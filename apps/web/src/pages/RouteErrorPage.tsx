import { useRouteError } from 'react-router';

import { FullPageError } from '../components/FullPageError';

export function RouteErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';

  return <FullPageError message={message} onRetry={() => window.location.reload()} />;
}
