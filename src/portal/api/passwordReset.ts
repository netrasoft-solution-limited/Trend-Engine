export interface PasswordResetResponse {
  detail: string;
}

export async function requestPasswordReset(email: string, csrfToken: string): Promise<PasswordResetResponse> {
  const response = await fetch('/portal/api/auth/password-reset', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Password reset request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
