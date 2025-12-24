import { useState, useEffect, useCallback } from 'react';
import {
  SECRET_PHRASE,
  LOCKOUT_DURATION_MS,
  LEVEL1_FAILURE_DURATION_MS,
  LEVEL2_FAILURE_DURATION_MS
} from '../config/constants';
import { speakWithElevenLabs } from '../utils/elevenLabsTTS';

const LOCKOUT_ENABLED_KEY = 'voice-interface-lockout-enabled';

// Load lockout enabled preference from localStorage
function loadLockoutEnabled() {
  try {
    const stored = localStorage.getItem(LOCKOUT_ENABLED_KEY);
    // Default to false (disabled) if not set
    return stored === 'true';
  } catch (e) {
    return false;
  }
}

// Save lockout enabled preference
function saveLockoutEnabled(enabled) {
  try {
    localStorage.setItem(LOCKOUT_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save lockout preference:', e);
  }
}

export function useLockout() {
  // Check if lockout is enabled in preferences
  const [lockoutEnabled, setLockoutEnabled] = useState(() => loadLockoutEnabled());
  // Start unlocked if lockout is disabled
  const [isLocked, setIsLocked] = useState(() => loadLockoutEnabled());
  const [unlockAttempts, setUnlockAttempts] = useState(0);
  const [unlockStatus, setUnlockStatus] = useState('idle'); // 'idle', 'level1', 'level2', 'lockout'
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  // Lockout Timer Logic
  useEffect(() => {
    let interval;
    let timeout;

    if (unlockStatus === 'lockout') {
      setLockoutCountdown(60);

      interval = setInterval(() => {
        setLockoutCountdown((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);

      timeout = setTimeout(() => {
        setUnlockStatus('idle');
        setUnlockAttempts(0);
      }, LOCKOUT_DURATION_MS);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [unlockStatus]);

  const attemptUnlock = useCallback((text) => {
    const normalized = text.toLowerCase().replace(/[^a-z\s]/g, '');

    if (normalized.includes(SECRET_PHRASE)) {
      setIsLocked(false);
      setUnlockStatus('idle');
      setUnlockAttempts(0);

      // Use ElevenLabs for "Access granted"
      speakWithElevenLabs('Access granted.');
      return true;
    } else {
      const newAttempts = unlockAttempts + 1;
      setUnlockAttempts(newAttempts);

      if (newAttempts === 1) {
        setUnlockStatus('level1');
        setTimeout(() => setUnlockStatus('idle'), LEVEL1_FAILURE_DURATION_MS);
      } else if (newAttempts === 2) {
        setUnlockStatus('level2');
        setTimeout(() => setUnlockStatus('idle'), LEVEL2_FAILURE_DURATION_MS);
      } else if (newAttempts >= 3) {
        setUnlockStatus('lockout');
      }
      return false;
    }
  }, [unlockAttempts]);

  const isInputBlocked = unlockStatus !== 'idle';

  // Toggle lockout enabled (takes effect on next app open)
  const toggleLockoutEnabled = useCallback(() => {
    const newValue = !lockoutEnabled;
    setLockoutEnabled(newValue);
    saveLockoutEnabled(newValue);
  }, [lockoutEnabled]);

  return {
    isLocked,
    unlockStatus,
    unlockAttempts,
    lockoutCountdown,
    attemptUnlock,
    isInputBlocked,
    lockoutEnabled,
    toggleLockoutEnabled
  };
}
