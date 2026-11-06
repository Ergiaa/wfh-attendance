import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '../../lib/cn';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, limit, total, onPageChange, disabled }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-fg-muted">
        {total === 0 ? (
          'No results'
        ) : (
          <>
            Showing <span className="font-medium text-fg">{first}</span>–
            <span className="font-medium text-fg">{last}</span> of{' '}
            <span className="font-medium text-fg">{total}</span>
          </>
        )}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Previous page"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft aria-hidden />
          </Button>

          <span className="px-2 text-fg-muted sm:hidden">
            Page {page} of {totalPages}
          </span>
          <ol className="hidden items-center gap-1 sm:flex">
            {pageItems(page, totalPages).map((item, index) =>
              item === 'gap' ? (
                <li key={`gap-${index}`} aria-hidden className="px-1.5 text-fg-muted">
                  …
                </li>
              ) : (
                <li key={item}>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? 'page' : undefined}
                    disabled={disabled}
                    onClick={() => onPageChange(item)}
                    className={cn(
                      'min-w-8 px-2 tabular-nums',
                      item === page && 'bg-primary-soft text-primary-ink hover:bg-primary-soft',
                    )}
                  >
                    {item}
                  </Button>
                </li>
              ),
            )}
          </ol>

          <Button
            variant="secondary"
            size="sm"
            aria-label="Next page"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      )}
    </nav>
  );
}

// Always shows the first, last and current page with one neighbour each side, so the list
// never exceeds 7 slots: 1 … 4 5 6 … 12.
function pageItems(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'gap', totalPages];
  }
  if (page >= totalPages - 3) {
    return [1, 'gap', ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)];
  }
  return [1, 'gap', page - 1, page, page + 1, 'gap', totalPages];
}
