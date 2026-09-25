import type { LoginResponse } from './login';

export async function getSession(): Promise<LoginResponse> {
  const response = await fetch('/portal/api/auth/session', { credentials: 'include' });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to fetch session: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
