export interface Invoice {
  id: number;
  number: string;
  period: string;
  amount: string;
  currency: string;
  status: 'paid' | 'open' | 'void';
  issued_on: string;
  method: string;
}

export interface SubscriptionDetails {
  plan: string;
  status: 'active' | 'past due' | 'cancelled';
  amount_monthly: string;
  currency: string;
  current_period: string;
  renews_on: string | null;
  processor_ref: string;
}

export interface SubscriptionResponse {
  subscription: SubscriptionDetails | null;
  invoices: Invoice[];
}

export async function getSubscription(): Promise<SubscriptionResponse> {
  const response = await fetch('/portal/api/subscription', { credentials: 'include' });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to fetch subscription: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
