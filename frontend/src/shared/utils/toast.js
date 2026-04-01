import { useCallback, useRef, useState } from "react";

/**
 * useToast - React hook for managing toast notifications.
 * Returns: [toasts, addToast, removeToast]
 */
export function useToast(timeout = 4000) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const addToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, message, type }]);
    timers.current[id] = setTimeout(() => {
      removeToast(id);
    }, timeout);
  }, [timeout, removeToast]);

  return [toasts, addToast, removeToast];
}