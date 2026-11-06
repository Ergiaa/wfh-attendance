import { CircleAlert, CircleCheck, Info, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

const TONES: Record<'danger' | 'success' | 'info', { icon: LucideIcon; className: string }> = {
  danger: { icon: CircleAlert, className: 'border-danger/30 bg-danger-soft text-danger' },
  success: { icon: CircleCheck, className: 'border-success/30 bg-success-soft text-success' },
  info: { icon: Info, className: 'border-primary/30 bg-primary-soft text-primary-ink' },
};

export interface AlertProps {
  tone?: keyof typeof TONES;
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const { icon: Icon, className: toneClassName } = TONES[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border p-3 text-sm', toneClassName, className)}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="flex flex-col gap-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-fg">{children}</div>}
      </div>
    </div>
  );
}
