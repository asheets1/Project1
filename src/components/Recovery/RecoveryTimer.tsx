import React, { useState, useEffect } from 'react';
import { RECOVERY_TIMER_PRESETS } from '../../utils/constants';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

export const RecoveryTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'hypertrophy' | 'strength' | 'cardio' | 'restDay'>(
    'hypertrophy'
  );
  const [customSeconds, setCustomSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setIsRunning(false);
            playNotification();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds]);

  const playNotification = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handlePresetSelect = (preset: keyof typeof RECOVERY_TIMER_PRESETS) => {
    setSelectedPreset(preset);
    const presetData = RECOVERY_TIMER_PRESETS[preset];
    const defaultTime = presetData.min * 60;
    setSeconds(defaultTime);
    setIsRunning(false);
  };

  const handleCustomTime = () => {
    if (customSeconds > 0) {
      setSeconds(customSeconds);
      setIsRunning(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Recovery Timer</h2>

      {/* Timer Display */}
      <div className="card p-12 text-center">
        <div className="inline-flex items-center justify-center w-48 h-48 rounded-full border-8 border-primary/20 mb-6">
          <div className="text-center">
            <p className="text-5xl font-bold font-mono text-primary">{formatTime(seconds)}</p>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={() => {
              setSeconds(0);
              setIsRunning(false);
            }}
            className="p-3 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-all"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        <p className="text-text/60">
          {isRunning ? 'Timer running...' : 'Set your rest period and press play'}
        </p>
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Rest Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(RECOVERY_TIMER_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key as any)}
              className={`p-4 rounded-lg transition-all ${
                selectedPreset === key
                  ? 'btn-primary'
                  : 'card hover:border-primary/30'
              }`}
            >
              <Clock size={20} className="mb-2 mx-auto" />
              <p className="text-sm font-medium">{preset.label}</p>
              <p className="text-xs text-text/60 mt-1">{preset.min}-{preset.max}s</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Timer */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Custom Timer</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={customSeconds}
            onChange={(e) => setCustomSeconds(Number(e.target.value))}
            placeholder="Seconds"
            className="input"
          />
          <button onClick={handleCustomTime} className="btn-secondary">
            Set
          </button>
        </div>
      </div>
    </div>
  );
};
