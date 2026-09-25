export async function getCsrfToken(): Promise<{ csrfToken: string; selfSignupEnabled: boolean }> {
  const response = await fetch('/portal/api/auth/csrf', { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
