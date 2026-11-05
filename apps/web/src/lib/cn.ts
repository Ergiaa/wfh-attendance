import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Lets a component's `className` prop override its defaults (`px-4` + `px-2` resolves to `px-2`).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
