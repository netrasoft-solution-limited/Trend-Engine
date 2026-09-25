export interface Publication {
  id: number;
  type: string;
  type_label: string;
  title: string;
  summary: string;
  published_at: string;
}

export async function getPublications(): Promise<Publication[]> {
  const response = await fetch('/portal/api/publications', { credentials: 'include' });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to fetch publications: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export interface PublicationDetail extends Publication {
  body: string;
}

export async function getPublication(id: number): Promise<PublicationDetail> {
  const response = await fetch(`/portal/api/publications/${id}`, { credentials: 'include' });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to fetch publication: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
