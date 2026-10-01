import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { api } from '../api';
import { usePortalSession } from '../session';
import { useAsync } from '../useAsync';
import { Empty, ErrorState, Loading } from '../States';
import { formatDateTime } from '../format';

/**
 * Reads the API only. There is no `data/*` import here and there must never be
 * one — `npm run boundary` fails the build if one appears.
 *
 * Everything listed has been through the publication gate. An APPROVED output
 * is not here, which is the entire point of PRD §6.9.
 */
export function Dashboard() {
  const session = usePortalSession();
  const { data, loading, error, reload } = useAsync(
    () => api.publications(),
    [session.organization.id]
  );
  const [type, setType] = useState('All');

  const publications = data ?? [];
  const types = ['All', ...Array.from(new Set(publications.map((p) => p.type_label)))];
  const visible = type === 'All' ? publications : publications.filter((p) => p.type_label === type);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">
          Published to {session.organization.name}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Everything here has been reviewed and approved by the Pure Play team before it reached
          you. Work still in progress appears under{' '}
          <Link to="/portal/delivery" className="font-semibold text-accent-deep hover:underline">
            what’s coming
          </Link>
          .
        </p>
      </header>

      {loading && <Loading label="Loading what's been published…" />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {!loading && !error &&
      <>
          {publications.length > 1 &&
        <div className="mb-4 flex flex-wrap gap-1.5">
              {types.map((t) =>
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            type === t ? 'bg-ink text-white' : 'bg-card text-ink-soft hover:text-ink'}`
            }>
            
                  {t}
                </button>
          )}
            </div>
        }

          {visible.length === 0 ?
        <Empty
          title="Nothing published yet"
          detail="You'll get an email the moment something is ready to read." /> :


        <ul className="space-y-3">
              {visible.map((p) =>
          <li key={p.id}>
                  <Link
              to={`/portal/output/${p.id}`}
              className="block rounded-2xl border border-line bg-card p-5 shadow-panel transition-colors duration-150 hover:border-ink-mute/40">
              
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="rounded-full bg-shell px-2.5 py-1 text-2xs font-semibold text-ink-soft">
                        {p.type_label}
                      </span>
                      <span className="text-2xs text-ink-mute">{formatDateTime(p.published_at)}</span>
                    </div>
                    <h2 className="mt-2.5 text-lg font-semibold leading-snug text-ink">{p.title}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.summary}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-deep">
                      Read
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
          )}
            </ul>
        }
        </>
      }
    </div>);

}
