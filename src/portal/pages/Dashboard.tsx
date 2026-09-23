import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2Icon, CheckIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { NoticeCard } from '../../components/NoticeCard';
import { deliveriesForOrg, notificationsForOrg, publicationsForOrg } from '../../data/publications';
import { usePortalSession } from '../session';
import { isOnboardingOrg, OnboardingChecklist, onboardingService } from '../onboarding/onboardingService';
import {
  DATE_RANGES,
  DEFAULT_FILTERS,
  OutputFilters,
  dateFromPublishedAt,
  describeFilters,
  filtersFromParams,
  filtersToParams,
  isFiltered,
  matchesFilters,
  sortPublications } from
'../dashboard/filterPublications';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-16 max-w-xl rounded-2xl bg-shell" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 rounded-2xl border border-line bg-card" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-64 rounded-2xl border border-line bg-card" />
        <div className="h-64 rounded-2xl border border-line bg-card" />
      </div>
      <div className="h-64 rounded-2xl border border-line bg-card" />
      <div className="h-44 rounded-2xl border border-line bg-card" />
    </div>);
}

/**
 * Reads `data/publications.ts` only. There is no import of the output layer
 * here and there must never be one — Arch §9.2/§9.3. Search and filtering
 * below operate exclusively on `Publication` records, which already exclude
 * withdrawn ones (`publicationsForOrg` filters those out at the source) — so
 * there is no way for a filtered view to surface one.
 */
