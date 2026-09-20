import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { usePortalSession } from '../session';
import { publicationsForOrg } from '../../data/publications';

/**
 * Reads `data/publications.ts` only. There is no import of the output layer
 * here and there must never be one — Arch §9.2/§9.3.
 */
export function Dashboard() {
  const { orgId, orgName } = usePortalSession();
  const published = publicationsForOrg(orgId);
  const [type, setType] = useState('All');

  const types = ['All', ...Array.from(new Set(published.map((p) => p.type)))];
  const visible = type === 'All' ? published : published.filter((p) => p.type === type);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Published to {orgName}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Everything here has been reviewed and approved by the Pure Play team before it reached you. Work still in
          progress appears under <Link to="/portal/delivery" className="font-semibold text-accent-deep hover:underline">what’s coming</Link>.
        </p>
      </header>

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

      {visible.length === 0 ?
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
          <p className="text-sm font-semibold text-ink">Nothing published in this category yet</p>
          <p className="mt-1 text-xs text-ink-soft">
            You’ll get an email the moment something is ready to read.
          </p>
        </div> :

      <ul className="space-y-3">
          {visible.map((p) =>
        <li key={p.id}>
              <Link
            to={`/portal/output/${p.id}`}
            className="block rounded-2xl border border-line bg-card p-5 shadow-panel transition-colors duration-150 hover:border-ink-mute/40">

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="rounded-full bg-shell px-2.5 py-1 text-2xs font-semibold text-ink-soft">{p.type}</span>
                  <span className="text-2xs text-ink-mute">{p.publishedAt}</span>
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
    </div>);

}
