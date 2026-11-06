import type { ComponentProps } from 'react';

import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

const VARIANTS = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary: 'border bg-surface text-fg hover:bg-surface-muted',
  ghost: 'text-fg-muted hover:bg-surface-muted hover:text-fg',
  danger: 'bg-danger text-danger-fg hover:bg-danger-hover',
} as const;

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
} as const;

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors',
        'disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner label="Working" />}
      {children}
    </button>
  );
}
