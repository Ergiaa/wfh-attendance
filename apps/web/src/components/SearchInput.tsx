import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../lib/cn';

export interface SearchInputProps {
  /** The committed search, usually from the URL. */
  value: string;
  /** Called with the trimmed text once typing pauses, or immediately on clear. */
  onSearch: (value: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
}

const DEBOUNCE_MS = 300;

export function SearchInput({ value, onSearch, label, placeholder, className }: SearchInputProps) {
  const [input, setInput] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Follow changes made outside the input (back/forward, a "Clear search" button elsewhere)
  // without clobbering text that already matches.
  const [committed, setCommitted] = useState(value);
  if (value !== committed) {
    setCommitted(value);
    if (value !== input.trim()) {
      setInput(value);
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const change = (next: string) => {
    setInput(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(next.trim()), DEBOUNCE_MS);
  };

  const clear = () => {
    clearTimeout(timer.current);
    setInput('');
    onSearch('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
      />
      <input
        type="search"
        value={input}
        onChange={(event) => change(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && input && clear()}
        placeholder={placeholder}
        aria-label={label}
        maxLength={100}
        className="h-10 w-full rounded-lg border bg-surface pr-9 pl-9 text-sm placeholder:text-fg-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {input && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-fg-muted hover:bg-surface-muted hover:text-fg"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}
