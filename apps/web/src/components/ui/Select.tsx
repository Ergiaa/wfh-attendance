import { ChevronDown } from 'lucide-react';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface SelectProps extends ComponentProps<'select'> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function Select({ label, error, hint, id, className, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;
  const message = error ?? hint;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={selectId} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border bg-surface pr-9 pl-3 text-sm transition-colors',
            'focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-muted',
            error && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20',
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
        />
      </div>
      {message && (
        <p id={messageId} className={cn('text-xs', error ? 'text-danger' : 'text-fg-muted')}>
          {message}
        </p>
      )}
    </div>
  );
}
