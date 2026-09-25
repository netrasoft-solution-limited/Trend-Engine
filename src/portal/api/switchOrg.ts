import type { LoginResponse } from './login';

export async function switchOrg(organizationId: number, csrfToken: string): Promise<LoginResponse> {
  const response = await fetch('/portal/api/auth/org', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ organization_id: organizationId })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Switching organisation failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
