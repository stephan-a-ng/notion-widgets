import React, { useState, useRef, useCallback } from 'react';
import { THEMES, DEFAULT_THEME } from './config/themes';
import { PENDING_SUBMIT_DELAY_MS, PREFETCH_DELAY_MS } from './config/constants';
import { addPunctuation } from './utils/transcriptFormatter';
import {
  useScrollCompact,
  useAudioDevices,
  useLockout,
  useSpeechRecognition,
  useAudioOutput,
  useKeyboardControls
} from './hooks';
import {
  Header,
  SettingsPanel,
  ThemeSelector,
  TranscriptDisplay,
  ThreadHistory,
  EditModal
} from './components';

export default function App() {
  // Mode: 'idle' | 'listening' | 'pending' | 'editing'
  const [mode, setMode] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [editText, setEditText] = useState('');
  const [apiError, setApiError] = useState(false);

  // UI State
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs for timers
  const pendingSubmitTimerRef = useRef(null);
  const preFetchTimerRef = useRef(null);

  // Custom hooks
  const { isLocked, unlockStatus, lockoutCountdown, attemptUnlock, isInputBlocked } = useLockout();
  const isCompact = useScrollCompact(isLocked);
  const { audioDevices, selectedDeviceId, getAudioDevices, handleDeviceChange } = useAudioDevices();

  const triggerErrorAnimation = useCallback(() => {
    setApiError(true);
    setTimeout(() => setApiError(false), 3000);
  }, []);

  const { preFetchBotResponse, playAudioResponse, cancelPendingAudio, resetCancellation } = useAudioOutput({
    onApiError: triggerErrorAnimation
  });

  // Commit message handler
  const commitMessage = useCallback(async (textToCommit) => {
    if (!textToCommit || !textToCommit.trim()) {
      setMode('idle');
      return;
    }

    const finalText = addPunctuation(textToCommit.trim());

    // Handle unlock logic
    if (isLocked) {
      const unlocked = attemptUnlock(finalText);
      setMode('idle');
      return;
    }

    // Standard flow - add user message
    const userMessage = {
      id: Date.now(),
      text: finalText,
      timestamp: new Date(),
      role: 'user'
    };
    setMessages(prev => [userMessage, ...prev]);
    setEditText('');

    // Show thinking state while waiting for response
    setMode('thinking');

    // Play audio response (waits for Tasklet + ElevenLabs)
    const responseText = await playAudioResponse();

    // Add assistant response to thread history
    if (responseText) {
      const assistantMessage = {
        id: Date.now() + 1,
        text: responseText,
        timestamp: new Date(),
        role: 'assistant'
      };
      setMessages(prev => [assistantMessage, ...prev]);
    }

    // Only go back to idle after response completes
    setMode('idle');
  }, [isLocked, attemptUnlock, playAudioResponse]);

  // Handle session end (called by speech recognition)
  const handleSessionEnd = useCallback((transcript, interimTranscript) => {
    let fullText = transcript + (interimTranscript ? ' ' + interimTranscript : '');
    fullText = fullText.replace(/\s+/g, ' ').trim();

    if (!fullText) {
      setMode('idle');
      return;
    }

    const finalText = addPunctuation(fullText);
    speechRecognition.setTranscript(finalText);
    setMode('pending');

    resetCancellation();

    if (pendingSubmitTimerRef.current) clearTimeout(pendingSubmitTimerRef.current);
    pendingSubmitTimerRef.current = setTimeout(() => {
      commitMessage(finalText);
      speechRecognition.reset();
    }, PENDING_SUBMIT_DELAY_MS);

    // Pre-fetch response from Tasklet if unlocked
    if (!isLocked) {
      if (preFetchTimerRef.current) clearTimeout(preFetchTimerRef.current);
      preFetchTimerRef.current = setTimeout(() => preFetchBotResponse(finalText), PREFETCH_DELAY_MS);
    }
  }, [isLocked, commitMessage, preFetchBotResponse, resetCancellation]);

  const speechRecognition = useSpeechRecognition({ onSessionEnd: handleSessionEnd });

  const startSession = useCallback(() => {
    if (isInputBlocked || mode !== 'idle') return;
    getAudioDevices();
    setMode('listening');
    speechRecognition.start();
  }, [isInputBlocked, mode, speechRecognition, getAudioDevices]);

  const endSession = useCallback(() => {
    if (isInputBlocked) return;
    speechRecognition.stop();
  }, [isInputBlocked, speechRecognition]);

  const cancelMessage = useCallback(() => {
    cancelPendingAudio();
    if (pendingSubmitTimerRef.current) clearTimeout(pendingSubmitTimerRef.current);
    if (preFetchTimerRef.current) clearTimeout(preFetchTimerRef.current);
    speechRecognition.reset();
    setEditText('');
    setMode('idle');
  }, [cancelPendingAudio, speechRecognition]);

  const enterEditMode = useCallback(() => {
    cancelPendingAudio();
    if (pendingSubmitTimerRef.current) clearTimeout(pendingSubmitTimerRef.current);
    if (preFetchTimerRef.current) clearTimeout(preFetchTimerRef.current);
    setEditText(speechRecognition.transcript);
    setMode('editing');
  }, [cancelPendingAudio, speechRecognition.transcript]);

  const handleOrbClick = useCallback(() => {
    if (isInputBlocked) return;
    if (mode === 'listening') endSession();
    else if (mode === 'idle') startSession();
  }, [isInputBlocked, mode, startSession, endSession]);

  const handleCommitFromEdit = useCallback(() => {
    commitMessage(editText);
    speechRecognition.reset();
  }, [commitMessage, editText, speechRecognition]);

  const selectTheme = useCallback((theme) => {
    setCurrentTheme(theme);
    setShowThemeSelector(false);
    setIsSettingsOpen(false);
  }, []);

  // Keyboard controls
  useKeyboardControls({
    mode,
    isInputBlocked,
    showThemeSelector,
    editText,
    onStartSession: startSession,
    onEndSession: endSession,
    onEnterEditMode: enterEditMode,
    onCancelMessage: cancelMessage,
    onCommitMessage: handleCommitFromEdit,
    onCloseThemeSelector: () => setShowThemeSelector(false)
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start p-6 overflow-x-hidden relative selection:bg-pink-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] transition-opacity duration-700 ${
            mode === 'listening' ? 'opacity-100 scale-110' : 'opacity-50 scale-100'
          }`}
        />
      </div>

      {/* Settings Button (Hidden when locked) */}
      {!isLocked && (
        <SettingsPanel
          isOpen={isSettingsOpen && !showThemeSelector}
          onToggle={() => setIsSettingsOpen(!isSettingsOpen)}
          onClose={() => setIsSettingsOpen(false)}
          currentTheme={currentTheme}
          onThemeClick={() => setShowThemeSelector(true)}
          audioDevices={audioDevices}
          selectedDeviceId={selectedDeviceId}
          onDeviceChange={handleDeviceChange}
        />
      )}

      {/* Full Screen Theme Selector */}
      {showThemeSelector && (
        <ThemeSelector
          themes={THEMES}
          currentTheme={currentTheme}
          onSelect={selectTheme}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      {/* Header with Orb */}
      <Header
        mode={mode}
        theme={currentTheme}
        unlockStatus={unlockStatus}
        apiError={apiError}
        isCompact={isCompact}
        isLocked={isLocked}
        lockoutCountdown={lockoutCountdown}
        isSupported={speechRecognition.isSupported}
        permissionError={speechRecognition.permissionError}
        onOrbClick={handleOrbClick}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-4 pb-20 mt-4">
        <TranscriptDisplay
          transcript={speechRecognition.transcript}
          interimTranscript={speechRecognition.interimTranscript}
          mode={mode}
          isLocked={isLocked}
          messagesCount={messages.length}
        />

        {!isLocked && (
          <ThreadHistory
            messages={messages}
            onClear={() => setMessages([])}
          />
        )}
      </div>

      {/* Edit Mode Overlay */}
      {mode === 'editing' && (
        <EditModal
          text={editText}
          onChange={setEditText}
          onSubmit={handleCommitFromEdit}
          onCancel={cancelMessage}
        />
      )}
    </div>
  );
}
