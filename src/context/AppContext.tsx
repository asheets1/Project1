import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, SafetyWarning } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

interface AppContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  safetyWarnings: SafetyWarning[];
  setSafetyWarnings: (warnings: SafetyWarning[]) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(
    STORAGE_KEYS.USER_PROFILE,
    null
  );
  const [safetyWarnings, setSafetyWarnings] = useLocalStorage<SafetyWarning[]>(
    STORAGE_KEYS.SAFETY_WARNINGS,
    []
  );

  const clearAllData = () => {
    setUserProfile(null);
    setSafetyWarnings([]);
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        safetyWarnings,
        setSafetyWarnings,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
