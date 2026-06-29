import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { RecoverySession } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

interface RecoveryContextType {
  sessions: RecoverySession[];
  addSession: (session: RecoverySession) => void;
  removeSession: (id: string) => void;
  updateSession: (session: RecoverySession) => void;
  getCurrentSession: () => RecoverySession | null;
}

const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined);

export const RecoveryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useLocalStorage<RecoverySession[]>(
    `${STORAGE_KEYS.USER_PROFILE}_recovery`,
    []
  );

  const getCurrentSession = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.find((s) => s.date === today) || null;
  };

  return (
    <RecoveryContext.Provider
      value={{
        sessions,
        addSession: (session) => setSessions([...sessions, session]),
        removeSession: (id) => setSessions(sessions.filter((s) => s.id !== id)),
        updateSession: (session) =>
          setSessions(sessions.map((s) => (s.id === session.id ? session : s))),
        getCurrentSession,
      }}
    >
      {children}
    </RecoveryContext.Provider>
  );
};

export const useRecoveryContext = () => {
  const context = useContext(RecoveryContext);
  if (context === undefined) {
    throw new Error('useRecoveryContext must be used within RecoveryProvider');
  }
  return context;
};
