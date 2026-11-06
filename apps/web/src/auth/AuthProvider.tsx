import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authKeys, fetchMe, login as loginRequest, type Credentials } from '../api/auth';
import { onUnauthorized } from '../api/client';
import { useToast } from '../components/toast/toast-context';
import { AuthContext, type AuthContextValue, type AuthState } from './auth-context';
import { clearToken, getToken, setToken } from './session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [token, setTokenState] = useState(getToken);

  // Restores the user behind a stored token; after login the cache is seeded so this never fires.
  const me = useQuery({
    queryKey: authKeys.me,
    queryFn: ({ signal }) => fetchMe(signal),
    enabled: token !== null,
    staleTime: Infinity,
    retry: false,
  });

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(
    () =>
      onUnauthorized((error) => {
        // Parallel requests can all 401; only the first one still finds a token to clear.
        if (getToken() === null) {
          return;
        }
        logout();
        // The server says why: an expired token, or an account deactivated or deleted by HRD.
        toast.show({ title: error.message, description: "You've been signed out." });
      }),
    [logout, toast],
  );

  const login = useCallback(
    async (credentials: Credentials) => {
      const { accessToken, employee } = await loginRequest(credentials);
      setToken(accessToken);
      queryClient.setQueryData(authKeys.me, employee);
      setTokenState(accessToken);
      return employee;
    },
    [queryClient],
  );

  const { data: user, error, refetch } = me;
  const value = useMemo<AuthContextValue>(() => {
    let state: AuthState;
    if (token === null) {
      state = { status: 'anonymous' };
    } else if (user) {
      state = { status: 'authenticated', user };
    } else if (error) {
      state = { status: 'error', error, retry: () => void refetch() };
    } else {
      state = { status: 'loading' };
    }
    return { state, login, logout };
  }, [token, user, error, refetch, login, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
