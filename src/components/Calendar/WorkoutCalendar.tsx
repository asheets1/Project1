import React, { useMemo, useState } from 'react';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useDietContext } from '../../context/DietContext';
import { useAppContext } from '../../context/AppContext';
import {
  buildDayActivityMap,
  buildMonthGrid,
  emptyDayActivity,
  isRestRecommended,
  toDateKey,
} from '../../utils/history';
import { DayDetail } from './DayDetail';
import { ChevronLeft, ChevronRight, Moon } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WorkoutCalendar: React.FC = () => {
  const { cardioSessions, machineExercises, bodyweightExercises, crossTrainingSessions } =
    useWorkoutContext();
  const { meals } = useDietContext();
  const { userProfile } = useAppContext();

  const todayKey = toDateKey(new Date());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const activityMap = useMemo(
    () =>
      buildDayActivityMap(
        {
          cardio: cardioSessions,
          machine: machineExercises,
          bodyweight: bodyweightExercises,
          cross: crossTrainingSessions,
          meals,
        },
        userProfile
      ),
    [cardioSessions, machineExercises, bodyweightExercises, crossTrainingSessions, meals, userProfile]
  );

  const weeks = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goPrev = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };
  const goNext = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };
  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(toDateKey(now));
  };

  const selectedActivity = activityMap[selectedDate] ?? {
    ...emptyDayActivity(selectedDate),
    restRecommended: isRestRecommended(activityMap, selectedDate),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Calendar</h1>
        <p className="text-text/60">
          Browse your training history. Tap any day to see what you logged. 🌙 marks recommended rest days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={goToday} className="btn-secondary btn-sm">Today</button>
              <button onClick={goPrev} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" aria-label="Previous month">
                <ChevronLeft size={20} />
              </button>
              <button onClick={goNext} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" aria-label="Next month">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-text/50 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weeks.flat().map((dateKey) => {
              const [, , dd] = dateKey.split('-');
              const inMonth = Number(dateKey.split('-')[1]) - 1 === viewMonth;
              const act = activityMap[dateKey];
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              const rest = isRestRecommended(activityMap, dateKey);

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`relative aspect-square rounded-lg p-1 flex flex-col items-center justify-start text-sm transition-all border ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:border-primary/30'
                  } ${inMonth ? '' : 'opacity-40'} ${isToday ? 'ring-2 ring-primary/50' : ''}`}
                >
                  <span className={`mt-0.5 ${isToday ? 'font-bold text-primary' : ''}`}>
                    {Number(dd)}
                  </span>

                  {rest && (
                    <Moon size={11} className="absolute top-1 right-1 text-indigo-500" />
                  )}

                  {/* Activity dots */}
                  <div className="flex flex-wrap gap-0.5 justify-center mt-auto mb-1 max-w-full">
                    {act?.cardioCount ? <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> : null}
                    {act?.strengthCount ? <span className="w-1.5 h-1.5 rounded-full bg-primary" /> : null}
                    {act?.bodyweightCount ? <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> : null}
                    {act?.crossCount ? <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> : null}
                    {act?.mealCount ? <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> : null}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-primary/10 text-xs text-text/60">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Cardio</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Strength</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Bodyweight</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Cross-train</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" /> Meals</span>
            <span className="flex items-center gap-1.5"><Moon size={12} className="text-indigo-500" /> Rest day</span>
          </div>
        </div>

        {/* Day detail */}
        <div className="lg:col-span-1">
          <DayDetail date={selectedDate} activity={selectedActivity} />
        </div>
      </div>
    </div>
  );
};
