import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LockIcon, MailIcon } from 'lucide-react';
import { usePortalSession } from '../session';
import { notificationPreferences, notificationsForOrg } from '../../data/publications';

export function Notifications() {
  const { orgId, role } = usePortalSession();
  const history = notificationsForOrg(orgId);

  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
  notificationPreferences.reduce((acc, p) => ({ ...acc, [p.id]: p.enabled }), {})
  );

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Notifications</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          What we email you, and everything we have sent.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-line bg-card shadow-panel">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">Preferences</h2>
        </div>
        <ul className="divide-y divide-line">
          {notificationPreferences.
          filter((p) => p.id !== 'billing' || role === 'Org Admin').
          map((p) =>
          <li key={p.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    {p.label}
                    {p.locked && <LockIcon className="h-3 w-3 text-ink-mute" />}
                  </p>
                  <p className="mt-0.5 text-2xs text-ink-mute">{p.detail}</p>
                </div>
                <button
              type="button"
              role="switch"
              aria-checked={prefs[p.id]}
              aria-label={p.label}
              disabled={p.locked}
              onClick={() => setPrefs((s) => ({ ...s, [p.id]: !s[p.id] }))}
              className={`mt-0.5 h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors duration-150 ${
              prefs[p.id] ? 'bg-ink' : 'bg-line'} ${
              p.locked ? 'cursor-not-allowed opacity-60' : ''}`
              }>

                  <span
                className={`block h-4 w-4 rounded-full bg-white transition-transform duration-150 ${
                prefs[p.id] ? 'translate-x-4' : ''}`
                } />

                </button>
              </li>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-card shadow-panel">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">History</h2>
        </div>
        {history.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-ink-mute">
            Nothing sent yet. We’ll notify you here the first time something is published to your organisation.
          </p>
        )}
        <ul className="divide-y divide-line">
          {history.map((n) =>
          <li key={n.id} className="flex items-start gap-3 px-5 py-3.5">
              <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              n.read ? 'bg-shell text-ink-mute' : 'bg-accent-soft text-accent-deep'}`
              }>

                <MailIcon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-ink">{n.subject}</p>
                <p className="text-2xs text-ink-mute">
                  {n.sentAt} · {n.channel}
                  {!n.read && <span className="font-semibold text-accent-deep"> · unread</span>}
                </p>
              </div>
              {n.publicationId &&
            <Link
              to={`/portal/output/${n.publicationId}`}
              className="shrink-0 text-2xs font-semibold text-accent-deep hover:underline">

                  Open
                </Link>
            }
            </li>
          )}
        </ul>
      </section>
    </div>);

}
