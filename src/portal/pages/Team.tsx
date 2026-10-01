import { useState } from 'react';
import { MailPlusIcon, Trash2Icon } from 'lucide-react';
import { AdminOnly } from '../AdminOnly';
import { ApiError, OrgRole, api } from '../api';
import { usePortalSession } from '../session';
import { useAsync } from '../useAsync';
import { ErrorState, Loading } from '../States';
import { formatDate } from '../format';

const STATUS_TONES: Record<string, string> = {
  active: 'bg-ok-soft text-ok',
  invited: 'bg-info-soft text-info',
  suspended: 'bg-bad-soft text-bad'
};

/**
 * Org Admin only, and the server says so — `/portal/api/team` returns 403 to
 * any session whose active membership is not an admin. `AdminOnly` below only
 * spares a viewer a screen full of failed requests.
 *
 * Members come from the API rather than a global array, so this screen can
 * only ever show the organisation the server bound. It used to read
 * `data/orgs.ts`, which held every organisation including both CI fixtures,
 * and filtered in-component.
 */
export function Team() {
  const session = usePortalSession();
  const { data, loading, error, reload } = useAsync(() => api.team(), [session.organization.id]);

  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('org_viewer');
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await api.invite(email, role);
      setEmail('');
      setInviting(false);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'That invitation could not be sent.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (membershipId: number) => {
    try {
      await api.removeMember(membershipId);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'That member could not be removed.');
    }
  };

  return (
    <AdminOnly>
      <div>
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Team</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Who at {session.organization.name} can read what we publish. Everyone joins by
              invitation — there is no public sign-up.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInviting((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">
            
            <MailPlusIcon className="h-3.5 w-3.5" />
            Invite someone
          </button>
        </header>

        {formError &&
        <p role="alert" className="mb-4 rounded-xl border border-bad/40 bg-bad-soft px-3 py-2.5 text-xs text-ink">
            {formError}
          </p>
        }

        {inviting &&
        <form onSubmit={invite} className="mb-4 rounded-2xl border border-line bg-card p-5 shadow-panel">
            <label className="block">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Email address</span>
              <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@yourcompany.com"
              className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />
            
            </label>
            <label className="mt-3 block">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Role</span>
              <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
              className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink focus:outline-none">
              
                <option value="org_viewer">Org Viewer — can read published outputs</option>
                <option value="org_admin">Org Admin — can also manage the team and billing</option>
              </select>
            </label>
            <p className="mt-3 text-2xs leading-relaxed text-ink-mute">
              They'll get an email with a single-use link. Invitations expire after seven days.
            </p>
            <div className="mt-3 flex gap-2">
              <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft disabled:bg-line disabled:text-ink-mute">
              
                {busy ? 'Sending…' : 'Send invitation'}
              </button>
              <button
              type="button"
              onClick={() => setInviting(false)}
              className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">
              
                Cancel
              </button>
            </div>
          </form>
        }

        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {data &&
        <>
            <ul className="divide-y divide-line rounded-2xl border border-line bg-card shadow-panel">
              {data.members.map((m) =>
            <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shell text-xs font-bold text-ink-soft">
                    {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{m.name}</p>
                    <p className="text-2xs text-ink-mute">{m.email}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-ink-soft">{m.role_label}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${STATUS_TONES[m.status] ?? 'bg-shell text-ink-mute'}`}>
                    {m.status}
                  </span>
                  <span className="w-28 shrink-0 text-right text-2xs text-ink-mute">
                    {formatDate(m.last_login)}
                  </span>
                  <button
                type="button"
                onClick={() => void remove(m.id)}
                aria-label={`Remove ${m.name}`}
                className="shrink-0 rounded-lg p-1.5 text-ink-mute transition-colors duration-150 hover:bg-bad-soft hover:text-bad">
                
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </li>
            )}
            </ul>

            {data.invites.length > 0 &&
          <section className="mt-4 rounded-2xl border border-line bg-card shadow-panel">
                <div className="border-b border-line px-5 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                    Pending invitations
                  </h2>
                </div>
                <ul className="divide-y divide-line">
                  {data.invites.map((i) =>
              <li key={i.id} className="flex flex-wrap items-center gap-x-4 px-5 py-3">
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{i.email}</span>
                      <span className="text-2xs text-ink-soft">{i.role_label}</span>
                      <span className="text-2xs text-ink-mute">expires {formatDate(i.expires_at)}</span>
                    </li>
              )}
                </ul>
              </section>
          }
          </>
        }

        <p className="mt-4 text-2xs leading-relaxed text-ink-mute">
          We keep a record of portal sign-ins for security. Removing someone here revokes their
          access immediately; ask us if you also want their personal details erased.
        </p>
      </div>
    </AdminOnly>);

}
