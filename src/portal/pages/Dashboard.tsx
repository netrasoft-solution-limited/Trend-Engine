import { Link } from 'react-router-dom';
import { deliveriesForOrg, notificationsForOrg, publicationsForOrg } from '../../data/publications';
import { usePortalSession } from '../session';

function dateFromPublishedAt(value: string) {
  if (value.startsWith('Today')) return new Date();
  const parsed = new Date(`${value}, ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

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
 * here and there must never be one — Arch §9.2/§9.3.
 */
export function Dashboard() {
  const { orgId, orgName } = usePortalSession();
  const loading = false;
  const published = publicationsForOrg(orgId);
  const notifications = notificationsForOrg(orgId);
  const coming = deliveriesForOrg(orgId).filter((item) => item.state === 'in preparation');
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const recent = [...published].sort((a, b) => dateFromPublishedAt(b.publishedAt).getTime() - dateFromPublishedAt(a.publishedAt).getTime()).slice(0, 5);
  const newThisMonth = published.filter((item) => dateFromPublishedAt(item.publishedAt) >= thirtyDaysAgo).length;
  const unread = notifications.filter((item) => !item.read).length;
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

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
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
            <h2 className="text-[15px] font-semibold text-ink">Recently published</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-mute">The newest updates ready for your team to read.</p>
          </div>
        </div>
        {recent.length === 0 ?
        <p className="px-5 py-8 text-center text-sm text-ink-mute">No published outputs yet.</p> :
        <ul className="divide-y divide-line">
            {recent.map((item) =>
          <li key={item.id}>
                <Link to={`/portal/output/${item.id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-shell">
                  <span className="min-w-0 truncate text-sm font-semibold text-ink">{item.title}</span>
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
