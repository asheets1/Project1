import React, { useState } from 'react';
import type { CrossTrainingSession } from '../../types';
import { WorkoutForm } from './WorkoutForm';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from '../../utils/uuid';

export const CrossTrainingTracker: React.FC = () => {
  const { crossTrainingSessions, addCrossTrainingSession, removeCrossTrainingSession } =
    useWorkoutContext();
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = crossTrainingSessions.filter((s) => s.date === today);

  const handleAddSession = (data: Record<string, any>) => {
    const session: CrossTrainingSession = {
      id: uuidv4(),
      date: today,
      loggedAt: new Date().toISOString(),
      name: data.sessionName,
      description: data.exercises || undefined,
      exercises: [],
      totalDuration: Number(data.duration),
      notes: data.notes || undefined,
    };
    addCrossTrainingSession(session);
    setShowForm(false);
  };

  const FORM_FIELDS = [
    { name: 'sessionName', label: 'Session Name', type: 'text' as const, placeholder: 'e.g., Upper Body & Cardio', required: true },
    { name: 'duration', label: 'Total Duration (min)', type: 'number' as const, required: true },
    { name: 'exercises', label: 'Exercises Included', type: 'textarea' as const, placeholder: 'List exercises...' },
    { name: 'notes', label: 'Notes', type: 'textarea' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Cross-Training</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Cross-Training'}
        </button>
      </div>

      {showForm && (
        <WorkoutForm
          title="Log Cross-Training Session"
          fields={FORM_FIELDS}
          onSubmit={handleAddSession}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {todaySessions.map((session) => (
          <div key={session.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-lg">{session.name}</h4>
              <button
                onClick={() => removeCrossTrainingSession(session.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
                aria-label="Delete session"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-text/60">Duration:</span>{' '}
                <span className="font-medium">{session.totalDuration} min</span>
              </p>
              {session.description && (
                <p>
                  <span className="text-text/60">Exercises:</span>{' '}
                  <span className="italic">{session.description}</span>
                </p>
              )}
              {session.notes && (
                <p>
                  <span className="text-text/60">Notes:</span>{' '}
                  <span className="italic">{session.notes}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {todaySessions.length === 0 && !showForm && (
        <div className="card p-12 text-center">
          <p className="text-text/60">No cross-training sessions logged. Mix and match your workouts!</p>
        </div>
      )}
    </div>
  );
};
