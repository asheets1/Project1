import { useState, useCallback, useEffect } from 'react';

/** Fired after the sync layer rewrites localStorage from the cloud. */
export const SYNC_HYDRATED_EVENT = 'wp-sync-hydrated';
/** Fired whenever the app writes data locally (drives debounced cloud push). */
export const DATA_CHANGED_EVENT = 'wp-data-changed';
/** Bumped on every local write so the sync layer can detect newer local data. */
export const LAST_MODIFIED_KEY = 'wp_last_modified';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const read = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(read);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.localStorage.setItem(LAST_MODIFIED_KEY, String(Date.now()));
        // Notify the sync layer that local data changed (triggers cloud push).
        window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
      } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
      }
    },
    [key, storedValue]
  );

  // Re-read when the cloud sync layer hydrates localStorage, or another tab
  // changes this key, so every context reflects the latest data without a reload.
  useEffect(() => {
    const rehydrate = () => setStoredValue(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) rehydrate();
    };
    window.addEventListener(SYNC_HYDRATED_EVENT, rehydrate);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SYNC_HYDRATED_EVENT, rehydrate);
      window.removeEventListener('storage', onStorage);
    };
  }, [key, read]);

  return [storedValue, setValue];
}
