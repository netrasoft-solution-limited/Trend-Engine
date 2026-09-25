interface Organization {
  id: number;
  slug: string;
  name: string;
}

interface Membership {
  id: number;
  organization: Organization;
  role: string;
  role_label: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  role_label: string;
  organization: Organization;
  memberships: Membership[];
}

export async function login(email: string, password: string, csrfToken: string): Promise<LoginResponse> {
  const response = await fetch('/portal/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Login failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
