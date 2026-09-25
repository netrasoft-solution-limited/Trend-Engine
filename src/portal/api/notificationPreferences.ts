export interface NotificationPreference {
  key: string;
  label: string;
  detail: string;
  locked: boolean;
  enabled: boolean;
}

export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  const response = await fetch('/portal/api/notifications/preferences', { credentials: 'include' });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to fetch notification preferences: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function updateNotificationPreference(
  key: string,
  enabled: boolean,
  csrfToken: string
): Promise<{ key: string; enabled: boolean }> {
  const response = await fetch('/portal/api/notifications/preferences', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ key, enabled })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Updating notification preference failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
