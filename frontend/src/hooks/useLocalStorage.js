import { useState, useEffect } from 'react';

/**
 * Persists state to localStorage and keeps it in sync across re-renders.
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key is absent
 */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Silently fail — storage quota or private mode
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
