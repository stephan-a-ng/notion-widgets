import React from 'react';
import { Orb } from './Orb/Orb';

export function Header({
  mode,
  theme,
  unlockStatus,
  apiError,
  isCompact,
  isLocked,
  lockoutCountdown,
  isSupported,
  permissionError,
  onOrbClick
}) {
  const getStatusText = () => {
    if (!isSupported) return <span className="text-red-400">Browser not supported.</span>;
    if (permissionError) return <span className="text-red-400">Microphone denied.</span>;

    if (unlockStatus === 'lockout') {
      return <span className="text-red-400 font-bold tracking-widest">System Locked: {lockoutCountdown}s</span>;
    }

    if (unlockStatus === 'level1' || unlockStatus === 'level2') {
      return <span className="opacity-0">...</span>;
    }

    if (isLocked) {
      return mode === 'listening' ? 'Listening...' : "What's the secret phrase?";
    }

    switch (mode) {
      case 'listening': return 'Listening...';
      case 'pending': return 'Sending...';
      case 'thinking': return 'Thinking...';
      case 'editing': return 'Edit Mode';
      default: return isCompact ? 'Hold Space' : 'Hold Space to Speak';
    }
  };

  return (
    <>
      {/* HEADER SPACER */}
      <div className="w-full shrink-0 h-[450px] pointer-events-none" aria-hidden="true" />

      {/* FIXED HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div
          className={`w-full max-w-2xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isCompact ? 'pt-4 px-6' : 'pt-20 px-6'
          }`}
        >
          <div
            className={`
              relative w-full backdrop-blur-xl border shadow-2xl
              transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isCompact
                ? 'h-20 rounded-full border-white/20 bg-black/80 overflow-hidden'
                : 'h-[320px] rounded-[3rem] border-transparent bg-transparent overflow-visible'
              }
            `}
          >
            <Orb
              mode={mode}
              theme={theme}
              unlockStatus={unlockStatus}
              apiError={apiError}
              isCompact={isCompact}
              isLocked={isLocked}
              onClick={onOrbClick}
            />

            {/* STATUS TEXT */}
            <div
              className={`
                absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isCompact
                  ? 'right-8 top-1/2 -translate-y-1/2 text-right'
                  : 'left-1/2 -translate-x-1/2 bottom-0 text-center w-full translate-y-20'
                }
              `}
            >
              <div
                className={`font-medium tracking-widest uppercase transition-colors duration-500 text-sm ${
                  mode === 'listening' || mode === 'thinking' ? 'text-white' : 'text-zinc-500'
                } ${mode === 'thinking' ? 'animate-pulse' : ''}`}
              >
                {getStatusText()}
              </div>

              {!isCompact && mode === 'pending' && !isLocked && (
                <div className="text-[10px] text-zinc-400 animate-pulse mt-1">
                  Press <span className="text-white font-bold border border-white/20 rounded px-1">Esc</span> to edit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
