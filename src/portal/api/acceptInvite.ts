export interface AcceptInviteResponse {
  detail: string;
  organization: string;
}

export async function acceptInvite(
  token: string,
  password: string,
  name: string | undefined,
  csrfToken: string
): Promise<AcceptInviteResponse> {
  const response = await fetch('/portal/api/invites/accept', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    // `name` is optional on the backend (`required=False`) — omitted entirely
    // rather than sent as `undefined`/`""` when not given.
    body: JSON.stringify(name ? { token, password, name } : { token, password })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Accepting the invitation failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
