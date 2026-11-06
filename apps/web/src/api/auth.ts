import type { EmployeeView, LoginResponse } from '@wfh/contracts';

import { request } from './client';

export interface Credentials {
  email: string;
  password: string;
}

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function login(credentials: Credentials): Promise<LoginResponse> {
  return request('/auth/login', { method: 'POST', body: credentials });
}

export function fetchMe(signal?: AbortSignal): Promise<EmployeeView> {
  return request('/auth/me', { signal });
}