export function Dashboard() {
  const { orgId, orgName, userId, role } = usePortalSession();
  const loading = false;
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromParams(searchParams);
  const [queryInput, setQueryInput] = useState(filters.q);

  // Org Viewers never see this, regardless of how new the organisation is —
  // onboarding is an Org Admin concern (PRD §3.2).
  const onboardingScope = { orgId, userId };
  const onboardingEligible = role === 'Org Admin' && isOnboardingOrg(orgId);
  const [checklist, setChecklist] = useState<OnboardingChecklist | null>(() =>
    onboardingEligible ? onboardingService.getChecklistSnapshot(onboardingScope) : null
  );
  const [checklistBusy, setChecklistBusy] = useState(false);

  const doneCount = checklist ? checklist.items.filter((i) => i.done).length : 0;
  const totalCount = checklist ? checklist.items.length : 0;
  const allDone = checklist ? doneCount === totalCount : false;
  const showChecklistCard = Boolean(onboardingEligible && checklist && !allDone && !checklist.dismissed);
  const showReopenLink = Boolean(onboardingEligible && checklist && !allDone && checklist.dismissed);
  const showCongrats = Boolean(onboardingEligible && checklist && allDone && !checklist.dismissed);

  async function hideChecklist() {
    setChecklistBusy(true);
    try {
      setChecklist(await onboardingService.dismiss(onboardingScope));
    } finally {
      setChecklistBusy(false);
    }
  }

  async function reopenChecklist() {
    setChecklistBusy(true);
    try {
      setChecklist(await onboardingService.reopen(onboardingScope));
    } finally {
      setChecklistBusy(false);
    }
  }

  const published = publicationsForOrg(orgId);
  const notifications = notificationsForOrg(orgId);
  const coming = deliveriesForOrg(orgId).filter((item) => item.state === 'in preparation');
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const newThisMonth = published.filter((item) => dateFromPublishedAt(item.publishedAt) >= thirtyDaysAgo).length;
  const unread = notifications.filter((item) => !item.read).length;
  const unreadIds = new Set(notifications.filter((n) => !n.read && n.publicationId).map((n) => n.publicationId as string));

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return { date, label: date.toLocaleString('en-US', { month: 'short' }) };
  });
  const monthlyCounts = months.map((month) => ({
    ...month,
    count: published.filter((item) => {
      const date = dateFromPublishedAt(item.publishedAt);
      return date.getMonth() === month.date.getMonth() && date.getFullYear() === month.date.getFullYear();
    }).length
  }));
  const categoryCounts = Array.from(published.reduce((counts, item) => {
    counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
    return counts;
  }, new Map<string, number>())).map(([label, count]) => ({ label, count }));
  const maxMonthlyCount = Math.max(...monthlyCounts.map((month) => month.count), 1);
  const maxCategoryCount = Math.max(...categoryCounts.map((category) => category.count), 1);

  const availableTypes = Array.from(new Set(published.map((p) => p.type)));
  const filteredSorted = sortPublications(
    published.filter((p) => matchesFilters(p, filters, (id) => unreadIds.has(id))),
    filters.sort
  );
  const chips = describeFilters(filters);
  const filtered = isFiltered(filters);

  // Debounced so typing doesn't write a history entry (and re-render) per
  // keystroke. Discrete controls (selects, chips, sort) commit immediately.
  useEffect(() => {
    const id = setTimeout(() => {
      if (queryInput.trim() !== filters.q) {
        updateFilters({ q: queryInput }, { replace: true });
      }
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  useEffect(() => {
    setQueryInput(filters.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  function updateFilters(patch: Partial<OutputFilters>, options?: { replace?: boolean }) {
    setSearchParams(filtersToParams({ ...filters, ...patch }), { replace: options?.replace ?? false });
  }

  function clearAll() {
    setQueryInput('');
    setSearchParams(filtersToParams(DEFAULT_FILTERS));
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {showChecklistCard && checklist &&
      <section className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-5 shadow-panel">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-accent-deep">Get started</p>
              <h2 className="mt-0.5 text-base font-semibold text-ink">Set up your organisation</h2>
              <p className="mt-1 text-xs text-ink-soft">{doneCount} of {totalCount} done</p>
            </div>
            <button
            type="button"
            onClick={hideChecklist}
            disabled={checklistBusy}
            className="text-xs font-semibold text-ink-mute transition-colors duration-150 hover:text-ink hover:underline disabled:cursor-not-allowed disabled:opacity-60">

              Hide for now
            </button>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card">
            <div className="h-full rounded-full bg-accent" style={{ width: `${doneCount / totalCount * 100}%` }} />
          </div>

          <ul className="mt-4 space-y-2">
            {checklist.items.map((item) =>
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-3.5 py-2.5">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                item.done ? 'bg-ok-soft text-ok' : 'bg-shell text-ink-mute'}`
                }>

                    {item.done ? <CheckIcon className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={item.done ? 'text-ink-mute line-through' : 'font-medium text-ink'}>{item.label}</span>
                </span>
                {!item.done && item.href &&
            <Link
              to={item.href}
              className="shrink-0 rounded-lg border border-line bg-shell px-2.5 py-1 text-2xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">

                    Go
                  </Link>
            }
                {!item.done && !item.href &&
            <span className="shrink-0 text-2xs text-ink-mute">Nothing published yet</span>
            }
              </li>
          )}
          </ul>
        </section>
      }

      {showReopenLink &&
      <button
        type="button"
        onClick={reopenChecklist}
        disabled={checklistBusy}
        className="self-start text-xs font-semibold text-accent-deep transition-colors duration-150 hover:underline disabled:cursor-not-allowed disabled:opacity-60">

          Show setup checklist
        </button>
      }

      {showCongrats &&
      <section className="rounded-2xl border border-ok/30 bg-ok-soft/60 p-5 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 shrink-0 text-ok" />
              <p className="text-sm font-semibold text-ink">Nice work — your organisation is all set up.</p>
            </div>
            <button
            type="button"
            onClick={hideChecklist}
            disabled={checklistBusy}
            className="rounded-xl border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:opacity-60">

              Got it
            </button>
          </div>
        </section>
      }

      <header>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Welcome back, {orgName}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          See what has been published for your team, what is new, and what is coming next.
        </p>
      </header>

      <section aria-label="Your summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/portal" className="rounded-2xl border border-line bg-card p-5 shadow-panel transition-colors duration-150 hover:border-ink-mute/40">
          <p className="text-3xl font-bold tabular-nums text-ink">{published.length}</p>
          <p className="mt-2 text-sm font-semibold text-ink">Published outputs</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-mute">Ready for your team to read.</p>
        </Link>
        <Link to="/portal" className="rounded-2xl border border-line bg-card p-5 shadow-panel transition-colors duration-150 hover:border-ink-mute/40">
          <p className="text-3xl font-bold tabular-nums text-ink">{newThisMonth}</p>
          <p className="mt-2 text-sm font-semibold text-ink">New this month</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-mute">Published in the last 30 days.</p>
        </Link>
        <Link to="/portal/notifications" className="rounded-2xl border border-line bg-card p-5 shadow-panel transition-colors duration-150 hover:border-ink-mute/40">
          <p className="text-3xl font-bold tabular-nums text-ink">{unread}</p>
          <p className="mt-2 text-sm font-semibold text-ink">Unread notifications</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-mute">Updates you have not opened yet.</p>
        </Link>
        <Link to="/portal/delivery" className="rounded-2xl border border-line bg-card p-5 shadow-panel transition-colors duration-150 hover:border-ink-mute/40">
          <p className="text-3xl font-bold tabular-nums text-ink">{coming.length}</p>
          <p className="mt-2 text-sm font-semibold text-ink">Coming soon</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-mute">Items being prepared for your team.</p>
        </Link>
      </section>

      <section aria-label="Published output charts" className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-panel">
          <h2 className="text-[15px] font-semibold text-ink">Published over time</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-mute">The number of outputs made available to your team each month.</p>
          {published.length === 0 ?
          <p className="mt-10 text-center text-sm text-ink-mute">No published outputs yet.</p> :
          <div className="mt-6 flex h-40 items-end gap-3" aria-label="Published outputs per month">
              {monthlyCounts.map((month) =>
            <div key={`${month.date.getFullYear()}-${month.date.getMonth()}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="text-2xs font-semibold tabular-nums text-ink-soft">{month.count}</span>
                  <div className="flex h-24 w-full items-end rounded-lg bg-shell px-1">
                    <div className="w-full rounded-md bg-accent" style={{ height: `${month.count / maxMonthlyCount * 100}%` }} />
                  </div>
                  <span className="text-2xs text-ink-mute">{month.label}</span>
                </div>
            )}
            </div>
          }
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-panel">
          <h2 className="text-[15px] font-semibold text-ink">Published by type</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-mute">How your published updates are grouped, so you can see the mix at a glance.</p>
          {categoryCounts.length === 0 ?
          <p className="mt-10 text-center text-sm text-ink-mute">No published outputs yet.</p> :
          <div className="mt-6 space-y-4">
              {categoryCounts.map((category) =>
            <div key={category.label}>
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="truncate font-medium text-ink">{category.label}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-ink-soft">{category.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-shell">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${category.count / maxCategoryCount * 100}%` }} />
                  </div>
                </div>
            )}
            </div>
          }
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Published outputs</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-mute">
              {filtered ?
              `${filteredSorted.length} of ${published.length} published outputs match your filters.` :
              'Everything published for your team, newest first.'}
            </p>
          </div>
        </div>

        {published.length > 0 &&
        <div className="space-y-3 border-b border-line px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search published outputs</span>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
                <input
                type="search"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search title or summary"
                className="w-full min-w-[180px] rounded-xl border border-line bg-shell py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />

              </label>

              <select
              value={filters.type}
              onChange={(e) => updateFilters({ type: e.target.value })}
              aria-label="Filter by output type"
              className="rounded-xl border border-line bg-shell px-2.5 py-2 text-xs font-medium text-ink focus:outline-none">

                <option value="">All types</option>
                {availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>

              <select
              value={filters.range}
              onChange={(e) => updateFilters({ range: e.target.value as OutputFilters['range'] })}
              aria-label="Filter by publication date"
              className="rounded-xl border border-line bg-shell px-2.5 py-2 text-xs font-medium text-ink focus:outline-none">

                {DATE_RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>

              <select
              value={filters.read}
              onChange={(e) => updateFilters({ read: e.target.value as OutputFilters['read'] })}
              aria-label="Filter by read status"
              className="rounded-xl border border-line bg-shell px-2.5 py-2 text-xs font-medium text-ink focus:outline-none">

                <option value="">Read and unread</option>
                <option value="unread">Unread only</option>
                <option value="read">Read only</option>
              </select>

              <button
              type="button"
              onClick={() => updateFilters({ sort: filters.sort === 'newest' ? 'oldest' : 'newest' })}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-shell px-2.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">

                <SlidersHorizontalIcon className="h-3.5 w-3.5" />
                {filters.sort === 'newest' ? 'Newest first' : 'Oldest first'}
              </button>
            </div>

            {chips.length > 0 &&
          <div className="flex flex-wrap items-center gap-1.5">
                {chips.map((chip) =>
            <span
              key={chip.key}
              className="flex items-center gap-1 rounded-full bg-accent-soft py-1 pl-2.5 pr-1.5 text-2xs font-semibold text-accent-deep">

                    {chip.label}
                    <button
                type="button"
                onClick={() => updateFilters(chip.clear)}
                aria-label={`Remove filter ${chip.label}`}
                className="flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-150 hover:bg-accent/20">

                      <XIcon className="h-3 w-3" />
                    </button>
                  </span>
            )}
                <button type="button" onClick={clearAll} className="text-2xs font-semibold text-ink-mute hover:text-ink hover:underline">
                  Clear all
                </button>
              </div>
          }
          </div>
        }

        {published.length === 0 &&
        <p className="px-5 py-8 text-center text-sm text-ink-mute">No published outputs yet.</p>
        }

        {published.length > 0 && filteredSorted.length === 0 &&
        <div className="px-5 py-8">
            <NoticeCard
            icon={SearchIcon}
            title="No results"
            message={`Nothing matches ${chips.map((c) => c.label).join(', ') || 'your filters'}.`}
            action={
            <button type="button" onClick={clearAll} className="text-xs font-semibold text-accent-deep hover:underline">
                Clear all filters
              </button>
            } />

          </div>
        }

        {filteredSorted.length > 0 &&
        <ul className="divide-y divide-line">
            {filteredSorted.map((item) =>
          <li key={item.id}>
                <Link to={`/portal/output/${item.id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-shell">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 truncate text-sm font-semibold text-ink">{item.title}</span>
                      {unreadIds.has(item.id) &&
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />
                  }
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-mute">{item.summary}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-mute">{item.publishedAt}</span>
                </Link>
              </li>
          )}
          </ul>
        }
      </section>

      <section className="rounded-2xl border border-line bg-card shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">What’s coming</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-mute">A preview of the next items being prepared for your team.</p>
          </div>
          <Link to="/portal/delivery" className="text-xs font-semibold text-accent-deep hover:underline">View all</Link>
        </div>
        {coming.length === 0 ?
        <p className="px-5 py-8 text-center text-sm text-ink-mute">Nothing is scheduled right now.</p> :
        <ul className="divide-y divide-line">
            {coming.slice(0, 3).map((item) =>
          <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="min-w-0 truncate text-sm font-semibold text-ink">{item.title}</span>
                <span className="shrink-0 text-xs text-ink-mute">{item.expected}</span>
              </li>
          )}
          </ul>
        }
      </section>
    </div>);
}
