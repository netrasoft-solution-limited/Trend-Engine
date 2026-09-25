export interface Delivery {
  id: number;
  type: string;
  title: string;
  state: 'in preparation' | 'published' | 'delivered';
  updated_at: string;
}

export async function getDeliveries(): Promise<Delivery[]> {
  const response = await fetch('/portal/api/deliveries', { credentials: 'include' });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to fetch deliveries: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
