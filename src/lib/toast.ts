import { useEffect, useState, useCallback } from 'react';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;
let listeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function notify() {
  listeners.forEach((l) => l([...currentToasts]));
}

export function showToast(message: string, type: Toast['type'] = 'success') {
  const id = ++toastId;
  currentToasts = [...currentToasts, { id, message, type }];
  notify();
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notify();
  }, []);

  return { toasts, dismiss };
}
