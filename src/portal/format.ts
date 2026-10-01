/**
 * Date formatting for the portal.
 *
 * Its own module so that `States.tsx` exports only components, which is
 * what React Fast Refresh needs.
 */
/** Dates arrive as ISO strings; render them the way a reader expects. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
