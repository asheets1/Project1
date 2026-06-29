import React, { useState } from 'react';
import type { BodyweightExercise } from '../../types';
import { WorkoutForm } from './WorkoutForm';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from '../../utils/uuid';

export const BodyweightTracker: React.FC = () => {
  const { bodyweightExercises, addBodyweightExercise, removeBodyweightExercise } =
    useWorkoutContext();
  const [showForm, setShowForm] = useState(false);
  const [todayExercises, setTodayExercises] = useState<BodyweightExercise[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    return bodyweightExercises.filter((e) => e.date === today);
  });

  const handleAddExercise = (data: Record<string, any>) => {
    const today = new Date().toISOString().split('T')[0];
    const exercise: BodyweightExercise = {
      id: uuidv4(),
      date: today,
      name: data.exerciseName,
      reps: Number(data.reps),
      sets: Number(data.sets),
      difficulty: data.difficulty,
      notes: data.notes,
    };
    addBodyweightExercise(exercise);
    setTodayExercises([...todayExercises, exercise]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    removeBodyweightExercise(id);
    setTodayExercises(todayExercises.filter((e) => e.id !== id));
  };

  const FORM_FIELDS = [
    { name: 'exerciseName', label: 'Exercise Name', type: 'text' as const, placeholder: 'e.g., Push-ups', required: true },
    { name: 'reps', label: 'Reps', type: 'number' as const, required: true },
    { name: 'sets', label: 'Sets', type: 'number' as const, required: true },
    {
      name: 'difficulty',
      label: 'Difficulty',
      type: 'select' as const,
      options: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
      ],
      required: true,
    },
    { name: 'notes', label: 'Notes', type: 'textarea' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Bodyweight Exercises</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Exercise'}
        </button>
      </div>

      {showForm && (
        <WorkoutForm
          title="Log Bodyweight Exercise"
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
                <h4 className="font-semibold text-lg">{exercise.name}</h4>
                <span className="badge badge-primary">{exercise.difficulty}</span>
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
          <p className="text-text/60">No exercises logged today. Start by adding your first one!</p>
        </div>
      )}
    </div>
  );
};
