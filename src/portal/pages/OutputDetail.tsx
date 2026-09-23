import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, CheckCircle2Icon, PrinterIcon, RotateCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { usePortalSession } from '../session';
import { publicationById } from '../../data/publications';
import { feedbackService, Feedback, FeedbackRating, FeedbackWithAuthor } from '../feedback/feedbackService';
import { recordPublicationViewed } from '../onboarding/onboardingService';

const RATING_LABEL: Record<FeedbackRating, string> = { useful: 'Useful', not_relevant: 'Not relevant' };

/**
 * Resolves through `publicationById` — a Publication record, never an Output or
 * an OutputVersion (Arch §9.2). Consequences a reader can see:
 *
 *   · No version history. Only the published version exists here.
 *   · No internal scores, vendor costs, rejection reasons or policy versions.
 *   · An unpublished record resolves to nothing, not to an older version.
 */
export function OutputDetail() {
  const { id } = useParams<{ id: string }>();
  const { orgId, userId, role } = usePortalSession();
  const publication = id ? publicationById(orgId, id) : undefined;

  const feedbackKey = id ?? '';
  const scope = { orgId, userId };

  // Seeded synchronously (see the note on `teamService.listMembersSnapshot`)
  // — there is nothing to await for an in-memory mock, so there is no
  // meaningful "loading" state here. A failed *submit* is where "error, with
  // retry" actually applies: the form stays open and resubmitting is the retry.
  const initialFeedback = feedbackService.getMyFeedbackSnapshot(feedbackKey, scope);
  const [myFeedback, setMyFeedback] = useState<Feedback | null>(initialFeedback);
  const [editing, setEditing] = useState(!initialFeedback);
  const [rating, setRating] = useState<FeedbackRating>(initialFeedback?.rating ?? 'useful');
  const [note, setNote] = useState(initialFeedback?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');
  const [adminFeedback, setAdminFeedback] = useState<FeedbackWithAuthor[]>(() =>
    role === 'Org Admin' ? feedbackService.listFeedbackSnapshot(feedbackKey, scope) : []
  );

  // Feeds the onboarding checklist's "read your first output" item — a
  // record of having viewed at least one publication, not of which ones.
  useEffect(() => {
    if (!publication) return;
    recordPublicationViewed({ orgId, userId });
  }, [orgId, userId, publication]);

  if (!publication) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-ink">This isn’t available</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-soft">
          It may have been withdrawn while it is corrected, or it may belong to a different organisation. If you were
          reading it recently, the Pure Play team will reissue it.
        </p>
        <Link
          to="/portal"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-deep hover:underline">

          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to published
        </Link>
      </div>);

  }

  // Defensive, not reachable today: `publicationById` already excludes
  // withdrawn records, so this component never receives one. Kept anyway so
  // a feedback panel reused somewhere without that page-level gate still
  // refuses to collect or show feedback on a withdrawn record — PRD §6.9's
  // "withdrawn resolves to nothing" should hold here too, not just upstream.
  const isWithdrawn = publication.unpublishedAt !== null;

  function startEditing() {
    setRating(myFeedback?.rating ?? 'useful');
    setNote(myFeedback?.note ?? '');
    setSaveError('');
    setEditing(true);
  }

  async function refreshAdminList() {
    if (role !== 'Org Admin') return;
    setAdminFeedback(await feedbackService.listFeedback(feedbackKey, scope));
  }

  async function onSubmitFeedback(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const result = await feedbackService.submitFeedback(feedbackKey, { rating, note }, scope);
      setMyFeedback(result);
      setEditing(false);
      setNotice('Thanks — your feedback has been saved.');
      await refreshAdminList();
    } catch {
      setSaveError('Something went wrong saving your feedback. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function onRemoveFeedback() {
    setSaving(true);
    setNotice('');
    try {
      await feedbackService.removeFeedback(feedbackKey, scope);
      setMyFeedback(null);
      setRating('useful');
      setNote('');
      setEditing(true);
      setNotice('Your feedback has been removed.');
      await refreshAdminList();
    } catch {
      setSaveError('Something went wrong removing your feedback. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <article>
      <Link
        to="/portal"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mute transition-colors duration-150 hover:text-ink">

        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Published
      </Link>

      <header className="mb-6 mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-shell px-2.5 py-1 text-2xs font-semibold text-ink-soft">
            {publication.type}
          </span>
          <span className="text-2xs text-ink-mute">Published {publication.publishedAt}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink">{publication.title}</h1>
        <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-ink-soft">{publication.summary}</p>
      </header>

      <div className="space-y-6 rounded-2xl border border-line bg-card p-6 shadow-panel sm:p-8">
        {publication.body.map((section) =>
        <section key={section.heading}>
            <h2 className="text-base font-semibold text-ink">{section.heading}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{section.text}</p>
          </section>
        )}
      </div>

      <section className="mt-4 rounded-2xl border border-line bg-card p-6 shadow-panel sm:p-8">
        <h2 className="text-base font-semibold text-ink">Was this useful?</h2>

        {isWithdrawn ?
        <p className="mt-2 text-sm text-ink-mute">This output has been withdrawn. Feedback is no longer being collected on it.</p> :

        <>
            {notice &&
          <div role="status" className="mt-3 flex items-center gap-2 rounded-xl border border-ok/35 bg-ok-soft px-3.5 py-3 text-sm text-ok">
                <CheckCircle2Icon className="h-4 w-4 shrink-0" />
                {notice}
              </div>
          }

            {!editing && myFeedback &&
          <div className="mt-3 space-y-3">
                <div className="flex items-start gap-2 rounded-xl border border-line bg-shell px-3.5 py-3">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              myFeedback.rating === 'useful' ? 'bg-ok-soft text-ok' : 'bg-slate-soft text-slate'}`
              }>
                    {myFeedback.rating === 'useful' ? <ThumbsUpIcon className="h-3.5 w-3.5" /> : <ThumbsDownIcon className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">You said: {RATING_LABEL[myFeedback.rating]}</p>
                    {myFeedback.note && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{myFeedback.note}</p>}
                    <p className="mt-1 text-2xs text-ink-mute">
                      Submitted {myFeedback.createdAt}
                      {myFeedback.updatedAt !== myFeedback.createdAt ? ` · edited ${myFeedback.updatedAt}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                type="button"
                onClick={startEditing}
                disabled={saving}
                className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:opacity-60">

                    Edit
                  </button>
                  <button
                type="button"
                onClick={onRemoveFeedback}
                disabled={saving}
                className="rounded-xl border border-bad/40 px-3 py-1.5 text-xs font-semibold text-bad transition-colors duration-150 hover:bg-bad-soft disabled:cursor-not-allowed disabled:opacity-60">

                    {saving ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              </div>
          }

            {editing &&
          <form onSubmit={onSubmitFeedback} className="mt-3 space-y-3">
                {saveError &&
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-bad/35 bg-bad-soft px-3.5 py-3">
                    <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
                    <p className="text-xs leading-relaxed text-ink">{saveError}</p>
                  </div>
            }

                <div className="flex gap-2">
                  <button
                type="button"
                onClick={() => setRating('useful')}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ${
                rating === 'useful' ? 'border-accent bg-accent-soft text-accent-deep' : 'border-line text-ink hover:border-ink-mute/50'}`
                }>

                    <ThumbsUpIcon className="h-3.5 w-3.5" />
                    Useful
                  </button>
                  <button
                type="button"
                onClick={() => setRating('not_relevant')}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ${
                rating === 'not_relevant' ? 'border-accent bg-accent-soft text-accent-deep' : 'border-line text-ink hover:border-ink-mute/50'}`
                }>

                    <ThumbsDownIcon className="h-3.5 w-3.5" />
                    Not relevant
                  </button>
                </div>

                <label className="block">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Add a note (optional)</span>
                  <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                maxLength={500}
                rows={3}
                placeholder="Anything specific that made this useful or not?"
                className="mt-1.5 w-full resize-y rounded-xl border border-line bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none" />

                  <p className="mt-1 text-right text-2xs text-ink-mute">{note.length} / 500</p>
                </label>

                <div className="flex gap-2">
                  <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60">

                    {saving && <RotateCcwIcon className="h-3.5 w-3.5 animate-spin" />}
                    {saving ? 'Saving…' : 'Save feedback'}
                  </button>
                  {myFeedback &&
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setSaveError('');
                }}
                className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:opacity-60">

                      Cancel
                    </button>
              }
                </div>
              </form>
          }
          </>
        }
      </section>

      {role === 'Org Admin' && !isWithdrawn &&
      <section className="mt-4 rounded-2xl border border-line bg-card shadow-panel">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-[15px] font-semibold text-ink">All feedback on this output</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-mute">Visible to Org Admins only.</p>
          </div>
          {adminFeedback.length === 0 ?
        <p className="px-5 py-6 text-sm text-ink-mute">No feedback yet.</p> :

        <ul className="divide-y divide-line">
              {adminFeedback.map((f) =>
          <li key={f.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{f.userName}</p>
                    <span
                className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${
                f.rating === 'useful' ? 'bg-ok-soft text-ok' : 'bg-slate-soft text-slate'}`
                }>

                      {RATING_LABEL[f.rating]}
                    </span>
                  </div>
                  {f.note && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.note}</p>}
                  <p className="mt-1 text-2xs text-ink-mute">{f.createdAt}</p>
                </li>
          )}
            </ul>
        }
        </section>
      }

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-2xs leading-relaxed text-ink-mute">
          Questions about anything here go to your Pure Play contact. Approved outputs are retained for the term set out
          in your agreement.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">

          <PrinterIcon className="h-3.5 w-3.5" />
          Print or save as PDF
        </button>
      </div>
    </article>);

}
