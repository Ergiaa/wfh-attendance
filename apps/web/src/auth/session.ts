const TOKEN_KEY = 'wfh.accessToken';

// Storage access throws in some privacy modes; treat that as "no session" rather than crashing.
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // The session still works for this tab via in-memory auth state.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing persisted, nothing to clear.
  }
}
