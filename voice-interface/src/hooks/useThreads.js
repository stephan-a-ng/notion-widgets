import { useState, useCallback, useEffect } from 'react';

const THREADS_STORAGE_KEY = 'voice-interface-threads';
const CURRENT_THREAD_KEY = 'voice-interface-current-thread';

// Generate unique thread ID
function generateThreadId() {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Load all threads from localStorage
function loadThreads() {
  try {
    const stored = localStorage.getItem(THREADS_STORAGE_KEY);
    if (stored) {
      const threads = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return threads.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        messages: t.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
    }
  } catch (e) {
    console.error('Failed to load threads:', e);
  }
  return [];
}

// Save threads to localStorage
function saveThreads(threads) {
  try {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  } catch (e) {
    console.error('Failed to save threads:', e);
  }
}

// Load current thread ID
function loadCurrentThreadId() {
  try {
    return localStorage.getItem(CURRENT_THREAD_KEY);
  } catch (e) {
    return null;
  }
}

// Save current thread ID
function saveCurrentThreadId(threadId) {
  try {
    if (threadId) {
      localStorage.setItem(CURRENT_THREAD_KEY, threadId);
    } else {
      localStorage.removeItem(CURRENT_THREAD_KEY);
    }
  } catch (e) {
    console.error('Failed to save current thread ID:', e);
  }
}

export function useThreads() {
  const [threads, setThreads] = useState(() => loadThreads());
  const [currentThreadId, setCurrentThreadId] = useState(() => loadCurrentThreadId());

  // Get current thread's messages
  const currentThread = threads.find(t => t.id === currentThreadId);
  const messages = currentThread?.messages || [];

  // Save threads whenever they change
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  // Save current thread ID whenever it changes
  useEffect(() => {
    saveCurrentThreadId(currentThreadId);
  }, [currentThreadId]);

  // Create a new thread
  const createNewThread = useCallback(() => {
    const newThread = {
      id: generateThreadId(),
      title: 'New Conversation',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };
    setThreads(prev => [newThread, ...prev]);
    setCurrentThreadId(newThread.id);
    return newThread.id;
  }, []);

  // Add a message to the current thread
  const addMessage = useCallback((message) => {
    // If no current thread, create one
    if (!currentThreadId) {
      const newId = generateThreadId();
      const newThread = {
        id: newId,
        title: message.role === 'user' ? message.text.slice(0, 50) : 'New Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [message]
      };
      setThreads(prev => [newThread, ...prev]);
      setCurrentThreadId(newId);
      return;
    }

    setThreads(prev => prev.map(t => {
      if (t.id === currentThreadId) {
        const updatedMessages = [message, ...t.messages];
        // Update title from first user message if still default
        let title = t.title;
        if (title === 'New Conversation' && message.role === 'user') {
          title = message.text.slice(0, 50) + (message.text.length > 50 ? '...' : '');
        }
        return {
          ...t,
          title,
          updatedAt: new Date(),
          messages: updatedMessages
        };
      }
      return t;
    }));
  }, [currentThreadId]);

  // Load an existing thread
  const loadThread = useCallback((threadId) => {
    setCurrentThreadId(threadId);
  }, []);

  // Delete a thread
  const deleteThread = useCallback((threadId) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
    }
  }, [currentThreadId]);

  // Clear current thread messages (but keep the thread)
  const clearCurrentThread = useCallback(() => {
    if (!currentThreadId) return;
    setThreads(prev => prev.map(t => {
      if (t.id === currentThreadId) {
        return { ...t, messages: [], updatedAt: new Date() };
      }
      return t;
    }));
  }, [currentThreadId]);

  // Start fresh (new thread, no history loaded)
  const startFresh = useCallback(() => {
    setCurrentThreadId(null);
  }, []);

  return {
    threads,
    currentThreadId,
    currentThread,
    messages,
    createNewThread,
    addMessage,
    loadThread,
    deleteThread,
    clearCurrentThread,
    startFresh
  };
}
