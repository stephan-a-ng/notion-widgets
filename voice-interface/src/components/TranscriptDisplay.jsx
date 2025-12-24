import React from 'react';

export function TranscriptDisplay({ transcript, interimTranscript, mode, isLocked, messagesCount }) {
  const hasContent = transcript || interimTranscript;

  if (mode === 'editing') return null;

  return (
    <div className="w-full min-h-[140px] flex flex-col items-center justify-start shrink-0 mb-8 transition-all duration-300 z-20 relative">
      {hasContent ? (
        <div className="animate-in fade-in zoom-in-95 duration-300 w-full bg-black/40 backdrop-blur-sm rounded-xl p-4">
          <p className="text-2xl md:text-3xl font-light leading-relaxed text-center text-white/90">
            {transcript}
            <span className="text-white/50">{interimTranscript}</span>
          </p>
          {mode === 'pending' && (
            <div className="mt-6 w-full flex justify-center">
              <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white animate-progress-bar origin-left"
                  style={{ animationDuration: '1.3s' }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        !isLocked && mode === 'idle' && messagesCount === 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 animate-in fade-in">
            <span className="text-zinc-600 font-light">Your words will appear here.</span>
            <span className="text-zinc-700 text-sm">Hold anywhere or press space to talk</span>
          </div>
        )
      )}
    </div>
  );
}
