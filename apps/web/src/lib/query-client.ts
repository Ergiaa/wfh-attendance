import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../api/client';

const isClientError = (error: unknown) =>
  error instanceof ApiError && error.status >= 400 && error.status < 500;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Retrying a 4xx just repeats the same answer; only network and server errors may be transient.
      retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
    },
  },
});
