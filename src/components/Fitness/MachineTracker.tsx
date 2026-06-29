import React, { useState } from 'react';
import type { MachineExercise, MuscleGroup } from '../../types';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useAppContext } from '../../context/AppContext';
import { Trash2, Dumbbell, Clock } from 'lucide-react';
import { v4 as uuidv4 } from '../../utils/uuid';
import { MUSCLE_GROUPS } from '../../utils/constants';
import { computeMuscleRecovery, formatTimeUntil } from '../../utils/recovery';

const RECOVERY_BADGE: Record<string, string> = {
  recovered: 'badge-success',
  recovering: 'badge-warning',
  fatigued: 'badge-danger',
};

const muscleLabel = (m: MuscleGroup) =>
  MUSCLE_GROUPS.find((g) => g.value === m)?.label ?? m;

export const MachineTracker: React.FC = () => {
  const { machineExercises, addMachineExercise, removeMachineExercise } = useWorkoutContext();
  const { userProfile } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [machineName, setMachineName] = useState('');
  const [sets, setSets] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayExercises = machineExercises.filter((e) => e.date === today);
  const weightUnit = userProfile?.unitSystem === 'metric' ? 'kg' : 'lbs';

  // Per-muscle recovery across ALL logged strength work (not just today).
  const muscleRecovery = computeMuscleRecovery(machineExercises, userProfile);

  const toggleMuscle = (m: MuscleGroup) => {
    setError('');
    setSelectedMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const resetForm = () => {
    setSelectedMuscles([]);
    setMachineName('');
    setSets('');
    setWeight('');
    setNotes('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMuscles.length === 0) {
      setError('Select at least one muscle group.');
      return;
    }
    if (!sets || Number(sets) <= 0) {
      setError('Enter the number of sets.');
      return;
    }
    if (weight === '' || Number(weight) < 0) {
      setError('Enter the weight used.');
      return;
    }

    const exercise: MachineExercise = {
      id: uuidv4(),
      date: today,
      loggedAt: new Date().toISOString(),
      machineName: machineName.trim() || undefined,
      muscleGroups: selectedMuscles,
      sets: Number(sets),
      weight: Number(weight),
      notes: notes.trim() || undefined,
    };
    addMachineExercise(exercise);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Weights &amp; Machines</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Strength Set'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <h3 className="text-xl font-semibold">Log Strength Work</h3>

          <div>
            <label className="label">Muscle Groups</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((m) => {
                const active = selectedMuscles.includes(m.value);
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => toggleMuscle(m.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface text-text border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Sets</label>
              <input
                type="number"
                value={sets}
                onChange={(e) => { setSets(e.target.value); setError(''); }}
                className="input"
                placeholder="e.g., 3"
                min="1"
              />
            </div>
            <div>
              <label className="label">Weight ({weightUnit})</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => { setWeight(e.target.value); setError(''); }}
                className="input"
                placeholder={`e.g., 120`}
                step="5"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="label">Exercise / Machine Name (optional)</label>
            <input
              type="text"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              className="input"
              placeholder="e.g., Leg Press"
            />
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input resize-none h-20"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Save</button>
            <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Per-muscle recovery windows */}
      {muscleRecovery.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock size={18} /> Muscle Recovery
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {muscleRecovery.map((r) => (
              <div key={r.muscle} className="rounded-lg bg-surface p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{muscleLabel(r.muscle)}</span>
                  <span className={RECOVERY_BADGE[r.status]}>
                    {r.status === 'recovered' ? 'Ready' : formatTimeUntil(r.readyAt)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r.status === 'recovered'
                        ? 'bg-green-500'
                        : r.status === 'fatigued'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${r.percentRecovered}%` }}
                  />
                </div>
                <p className="text-[11px] text-text/60 mt-1">
                  {r.percentRecovered}% recovered · {r.recoveryHours}h window
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's logged strength sets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {todayExercises.map((exercise) => (
          <div key={exercise.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Dumbbell size={18} className="text-primary" />
                  {exercise.machineName || 'Strength Set'}
                </h4>
                <p className="text-sm text-text/60">
                  {exercise.sets} sets · {exercise.weight} {weightUnit}
                </p>
              </div>
              <button
                onClick={() => removeMachineExercise(exercise.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
                aria-label="Delete set"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {exercise.muscleGroups.map((m) => (
                <span key={m} className="badge-primary">{muscleLabel(m)}</span>
              ))}
            </div>

            {exercise.notes && (
              <p className="text-sm mt-3">
                <span className="text-text/60">Notes:</span>{' '}
                <span className="italic">{exercise.notes}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {todayExercises.length === 0 && !showForm && (
        <div className="card p-12 text-center">
          <p className="text-text/60">No strength sets logged today.</p>
        </div>
      )}
    </div>
  );
};
