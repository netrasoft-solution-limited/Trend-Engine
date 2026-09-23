import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, CheckCircle2Icon, MailIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import { usePortalSession } from '../session';
import { notificationsForOrg, PUBLICATION_TYPES } from '../../data/publications';
import {
  describeSettings,
  DIGEST_DAYS,
  NotificationSettings,
  NotificationSettingsError,
  notificationSettingsService } from
'../notifications/notificationSettingsService';

function settingsEqual(a: NotificationSettings, b: NotificationSettings): boolean {
  return (
    a.channels.email === b.channels.email &&
    a.channels.inApp === b.channels.inApp &&
    a.frequency === b.frequency &&
    a.digestDay === b.digestDay &&
    a.digestTime === b.digestTime &&
    a.pausedUntil === b.pausedUntil &&
    a.publicationTypes.length === b.publicationTypes.length &&
    a.publicationTypes.every((t) => b.publicationTypes.includes(t)));

}

function formatIsoDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Notifications() {
  const { orgId, userId } = usePortalSession();
  const history = notificationsForOrg(orgId);
  const scope = { orgId, userId };

  // Seeded synchronously — see the note on `teamService.listMembersSnapshot`.
  const [saved, setSaved] = useState<NotificationSettings>(() => notificationSettingsService.getSettingsSnapshot(scope));
  const [draft, setDraft] = useState<NotificationSettings>(saved);
  const [channelError, setChannelError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const dirty = !settingsEqual(draft, saved);
  const busy = saving || resetting;

  // Real navigation away — tab close, refresh, a typed URL.
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // In-app navigation away — the sidebar, the header, this page's own links.
  // There is no data router here (`App.tsx` uses plain `BrowserRouter`), so
  // react-router's `useBlocker` isn't available; this is the self-contained
  // equivalent, scoped to this component's own lifetime.
  useEffect(() => {
    if (!dirty) return;
    function onClickCapture(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor || anchor.target === '_blank') return;
      if (!window.confirm('You have unsaved notification settings. Leave without saving?')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, [dirty]);

  function toggleChannel(channel: 'email' | 'inApp') {
    const other = channel === 'email' ? 'inApp' : 'email';
    if (draft.channels[channel] && !draft.channels[other]) {
      setChannelError('At least one channel — email or in-app — needs to stay on.');
      return;
    }
    setChannelError('');
    setDraft((d) => ({ ...d, channels: { ...d.channels, [channel]: !d.channels[channel] } }));
  }

  function toggleType(slug: string) {
    setDraft((d) => ({
      ...d,
      publicationTypes: d.publicationTypes.includes(slug) ?
      d.publicationTypes.filter((t) => t !== slug) :
      [...d.publicationTypes, slug]
    }));
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const result = await notificationSettingsService.updateSettings(draft, scope);
      setSaved(result);
      setDraft(result);
      setNotice('Saved.');
    } catch (err) {
      setSaveError(err instanceof NotificationSettingsError ? err.message : 'Something went wrong saving your settings. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    setResetting(true);
    setSaveError('');
    setNotice('');
    try {
      const result = await notificationSettingsService.resetToDefaults(scope);
      setSaved(result);
      setDraft(result);
      setNotice('Reset to defaults.');
    } catch {
      setSaveError('Something went wrong resetting your settings. Try again.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Notifications</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          How and when we notify you, and everything we have sent.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-line bg-card shadow-panel">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">Preferences</h2>
          <p className="mt-1 text-xs text-ink-mute">Only visible to you — everyone on your team sets their own.</p>
        </div>

        <form onSubmit={onSave} className="space-y-5 px-5 py-4">
          {notice &&
          <div role="status" className="flex items-center gap-2 rounded-xl border border-ok/35 bg-ok-soft px-3.5 py-3 text-sm text-ok">
              <CheckCircle2Icon className="h-4 w-4 shrink-0" />
              {notice}
            </div>
          }
          {saveError &&
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
              <div className="min-w-0">
                <p className="text-xs leading-relaxed text-ink">{saveError}</p>
                <button type="submit" className="mt-1 text-2xs font-semibold text-accent-deep hover:underline">
                  Try again
                </button>
              </div>
            </div>
          }

          <div className="rounded-xl border border-accent/30 bg-accent-soft/50 px-3.5 py-3">
            <p className="text-xs leading-relaxed text-ink">{describeSettings(draft)}</p>
          </div>

          <fieldset>
            <legend className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Channels</legend>
            <div className="mt-2 space-y-2">
              {(['email', 'inApp'] as const).map((channel) =>
              <label key={channel} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
                  <span className="text-sm font-medium text-ink">{channel === 'email' ? 'Email' : 'In-app'}</span>
                  <button
                  type="button"
                  role="switch"
                  aria-checked={draft.channels[channel]}
                  aria-label={channel === 'email' ? 'Email notifications' : 'In-app notifications'}
                  onClick={() => toggleChannel(channel)}
                  className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors duration-150 ${
                  draft.channels[channel] ? 'bg-ink' : 'bg-line'}`
                  }>

                    <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform duration-150 ${
                    draft.channels[channel] ? 'translate-x-4' : ''}`
                    } />

                  </button>
                </label>
              )}
            </div>
            {channelError && <p className="mt-1.5 text-2xs text-bad">{channelError}</p>}
          </fieldset>

          <fieldset>
            <legend className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Frequency</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {(
                [
                { key: 'immediately', label: 'Immediately' },
                { key: 'daily_digest', label: 'Daily digest' },
                { key: 'weekly_digest', label: 'Weekly digest' }] as
                const).
                map((option) =>
                <label
                  key={option.key}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  draft.frequency === option.key ? 'border-accent bg-accent-soft text-accent-deep' : 'border-line text-ink hover:border-ink-mute/50'}`
                  }>

                  <input
                    type="radio"
                    name="frequency"
                    className="accent-accent"
                    checked={draft.frequency === option.key}
                    onChange={() =>
                    setDraft((d) => ({
                      ...d,
                      frequency: option.key,
                      digestTime: option.key === 'immediately' ? null : d.digestTime ?? '08:00',
                      digestDay: option.key === 'weekly_digest' ? d.digestDay ?? 'Monday' : null
                    }))
                    } />

                  {option.label}
                </label>
              )}
            </div>

            {draft.frequency !== 'immediately' &&
            <div className="mt-3 flex flex-wrap items-end gap-3">
                {draft.frequency === 'weekly_digest' &&
              <label className="block">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Day</span>
                    <select
                  value={draft.digestDay ?? 'Monday'}
                  onChange={(e) => setDraft((d) => ({ ...d, digestDay: e.target.value as NotificationSettings['digestDay'] }))}
                  className="mt-1.5 rounded-xl border border-line bg-shell px-3 py-2 text-sm text-ink focus:outline-none">

                      {DIGEST_DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </label>
              }
                <label className="block">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Time</span>
                  <input
                  type="time"
                  value={draft.digestTime ?? '08:00'}
                  onChange={(e) => setDraft((d) => ({ ...d, digestTime: e.target.value }))}
                  className="mt-1.5 rounded-xl border border-line bg-shell px-3 py-2 text-sm text-ink focus:outline-none" />

                </label>
              </div>
            }
          </fieldset>

          <fieldset>
            <legend className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Notify me about</legend>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {PUBLICATION_TYPES.map((type) =>
              <label key={type.slug} className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm text-ink">
                  <input
                  type="checkbox"
                  className="accent-accent"
                  checked={draft.publicationTypes.includes(type.slug)}
                  onChange={() => toggleType(type.slug)} />

                  {type.label}
                </label>
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Pause notifications until…</legend>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={draft.pausedUntil ?? ''}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDraft((d) => ({ ...d, pausedUntil: e.target.value || null }))}
                className="rounded-xl border border-line bg-shell px-3 py-2 text-sm text-ink focus:outline-none" />

              {draft.pausedUntil &&
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, pausedUntil: null }))}
                className="flex items-center gap-1 text-2xs font-semibold text-ink-mute hover:text-ink hover:underline">

                  <XIcon className="h-3 w-3" />
                  Clear
                </button>
              }
            </div>
            {draft.pausedUntil &&
            <p className="mt-1.5 text-2xs text-ink-mute">Paused until {formatIsoDate(draft.pausedUntil)}.</p>
            }
          </fieldset>

          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <button
              type="submit"
              disabled={!dirty || busy}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60">

              {saving && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onReset}
              disabled={busy}
              className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:opacity-60">

              {resetting ? 'Resetting…' : 'Reset to defaults'}
            </button>
            {dirty && <span className="text-2xs text-ink-mute">You have unsaved changes.</span>}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-line bg-card shadow-panel">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">History</h2>
        </div>
        {history.length === 0 &&
        <p className="px-5 py-8 text-center text-sm text-ink-mute">
            Nothing sent yet. We’ll notify you here the first time something is published to your organisation.
          </p>
        }
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
