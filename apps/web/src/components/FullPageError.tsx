import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from './ui/Button';

export interface FullPageErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function FullPageError({
  title = 'Something went wrong',
  message,
  onRetry,
  action,
}: FullPageErrorProps) {
  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
          <CircleAlert aria-hidden className="size-6" />
        </span>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-fg-muted">{message}</p>
        <div className="mt-2 flex gap-2">
          {onRetry && <Button onClick={onRetry}>Try again</Button>}
          {action}
        </div>
      </div>
    </div>
  );
}
