import { useState, useCallback, useEffect } from 'react';
import { AIRTABLE_API_URL, AIRTABLE_TOKEN } from '../config/constants';

export function useThreads() {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  // Fetch all thread history from Airtable
  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all records, sorted by created time descending
      const response = await fetch(
        `${AIRTABLE_API_URL}?sort[0][field]=Created&sort[0][direction]=desc`,
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

      if (data.records) {
        // Transform Airtable records into thread format
        const threadList = data.records
          .filter(record => record.fields['Job Status'] === 'Done')
          .map(record => {
            const fields = record.fields;
            return {
              id: record.id,
              jobId: fields['Job ID'] || record.id,
              title: fields['Request Text']?.slice(0, 50) || 'Conversation',
              requestText: fields['Request Text'] || '',
              responseText: fields['Response Text'] || '',
              createdAt: new Date(record.createdTime),
              status: fields['Job Status']
            };
          });

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

  // Get current thread
  const currentThread = threads.find(t => t.id === currentThreadId);

  // Convert single Airtable record to messages format
  const messages = currentThread ? [
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
  ].filter(m => m.text) : [];

  // Load a thread
  const loadThread = useCallback((threadId) => {
    setCurrentThreadId(threadId);
  }, []);

  // Start a new thread (clear current selection)
  const createNewThread = useCallback(() => {
    setCurrentThreadId(null);
  }, []);

  // Clear current thread (just deselect)
  const clearCurrentThread = useCallback(() => {
    setCurrentThreadId(null);
  }, []);

  // Refresh threads from Airtable
  const refreshThreads = useCallback(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    currentThreadId,
    currentThread,
    messages,
    isLoading,
    loadThread,
    createNewThread,
    clearCurrentThread,
    refreshThreads,
    // For compatibility with existing code
    addMessage: () => {},
    deleteThread: () => {}
  };
}
