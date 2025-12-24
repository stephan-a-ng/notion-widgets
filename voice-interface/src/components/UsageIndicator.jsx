import React, { useState } from 'react';

export function UsageIndicator({ percentage, refreshEpoch, history, healthStatus, isLoading, justUpdated }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

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

  const getMeterColor = () => {
    if (percentage < 25) return 'bg-green-500';
    if (percentage < 50) return 'bg-green-400';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatRefreshDate = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) {
      return 'Refreshing soon...';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate graph points
  const getGraphPath = () => {
    if (history.length < 2) return null;

    const width = 200;
    const height = 60;
    const padding = 5;

    const minPercentage = Math.min(...history.map(h => h.percentage));
    const maxPercentage = Math.max(...history.map(h => h.percentage));
    const range = maxPercentage - minPercentage || 1;

    const points = history.map((h, i) => {
      const x = padding + (i / (history.length - 1)) * (width - padding * 2);
      const y = height - padding - ((h.percentage - minPercentage) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowGraph(false);
      }}
    >
      {/* Small blob indicator */}
      <div className="relative w-4 h-4 cursor-pointer">
        {/* Pulse ring on update */}
        {justUpdated && (
          <div
            className={`absolute inset-0 rounded-full ${getStatusGlow()} animate-ping`}
            style={{ animationDuration: '1s' }}
          />
        )}
        {/* Glow - larger when just updated */}
        <div
          className={`
            absolute rounded-full blur-sm ${getStatusGlow()} transition-all duration-300
            ${justUpdated ? 'inset-[-4px] opacity-80' : 'inset-0 opacity-50'}
          `}
        />
        {/* Blob */}
        <div
          className={`
            w-full h-full rounded-full
            bg-gradient-to-br ${getStatusColor()}
            shadow-lg transition-transform duration-300
            ${justUpdated ? 'scale-125' : 'scale-100'}
          `}
          style={{
            animation: 'blob-idle 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Hover info box */}
      {isHovered && (
        <div
          className={`
            absolute right-0 top-6 z-50
            bg-zinc-900/95 backdrop-blur-xl
            border border-white/10 rounded-xl
            shadow-2xl
            animate-in fade-in zoom-in-95 duration-200
            overflow-hidden
            ${showGraph ? 'w-64' : 'w-48'}
          `}
        >
          <div className="p-3 space-y-3">
            {/* Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Usage</span>
                <span className="text-sm font-mono font-medium text-white">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getMeterColor()} transition-all duration-500`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>

            {/* Refresh date */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">Resets in</span>
              <span className="text-xs font-mono text-zinc-400">
                {formatRefreshDate(refreshEpoch)}
              </span>
            </div>

            {/* More button / Graph */}
            {history.length >= 2 && (
              <div
                className="relative"
                onMouseEnter={() => setShowGraph(true)}
              >
                {!showGraph ? (
                  <div className="text-center">
                    <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">
                      more...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="text-xs text-zinc-500 text-center">Consumption History</div>
                    <div className="bg-zinc-800/50 rounded-lg p-2">
                      <svg
                        viewBox="0 0 200 60"
                        className="w-full h-12"
                        preserveAspectRatio="none"
                      >
                        {/* Grid lines */}
                        <line x1="5" y1="15" x2="195" y2="15" stroke="#374151" strokeWidth="0.5" />
                        <line x1="5" y1="30" x2="195" y2="30" stroke="#374151" strokeWidth="0.5" />
                        <line x1="5" y1="45" x2="195" y2="45" stroke="#374151" strokeWidth="0.5" />

                        {/* Graph line */}
                        <path
                          d={getGraphPath()}
                          fill="none"
                          stroke="url(#graphGradient)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="50%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>{history[0]?.percentage.toFixed(0)}%</span>
                        <span>{history[history.length - 1]?.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-600 text-center">
                      {history.length} data points since refresh
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
