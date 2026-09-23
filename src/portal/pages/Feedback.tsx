import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, MessageSquareIcon, RotateCcwIcon } from 'lucide-react';
import { AdminOnly } from '../AdminOnly';
import { NoticeCard } from '../../components/NoticeCard';
import { usePortalSession } from '../session';
import { feedbackService, FeedbackSummaryRow } from '../feedback/feedbackService';

export function Feedback() {
  const { orgId, userId } = usePortalSession();
  const scope = { orgId, userId };

  // Seeded synchronously — see the note on `teamService.listMembersSnapshot`.
  const [rows, setRows] = useState<FeedbackSummaryRow[] | null>(() => feedbackService.getFeedbackSummarySnapshot(scope));
  const [loadError, setLoadError] = useState(false);

  function load() {
    setRows(null);
    setLoadError(false);
    feedbackService
      .getFeedbackSummary(scope)
      .then(setRows)
      .catch(() => setLoadError(true));
  }

  return (
    <AdminOnly>
      <div>
        <header className="mb-6">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Feedback</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            How your team is rating what’s been published, and what hasn’t had a response yet.
          </p>
        </header>

        {rows === null && !loadError &&
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-card px-5 py-8 text-sm text-ink-soft shadow-panel">
            <RotateCcwIcon className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        }

        {loadError &&
        <NoticeCard
          icon={AlertTriangleIcon}
          tone="bad"
          title="Couldn’t load feedback"
          message="Something went wrong loading the summary."
          action={
          <button type="button" onClick={load} className="text-xs font-semibold text-accent-deep hover:underline">
              Try again
            </button>
          } />

        }

        {rows !== null && !loadError && rows.length === 0 &&
        <NoticeCard
          icon={MessageSquareIcon}
          title="Nothing published yet"
          message="Once something is published to your organisation, you’ll be able to see how your team is rating it here." />

        }

        {rows !== null && !loadError && rows.length > 0 &&
        <ul className="divide-y divide-line rounded-2xl border border-line bg-card shadow-panel">
            {rows.map((row) => {
              const total = row.useful + row.notRelevant;
              return (
                <li key={row.publicationId} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                  <Link
                    to={`/portal/output/${row.publicationId}`}
                    className="min-w-0 flex-1 truncate text-sm font-semibold text-ink hover:underline">

                    {row.publicationTitle}
                  </Link>
                  {total === 0 ?
                <span className="shrink-0 rounded-full bg-shell px-2.5 py-1 text-2xs font-semibold text-ink-mute">
                      No feedback yet
                    </span> :

                <span className="flex shrink-0 items-center gap-3 text-xs font-semibold">
                      <span className="text-ok">{row.useful} useful</span>
                      <span className="text-ink-mute">{row.notRelevant} not relevant</span>
                    </span>
                }
                </li>);

            })}
          </ul>
        }
      </div>
    </AdminOnly>);

}
