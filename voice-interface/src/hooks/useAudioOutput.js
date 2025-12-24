import { useRef, useCallback } from 'react';
import {
  ELEVEN_LABS_API_KEY,
  ELEVEN_LABS_VOICE_ID,
  TASKLET_WEBHOOK_URL,
  AIRTABLE_API_URL,
  AIRTABLE_TOKEN,
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_MS
} from '../config/constants';
import { speakWithElevenLabs } from '../utils/elevenLabsTTS';
import { getRandomThinkingPhrase } from '../utils/thinkingPhrases';

// Generate unique thread ID
function generateThreadId() {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useAudioOutput({ onApiError }) {
  const pendingResponseRef = useRef(null);
  const isResponseCancelledRef = useRef(false);

  // Send message to Tasklet webhook
  const sendToTasklet = useCallback(async (threadId, userMessage) => {
    try {
      const response = await fetch(TASKLET_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          thread_id: threadId,
          text: userMessage
        })
      });

      if (!response.ok) {
        throw new Error(`Tasklet request failed with status ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Tasklet Error:', error);
      return false;
    }
  }, []);

  // Poll Airtable for response
  const pollAirtable = useCallback(async (threadId) => {
    const startTime = Date.now();
    const encodedFormula = encodeURIComponent(`{Job ID}='${threadId}'`);

    while (Date.now() - startTime < POLL_TIMEOUT_MS) {
      if (isResponseCancelledRef.current) {
        return null;
      }

      try {
        const response = await fetch(
          `${AIRTABLE_API_URL}?filterByFormula=${encodedFormula}`,
          {
            headers: {
              'Authorization': `Bearer ${AIRTABLE_TOKEN}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Airtable request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.records && data.records.length > 0) {
          const record = data.records[0];
          const fields = record.fields || {};

          if (fields['Job Status'] === 'Done') {
            return fields['Response Text'] || 'Done';
          }
        }
      } catch (error) {
        console.error('Airtable polling error:', error);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    console.error('Polling timeout - no response received');
    return null;
  }, []);

  // Fetch response from Tasklet + Airtable
  const fetchTaskletResponse = useCallback(async (userMessage) => {
    const threadId = generateThreadId();

    // Play thinking phrase immediately
    const thinkingPhrase = getRandomThinkingPhrase();
    speakWithElevenLabs(thinkingPhrase);

    // Send to Tasklet
    const sent = await sendToTasklet(threadId, userMessage);
    if (!sent) {
      return null;
    }

    // Poll Airtable for response
    const responseText = await pollAirtable(threadId);
    return responseText;
  }, [sendToTasklet, pollAirtable]);

  // Convert text to speech via ElevenLabs
  const fetchBotAudio = useCallback(async (text) => {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVEN_LABS_API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_turbo_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs request failed with status ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      return new Audio(URL.createObjectURL(blob));
    } catch (error) {
      console.error('ElevenLabs Error:', error);
      if (onApiError) onApiError();
      return null;
    }
  }, [onApiError]);

  // Pre-fetch bot response from Tasklet (called during pending state)
  const preFetchBotResponse = useCallback((userMessage) => {
    pendingResponseRef.current = fetchTaskletResponse(userMessage).then(async (responseText) => {
      if (!responseText) return { audio: null, text: 'Sorry, I couldn\'t get a response.' };
      const audio = await fetchBotAudio(responseText);
      return { audio, text: responseText };
    });
  }, [fetchTaskletResponse, fetchBotAudio]);

  // Play the audio response
  const playAudioResponse = useCallback(async (fallbackText = 'Got it.') => {
    if (isResponseCancelledRef.current) return;

    let audioData = null;
    let responseText = fallbackText;

    if (pendingResponseRef.current) {
      try {
        audioData = await pendingResponseRef.current;
        if (audioData?.text) responseText = audioData.text;
      } catch (e) {
        console.error(e);
      }
    }

    const playFallback = () => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    if (audioData && audioData.audio) {
      try {
        await audioData.audio.play();
      } catch (err) {
        console.error('Audio playback error:', err);
        playFallback();
      }
    } else {
      playFallback();
    }
  }, []);

  const cancelPendingAudio = useCallback(() => {
    isResponseCancelledRef.current = true;
    pendingResponseRef.current = null;
  }, []);

  const resetCancellation = useCallback(() => {
    isResponseCancelledRef.current = false;
    pendingResponseRef.current = null;
  }, []);

  return {
    preFetchBotResponse,
    playAudioResponse,
    cancelPendingAudio,
    resetCancellation,
    isResponseCancelledRef
  };
}
