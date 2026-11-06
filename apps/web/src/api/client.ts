import type { ApiErrorResponse, ApiResponse } from '@wfh/contracts';

import { getToken } from '../auth/session';

export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

let unauthorizedHandler: (() => void) | undefined;

export function onUnauthorized(handler: () => void): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined;
    }
  };
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);
  const body = (await response.json()) as ApiResponse<T>;
  return body.data;
}

async function send(
  path: string,
  { method = 'GET', body, query, signal }: RequestOptions,
): Promise<Response> {
  const token = getToken();
  const headers = new Headers({ Accept: 'application/json' });
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`/api${path}${toQueryString(query)}`, {
      method,
      headers,
      body: payload,
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  if (!response.ok) {
    // Only an existing session can expire; a 401 without a token is a failed login.
    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }
    throw await toApiError(response);
  }
  return response;
}

function toQueryString(query: RequestOptions['query']): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

async function toApiError(response: Response): Promise<ApiError> {
  if (response.status === 429) {
    return new ApiError('Too many attempts. Please wait a minute and try again.', 429);
  }

  const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
  if (body && typeof body.message === 'string') {
    return new ApiError(body.message, response.status, body.errors);
  }
  return new ApiError('Something went wrong. Please try again.', response.status);
}
