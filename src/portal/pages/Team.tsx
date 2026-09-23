import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, CheckCircle2Icon, MailPlusIcon, MoreVerticalIcon, RotateCcwIcon, UsersIcon } from 'lucide-react';
import { AdminOnly } from '../AdminOnly';
import { ConfirmPanel } from '../../components/ConfirmPanel';
import { NoticeCard } from '../../components/NoticeCard';
import { usePortalSession } from '../session';
import { teamService, TeamMember, TeamServiceError } from '../team/teamService';
import { OrgRole } from '../../types';

const STATUS_TONES: Record<TeamMember['status'], string> = {
  active: 'bg-ok-soft text-ok',
  invited: 'bg-info-soft text-info'
};

type Notice = { tone: 'ok' | 'bad'; text: string };
type Confirming = { member: TeamMember; kind: 'remove' | 'cancel-invite' };

export function Team() {
  const { orgId, userName, email: currentUserEmail } = usePortalSession();

  // Seeded synchronously — see the note on `teamService.listMembersSnapshot`.
  // `null` only ever appears after an explicit retry, which is where the
  // loading state below is actually reachable.
  const [members, setMembers] = useState<TeamMember[] | null>(() => teamService.listMembersSnapshot({ orgId, currentUserEmail }));
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Confirming | null>(null);

  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('Org Viewer');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [inviteError, setInviteError] = useState('');

  function load() {
    setMembers(null);
    setLoadError(false);
    teamService
      .listMembers({ orgId, currentUserEmail })
      .then(setMembers)
      .catch(() => setLoadError(true));
  }

  function activeAdminCount(list: TeamMember[]): number {
    return list.filter((m) => m.status === 'active' && m.role === 'Org Admin').length;
  }

  async function onInvite(event: React.FormEvent) {
    event.preventDefault();
    setInviteStatus('submitting');
    setInviteError('');
    try {
      const created = await teamService.inviteMember({ orgId, email: inviteEmail, role: inviteRole, invitedByName: userName });
      setMembers((prev) => (prev ? [...prev, created] : [created]));
      setInviting(false);
      setInviteEmail('');
      setInviteRole('Org Viewer');
      setInviteStatus('idle');
      setNotice({ tone: 'ok', text: `Invitation sent to ${created.email}.` });
    } catch (err) {
      setInviteError(err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.');
      setInviteStatus('error');
    }
  }

  async function onChangeRole(member: TeamMember) {
    const nextRole: OrgRole = member.role === 'Org Admin' ? 'Org Viewer' : 'Org Admin';
    setOpenMenuId(null);
    setBusyId(member.id);
    setNotice(null);
    try {
      const updated = await teamService.changeRole({ orgId, memberId: member.id, role: nextRole });
      setMembers((prev) => prev?.map((m) => (m.id === member.id ? updated : m)) ?? prev);
      setNotice({ tone: 'ok', text: `${member.name} is now ${nextRole}.` });
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.' });
    } finally {
      setBusyId(null);
    }
  }

  async function onConfirmRemove(member: TeamMember) {
    setBusyId(member.id);
    try {
      await teamService.removeMember({ orgId, memberId: member.id, currentUserEmail });
      setMembers((prev) => prev?.filter((m) => m.id !== member.id) ?? prev);
      setNotice({ tone: 'ok', text: `${member.name}’s access has been removed.` });
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.' });
    } finally {
      setBusyId(null);
      setConfirming(null);
    }
  }

  async function onResendInvite(member: TeamMember) {
    setOpenMenuId(null);
    setBusyId(member.id);
    setNotice(null);
    try {
      await teamService.resendInvite({ orgId, memberId: member.id });
      setNotice({ tone: 'ok', text: `Invitation resent to ${member.email}.` });
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.' });
    } finally {
      setBusyId(null);
    }
  }

  async function onConfirmCancelInvite(member: TeamMember) {
    setBusyId(member.id);
    try {
      await teamService.cancelInvite({ orgId, memberId: member.id });
      setMembers((prev) => prev?.filter((m) => m.id !== member.id) ?? prev);
      setNotice({ tone: 'ok', text: `Invitation to ${member.email} cancelled.` });
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.' });
    } finally {
      setBusyId(null);
      setConfirming(null);
    }
  }

  return (
    <AdminOnly>
      <div>
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Team</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">Team members join by invitation.</p>
          </div>
          <button
            type="button"
            onClick={() => setInviting((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">

            <MailPlusIcon className="h-3.5 w-3.5" />
            Invite someone
          </button>
        </header>

        {notice &&
        <div
          role="status"
          className={`mb-4 flex items-start gap-2 rounded-xl border px-3.5 py-3 ${
          notice.tone === 'ok' ? 'border-ok/35 bg-ok-soft' : 'border-bad/35 bg-bad-soft'}`
          }>

            {notice.tone === 'ok' ?
          <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> :

          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          }
            <p className="text-xs leading-relaxed text-ink">{notice.text}</p>
          </div>
        }

        {inviting &&
        <div className="mb-4 rounded-2xl border border-line bg-card p-5 shadow-panel">
            <form onSubmit={onInvite} noValidate>
              {inviteStatus === 'error' &&
            <div role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
                  <p className="text-xs leading-relaxed text-ink">{inviteError}</p>
                </div>
            }
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Email address</span>
                <input
                type="email"
                required
                placeholder="name@jarrow.example"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />

              </label>
              <label className="mt-3 block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Role</span>
                <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink focus:outline-none">

                  <option value="Org Viewer">Org Viewer — can read published outputs</option>
                  <option value="Org Admin">Org Admin — can also manage the team and billing</option>
                </select>
              </label>
              <p className="mt-3 text-2xs leading-relaxed text-ink-mute">
                They’ll get an email with a single-use link. Invitations expire after seven days.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                type="submit"
                disabled={inviteStatus === 'submitting'}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60">

                  {inviteStatus === 'submitting' && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
                  {inviteStatus === 'submitting' ? 'Sending…' : 'Send invitation'}
                </button>
                <button
                type="button"
                disabled={inviteStatus === 'submitting'}
                onClick={() => {
                  setInviting(false);
                  setInviteStatus('idle');
                  setInviteError('');
                }}
                className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:opacity-60">

                  Cancel
                </button>
              </div>
            </form>
          </div>
        }

        {members === null && !loadError &&
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-card px-5 py-8 text-sm text-ink-soft shadow-panel">
            <RotateCcwIcon className="h-4 w-4 animate-spin" />
            Loading your team…
          </div>
        }

        {loadError &&
        <NoticeCard
          icon={AlertTriangleIcon}
          tone="bad"
          title="Couldn’t load your team"
          message="Something went wrong loading the team list."
          action={
          <button
            type="button"
            onClick={load}
            className="text-xs font-semibold text-accent-deep hover:underline">

              Try again
            </button>
          } />

        }

        {members !== null && !loadError &&
        <>
            {members.length === 1 &&
          <div className="mb-4">
                <NoticeCard
              icon={UsersIcon}
              title="You’re the only member so far"
              message="Invite your team to give them access to what's published for your organisation." />

              </div>
          }

            <ul className="divide-y divide-line rounded-2xl border border-line bg-card shadow-panel">
              {members.map((m) => {
                const isLastActiveAdmin = m.role === 'Org Admin' && m.status === 'active' && activeAdminCount(members) <= 1;
                const removeReason = m.isSelf ?
                'You cannot remove your own access.' :
                isLastActiveAdmin ?
                'An organisation needs at least one Org Admin.' :
                '';
                const demoteReason = isLastActiveAdmin ? 'An organisation needs at least one Org Admin.' : '';
                const busy = busyId === m.id;
                const menuOpen = openMenuId === m.id;

                return (
                  <Fragment key={m.id}>
                    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                      <Link
                      to={`/portal/team/${m.id}`}
                      className="flex min-w-0 flex-1 items-center gap-4 rounded-lg transition-colors duration-150 hover:bg-shell/60">

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shell text-xs font-bold text-ink-soft">
                          {m.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                            {m.name}
                            {m.isSelf &&
                          <span className="rounded-full bg-shell px-1.5 py-0.5 text-2xs font-semibold text-ink-mute">
                                You
                              </span>
                          }
                          </p>
                          <p className="text-2xs text-ink-mute">{m.email}</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-ink-soft">{m.role}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${STATUS_TONES[m.status]}`}>
                          {m.status}
                        </span>
                        <span className="w-24 shrink-0 text-right text-2xs text-ink-mute">{m.lastLogin ?? 'never'}</span>
                      </Link>

                      <div className="relative shrink-0">
                        <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-label={`Actions for ${m.name}`}
                        disabled={busy}
                        onClick={() => setOpenMenuId(menuOpen ? null : m.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-mute transition-colors duration-150 hover:bg-shell hover:text-ink disabled:cursor-not-allowed">

                          {busy ? <RotateCcwIcon className="h-4 w-4 animate-spin" /> : <MoreVerticalIcon className="h-4 w-4" />}
                        </button>
                        <div
                        role="menu"
                        className={`absolute right-0 top-full z-10 mt-1 w-64 space-y-0.5 rounded-xl border border-line bg-card p-1.5 shadow-lg ${
                        menuOpen ? '' : 'hidden'}`
                        }>

                          {m.status === 'active' &&
                        <>
                              <button
                          type="button"
                          role="menuitem"
                          disabled={!!demoteReason}
                          title={demoteReason || undefined}
                          onClick={() => onChangeRole(m)}
                          className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-ink transition-colors duration-150 hover:bg-shell disabled:cursor-not-allowed disabled:text-ink-mute disabled:hover:bg-transparent">

                                Change to {m.role === 'Org Admin' ? 'Org Viewer' : 'Org Admin'}
                              </button>
                              {demoteReason &&
                          <p className="px-2.5 pb-1.5 text-2xs leading-relaxed text-ink-mute">{demoteReason}</p>
                          }
                              <button
                          type="button"
                          role="menuitem"
                          disabled={!!removeReason}
                          title={removeReason || undefined}
                          onClick={() => {
                            setOpenMenuId(null);
                            setConfirming({ member: m, kind: 'remove' });
                          }}
                          className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-bad transition-colors duration-150 hover:bg-bad-soft disabled:cursor-not-allowed disabled:text-ink-mute disabled:hover:bg-transparent">

                                Remove access
                              </button>
                              {removeReason &&
                          <p className="px-2.5 pb-1.5 text-2xs leading-relaxed text-ink-mute">{removeReason}</p>
                          }
                            </>
                        }
                          {m.status === 'invited' &&
                        <>
                              <button
                          type="button"
                          role="menuitem"
                          onClick={() => onResendInvite(m)}
                          className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-ink transition-colors duration-150 hover:bg-shell">

                                Resend invitation
                              </button>
                              <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setOpenMenuId(null);
                            setConfirming({ member: m, kind: 'cancel-invite' });
                          }}
                          className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-bad transition-colors duration-150 hover:bg-bad-soft">

                                Cancel invitation
                              </button>
                            </>
                        }
                        </div>
                      </div>
                    </li>

                    {confirming?.member.id === m.id &&
                  <li className="px-5 py-4">
                        {confirming.kind === 'remove' ?
                    <ConfirmPanel
                      tone="bad"
                      title={`Remove ${m.name}’s access?`}
                      description="This revokes their access immediately. They will no longer be able to sign in."
                      confirmLabel="Yes, remove access"
                      busy={busy}
                      onConfirm={() => onConfirmRemove(m)}
                      onCancel={() => setConfirming(null)} /> :


                    <ConfirmPanel
                      tone="bad"
                      title={`Cancel the invitation to ${m.email}?`}
                      description="This revokes the invitation immediately. The link they were sent will stop working."
                      confirmLabel="Yes, cancel invitation"
                      busy={busy}
                      onConfirm={() => onConfirmCancelInvite(m)}
                      onCancel={() => setConfirming(null)} />

                    }
                      </li>
                  }
                  </Fragment>);

              })}
            </ul>
          </>
        }

        <p className="mt-4 text-2xs leading-relaxed text-ink-mute">
          We keep a record of portal sign-ins for security. If someone leaves, removing them here revokes their access
          immediately; ask us if you also want their personal details erased.
        </p>
      </div>
    </AdminOnly>);

}
