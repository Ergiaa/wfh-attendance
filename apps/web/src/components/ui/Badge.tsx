import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

const TONES = {
  neutral: 'bg-surface-muted text-fg-muted',
  primary: 'bg-primary-soft text-primary-ink',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
} as const;

export interface BadgeProps {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
