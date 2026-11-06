import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface TextFieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function TextField({ label, error, hint, id, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          'h-10 rounded-lg border bg-surface px-3 text-sm transition-colors placeholder:text-fg-muted',
          'focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-muted',
          error && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20',
        )}
        {...props}
      />
      {message && (
        <p id={messageId} className={cn('text-xs', error ? 'text-danger' : 'text-fg-muted')}>
          {message}
        </p>
      )}
    </div>
  );
}
