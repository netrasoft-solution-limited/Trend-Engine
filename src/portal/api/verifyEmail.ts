export interface VerifyEmailResponse {
  detail: string;
  organization: string;
}

export async function verifyEmail(token: string, csrfToken: string): Promise<VerifyEmailResponse> {
  const response = await fetch('/portal/api/auth/verify', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ token })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Email verification failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
