import { useEffect, useRef } from 'react';

export function useKeyboardControls({
  mode,
  isInputBlocked,
  showThemeSelector,
  editText,
  onStartSession,
  onEndSession,
  onEnterEditMode,
  onCancelMessage,
  onCommitMessage,
  onCloseThemeSelector
}) {
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Space key for push-to-talk
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        if (modeRef.current === 'editing') return;
        e.preventDefault();
        if (!isInputBlocked && !e.repeat && modeRef.current === 'idle') {
          onStartSession();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        if (modeRef.current === 'editing') return;
        e.preventDefault();
        if (!isInputBlocked && modeRef.current === 'listening') {
          onEndSession();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isInputBlocked, onStartSession, onEndSession]);

  // Escape and Enter keys
  useEffect(() => {
    const handleNavKeys = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        if (showThemeSelector) {
          onCloseThemeSelector();
        } else if (mode === 'pending') {
          onEnterEditMode();
        } else if (mode === 'editing') {
          onCancelMessage();
        }
      }
      if (e.key === 'Enter' && !e.shiftKey && mode === 'editing') {
        e.preventDefault();
        onCommitMessage(editText);
      }
    };

    window.addEventListener('keydown', handleNavKeys);
    return () => window.removeEventListener('keydown', handleNavKeys);
  }, [mode, editText, showThemeSelector, onEnterEditMode, onCancelMessage, onCommitMessage, onCloseThemeSelector]);
}
