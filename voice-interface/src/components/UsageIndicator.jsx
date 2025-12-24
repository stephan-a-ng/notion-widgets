import React, { useState, useEffect, useRef } from 'react';

export function UsageIndicator({ percentage, refreshEpoch, history, healthStatus, isLoading, justUpdated }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const panelRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    if (!isLocked) return;

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsLocked(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocked]);

  if (isLoading) return null;

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'healthy': return 'from-green-400 to-green-600';
      case 'warning': return 'from-yellow-400 to-orange-500';
      case 'danger': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getStatusGlow = () => {
    switch (healthStatus) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLineColor = () => {
    switch (healthStatus) {
      case 'healthy': return '#22c55e';
      case 'warning': return '#eab308';
      case 'danger': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatRefreshDate = (date) => {
    if (!date) return '—';
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return 'Soon';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    }
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  // Calculate graph path - time-based X axis from last reset to next reset
  const getGraphPath = () => {
    if (history.length < 1 || !resetStartTime || !refreshEpoch) return null;

    const width = 280;
    const height = 50;
    const paddingX = 10;
    const paddingY = 8;

    const startTime = resetStartTime.getTime();
    const endTime = refreshEpoch.getTime();
    const totalDuration = endTime - startTime;

    // Y axis: 0 to 100%
    const maxY = 100;

    // Filter history to only include points within the current period
    const relevantHistory = history.filter(h =>
      h.timestamp.getTime() >= startTime && h.timestamp.getTime() <= endTime
    );

    if (relevantHistory.length < 1) return null;

    const points = relevantHistory.map((h) => {
      const timeSinceReset = h.timestamp.getTime() - startTime;
      const x = paddingX + (timeSinceReset / totalDuration) * (width - paddingX * 2);
      const y = height - paddingY - (h.percentage / maxY) * (height - paddingY * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Get area fill path (for gradient under the line)
  const getAreaPath = () => {
    if (history.length < 1 || !resetStartTime || !refreshEpoch) return null;

    const width = 280;
    const height = 50;
    const paddingX = 10;
    const paddingY = 8;

    const startTime = resetStartTime.getTime();
    const endTime = refreshEpoch.getTime();
    const totalDuration = endTime - startTime;

    const maxY = 100;

    // Filter history to only include points within the current period
    const relevantHistory = history.filter(h =>
      h.timestamp.getTime() >= startTime && h.timestamp.getTime() <= endTime
    );

    if (relevantHistory.length < 1) return null;

    const points = relevantHistory.map((h) => {
      const timeSinceReset = h.timestamp.getTime() - startTime;
      const x = paddingX + (timeSinceReset / totalDuration) * (width - paddingX * 2);
      const y = height - paddingY - (h.percentage / maxY) * (height - paddingY * 2);
      return { x, y };
    });

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height - paddingY;

    return `M ${firstX},${bottomY} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${lastX},${bottomY} Z`;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isLocked) {
      setIsLocked(false);
      setIsExpanded(false);
    } else {
      setIsLocked(true);
      setIsExpanded(true);
    }
  };

  // Calculate the start time for the graph (last reset = 24hrs before next reset)
  const getResetStartTime = () => {
    if (!refreshEpoch) return null;
    // Last reset is 24 hours before the next refresh
    return new Date(refreshEpoch.getTime() - 24 * 60 * 60 * 1000);
  };

  const resetStartTime = getResetStartTime();

  return (
    <div
      ref={panelRef}
      className="fixed top-6 z-40 flex flex-col items-end gap-3"
      style={{ right: '1.5rem' }}
      onMouseEnter={() => !isLocked && setIsExpanded(true)}
      onMouseLeave={() => !isLocked && setIsExpanded(false)}
    >
      {/* Spacer for gear icon */}
      <div className="w-10 h-10" />

      {/* Status orb - aligned with gear */}
      <div
        className="relative w-4 h-4 cursor-pointer mr-3"
        onClick={handleClick}
      >
        {/* Pulse ring on update */}
        {justUpdated && (
          <div
            className={`absolute inset-0 rounded-full ${getStatusGlow()} animate-ping`}
            style={{ animationDuration: '1s' }}
          />
        )}
        {/* Glow */}
        <div
          className={`
            absolute rounded-full blur-sm ${getStatusGlow()} transition-all duration-300
            ${justUpdated ? 'inset-[-4px] opacity-80' : 'inset-0 opacity-50'}
          `}
          style={{ animation: 'status-glow 3s ease-in-out infinite' }}
        />
        {/* Orb with fluctuating animation */}
        <div
          className={`
            w-full h-full rounded-full
            shadow-lg transition-transform duration-300
            ${justUpdated ? 'scale-125' : 'scale-100'}
          `}
          style={{
            animation: 'status-orb-pulse 3s ease-in-out infinite',
            background: `linear-gradient(135deg, ${getLineColor()}, ${healthStatus === 'healthy' ? '#f97316' : '#22c55e'})`
          }}
        />
      </div>

      {/* Slide-out panel */}
      <div
        className={`
          bg-black/80 backdrop-blur-xl
          border border-white/10 rounded-xl
          transition-all duration-300 ease-out overflow-hidden
          ${isExpanded ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 pointer-events-none'}
        `}
      >

          <div className="p-3 w-72">
            {/* Header with percentage and reset time */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-semibold text-white">
                  {percentage.toFixed(1)}%
                </span>
                <span className="text-xs text-zinc-500">used</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500">resets in </span>
                <span className="text-xs font-mono text-zinc-400">
                  {formatRefreshDate(refreshEpoch)}
                </span>
              </div>
            </div>

            {/* Graph */}
            <div className="bg-zinc-900/50 rounded-lg p-2 border border-white/5">
              <svg
                viewBox="0 0 280 50"
                className="w-full h-12"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                <line x1="10" y1="12" x2="270" y2="12" stroke="#27272a" strokeWidth="0.5" />
                <line x1="10" y1="25" x2="270" y2="25" stroke="#27272a" strokeWidth="0.5" />
                <line x1="10" y1="38" x2="270" y2="38" stroke="#27272a" strokeWidth="0.5" />

                {/* Area fill */}
                {getAreaPath() && (
                  <path
                    d={getAreaPath()}
                    fill={getLineColor()}
                    fillOpacity="0.1"
                  />
                )}

                {/* Graph line */}
                {getGraphPath() ? (
                  <path
                    d={getGraphPath()}
                    fill="none"
                    stroke={getLineColor()}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <text x="140" y="28" textAnchor="middle" fill="#52525b" fontSize="10">
                    Collecting data...
                  </text>
                )}

                {/* Current value dot - positioned based on current time in the period */}
                {getGraphPath() && resetStartTime && refreshEpoch && (
                  <circle
                    cx={10 + ((Date.now() - resetStartTime.getTime()) / (refreshEpoch.getTime() - resetStartTime.getTime())) * 260}
                    cy={50 - 8 - (percentage / 100) * (50 - 16)}
                    r="3"
                    fill={getLineColor()}
                  />
                )}
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between text-[9px] text-zinc-600 mt-1 px-1">
                <span>Reset</span>
                <span>Now</span>
              </div>
            </div>

            {/* Footer info */}
            {(() => {
              const relevantCount = resetStartTime && refreshEpoch
                ? history.filter(h =>
                    h.timestamp.getTime() >= resetStartTime.getTime() &&
                    h.timestamp.getTime() <= refreshEpoch.getTime()
                  ).length
                : history.length;
              return relevantCount > 0 ? (
                <div className="mt-2 text-[10px] text-zinc-600 text-center">
                  {relevantCount} data point{relevantCount !== 1 ? 's' : ''} this period
                </div>
              ) : null;
            })()}
          </div>
      </div>
    </div>
  );
}
