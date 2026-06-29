import React, { useState, useMemo } from 'react';
import type { Meal } from '../../types';
import { useDietContext } from '../../context/DietContext';
import { useAppContext } from '../../context/AppContext';
import { calculateBMR, calculateTDEE, calculateMacroTargets } from '../../utils/calculations';
import { v4 as uuidv4 } from '../../utils/uuid';

export const MacroTracker: React.FC = () => {
  const { getDailyNutrition, addMeal } = useDietContext();
  const { userProfile } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const today = new Date().toISOString().split('T')[0];
  const dailyNutrition = useMemo(() => getDailyNutrition(today), [getDailyNutrition, today]);

  const tdeeTarget = useMemo(() => {
    if (!userProfile) return null;
    const bmr = calculateBMR(
      userProfile.age,
      userProfile.weight,
      userProfile.height,
      'male',
      userProfile.unitSystem
    );
    return calculateTDEE(bmr, userProfile.goal).tdee;
  }, [userProfile]);

  const targets = useMemo(() => {
    if (!userProfile || tdeeTarget == null) return null;
    return calculateMacroTargets(tdeeTarget, userProfile.goal);
  }, [userProfile, tdeeTarget]);

  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foodName || !formData.calories) return;

    const meal: Meal = {
      id: uuidv4(),
      date: today,
      mealType,
      foodName: formData.foodName,
      quantity: formData.quantity,
      calories: Number(formData.calories),
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
    };

    addMeal(meal);
    setFormData({
      foodName: '',
      quantity: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    });
  };

  const getProgressPercent = (current: number, target: number | undefined) => {
    if (!target) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const MacroBar = ({ label, current, target }: { label: string; current: number; target?: number }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-text/60">{label}</span>
        <span className="font-semibold">{current}g {target ? `/ ${target}g` : ''}</span>
      </div>
      <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all ${
            label.includes('Protein') ? 'bg-primary' : label.includes('Carbs') ? 'bg-secondary' : 'bg-accent'
          }`}
          style={{ width: `${getProgressPercent(current, target)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Daily Nutrition Tracker</h2>

      {/* Macro Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-text/60 text-sm mb-2">Total Calories</p>
          <p className="text-3xl font-bold">{dailyNutrition.totalCalories}</p>
          {tdeeTarget != null && (
            <p className="text-xs text-text/40 mt-1">{tdeeTarget} cal daily target</p>
          )}
        </div>
        <div className="card p-4">
          <p className="text-text/60 text-sm mb-2">Protein</p>
          <p className="text-3xl font-bold text-primary">{dailyNutrition.totalProtein}g</p>
          {targets && <p className="text-xs text-text/40 mt-1">{targets.protein}g target</p>}
        </div>
        <div className="card p-4">
          <p className="text-text/60 text-sm mb-2">Carbs</p>
          <p className="text-3xl font-bold text-secondary">{dailyNutrition.totalCarbs}g</p>
          {targets && <p className="text-xs text-text/40 mt-1">{targets.carbs}g target</p>}
        </div>
        <div className="card p-4">
          <p className="text-text/60 text-sm mb-2">Fat</p>
          <p className="text-3xl font-bold text-accent">{dailyNutrition.totalFat}g</p>
          {targets && <p className="text-xs text-text/40 mt-1">{targets.fat}g target</p>}
        </div>
      </div>

      {/* Macro Bars */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-lg">Daily Progress</h3>
        <MacroBar label="Protein" current={dailyNutrition.totalProtein} target={targets?.protein} />
        <MacroBar label="Carbs" current={dailyNutrition.totalCarbs} target={targets?.carbs} />
        <MacroBar label="Fat" current={dailyNutrition.totalFat} target={targets?.fat} />
      </div>

      {/* Add Meal Form */}
      <div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Meal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="input"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Food Name</label>
              <input
                type="text"
                value={formData.foodName}
                onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                className="input"
                placeholder="e.g., Chicken Breast"
                required
              />
            </div>
            <div>
              <label className="label">Quantity</label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input"
                placeholder="e.g., 150g"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Calories</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="input"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="label">Protein (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">Carbs (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">Fat (g)</label>
              <input
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            Add Meal
          </button>
        </form>
      )}

      {/* Meal List */}
      <div className="space-y-3">
        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
          const meals = dailyNutrition.meals.filter((m) => m.mealType === type);
          if (meals.length === 0) return null;

          return (
            <div key={type} className="card p-4">
              <h4 className="font-semibold capitalize mb-3 text-primary">{type}</h4>
              <div className="space-y-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex justify-between items-start text-sm bg-surface/50 p-2 rounded">
                    <div>
                      <p className="font-medium">{meal.foodName}</p>
                      <p className="text-text/60 text-xs">{meal.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{meal.calories} cal</p>
                      <p className="text-text/60 text-xs">P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
