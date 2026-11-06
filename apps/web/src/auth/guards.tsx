import type { Role } from '@wfh/contracts';
import { Navigate, Outlet, useLocation, type Location } from 'react-router';

import { FullPageError } from '../components/FullPageError';
import { FullPageSpinner } from '../components/ui/Spinner';
import { homePathFor, paths } from '../lib/paths';
import { useAuth, useCurrentUser } from './auth-context';

interface RedirectState {
  from?: Location;
}

export function RequireAuth() {
  const { state } = useAuth();
  const location = useLocation();

  switch (state.status) {
    case 'loading':
      return <FullPageSpinner />;
    case 'error':
      return <FullPageError message={state.error.message} onRetry={state.retry} />;
    case 'anonymous':
      return (
        <Navigate to={paths.login} replace state={{ from: location } satisfies RedirectState} />
      );
    case 'authenticated':
      return <Outlet />;
  }
}

export function RequireRole({ role }: { role: Role }) {
  const user = useCurrentUser();
  return user.role === role ? <Outlet /> : <Navigate to="/" replace />;
}

// Also performs the post-login redirect: once login() resolves, this re-renders as authenticated.
export function GuestOnly() {
  const { state } = useAuth();
  const location = useLocation();

  if (state.status === 'loading') {
    return <FullPageSpinner />;
  }
  if (state.status === 'authenticated') {
    const from = (location.state as RedirectState | null)?.from;
    return <Navigate to={from ?? homePathFor(state.user)} replace />;
  }
  return <Outlet />;
}

export function HomeRedirect() {
  return <Navigate to={homePathFor(useCurrentUser())} replace />;
}
