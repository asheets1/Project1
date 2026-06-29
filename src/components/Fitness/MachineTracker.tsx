import React, { useState } from 'react';
import type { MachineExercise } from '../../types';
import { WorkoutForm } from './WorkoutForm';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from '../../utils/uuid';

export const MachineTracker: React.FC = () => {
  const { machineExercises, addMachineExercise, removeMachineExercise } =
    useWorkoutContext();
  const [showForm, setShowForm] = useState(false);
  const [todayExercises, setTodayExercises] = useState<MachineExercise[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    return machineExercises.filter((e) => e.date === today);
  });

  const handleAddExercise = (data: Record<string, any>) => {
    const today = new Date().toISOString().split('T')[0];
    const exercise: MachineExercise = {
      id: uuidv4(),
      date: today,
      machineName: data.machineName,
      load: Number(data.load),
      reps: Number(data.reps),
      sets: Number(data.sets),
      duration: Number(data.duration),
      notes: data.notes,
    };
    addMachineExercise(exercise);
    setTodayExercises([...todayExercises, exercise]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    removeMachineExercise(id);
    setTodayExercises(todayExercises.filter((e) => e.id !== id));
  };

  const FORM_FIELDS = [
    { name: 'machineName', label: 'Machine Name', type: 'text' as const, placeholder: 'e.g., Leg Press', required: true },
    { name: 'load', label: 'Load (lbs)', type: 'number' as const, step: '5', required: true },
    { name: 'reps', label: 'Reps', type: 'number' as const, required: true },
    { name: 'sets', label: 'Sets', type: 'number' as const, required: true },
    { name: 'duration', label: 'Duration (min)', type: 'number' as const, step: '1' },
    { name: 'notes', label: 'Notes', type: 'textarea' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Stationary Machines</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Machine Session'}
        </button>
      </div>

      {showForm && (
        <WorkoutForm
          title="Log Machine Exercise"
          fields={FORM_FIELDS}
          onSubmit={handleAddExercise}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {todayExercises.map((exercise) => (
          <div key={exercise.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-lg">{exercise.machineName}</h4>
                <p className="text-sm text-text/60">{exercise.load} lbs</p>
              </div>
              <button
                onClick={() => handleDelete(exercise.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-text/60">Sets:</span> <span className="font-medium">{exercise.sets}</span>
              </p>
              <p>
                <span className="text-text/60">Reps:</span> <span className="font-medium">{exercise.reps}</span>
              </p>
              <p>
                <span className="text-text/60">Duration:</span> <span className="font-medium">{exercise.duration} min</span>
              </p>
              {exercise.notes && (
                <p>
                  <span className="text-text/60">Notes:</span> <span className="italic">{exercise.notes}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {todayExercises.length === 0 && !showForm && (
        <div className="card p-12 text-center">
          <p className="text-text/60">No machine sessions logged today.</p>
        </div>
      )}
    </div>
  );
};
