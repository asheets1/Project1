import React, { useState } from 'react';
import type { UserProfile, HealthGoal, UnitSystem, Sex } from '../../types';
import { HEALTH_GOALS } from '../../utils/constants';
import {
  validateAge,
  validateWeight,
  validateHeight,
  validateRestingHeartRate,
} from '../../utils/validators';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  initialData?: UserProfile;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, initialData }) => {
  const [age, setAge] = useState(initialData?.age || '');
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [height, setHeight] = useState(initialData?.height || '');
  const [restingHeartRate, setRestingHeartRate] = useState(
    initialData?.restingHeartRate || ''
  );
  const [sex, setSex] = useState<Sex>(initialData?.sex || 'male');
  const [goal, setGoal] = useState<HealthGoal>(initialData?.goal || 'strength');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialData?.unitSystem || 'imperial');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);

    const ageValidation = validateAge(ageNum);
    const weightValidation = validateWeight(weightNum);
    const heightValidation = validateHeight(heightNum);

    if (!ageValidation.valid) newErrors.age = ageValidation.error || '';
    if (!weightValidation.valid) newErrors.weight = weightValidation.error || '';
    if (!heightValidation.valid) newErrors.height = heightValidation.error || '';

    // Resting HR is optional; only validate when provided.
    const restingNum = restingHeartRate === '' ? undefined : Number(restingHeartRate);
    if (restingNum !== undefined) {
      const restingValidation = validateRestingHeartRate(restingNum);
      if (!restingValidation.valid) newErrors.restingHeartRate = restingValidation.error || '';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      age: ageNum,
      weight: weightNum,
      height: heightNum,
      sex,
      restingHeartRate: restingNum,
      goal,
      unitSystem,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              setErrors({ ...errors, age: '' });
            }}
            className="input"
            placeholder="Enter your age"
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        <div>
          <label className="label">Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              setErrors({ ...errors, weight: '' });
            }}
            className="input"
            placeholder="Enter your weight"
          />
          {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
        </div>

        <div>
          <label className="label">Height ({unitSystem === 'imperial' ? 'inches' : 'cm'})</label>
          <input
            type="number"
            step="0.1"
            value={height}
            onChange={(e) => {
              setHeight(e.target.value);
              setErrors({ ...errors, height: '' });
            }}
            className="input"
            placeholder="Enter your height"
          />
          {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
        </div>

        <div>
          <label className="label">Resting Heart Rate (bpm)</label>
          <input
            type="number"
            value={restingHeartRate}
            onChange={(e) => {
              setRestingHeartRate(e.target.value);
              setErrors({ ...errors, restingHeartRate: '' });
            }}
            className="input"
            placeholder="Optional — improves effort scoring"
          />
          {errors.restingHeartRate && (
            <p className="text-red-500 text-sm mt-1">{errors.restingHeartRate}</p>
          )}
        </div>

        <div>
          <label className="label">Sex (for BMR calculation)</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            className="input"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="label">Unit System</label>
          <select
            value={unitSystem}
            onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
            className="input"
          >
            <option value="imperial">Imperial (lbs, inches)</option>
            <option value="metric">Metric (kg, cm)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Health Goal</label>
        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value as HealthGoal)}
          className="input"
        >
          {HEALTH_GOALS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary w-full">
        Save Profile
      </button>
    </form>
  );
};
