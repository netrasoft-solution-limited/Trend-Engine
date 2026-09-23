import { Publication } from '../../types';
import { typeLabelToSlug, typeSlugToLabel } from '../../data/publications';

/**
 * Search and filtering for the Dashboard's published-outputs list.
 *
 * Pure functions only, and everything here operates on `Publication` — the
 * shape `data/publications.ts` exposes to the portal. Nothing here reads
 * `data/outputs.ts`, and nothing here needs to: title, summary, type and
 * publish date are all a Publication already carries.
 */

export type DateRangeKey = '7d' | '30d' | '90d' | 'all';
export type SortKey = 'newest' | 'oldest';
export type ReadKey = 'read' | 'unread' | '';

export const DATE_RANGES: { key: DateRangeKey; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'all', label: 'All time' }
];

const RANGE_DAYS: Record<Exclude<DateRangeKey, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

export interface OutputFilters {
  q: string;
  /** A `Publication.type` label, or '' for every type. */
  type: string;
  range: DateRangeKey;
  read: ReadKey;
  sort: SortKey;
}

export const DEFAULT_FILTERS: OutputFilters = { q: '', type: '', range: 'all', read: '', sort: 'newest' };

/** Same lenient parser the Dashboard's charts already relied on, centralised
 * here so the list and the charts can't drift on what "the publish date" means. */
export function dateFromPublishedAt(value: string): Date {
  if (value.startsWith('Today')) return new Date();
  if (value.startsWith('Yesterday')) {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }
  const parsed = new Date(`${value}, ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/** Reads filters from a `URLSearchParams`, defaulting anything missing or malformed. */
export function filtersFromParams(params: URLSearchParams): OutputFilters {
  const range = params.get('range');
  const read = params.get('read');
  const sort = params.get('sort');
  return {
    q: params.get('q') ?? '',
    type: typeSlugToLabel(params.get('type') ?? '') ?? '',
    range: range === '7d' || range === '30d' || range === '90d' ? range : 'all',
    read: read === 'read' || read === 'unread' ? read : '',
    sort: sort === 'oldest' ? 'oldest' : 'newest'
  };
}

/** The inverse of `filtersFromParams` — only non-default values are written,
 * so an unfiltered view keeps a clean `/portal` URL rather than `?q=&type=…`. */
export function filtersToParams(filters: OutputFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  const slug = typeLabelToSlug(filters.type);
  if (slug) params.set('type', slug);
  if (filters.range !== 'all') params.set('range', filters.range);
  if (filters.read) params.set('read', filters.read);
  if (filters.sort !== 'newest') params.set('sort', filters.sort);
  return params;
}

export function isFiltered(filters: OutputFilters): boolean {
  return Boolean(filters.q.trim() || filters.type || filters.range !== 'all' || filters.read);
}

export function matchesFilters(publication: Publication, filters: OutputFilters, isUnread: (id: string) => boolean): boolean {
  if (filters.type && publication.type !== filters.type) return false;

  if (filters.range !== 'all') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RANGE_DAYS[filters.range]);
    if (dateFromPublishedAt(publication.publishedAt) < cutoff) return false;
  }

  if (filters.read === 'unread' && !isUnread(publication.id)) return false;
  if (filters.read === 'read' && isUnread(publication.id)) return false;

  const q = filters.q.trim().toLowerCase();
  if (q) {
    const haystack = `${publication.title} ${publication.summary}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  return true;
}

export function sortPublications(list: Publication[], sort: SortKey): Publication[] {
  const sorted = [...list].sort((a, b) => dateFromPublishedAt(b.publishedAt).getTime() - dateFromPublishedAt(a.publishedAt).getTime());
  return sort === 'oldest' ? sorted.reverse() : sorted;
}

/** Short, human phrases describing each active filter, for the no-results message and chips. */
export function describeFilters(filters: OutputFilters): { key: string; label: string; clear: Partial<OutputFilters> }[] {
  const chips: { key: string; label: string; clear: Partial<OutputFilters> }[] = [];
  if (filters.q.trim()) chips.push({ key: 'q', label: `“${filters.q.trim()}”`, clear: { q: '' } });
  if (filters.type) chips.push({ key: 'type', label: filters.type, clear: { type: '' } });
  if (filters.range !== 'all') {
    const rangeLabel = DATE_RANGES.find((r) => r.key === filters.range)?.label ?? filters.range;
    chips.push({ key: 'range', label: rangeLabel, clear: { range: 'all' } });
  }
  if (filters.read) chips.push({ key: 'read', label: filters.read === 'unread' ? 'Unread' : 'Read', clear: { read: '' } });
  return chips;
}
