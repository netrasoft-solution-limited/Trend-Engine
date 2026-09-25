export interface ResendVerificationResponse {
  detail: string;
}

export async function resendVerification(email: string, csrfToken: string): Promise<ResendVerificationResponse> {
  const response = await fetch('/portal/api/auth/verify/resend', {
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
    throw new Error(body?.detail ?? `Resending the verification link failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
