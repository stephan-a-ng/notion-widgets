import React from 'react';
import { Check } from 'lucide-react';

export function DeviceSelector({ devices, selectedDeviceId, onDeviceChange }) {
  return (
    <div className="flex flex-col gap-1 max-h-60 overflow-y-auto mt-2">
      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-3 py-2">
        Microphone
      </div>
      {devices.length > 0 ? (
        devices.map((device) => (
          <button
            key={device.deviceId}
            onClick={() => onDeviceChange(device.deviceId)}
            className={`text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
              selectedDeviceId === device.deviceId
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
            }`}
          >
            <span className="truncate pr-2">
              {device.label || `Microphone ${device.deviceId.slice(0, 4)}...`}
            </span>
            {selectedDeviceId === device.deviceId && (
              <Check className="w-3 h-3 text-green-400 shrink-0" />
            )}
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-zinc-600 text-xs italic">
          No microphones found or permission denied.
        </div>
      )}
    </div>
  );
}
