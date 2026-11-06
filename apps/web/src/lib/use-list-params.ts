import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

type ParamValue = string | number | undefined;

// Keeps a list page's page number and filters in the URL, so refresh, back/forward and shared
// links all reproduce the same view.
export function useListParams() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Math.trunc(Number(params.get('page'))) || 1);

  const get = useCallback((key: string) => params.get(key) ?? '', [params]);

  /** Changing any filter returns to page 1, since the old page may no longer exist. */
  const update = useCallback(
    (changes: Record<string, ParamValue>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined || value === '') {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          if (!('page' in changes) || next.get('page') === '1') {
            next.delete('page');
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setPage = useCallback((value: number) => update({ page: value }), [update]);

  return { page, get, update, setPage };
}
