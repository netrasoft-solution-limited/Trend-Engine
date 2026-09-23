import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, CheckCircle2Icon, ClockIcon, PencilIcon, RotateCcwIcon, UserXIcon } from 'lucide-react';
import { AdminOnly } from '../AdminOnly';
import { ConfirmPanel } from '../../components/ConfirmPanel';
import { NoticeCard } from '../../components/NoticeCard';
import { Panel, PanelHeader } from '../../components/Panel';
import { usePortalSession } from '../session';
import { teamService, TeamMemberDetail as MemberDetail, TeamServiceError } from '../team/teamService';
import { OrgRole } from '../../types';

const STATUS_TONES: Record<'active' | 'invited', string> = {
  active: 'bg-ok-soft text-ok',
  invited: 'bg-info-soft text-info'
};

type LoadState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error' }
  | { status: 'ready'; detail: MemberDetail };

type Notice = { tone: 'ok' | 'bad'; text: string };

export function TeamMemberDetail() {
  const { memberId = '' } = useParams();
  const { orgId, email: currentUserEmail } = usePortalSession();
  const navigate = useNavigate();

  // Seeded synchronously (see the note on `teamService.getMemberSnapshot`) so
  // a cross-organisation or unknown id shows "not found" on first paint,
  // rather than a loading frame no one would ever see resolve.
  const [state, setState] = useState<LoadState>(() => {
    const snapshot = teamService.getMemberSnapshot({ orgId, memberId, currentUserEmail });
    return snapshot ? { status: 'ready', detail: snapshot } : { status: 'not-found' };
  });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<'remove' | 'cancel-invite' | null>(null);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftRole, setDraftRole] = useState<OrgRole>('Org Viewer');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  function load() {
    setState({ status: 'loading' });
    teamService
      .getMember({ orgId, memberId, currentUserEmail })
      .then((detail) => setState({ status: 'ready', detail }))
      .catch((err) => {
        setState(err instanceof TeamServiceError && err.code === 'not_found' ? { status: 'not-found' } : { status: 'error' });
      });
  }

  if (state.status === 'loading') {
    return (
      <AdminOnly>
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-card px-5 py-8 text-sm text-ink-soft shadow-panel">
          <RotateCcwIcon className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </AdminOnly>);

  }

  if (state.status === 'not-found') {
    return (
      <AdminOnly>
        <NoticeCard
          icon={AlertTriangleIcon}
          title="Member not found"
          message="This person isn't on your team — they may have been removed, or the link may belong to a different organisation."
          action={
          <Link to="/portal/team" className="text-xs font-semibold text-accent-deep hover:underline">
              Back to team
            </Link>
          } />

      </AdminOnly>);

  }

  if (state.status === 'error') {
    return (
      <AdminOnly>
        <NoticeCard
          icon={AlertTriangleIcon}
          tone="bad"
          title="Couldn’t load this person"
          message="Something went wrong loading their details."
          action={
          <button type="button" onClick={load} className="text-xs font-semibold text-accent-deep hover:underline">
              Try again
            </button>
          } />

      </AdminOnly>);

  }

  const { detail } = state;
  // Recomputed from the list snapshot rather than stored — the same rule the
  // list page enforces, kept in exactly one place conceptually even though it
  // is evaluated on two screens.
  const teamSnapshot = teamService.listMembersSnapshot({ orgId, currentUserEmail });
  const isLastActiveAdmin =
  detail.role === 'Org Admin' &&
  detail.status === 'active' &&
  teamSnapshot.filter((m) => m.role === 'Org Admin' && m.status === 'active').length <= 1;
  const removeReason = detail.isSelf ?
  'You cannot remove your own access.' :
  isLastActiveAdmin ?
  'An organisation needs at least one Org Admin.' :
  '';
  const demoteBlocked = isLastActiveAdmin;
  const dirty = editing && (draftName.trim() !== detail.name || draftRole !== detail.role);
  const nameError = editing && draftName.trim().length === 0 ? 'Name is required.' : '';

  function startEditing() {
    setDraftName(detail.name);
    setDraftRole(detail.role);
    setSaveError('');
    setEditing(true);
  }

  function requestCancelEdit() {
    if (dirty) {
      setConfirmingDiscard(true);
      return;
    }
    setEditing(false);
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    if (nameError || !dirty) return;
    setSaving(true);
    setSaveError('');
    try {
      let updated = detail;
      if (draftName.trim() !== detail.name) {
        const result = await teamService.updateMember({ orgId, memberId: detail.id, name: draftName.trim() });
        updated = { ...updated, name: result.name };
      }
      if (draftRole !== detail.role) {
        const result = await teamService.changeRole({ orgId, memberId: detail.id, role: draftRole });
        updated = { ...updated, role: result.role };
      }
      setState({ status: 'ready', detail: updated });
      setEditing(false);
      setNotice({ tone: 'ok', text: 'Saved.' });
    } catch (err) {
      setSaveError(err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmRemove() {
    setBusy(true);
    try {
      await teamService.removeMember({ orgId, memberId: detail.id, currentUserEmail });
      navigate('/portal/team', { replace: true });
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.' });
      setBusy(false);
      setConfirming(null);
    }
  }

  async function onConfirmCancelInvite() {
    setBusy(true);
    try {
      await teamService.cancelInvite({ orgId, memberId: detail.id });
      navigate('/portal/team', { replace: true });
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.' });
      setBusy(false);
      setConfirming(null);
    }
  }

  async function onResendInvite() {
    setBusy(true);
    setNotice(null);
    try {
      await teamService.resendInvite({ orgId, memberId: detail.id });
      setNotice({ tone: 'ok', text: `Invitation resent to ${detail.email}.` });
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof TeamServiceError ? err.message : 'Something went wrong. Try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminOnly>
      <div className="space-y-3">
        <Link
          to="/portal/team"
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:text-ink">

          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to team
        </Link>

        {notice &&
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 ${
          notice.tone === 'ok' ? 'border-ok/35 bg-ok-soft' : 'border-bad/35 bg-bad-soft'}`
          }>

            {notice.tone === 'ok' ?
          <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> :

          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
          }
            <p className="text-xs leading-relaxed text-ink">{notice.text}</p>
          </div>
        }

        <Panel>
          <PanelHeader
            title={detail.name}
            subtitle={detail.email}
            right={
            <span className={`rounded-full px-2.5 py-1 text-2xs font-semibold ${STATUS_TONES[detail.status]}`}>
                {detail.status}
                {detail.isSelf ? ' · you' : ''}
              </span>
            } />


          {!editing &&
          <div className="space-y-4 px-5 py-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                <div>
                  <dt className="text-2xs text-ink-mute">Role</dt>
                  <dd className="text-sm font-semibold text-ink">{detail.role}</dd>
                </div>
                <div>
                  <dt className="text-2xs text-ink-mute">Added</dt>
                  <dd className="text-sm text-ink">{detail.addedAt}</dd>
                </div>
                <div>
                  <dt className="text-2xs text-ink-mute">Invited by</dt>
                  <dd className="text-sm text-ink">{detail.invitedBy}</dd>
                </div>
                {detail.status === 'active' &&
              <div>
                    <dt className="text-2xs text-ink-mute">Last sign-in</dt>
                    <dd className="text-sm text-ink">{detail.lastLogin ?? 'never'}</dd>
                  </div>
              }
              </dl>

              <button
              type="button"
              onClick={startEditing}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">

                <PencilIcon className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
          }

          {editing &&
          <form onSubmit={onSave} className="space-y-3 px-5 py-4">
              {saveError &&
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
                  <p className="text-xs leading-relaxed text-ink">{saveError}</p>
                </div>
            }

              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Name</span>
                <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink focus:outline-none" />

                {nameError && <p className="mt-1 text-2xs text-bad">{nameError}</p>}
              </label>

              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Email</span>
                <input
                value={detail.email}
                readOnly
                disabled
                className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink-mute" />

                <p className="mt-1 text-2xs leading-relaxed text-ink-mute">
                  To change this person’s email, remove them and invite the new address instead.
                </p>
              </label>

              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Role</span>
                <select
                value={draftRole}
                onChange={(e) => setDraftRole(e.target.value as OrgRole)}
                className="mt-1.5 w-full rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink focus:outline-none">

                  <option value="Org Viewer" disabled={demoteBlocked && detail.role === 'Org Admin'}>
                    Org Viewer
                  </option>
                  <option value="Org Admin">Org Admin</option>
                </select>
                {demoteBlocked && draftRole === 'Org Viewer' &&
              <p className="mt-1 text-2xs leading-relaxed text-ink-mute">
                    An organisation needs at least one Org Admin, so this change can’t be saved.
                  </p>
              }
              </label>

              <div className="flex gap-2">
                <button
                type="submit"
                disabled={saving || !dirty || !!nameError || (demoteBlocked && draftRole === 'Org Viewer')}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60">

                  {saving && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                type="button"
                disabled={saving}
                onClick={requestCancelEdit}
                className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:opacity-60">

                  Cancel
                </button>
              </div>

              {confirmingDiscard &&
            <ConfirmPanel
              title="Discard your changes?"
              description="Your edits haven’t been saved. Discarding them cannot be undone."
              confirmLabel="Yes, discard"
              onConfirm={() => {
                setConfirmingDiscard(false);
                setEditing(false);
              }}
              onCancel={() => setConfirmingDiscard(false)} />

            }
            </form>
          }
        </Panel>

        {detail.status === 'active' &&
        <Panel>
            <PanelHeader title="Recent sign-ins" subtitle="Recorded for security" />
            {detail.signIns.length === 0 ?
          <p className="px-5 py-6 text-sm text-ink-mute">No sign-ins recorded yet.</p> :

          <ul className="divide-y divide-line">
                {detail.signIns.map((entry, index) =>
            <li key={index} className="flex items-center gap-2 px-5 py-3">
                    <ClockIcon className="h-3.5 w-3.5 shrink-0 text-ink-mute" />
                    <span className="text-xs text-ink-soft">{entry.at}</span>
                  </li>
            )}
              </ul>
          }
          </Panel>
        }

        <Panel>
          <PanelHeader title={detail.status === 'invited' ? 'Invitation' : 'Access'} />
          <div className="flex flex-wrap items-center gap-2 px-5 py-4">
            {detail.status === 'invited' &&
          <>
                <button
              type="button"
              disabled={busy || editing}
              onClick={onResendInvite}
              className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:opacity-60">

                  Resend invitation
                </button>
                <button
              type="button"
              disabled={busy || editing}
              onClick={() => setConfirming('cancel-invite')}
              className="flex items-center gap-1.5 rounded-xl border border-bad/40 px-3.5 py-2 text-xs font-semibold text-bad transition-colors duration-150 hover:bg-bad-soft disabled:cursor-not-allowed disabled:opacity-60">

                  <UserXIcon className="h-3.5 w-3.5" />
                  Cancel invitation
                </button>
              </>
          }
            {detail.status === 'active' &&
          <button
            type="button"
            disabled={busy || editing || !!removeReason}
            title={removeReason || undefined}
            onClick={() => setConfirming('remove')}
            className="flex items-center gap-1.5 rounded-xl border border-bad/40 px-3.5 py-2 text-xs font-semibold text-bad transition-colors duration-150 hover:bg-bad-soft disabled:cursor-not-allowed disabled:text-ink-mute disabled:hover:bg-transparent">

                <UserXIcon className="h-3.5 w-3.5" />
                Remove access
              </button>
          }
            {removeReason && <p className="text-2xs leading-relaxed text-ink-mute">{removeReason}</p>}
          </div>

          {confirming === 'remove' &&
          <div className="border-t border-line px-5 py-4">
              <ConfirmPanel
              tone="bad"
              title={`Remove ${detail.name}’s access?`}
              description="This revokes their access immediately. They will no longer be able to sign in."
              confirmLabel="Yes, remove access"
              busy={busy}
              onConfirm={onConfirmRemove}
              onCancel={() => setConfirming(null)} />

            </div>
          }
          {confirming === 'cancel-invite' &&
          <div className="border-t border-line px-5 py-4">
              <ConfirmPanel
              tone="bad"
              title={`Cancel the invitation to ${detail.email}?`}
              description="This revokes the invitation immediately. The link they were sent will stop working."
              confirmLabel="Yes, cancel invitation"
              busy={busy}
              onConfirm={onConfirmCancelInvite}
              onCancel={() => setConfirming(null)} />

            </div>
          }
        </Panel>
      </div>
    </AdminOnly>);

}
