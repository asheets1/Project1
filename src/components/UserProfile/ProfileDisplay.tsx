import React, { useMemo } from 'react';
import type { UserProfile } from '../../types';
import { calculateBMR, calculateTDEE, calculateMacroTargets } from '../../utils/calculations';
import { Activity, Zap } from 'lucide-react';

interface ProfileDisplayProps {
  profile: UserProfile;
}

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile }) => {
  const bmrTdee = useMemo(() => {
    const bmr = calculateBMR(profile.age, profile.weight, profile.height, 'male', profile.unitSystem);
    return calculateTDEE(bmr, profile.goal);
  }, [profile]);

  const macros = useMemo(() => {
    return calculateMacroTargets(bmrTdee.tdee, profile.goal);
  }, [bmrTdee.tdee, profile.goal]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="text-primary" />
          <h3 className="text-lg font-semibold">BMR</h3>
        </div>
        <p className="text-4xl font-bold text-primary mb-2">{bmrTdee.bmr}</p>
        <p className="text-text/60">Calories (base metabolic rate)</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-secondary" />
          <h3 className="text-lg font-semibold">TDEE</h3>
        </div>
        <p className="text-4xl font-bold text-secondary mb-2">{bmrTdee.tdee}</p>
        <p className="text-text/60">Calories (with activity)</p>
      </div>

      <div className="card p-6 md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Daily Macro Targets</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{macros.protein}</p>
            <p className="text-sm text-text/60">Protein (g)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{macros.carbs}</p>
            <p className="text-sm text-text/60">Carbs (g)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{macros.fat}</p>
            <p className="text-sm text-text/60">Fat (g)</p>
          </div>
        </div>
      </div>

      <div className="card p-6 md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Profile Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-text/60">Age</p>
            <p className="text-lg font-semibold">{profile.age} years</p>
          </div>
          <div>
            <p className="text-sm text-text/60">Weight</p>
            <p className="text-lg font-semibold">
              {profile.weight} {profile.unitSystem === 'imperial' ? 'lbs' : 'kg'}
            </p>
          </div>
          <div>
            <p className="text-sm text-text/60">Height</p>
            <p className="text-lg font-semibold">
              {profile.height} {profile.unitSystem === 'imperial' ? 'in' : 'cm'}
            </p>
          </div>
          <div>
            <p className="text-sm text-text/60">Goal</p>
            <p className="text-lg font-semibold capitalize">{profile.goal}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
