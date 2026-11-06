import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-6 py-12 text-center', className)}>
      <span className="mb-1 grid size-10 place-items-center rounded-full bg-surface-muted text-fg-muted">
        <Icon aria-hidden className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
