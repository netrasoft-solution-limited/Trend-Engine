import { useState } from 'react';
import { MailPlusIcon } from 'lucide-react';
import { AdminOnly } from '../AdminOnly';
import { usePortalSession } from '../session';
import { orgUsers } from '../../data/orgs';

const STATUS_TONES: Record<string, string> = {
  active: 'bg-ok-soft text-ok',
  invited: 'bg-info-soft text-info',
  suspended: 'bg-bad-soft text-bad'
};

export function Team() {
  const { orgId, orgName } = usePortalSession();
  const [inviting, setInviting] = useState(false);

  const members = orgUsers.filter((u) => u.orgId === orgId);

  return (
    <AdminOnly>
      <div>
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Team</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Who at {orgName} can read what we publish. Everyone joins by invitation — there is no public sign-up.
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

        {inviting &&
        <div className="mb-4 rounded-2xl border border-line bg-card p-5 shadow-panel">
            <label className="block">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Email address</span>
              <input
              type="email"
              placeholder="name@jarrow.example"
              className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />

            </label>
            <label className="mt-3 block">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Role</span>
              <select className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink focus:outline-none">
                <option>Org Viewer — can read published outputs</option>
                <option>Org Admin — can also manage the team and billing</option>
              </select>
            </label>
            <p className="mt-3 text-2xs leading-relaxed text-ink-mute">
              They’ll get an email with a single-use link. Invitations expire after seven days.
            </p>
            <div className="mt-3 flex gap-2">
              <button
              type="button"
              onClick={() => setInviting(false)}
              className="rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">

                Send invitation
              </button>
              <button
              type="button"
              onClick={() => setInviting(false)}
              className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">

                Cancel
              </button>
            </div>
          </div>
        }

        <ul className="divide-y divide-line rounded-2xl border border-line bg-card shadow-panel">
          {members.map((m) =>
          <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shell text-xs font-bold text-ink-soft">
                {m.name.split(' ').map((n) => n[0]).join('')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{m.name}</p>
                <p className="text-2xs text-ink-mute">{m.email}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-ink-soft">{m.role}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${STATUS_TONES[m.status]}`}>
                {m.status}
              </span>
              <span className="w-24 shrink-0 text-right text-2xs text-ink-mute">{m.lastLogin ?? 'never'}</span>
            </li>
          )}
        </ul>

        <p className="mt-4 text-2xs leading-relaxed text-ink-mute">
          We keep a record of portal sign-ins for security. If someone leaves, removing them here revokes their access
          immediately; ask us if you also want their personal details erased.
        </p>
      </div>
    </AdminOnly>);

}
