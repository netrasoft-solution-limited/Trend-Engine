export interface PasswordResetConfirmResponse {
  detail: string;
}

export async function confirmPasswordReset(
  uid: string,
  token: string,
  newPassword: string,
  csrfToken: string
): Promise<PasswordResetConfirmResponse> {
  const response = await fetch('/portal/api/auth/password-reset/confirm', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ uid, token, password: newPassword })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Password reset confirmation failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
