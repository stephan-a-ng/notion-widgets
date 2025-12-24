import { useState, useCallback } from 'react';

export function useAudioDevices() {
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  const getAudioDevices = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);

      if (audioInputs.length > 0 && !selectedDeviceId) {
        const defaultDevice = audioInputs.find(d => d.deviceId === 'default') || audioInputs[0];
        setSelectedDeviceId(defaultDevice.deviceId);
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  }, [selectedDeviceId]);

  const handleDeviceChange = useCallback(async (deviceId) => {
    setSelectedDeviceId(deviceId);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } }
      });
      stream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.error('Error changing device:', e);
    }
  }, []);

  return {
    audioDevices,
    selectedDeviceId,
    getAudioDevices,
    handleDeviceChange
  };
}
