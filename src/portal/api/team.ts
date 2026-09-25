export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  role_label: string;
  status: string;
  last_login: string | null;
}

export interface PendingInvite {
  id: number;
  email: string;
  role: string;
  role_label: string;
  expires_at: string;
  created_at: string;
}

export interface TeamResponse {
  members: TeamMember[];
  invites: PendingInvite[];
}

export async function getTeam(): Promise<TeamResponse> {
  const response = await fetch('/portal/api/team', { credentials: 'include' });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to fetch team: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function inviteTeamMember(email: string, role: string, csrfToken: string): Promise<PendingInvite> {
  const response = await fetch('/portal/api/team', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ email, role })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Inviting team member failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
