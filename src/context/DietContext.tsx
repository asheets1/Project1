import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Meal, DailyNutrition } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

interface DietContextType {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  removeMeal: (id: string) => void;
  updateMeal: (meal: Meal) => void;
  getMealsForDate: (date: string) => Meal[];
  getDailyNutrition: (date: string) => DailyNutrition;
}

const DietContext = createContext<DietContextType | undefined>(undefined);

export const DietProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useLocalStorage<Meal[]>(STORAGE_KEYS.MEALS, []);

  const getMealsForDate = (date: string) => {
    return meals.filter((m) => m.date === date);
  };

  const getDailyNutrition = (date: string): DailyNutrition => {
    const dateMeals = getMealsForDate(date);
    return {
      date,
      meals: dateMeals,
      totalCalories: dateMeals.reduce((sum, m) => sum + m.calories, 0),
      totalProtein: dateMeals.reduce((sum, m) => sum + m.protein, 0),
      totalCarbs: dateMeals.reduce((sum, m) => sum + m.carbs, 0),
      totalFat: dateMeals.reduce((sum, m) => sum + m.fat, 0),
    };
  };

  return (
    <DietContext.Provider
      value={{
        meals,
        addMeal: (meal) => setMeals([...meals, meal]),
        removeMeal: (id) => setMeals(meals.filter((m) => m.id !== id)),
        updateMeal: (meal) => setMeals(meals.map((m) => (m.id === meal.id ? meal : m))),
        getMealsForDate,
        getDailyNutrition,
      }}
    >
      {children}
    </DietContext.Provider>
  );
};

export const useDietContext = () => {
  const context = useContext(DietContext);
  if (context === undefined) {
    throw new Error('useDietContext must be used within DietProvider');
  }
  return context;
};
