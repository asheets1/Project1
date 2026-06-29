import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
  BodyweightExercise,
  MachineExercise,
  CardioSession,
  CrossTrainingSession,
} from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

interface WorkoutContextType {
  bodyweightExercises: BodyweightExercise[];
  addBodyweightExercise: (exercise: BodyweightExercise) => void;
  removeBodyweightExercise: (id: string) => void;
  updateBodyweightExercise: (exercise: BodyweightExercise) => void;

  machineExercises: MachineExercise[];
  addMachineExercise: (exercise: MachineExercise) => void;
  removeMachineExercise: (id: string) => void;
  updateMachineExercise: (exercise: MachineExercise) => void;

  cardioSessions: CardioSession[];
  addCardioSession: (session: CardioSession) => void;
  removeCardioSession: (id: string) => void;
  updateCardioSession: (session: CardioSession) => void;

  crossTrainingSessions: CrossTrainingSession[];
  addCrossTrainingSession: (session: CrossTrainingSession) => void;
  removeCrossTrainingSession: (id: string) => void;
  updateCrossTrainingSession: (session: CrossTrainingSession) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bodyweightExercises, setBodyweightExercises] = useLocalStorage<BodyweightExercise[]>(
    STORAGE_KEYS.BODYWEIGHT_EXERCISES,
    []
  );
  const [machineExercises, setMachineExercises] = useLocalStorage<MachineExercise[]>(
    STORAGE_KEYS.MACHINE_EXERCISES,
    []
  );
  const [cardioSessions, setCardioSessions] = useLocalStorage<CardioSession[]>(
    STORAGE_KEYS.CARDIO_SESSIONS,
    []
  );
  const [crossTrainingSessions, setCrossTrainingSessions] = useLocalStorage<CrossTrainingSession[]>(
    STORAGE_KEYS.CROSS_TRAINING,
    []
  );

  return (
    <WorkoutContext.Provider
      value={{
        bodyweightExercises,
        addBodyweightExercise: (exercise) =>
          setBodyweightExercises([...bodyweightExercises, exercise]),
        removeBodyweightExercise: (id) =>
          setBodyweightExercises(bodyweightExercises.filter((e) => e.id !== id)),
        updateBodyweightExercise: (exercise) =>
          setBodyweightExercises(
            bodyweightExercises.map((e) => (e.id === exercise.id ? exercise : e))
          ),

        machineExercises,
        addMachineExercise: (exercise) => setMachineExercises([...machineExercises, exercise]),
        removeMachineExercise: (id) =>
          setMachineExercises(machineExercises.filter((e) => e.id !== id)),
        updateMachineExercise: (exercise) =>
          setMachineExercises(
            machineExercises.map((e) => (e.id === exercise.id ? exercise : e))
          ),

        cardioSessions,
        addCardioSession: (session) => setCardioSessions([...cardioSessions, session]),
        removeCardioSession: (id) =>
          setCardioSessions(cardioSessions.filter((s) => s.id !== id)),
        updateCardioSession: (session) =>
          setCardioSessions(cardioSessions.map((s) => (s.id === session.id ? session : s))),

        crossTrainingSessions,
        addCrossTrainingSession: (session) =>
          setCrossTrainingSessions([...crossTrainingSessions, session]),
        removeCrossTrainingSession: (id) =>
          setCrossTrainingSessions(crossTrainingSessions.filter((s) => s.id !== id)),
        updateCrossTrainingSession: (session) =>
          setCrossTrainingSessions(
            crossTrainingSessions.map((s) => (s.id === session.id ? session : s))
          ),
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkoutContext = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkoutContext must be used within WorkoutProvider');
  }
  return context;
};
