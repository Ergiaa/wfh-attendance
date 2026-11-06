import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { EmptyState } from './EmptyState';

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: keyof typeof ALIGN;
  /** Applied to both the header and body cells, e.g. a width or `hidden sm:table-cell`. */
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  /** Accessible name for the table; not rendered visibly. */
  caption: string;
  /** First load, with nothing to show yet: renders skeleton rows. */
  loading?: boolean;
  /** Showing previous data while a refetch (e.g. the next page) is in flight. */
  stale?: boolean;
  empty?: ReactNode;
  footer?: ReactNode;
  skeletonRows?: number;
}

export function Table<T>({
  columns,
  rows,
  getRowId,
  caption,
  loading = false,
  stale = false,
  empty = <EmptyState title="Nothing here yet" />,
  footer,
  skeletonRows = 5,
}: TableProps<T>) {
  const isEmpty = !loading && rows?.length === 0;

  return (
    <div className="overflow-hidden rounded-xl border bg-surface shadow-xs">
      <div className="overflow-x-auto">
        <table
          aria-busy={loading || stale || undefined}
          className={cn('w-full text-sm transition-opacity', stale && 'opacity-60')}
        >
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b bg-surface-muted/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    'px-4 py-2.5 text-xs font-medium whitespace-nowrap text-fg-muted',
                    ALIGN[column.align ?? 'left'],
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: skeletonRows }, (_, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.id} className={cn('px-4 py-3.5', column.className)}>
                        <div
                          className={cn(
                            'h-4 w-3/4 animate-pulse rounded bg-surface-muted',
                            column.align === 'right' && 'ml-auto',
                            column.align === 'center' && 'mx-auto',
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : rows?.map((row) => (
                  <tr key={getRowId(row)} className="transition-colors hover:bg-surface-muted/40">
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          // Scroll sideways on narrow screens rather than squeezing values onto two lines.
                          'px-4 py-3 align-middle whitespace-nowrap',
                          ALIGN[column.align ?? 'left'],
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {isEmpty && <div className="border-t">{empty}</div>}
      {footer && <div className="border-t px-4 py-3">{footer}</div>}
    </div>
  );
}
