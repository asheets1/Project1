import React, { useState } from 'react';
import type { CardioSession } from '../../types';
import { WorkoutForm } from './WorkoutForm';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from '../../utils/uuid';
import { calculatePace, calculateAverageSpeed } from '../../utils/calculations';

export const CardioTracker: React.FC = () => {
  const { cardioSessions, addCardioSession, removeCardioSession } = useWorkoutContext();
  const [showForm, setShowForm] = useState(false);
  const [cardioType, setCardioType] = useState<'running' | 'cycling'>('running');
  const [todaySessions, setTodaySessions] = useState<CardioSession[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    return cardioSessions.filter((s) => s.date === today);
  });

  const handleAddSession = (data: Record<string, any>) => {
    const today = new Date().toISOString().split('T')[0];
    const session: CardioSession = {
      id: uuidv4(),
      date: today,
      type: cardioType,
      distance: Number(data.distance),
      duration: Number(data.duration),
      pace: cardioType === 'running' ? Number(data.pace) : undefined,
      cadence: cardioType === 'cycling' ? Number(data.cadence) : undefined,
      heartRate: data.heartRate ? Number(data.heartRate) : undefined,
      notes: data.notes,
    };
    addCardioSession(session);
    setTodaySessions([...todaySessions, session]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    removeCardioSession(id);
    setTodaySessions(todaySessions.filter((s) => s.id !== id));
  };

  const getFormFields = () => {
    const commonFields = [
      { name: 'distance', label: 'Distance (miles)', type: 'number' as const, step: '0.1', required: true },
      { name: 'duration', label: 'Duration (minutes)', type: 'number' as const, step: '1', required: true },
      { name: 'heartRate', label: 'Avg Heart Rate (bpm)', type: 'number' as const },
      { name: 'notes', label: 'Notes', type: 'textarea' as const },
    ];

    if (cardioType === 'running') {
      return [
        { name: 'pace', label: 'Target Pace (min/mile)', type: 'text' as const, placeholder: 'e.g., 8:30' },
        ...commonFields,
      ];
    } else {
      return [
        { name: 'cadence', label: 'Cadence (rpm)', type: 'number' as const },
        ...commonFields,
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Cardio Workouts</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Cardio'}
        </button>
      </div>

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
            fields={getFormFields()}
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

          return (
            <div key={session.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">
                    {session.type === 'running' ? '🏃' : '🚴'} {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                  </h4>
                  <p className="text-sm text-text/60">{session.distance} miles in {session.duration} min</p>
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-text/60">Avg Speed:</span> <span className="font-medium">{avgSpeed} mph</span>
                </p>
                {session.type === 'running' && (
                  <p>
                    <span className="text-text/60">Pace:</span> <span className="font-medium">{pace} /mile</span>
                  </p>
                )}
                {session.type === 'cycling' && session.cadence && (
                  <p>
                    <span className="text-text/60">Cadence:</span> <span className="font-medium">{session.cadence} rpm</span>
                  </p>
                )}
                {session.heartRate && (
                  <p>
                    <span className="text-text/60">Avg HR:</span> <span className="font-medium">{session.heartRate} bpm</span>
                  </p>
                )}
                {session.notes && (
                  <p>
                    <span className="text-text/60">Notes:</span> <span className="italic">{session.notes}</span>
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
