import { useState, useCallback, useEffect } from 'react';
import { AIRTABLE_API_URL, AIRTABLE_THREADS_URL, AIRTABLE_TOKEN } from '../config/constants';

const SESSION_MESSAGES_KEY = 'voice-interface-session-messages';
const ACTIVE_THREAD_ID_KEY = 'voice-interface-active-thread-id';

// Generate unique thread ID
function generateThreadId() {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Load session messages from localStorage
function loadSessionMessages() {
  try {
    const stored = localStorage.getItem(SESSION_MESSAGES_KEY);
    if (stored) {
      const messages = JSON.parse(stored);
      return messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  } catch (e) {
    console.error('Failed to load session messages:', e);
  }
  return [];
}

// Save session messages to localStorage
function saveSessionMessages(messages) {
  try {
    localStorage.setItem(SESSION_MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save session messages:', e);
  }
}

// Load active thread ID from localStorage
function loadActiveThreadId() {
  try {
    return localStorage.getItem(ACTIVE_THREAD_ID_KEY);
  } catch (e) {
    return null;
  }
}

// Save active thread ID to localStorage
function saveActiveThreadId(threadId) {
  try {
    if (threadId) {
      localStorage.setItem(ACTIVE_THREAD_ID_KEY, threadId);
    } else {
      localStorage.removeItem(ACTIVE_THREAD_ID_KEY);
    }
  } catch (e) {
    console.error('Failed to save active thread ID:', e);
  }
}

export function useThreads() {
  // Local session messages (current conversation)
  const [sessionMessages, setSessionMessages] = useState(() => loadSessionMessages());

  // Active thread ID for the current conversation (used for API calls)
  const [activeThreadId, setActiveThreadId] = useState(() => loadActiveThreadId() || generateThreadId());

  // Airtable history
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // Save session messages whenever they change
  useEffect(() => {
    saveSessionMessages(sessionMessages);
  }, [sessionMessages]);

  // Save active thread ID whenever it changes
  useEffect(() => {
    saveActiveThreadId(activeThreadId);
  }, [activeThreadId]);

  // Fetch all thread history from Airtable
  const fetchThreads = useCallback(async () => {
    if (!AIRTABLE_API_URL || !AIRTABLE_TOKEN) {
      console.warn('Airtable not configured');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch conversations and thread metadata in parallel
      const [conversationsResponse, threadsResponse] = await Promise.all([
        fetch(`${AIRTABLE_API_URL}?maxRecords=50`, {
          headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
        }),
        AIRTABLE_THREADS_URL ? fetch(`${AIRTABLE_THREADS_URL}?maxRecords=100`, {
          headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
        }) : Promise.resolve(null)
      ]);

      if (!conversationsResponse.ok) {
        throw new Error(`Airtable fetch failed: ${conversationsResponse.status}`);
      }

      const data = await conversationsResponse.json();
      console.log('Conversations Airtable response:', data);

      // Build thread names map from Threads table
      const threadNamesMap = new Map();
      if (threadsResponse && threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        console.log('Threads metadata:', threadsData);
        threadsData.records?.forEach(record => {
          const jobId = record.fields['Job ID'];
          const name = record.fields['Name'];
          if (jobId && name) {
            threadNamesMap.set(jobId, name);
          }
        });
      }

      // Log all field names from first record to help debug
      if (data.records && data.records.length > 0) {
        console.log('Available fields:', Object.keys(data.records[0].fields));
      }

      if (data.records) {
        // Transform Airtable records into thread format
        // Group by Job ID (thread_id) since multiple messages share the same thread
        const threadMap = new Map();

        data.records
          .filter(record => {
            const status = record.fields['Job Status'] || record.fields['Status'] || record.fields['status'];
            // Accept Done, done, Completed, completed, or if no status field exists
            return !status || status === 'Done' || status === 'done' || status === 'Completed' || status === 'completed';
          })
          .forEach(record => {
            const fields = record.fields;
            const requestText = fields['Request Text'] || fields['request_text'] || fields['text'] || fields['Text'] || fields['input'] || fields['Input'] || fields['message'] || fields['Message'] || '';
            const responseText = fields['Response Text'] || fields['response_text'] || fields['response'] || fields['Response'] || fields['output'] || fields['Output'] || fields['answer'] || fields['Answer'] || '';
            const jobId = fields['Job ID'] || fields['job_id'] || fields['id'] || record.id;
            const createdAt = new Date(record.createdTime);

            if (!requestText && !responseText) return;

            // Group messages by Job ID (thread_id)
            if (!threadMap.has(jobId)) {
              threadMap.set(jobId, {
                id: jobId,
                jobId: jobId,
                messages: [],
                createdAt: createdAt,
                lastMessageAt: createdAt
              });
            }

            const thread = threadMap.get(jobId);
            thread.messages.push({
              recordId: record.id,
              requestText,
              responseText,
              createdAt
            });

            // Track the earliest and latest message times
            if (createdAt < thread.createdAt) {
              thread.createdAt = createdAt;
            }
            if (createdAt > thread.lastMessageAt) {
              thread.lastMessageAt = createdAt;
            }
          });

        // Convert map to array and format for display
        const threadList = Array.from(threadMap.values())
          .map(thread => {
            // Sort messages by time (oldest first)
            thread.messages.sort((a, b) => a.createdAt - b.createdAt);

            // Use first message's request as title, last message for preview
            const firstMessage = thread.messages[0];
            const lastMessage = thread.messages[thread.messages.length - 1];

            // Use thread name from Threads table if available, otherwise use first message
            const threadName = threadNamesMap.get(thread.jobId);

            return {
              id: thread.id,
              jobId: thread.jobId,
              title: threadName || (firstMessage.requestText ? firstMessage.requestText.slice(0, 50) : 'Conversation'),
              hasCustomName: !!threadName,
              requestText: firstMessage.requestText,
              responseText: lastMessage.responseText,
              messages: thread.messages,
              messageCount: thread.messages.length,
              createdAt: thread.createdAt,
              lastMessageAt: thread.lastMessageAt
            };
          })
          .sort((a, b) => b.lastMessageAt - a.lastMessageAt); // Sort by most recent activity

        console.log('Parsed threads (grouped by Job ID):', threadList);
        setThreads(threadList);
      }
    } catch (error) {
      console.error('Failed to fetch threads from Airtable:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch threads on mount
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Get current thread from Airtable history
  const currentThread = threads.find(t => t.id === currentThreadId);

  // Messages to display:
  // - If viewing/continuing a historical thread, show historical + new session messages
  // - Otherwise show current session messages only
  // Display order: newest at top (reversed), with assistant response before user request
  const historicalMessages = currentThreadId && currentThread
    ? currentThread.messages
        .flatMap(msg => [
          // User request first, then assistant response (will be reversed below)
          msg.requestText ? {
            id: `${msg.recordId}-request`,
            text: msg.requestText,
            timestamp: msg.createdAt,
            role: 'user'
          } : null,
          msg.responseText ? {
            id: `${msg.recordId}-response`,
            text: msg.responseText,
            timestamp: msg.createdAt,
            role: 'assistant'
          } : null
        ])
        .filter(Boolean)
        .reverse() // Newest first: assistant response appears before user request
    : [];

  // Combine session messages (new) with historical messages
  const messages = currentThreadId && currentThread
    ? [...sessionMessages, ...historicalMessages]
    : sessionMessages;

  // Add message to current session
  const addMessage = useCallback((message) => {
    setSessionMessages(prev => [message, ...prev]);
  }, []);

  // Update message status (e.g., pending -> confirmed)
  const updateMessageStatus = useCallback((messageId, status) => {
    setSessionMessages(prev => {
      const updated = prev.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      );
      saveSessionMessages(updated);
      return updated;
    });
  }, []);

  // Load a historical thread and continue it
  const loadThread = useCallback((threadId) => {
    console.log('[useThreads] loadThread called with:', threadId);
    setCurrentThreadId(threadId);
    // Set activeThreadId so new messages continue this conversation
    setActiveThreadId(threadId);
    saveActiveThreadId(threadId);
    // Clear session messages since we're now continuing a historical thread
    setSessionMessages([]);
    saveSessionMessages([]);
    console.log('[useThreads] activeThreadId set to:', threadId);
  }, []);

  // Start a new thread (clear session and deselect historical thread)
  const createNewThread = useCallback(() => {
    setCurrentThreadId(null);
    setSessionMessages([]);
    saveSessionMessages([]);
    // Generate new thread ID for the new conversation
    const newThreadId = generateThreadId();
    setActiveThreadId(newThreadId);
    saveActiveThreadId(newThreadId);
    console.log('Started new thread:', newThreadId);
  }, []);

  // Clear current session messages
  const clearCurrentThread = useCallback(() => {
    if (currentThreadId) {
      // If viewing historical thread, just go back to session
      setCurrentThreadId(null);
    } else {
      // Clear session messages
      setSessionMessages([]);
      saveSessionMessages([]);
    }
  }, [currentThreadId]);

  // Refresh threads from Airtable
  const refreshThreads = useCallback(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Check if there's any history to show
  const hasHistory = threads.length > 0 || sessionMessages.length > 0;

  return {
    threads,
    currentThreadId,
    currentThread,
    messages,
    sessionMessages,
    activeThreadId, // Thread ID for API calls
    isLoading,
    hasHistory,
    addMessage,
    updateMessageStatus,
    loadThread,
    createNewThread,
    clearCurrentThread,
    refreshThreads
  };
}
