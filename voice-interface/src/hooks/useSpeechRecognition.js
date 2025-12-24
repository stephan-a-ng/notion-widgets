import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTranscript } from '../utils/transcriptFormatter';

export function useSpeechRecognition({ onSessionEnd }) {
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const interimTranscriptRef = useRef('');

  // Sync refs
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    interimTranscriptRef.current = interimTranscript;
  }, [interimTranscript]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setPermissionError(false);
          setIsListening(true);
        };

        recognition.onerror = (event) => {
          if (event.error === 'no-speech') return;
          console.error('Speech error', event.error);
          if (event.error === 'not-allowed') {
            setPermissionError(true);
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (onSessionEnd) {
            onSessionEnd(transcriptRef.current, interimTranscriptRef.current);
          }
        };

        recognition.onresult = (event) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentFinal += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (currentFinal) {
            setTranscript(prev => formatTranscript(prev, currentFinal));
          }
          setInterimTranscript(currentInterim);
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSessionEnd]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
    }
  }, []);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isSupported,
    permissionError,
    transcript,
    interimTranscript,
    isListening,
    start,
    stop,
    reset,
    setTranscript
  };
}
