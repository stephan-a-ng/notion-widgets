import { useEffect, useRef } from 'react';

// Check if touch target is an interactive element that should not trigger push-to-talk
function isInteractiveElement(target) {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  if (['button', 'input', 'textarea', 'select', 'a'].includes(tagName)) return true;
  if (target.closest('button, input, textarea, select, a, [role="button"]')) return true;
  if (target.closest('[data-no-touch-talk]')) return true;
  return false;
}

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
  const touchActiveRef = useRef(false);

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

  // Touch for push-to-talk (mobile support)
  useEffect(() => {
    const handleTouchStart = (e) => {
      // Skip if touching interactive elements
      if (isInteractiveElement(e.target)) return;
      // Skip if in editing mode or theme selector is open
      if (modeRef.current === 'editing' || showThemeSelector) return;
      if (isInputBlocked) return;

      if (modeRef.current === 'idle') {
        touchActiveRef.current = true;
        e.preventDefault();
        onStartSession();
      }
    };

    const handleTouchEnd = (e) => {
      if (!touchActiveRef.current) return;
      touchActiveRef.current = false;

      if (isInputBlocked) return;
      if (modeRef.current === 'listening') {
        e.preventDefault();
        onEndSession();
      }
    };

    // Use passive: false to allow preventDefault
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isInputBlocked, showThemeSelector, onStartSession, onEndSession]);

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
