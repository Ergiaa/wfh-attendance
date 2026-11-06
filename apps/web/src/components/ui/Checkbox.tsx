import { Check } from 'lucide-react';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string;
  description?: ReactNode;
}

export function Checkbox({ label, description, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;

  return (
    <div className={cn('flex gap-3', className)}>
      <div className="relative mt-0.5 grid size-4 shrink-0 place-items-center">
        <input
          id={inputId}
          type="checkbox"
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'peer size-4 appearance-none rounded border bg-surface transition-colors',
            'checked:border-primary checked:bg-primary',
            'focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
          {...props}
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute size-3 text-primary-fg opacity-0 peer-checked:opacity-100"
        />
      </div>
      <div className="text-sm">
        <label htmlFor={inputId} className="font-medium">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-fg-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
