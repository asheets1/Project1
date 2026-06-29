import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  reconcileOnLogin,
  snapshotLocal,
  pushRemote,
  clearLocalData,
} from '../lib/sync';
import { DATA_CHANGED_EVENT } from '../hooks/useLocalStorage';

type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

interface AuthContextType {
  isConfigured: boolean;
  user: User | null;
  loading: boolean;
  syncState: SyncState;
  lastSyncedAt: number | null;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUSH_DEBOUNCE_MS = 1500;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const userRef = useRef<User | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a ref in sync so event handlers always see the current user.
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const flushPush = async () => {
    const current = userRef.current;
    if (!current) return;
    setSyncState('syncing');
    const ok = await pushRemote(current.id, snapshotLocal());
    if (ok) {
      setSyncState('synced');
      setLastSyncedAt(Date.now());
    } else {
      setSyncState('error');
    }
  };

  // Establish session and subscribe to auth changes.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      handleSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track the previous user id so we only reconcile on an actual login.
  const prevUserId = useRef<string | null>(null);

  const handleSession = (session: Session | null) => {
    const nextUser = session?.user ?? null;
    setUser(nextUser);

    if (nextUser && nextUser.id !== prevUserId.current) {
      prevUserId.current = nextUser.id;
      setSyncState('syncing');
      reconcileOnLogin(nextUser.id)
        .then(() => {
          setSyncState('synced');
          setLastSyncedAt(Date.now());
        })
        .catch(() => setSyncState('error'));
    } else if (!nextUser) {
      prevUserId.current = null;
      setSyncState('idle');
    }
  };

  // Debounced cloud push whenever local data changes (while signed in).
  useEffect(() => {
    if (!supabase) return;

    const onChange = () => {
      if (!userRef.current) return;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(flushPush, PUSH_DEBOUNCE_MS);
    };

    const onLeave = () => {
      // Best-effort flush before the tab is hidden/closed.
      if (userRef.current) flushPush();
    };

    window.addEventListener(DATA_CHANGED_EVENT, onChange);
    window.addEventListener('visibilitychange', onLeave);
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, onChange);
      window.removeEventListener('visibilitychange', onLeave);
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp: AuthContextType['signUp'] = async (email, password) => {
    if (!supabase) return { error: 'Sync is not configured.' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    // If email confirmation is on, there's a user but no active session yet.
    const needsConfirmation = !data.session;
    return { needsConfirmation };
  };

  const signIn: AuthContextType['signIn'] = async (email, password) => {
    if (!supabase) return { error: 'Sync is not configured.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // Remove this account's data from the device for privacy; it's safe in the cloud.
    clearLocalData();
    setSyncState('idle');
    setLastSyncedAt(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isConfigured: isSupabaseConfigured,
        user,
        loading,
        syncState,
        lastSyncedAt,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
