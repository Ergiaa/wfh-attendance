import type { EmployeeView } from '@wfh/contracts';
import { createContext, use } from 'react';

import type { Credentials } from '../api/auth';

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: EmployeeView }
  | { status: 'error'; error: Error; retry: () => void };

export interface AuthContextValue {
  state: AuthState;
  login: (credentials: Credentials) => Promise<EmployeeView>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

export function useCurrentUser(): EmployeeView {
  const { state } = useAuth();
  if (state.status !== 'authenticated') {
    throw new Error('useCurrentUser must be used inside <RequireAuth>');
  }
  return state.user;
}
