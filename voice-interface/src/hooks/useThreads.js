import { useState, useCallback, useEffect } from 'react';
import { AIRTABLE_API_URL, AIRTABLE_TOKEN } from '../config/constants';

const SESSION_MESSAGES_KEY = 'voice-interface-session-messages';

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

export function useThreads() {
  // Local session messages (current conversation)
  const [sessionMessages, setSessionMessages] = useState(() => loadSessionMessages());

  // Airtable history
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // Save session messages whenever they change
  useEffect(() => {
    saveSessionMessages(sessionMessages);
  }, [sessionMessages]);

  // Fetch all thread history from Airtable
  const fetchThreads = useCallback(async () => {
    if (!AIRTABLE_API_URL || !AIRTABLE_TOKEN) {
      console.warn('Airtable not configured');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all records, sorted by created time descending
      const response = await fetch(
        `${AIRTABLE_API_URL}?sort[0][field]=Created&sort[0][direction]=desc&maxRecords=50`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Airtable fetch failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Conversations Airtable response:', data);

      // Log all field names from first record to help debug
      if (data.records && data.records.length > 0) {
        console.log('Available fields:', Object.keys(data.records[0].fields));
      }

      if (data.records) {
        // Transform Airtable records into thread format
        // Try multiple possible field names for flexibility
        const threadList = data.records
          .filter(record => {
            const status = record.fields['Job Status'] || record.fields['Status'] || record.fields['status'];
            // Accept Done, done, Completed, completed, or if no status field exists
            return !status || status === 'Done' || status === 'done' || status === 'Completed' || status === 'completed';
          })
          .map(record => {
            const fields = record.fields;
            // Try multiple possible field names
            const requestText = fields['Request Text'] || fields['request_text'] || fields['text'] || fields['Text'] || fields['input'] || fields['Input'] || fields['message'] || fields['Message'] || '';
            const responseText = fields['Response Text'] || fields['response_text'] || fields['response'] || fields['Response'] || fields['output'] || fields['Output'] || fields['answer'] || fields['Answer'] || '';
            const jobId = fields['Job ID'] || fields['job_id'] || fields['id'] || record.id;

            return {
              id: record.id,
              jobId: jobId,
              title: requestText ? requestText.slice(0, 50) : 'Conversation',
              requestText: requestText,
              responseText: responseText,
              createdAt: new Date(record.createdTime),
              status: fields['Job Status'] || fields['Status'] || 'Done'
            };
          })
          .filter(thread => thread.requestText || thread.responseText); // Only include threads with some content

        console.log('Parsed threads:', threadList);
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
  // - If viewing a historical thread, show that thread's messages
  // - Otherwise show current session messages
  const messages = currentThreadId && currentThread
    ? [
        {
          id: `${currentThread.id}-response`,
          text: currentThread.responseText,
          timestamp: currentThread.createdAt,
          role: 'assistant'
        },
        {
          id: `${currentThread.id}-request`,
          text: currentThread.requestText,
          timestamp: currentThread.createdAt,
          role: 'user'
        }
      ].filter(m => m.text)
    : sessionMessages;

  // Add message to current session
  const addMessage = useCallback((message) => {
    setSessionMessages(prev => [message, ...prev]);
  }, []);

  // Load a historical thread
  const loadThread = useCallback((threadId) => {
    setCurrentThreadId(threadId);
  }, []);

  // Start a new thread (clear session and deselect historical thread)
  const createNewThread = useCallback(() => {
    setCurrentThreadId(null);
    setSessionMessages([]);
    saveSessionMessages([]);
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
    isLoading,
    hasHistory,
    addMessage,
    loadThread,
    createNewThread,
    clearCurrentThread,
    refreshThreads
  };
}
