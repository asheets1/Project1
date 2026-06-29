import React, { useState } from 'react';
import type { CardioSession } from '../../types';
import { WorkoutForm } from './WorkoutForm';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useAppContext } from '../../context/AppContext';
import { Trash2, Activity, Mountain, HeartPulse } from 'lucide-react';
import { v4 as uuidv4 } from '../../utils/uuid';
import {
  calculatePace,
  calculateAverageSpeed,
  calculateCardioExertion,
  effortLevelLabel,
} from '../../utils/calculations';

const EFFORT_BADGE: Record<string, string> = {
  light: 'badge-success',
  moderate: 'badge-success',
  hard: 'badge-warning',
  very_hard: 'badge-warning',
  severe: 'badge-danger',
};

export const CardioTracker: React.FC = () => {
  const { cardioSessions, addCardioSession, removeCardioSession } = useWorkoutContext();
  const { userProfile } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [cardioType, setCardioType] = useState<'running' | 'cycling'>('running');

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = cardioSessions.filter((s) => s.date === today);

  const distanceUnit = userProfile?.unitSystem === 'metric' ? 'km' : 'miles';
  const elevationUnit = userProfile?.unitSystem === 'metric' ? 'm' : 'ft';
  const speedUnit = userProfile?.unitSystem === 'metric' ? 'km/h' : 'mph';

  const handleAddSession = (data: Record<string, any>) => {
    const session: CardioSession = {
      id: uuidv4(),
      date: today,
      loggedAt: new Date().toISOString(),
      type: cardioType,
      distance: Number(data.distance),
      duration: Number(data.duration),
      avgHeartRate: Number(data.avgHeartRate),
      elevationGain: Number(data.elevationGain) || 0,
      notes: data.notes,
    };
    addCardioSession(session);
    setShowForm(false);
  };

  const formFields = [
    { name: 'distance', label: `Distance (${distanceUnit})`, type: 'number' as const, step: '0.1', required: true },
    { name: 'duration', label: 'Time (minutes)', type: 'number' as const, step: '1', required: true },
    { name: 'avgHeartRate', label: 'Avg Heart Rate (bpm)', type: 'number' as const, required: true },
    { name: 'elevationGain', label: `Elevation Gain (${elevationUnit})`, type: 'number' as const, step: '1' },
    { name: 'notes', label: 'Notes', type: 'textarea' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Cardio Workouts</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Cardio'}
        </button>
      </div>

      {!userProfile?.restingHeartRate && (
        <div className="card p-4 bg-amber-500/10 border border-amber-500/20 text-sm">
          Tip: add your <span className="font-semibold">resting heart rate</span> in your profile for
          more accurate effort &amp; recovery scoring. Using a default of 65&nbsp;bpm for now.
        </div>
      )}

      {showForm && (
        <div className="card p-6">
          <div className="mb-6">
            <label className="label">Activity Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setCardioType('running')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  cardioType === 'running' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                🏃 Running
              </button>
              <button
                onClick={() => setCardioType('cycling')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  cardioType === 'cycling' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                🚴 Cycling
              </button>
            </div>
          </div>

          <WorkoutForm
            title="Log Cardio Session"
            fields={formFields}
            onSubmit={handleAddSession}
            onCancel={() => setShowForm(false)}
            submitLabel="Save Session"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {todaySessions.map((session) => {
          const pace = calculatePace(session.distance, session.duration);
          const avgSpeed = calculateAverageSpeed(session.distance, session.duration);
          const exertion = calculateCardioExertion(session, userProfile);

          return (
            <div key={session.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">
                    {session.type === 'running' ? '🏃' : '🚴'}{' '}
                    {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                  </h4>
                  <p className="text-sm text-text/60">
                    {session.distance} {distanceUnit} in {session.duration} min
                  </p>
                </div>
                <button
                  onClick={() => removeCardioSession(session.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                  aria-label="Delete session"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Effort + recovery summary */}
              <div className="rounded-lg bg-surface p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm text-text/70">
                    <Activity size={16} /> Effort
                  </span>
                  <span className={EFFORT_BADGE[exertion.effortLevel]}>
                    {effortLevelLabel(exertion.effortLevel)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">{exertion.trimp}</p>
                    <p className="text-[11px] text-text/60">Exertion</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-secondary">
                      {Math.round(exertion.hrrFraction * 100)}%
                    </p>
                    <p className="text-[11px] text-text/60">HR Reserve</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-accent">{exertion.recoveryHours}h</p>
                    <p className="text-[11px] text-text/60">Recover</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <p>
                  <span className="text-text/60">Avg Speed:</span>{' '}
                  <span className="font-medium">{avgSpeed} {speedUnit}</span>
                </p>
                {session.type === 'running' && (
                  <p>
                    <span className="text-text/60">Pace:</span>{' '}
                    <span className="font-medium">{pace} /{distanceUnit === 'km' ? 'km' : 'mile'}</span>
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-red-500" />
                  <span className="text-text/60">Avg HR:</span>{' '}
                  <span className="font-medium">{session.avgHeartRate} bpm</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mountain size={14} className="text-text/60" />
                  <span className="text-text/60">Elevation:</span>{' '}
                  <span className="font-medium">{session.elevationGain} {elevationUnit}</span>
                </p>
                {session.notes && (
                  <p>
                    <span className="text-text/60">Notes:</span>{' '}
                    <span className="italic">{session.notes}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {todaySessions.length === 0 && !showForm && (
        <div className="card p-12 text-center">
          <p className="text-text/60">No cardio sessions logged today. Start with a run or ride!</p>
        </div>
      )}
    </div>
  );
};
