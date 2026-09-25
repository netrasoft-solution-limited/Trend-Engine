export interface RegisterResponse {
  detail: string;
}

export async function register(
  organizationName: string,
  name: string,
  email: string,
  password: string,
  csrfToken: string
): Promise<RegisterResponse> {
  const response = await fetch('/portal/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ organization_name: organizationName, name, email, password })
  });

  // Raised as a plain `Http404` on the backend when `PORTAL_ALLOW_SELF_SIGNUP`
  // is off — DRF's generic {"detail": "Not found."} for that case would read
  // like a routing bug rather than "this feature is deliberately disabled",
  // so it's called out here before the normal body-parsing path runs at all.
  if (response.status === 404) {
    throw new Error('Self-service registration is not enabled on this backend.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Registration failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
