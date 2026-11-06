import { createContext, use, useCallback, type RefCallback } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastOptions {
  tone?: ToastTone;
  title: string;
  description?: string;
}

export interface ToastApi {
  show: (toast: ToastOptions) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

type RegisterHost = (element: HTMLElement) => () => void;

// Everything outside an open modal <dialog> is blocked from pointer input, even when drawn above
// it, so a toast there couldn't be clicked (the click would hit the backdrop and close the modal).
// Modals register a slot via this hook and the provider renders toasts inside the topmost one.
export const ToastHostContext = createContext<RegisterHost | null>(null);

export function useToastHost(): RefCallback<HTMLElement> {
  const register = use(ToastHostContext);
  return useCallback(
    (element: HTMLElement | null) => (element && register ? register(element) : undefined),
    [register],
  );
}

export function useToast(): ToastApi {
  const context = use(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return context;
}
