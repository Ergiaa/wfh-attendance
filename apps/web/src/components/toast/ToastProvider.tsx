import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../../lib/cn';
import {
  ToastContext,
  ToastHostContext,
  type ToastApi,
  type ToastOptions,
  type ToastTone,
} from './toast-context';

interface Toast extends Required<Pick<ToastOptions, 'tone' | 'title'>> {
  id: number;
  description?: string;
}

const MAX_VISIBLE = 3;

const TONES: Record<ToastTone, { icon: LucideIcon; iconClassName: string; durationMs: number }> = {
  success: { icon: CircleCheck, iconClassName: 'text-success', durationMs: 4000 },
  info: { icon: Info, iconClassName: 'text-primary-ink', durationMs: 4000 },
  // Errors usually need reading and acting on, so they stay longer.
  error: { icon: CircleAlert, iconClassName: 'text-danger', durationMs: 7000 },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(({ tone = 'info', title, description }: ToastOptions) => {
    const toast: Toast = { id: ++nextId.current, tone, title, description };
    setToasts((current) => [...current, toast].slice(-MAX_VISIBLE));
  }, []);

  const registerHost = useCallback((element: HTMLElement) => {
    setHosts((current) => [...current, element]);
    return () => setHosts((current) => current.filter((host) => host !== element));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      success: (title, description) => show({ tone: 'success', title, description }),
      error: (title, description) => show({ tone: 'error', title, description }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext value={api}>
      <ToastHostContext value={registerHost}>{children}</ToastHostContext>
      {createPortal(
        <ol
          aria-label="Notifications"
          className="fixed right-4 bottom-4 left-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-96"
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </ol>,
        hosts.at(-1) ?? document.body,
      )}
    </ToastContext>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const { icon: Icon, iconClassName, durationMs } = TONES[toast.tone];
  const [paused, setPaused] = useState(false);

  // Hovering or focusing pauses the countdown; it restarts in full once the pointer leaves.
  useEffect(() => {
    if (paused) {
      return;
    }
    const timer = setTimeout(() => onDismiss(toast.id), durationMs);
    return () => clearTimeout(timer);
  }, [paused, durationMs, onDismiss, toast.id]);

  return (
    <li
      role={toast.tone === 'error' ? 'alert' : 'status'}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        'flex items-start gap-3 rounded-xl border bg-surface p-4 text-fg shadow-lg',
        'transition duration-200 starting:translate-y-2 starting:opacity-0',
      )}
    >
      <Icon aria-hidden className={cn('mt-0.5 size-5 shrink-0', iconClassName)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm text-fg-muted">{toast.description}</p>}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
        className="-m-1 rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
      >
        <X aria-hidden className="size-4" />
      </button>
    </li>
  );
}
