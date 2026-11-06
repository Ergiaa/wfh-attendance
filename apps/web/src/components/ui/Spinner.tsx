import { LoaderCircle } from 'lucide-react';

import { cn } from '../../lib/cn';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <LoaderCircle
      role="status"
      aria-label={label}
      className={cn('size-5 animate-spin', className)}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center text-fg-muted">
      <Spinner className="size-8" />
    </div>
  );
}
