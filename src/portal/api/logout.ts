export async function logout(csrfToken: string): Promise<void> {
  const response = await fetch('/portal/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRFToken': csrfToken
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Logout failed: ${response.status} ${response.statusText}`);
  }

  // 204 No Content on success — nothing to parse, nothing to return.
}
