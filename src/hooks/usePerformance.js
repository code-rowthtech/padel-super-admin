import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom hook for performance optimization and memory management
 */
export const usePerformance = () => {
  const mountedRef = useRef(true);
  const timeoutRefs = useRef(new Set());
  const intervalRefs = useRef(new Set());

  // Safe setState that checks if component is still mounted
  const safeSetState = useCallback((setState) => {
    return (...args) => {
      if (mountedRef.current) {
        setState(...args);
      }
    };
  }, []);

  // Safe timeout that auto-cleans up
  const safeSetTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        callback();
      }
      timeoutRefs.current.delete(timeoutId);
    }, delay);
    
    timeoutRefs.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Safe interval that auto-cleans up
  const safeSetInterval = useCallback((callback, delay) => {
    const intervalId = setInterval(() => {
      if (mountedRef.current) {
        callback();
      }
    }, delay);
    
    intervalRefs.current.add(intervalId);
    return intervalId;
  }, []);

  // Clear specific timeout
  const clearSafeTimeout = useCallback((timeoutId) => {
    clearTimeout(timeoutId);
    timeoutRefs.current.delete(timeoutId);
  }, []);

  // Clear specific interval
  const clearSafeInterval = useCallback((intervalId) => {
    clearInterval(intervalId);
    intervalRefs.current.delete(intervalId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      // Clear all timeouts
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current.clear();
      
      // Clear all intervals
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current.clear();
    };
  }, []);

  return {
    isMounted: () => mountedRef.current,
    safeSetState,
    safeSetTimeout,
    safeSetInterval,
    clearSafeTimeout,
    clearSafeInterval,
  };
};

/**
 * Hook for debouncing values to prevent excessive API calls
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const { safeSetTimeout, clearSafeTimeout } = usePerformance();

  useEffect(() => {
    const timeoutId = safeSetTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearSafeTimeout(timeoutId);
  }, [value, delay, safeSetTimeout, clearSafeTimeout]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};