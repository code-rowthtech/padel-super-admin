import { useEffect } from 'react';

export const useLocalStorageSync = (key, onSync) => {
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        onSync(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, onSync]);

  const triggerSync = (data) => {
    localStorage.setItem(key, JSON.stringify({ ...data, timestamp: Date.now() }));
    localStorage.removeItem(key); // Clean up
  };

  return { triggerSync };
};
