export interface Notification {
  id: number;
  subject: string;
  body: string;
  channel: 'email' | 'in_app';
  sent_at: string;
  read: boolean;
  publication_id: number | null;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await fetch('/portal/api/notifications', { credentials: 'include' });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to fetch notifications: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function markAllNotificationsRead(csrfToken: string): Promise<void> {
  const response = await fetch('/portal/api/notifications', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRFToken': csrfToken
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Marking notifications read failed: ${response.status} ${response.statusText}`);
  }

  // 204 No Content on success — nothing to parse, nothing to return.
}
