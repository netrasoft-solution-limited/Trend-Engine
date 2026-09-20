import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  HistoryIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UndoIcon } from
'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { StateChip } from '../../components/StateChip';
import {
  citationChecks,
  claimsFlags,
  draftSections,
  expertReviews,
  internalOnlyFields,
  outputTypes,
  outputVersions,
  recentOutputs,
  reviewStages } from
'../../data/outputs';
import { clientProfile } from '../../data/client';
import { signals } from '../../data/signals';
import { OutputState } from '../../types';

const EXPORT_FORMATS = ['Markdown', 'DOCX', 'PDF / HTML', 'CSV'];

const SEVERITY_STYLES: Record<string, string> = {
  blocking: 'border-bad/40 bg-bad-soft',
  review: 'border-warn/40 bg-warn-soft',
  note: 'border-line bg-shell'
};

const SEVERITY_TEXT: Record<string, string> = {
  blocking: 'text-bad',
  review: 'text-warn',
  note: 'text-ink-mute'
};

const CURRENT_VERSION = 3;

interface GateEvent {
  at: string;
  message: string;
}

export function OutputBuilder() {
  const [params] = useSearchParams();
  const signalId = params.get('signal') ?? 'SIG-2041';
  const signal = signals.find((s) => s.id === signalId) ?? signals[0];

  const [type, setType] = useState(params.get('type') ?? 'content_brief');
  const [state, setState] = useState<OutputState>('draft');
  const [stage, setStage] = useState(1);
  const [sections, setSections] = useState(() =>
  draftSections.reduce<Record<string, string>>((acc, s) => ({ ...acc, [s.id]: s.value }), {})
  );
  const [resolved, setResolved] = useState<Record<string, boolean>>({});

  // Publication gate state — PRD §6.9.
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [expertSignedOff, setExpertSignedOff] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [gateLog, setGateLog] = useState<GateEvent[]>([]);

  const blocking = claimsFlags.filter((f) => f.severity === 'blocking' && !resolved[f.id]).length;
  const activeType = outputTypes.find((t) => t.id === type) ?? outputTypes[0];
  const review = expertReviews.find((r) => r.outputId === 'OUT-3120');

  const requiresExpert = activeType.requiresExpertReview;
  const expertReady = !requiresExpert || expertSignedOff;
  const isPublished = state === 'published';
  const canApprove = blocking === 0 && state !== 'approved' && !isPublished;
  const canPublish = state === 'approved' && expertReady;
  const diverged = isPublished && publishedVersion !== null && publishedVersion !== CURRENT_VERSION;

  const log = (message: string) =>
  setGateLog((l) => [{ at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), message }, ...l]);

  const publish = () => {
    setState('published');
    setPublishedVersion(CURRENT_VERSION);
    setConfirming(false);
    log(`Published v${CURRENT_VERSION} → ${clientProfile.name} · notification sent`);
  };

  const unpublish = () => {
    setState('approved');
    setPublishedVersion(null);
    log(`Unpublished v${CURRENT_VERSION} from ${clientProfile.name}`);
  };

  const publishBlockedReason = () => {
    if (isPublished) return null;
    if (state !== 'approved') return 'This version has not been approved yet. Approval comes first, and it is a separate decision.';
    if (!expertReady) return `${activeType.label} carries health or scientific content. An expert sign-off must be recorded before it can be published — a stricter gate than approval.`;
    return null;
  };

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={`Output builder · from ${signal.id} · ${clientProfile.profileVersion} · ${clientProfile.domainPackVersion}`}
        title={activeType.label}
        description={`${activeType.note}. You own the exact version that leaves this screen — and publishing it is a second, separate decision.`}
        right={
        <>
            <StateChip state={state} className="px-3 py-1.5 text-xs" />
            <button
            type="button"
            onClick={() => setState('review ready')}
            disabled={isPublished}
            className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:text-ink-mute">

              Mark review ready
            </button>
            <button
            type="button"
            disabled={!canApprove}
            onClick={() => setState('approved')}
            className="flex items-center gap-1.5 rounded-xl border border-ink/15 bg-card px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink/40 disabled:cursor-not-allowed disabled:border-line disabled:text-ink-mute">

              <CheckIcon className="h-3.5 w-3.5" />
              {blocking > 0 ? `${blocking} blocking flag${blocking > 1 ? 's' : ''}` : 'Approve version'}
            </button>
          </>
        } />


      <Panel className="p-2">
        <div className="flex flex-wrap gap-1.5">
          {outputTypes.map((t) =>
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ${
            type === t.id ? 'bg-accent text-white' : 'text-ink-soft hover:bg-shell hover:text-ink'}`
            }>

              {t.label}
            </button>
          )}
        </div>
      </Panel>

      {/*
        THE PUBLICATION GATE — PRD §6.9, Arch §9.
        Approval and publication are two distinct states with two distinct
        actions. Collapsing them makes accidental disclosure a single mis-click,
        and with the manual email step gone there is no human backstop left.
      */}
      <Panel className={isPublished ? 'border-ok/40' : 'border-accent/30'}>
        <PanelHeader
          title="Publication"
          subtitle="Approved means you signed off on this exact version. Published means it is visible in the client portal right now."
          right={
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold ${
            isPublished ? 'bg-ok-soft text-ok' : 'bg-shell text-ink-mute'}`
            }>

              {isPublished ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
              {isPublished ? `Live to ${clientProfile.name}` : 'Not client-visible'}
            </span>
          } />


        <div className="grid gap-3 px-5 py-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-3">
            {requiresExpert &&
            <div
              className={`rounded-xl border p-3 ${
              expertSignedOff ? 'border-ok/30 bg-ok-soft' : 'border-warn/40 bg-warn-soft'}`
              }>

                <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <ShieldCheckIcon className={`h-3.5 w-3.5 ${expertSignedOff ? 'text-ok' : 'text-warn'}`} />
                  Expert review required before publication
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                  {review?.discipline} · {review?.reviewer}. {expertSignedOff ?
                'Sign-off recorded. This output may be published.' :
                review?.note}
                </p>
                <button
                type="button"
                onClick={() => {
                  setExpertSignedOff((v) => !v);
                  log(expertSignedOff ? 'Expert sign-off withdrawn' : `Expert sign-off recorded by ${review?.reviewer}`);
                }}
                className="mt-2 text-2xs font-semibold text-accent-deep hover:underline">

                  {expertSignedOff ? 'Withdraw sign-off' : 'Record sign-off'}
                </button>
              </div>
            }

            {diverged &&
            <div className="rounded-xl border border-warn/40 bg-warn-soft p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <AlertTriangleIcon className="h-3.5 w-3.5 text-warn" />
                  The client is reading v{publishedVersion} while you edit v{CURRENT_VERSION}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                  Only one published version is visible to a tenant at a time. Your edits are not live until you publish
                  again.
                </p>
              </div>
            }

            {publishBlockedReason() &&
            <div className="rounded-xl border border-line bg-shell p-3">
                <p className="text-xs leading-relaxed text-ink-soft">{publishBlockedReason()}</p>
              </div>
            }

            <div className="flex flex-wrap items-center gap-2">
              {!isPublished && !confirming &&
              <button
                type="button"
                disabled={!canPublish}
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-accent-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-mute">

                  <SendIcon className="h-3.5 w-3.5" />
                  Publish to {clientProfile.name}
                </button>
              }

              {!isPublished && confirming &&
              <div className="w-full rounded-xl border border-accent/40 bg-accent-soft p-3">
                  <p className="text-xs font-semibold text-ink">
                    Publish v{CURRENT_VERSION} to {clientProfile.name}?
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    This makes the version readable in their portal immediately and sends a notification to every member
                    of the organisation. It is reversible, and both the publish and any later withdrawal are recorded in
                    the audit log.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                    type="button"
                    onClick={publish}
                    className="rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-accent-deep">

                      Yes, publish now
                    </button>
                    <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">

                      Cancel
                    </button>
                  </div>
                </div>
              }

              {isPublished &&
              <button
                type="button"
                onClick={unpublish}
                className="flex items-center gap-1.5 rounded-xl border border-bad/40 bg-card px-3.5 py-2 text-xs font-semibold text-bad transition-colors duration-150 hover:bg-bad-soft">

                  <UndoIcon className="h-3.5 w-3.5" />
                  Unpublish
                </button>
              }

              <Link
                to="/portal"
                className="text-2xs font-semibold text-accent-deep hover:underline">

                Open the client portal to check
              </Link>
            </div>

            {gateLog.length > 0 &&
            <ul className="space-y-1 rounded-xl bg-shell p-3">
                <li className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  Audit events written this session
                </li>
                {gateLog.map((e, i) =>
              <li key={i} className="flex gap-2 text-2xs text-ink-soft">
                    <span className="shrink-0 font-mono tabular-nums text-ink-mute">{e.at}</span>
                    <span>{e.message}</span>
                  </li>
              )}
              </ul>
            }
          </div>

          {/* Version history is internal. The client only ever sees the published version. */}
          <div className="rounded-xl border border-line bg-shell p-3">
            <p className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
              <HistoryIcon className="h-3.5 w-3.5" />
              Version history — internal only
            </p>
            <ul className="mt-2 space-y-1.5">
              {outputVersions.map((v) =>
              <li key={v.id} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 rounded-md bg-card px-1.5 py-0.5 font-mono text-2xs font-semibold text-ink">
                    v{v.version}
                  </span>
                  <div className="min-w-0">
                    <p className="text-2xs text-ink-soft">{v.summary}</p>
                    <p className="text-2xs text-ink-mute">
                      {v.createdAt} · {v.author}
                      {publishedVersion === v.version && <span className="font-semibold text-ok"> · published</span>}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </Panel>

      <div className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-3">
          <Panel className="px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink">Review pipeline</h2>
              <p className="text-2xs text-ink-mute">
                Stage {stage + 1} of {reviewStages.length} · {reviewStages[stage]}
              </p>
            </div>
            <ol className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
              {reviewStages.map((s, i) =>
              <li key={s} className="flex min-w-0 flex-1 items-center gap-1.5">
                  <button
                  type="button"
                  onClick={() => setStage(i)}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors duration-150 ${
                  i < stage ?
                  'border-ok/30 bg-ok-soft' :
                  i === stage ?
                  'border-accent bg-accent-soft' :
                  'border-line bg-card hover:border-ink-mute/40'}`
                  }>

                    <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-2xs font-semibold ${
                    i < stage ? 'bg-ok text-white' : i === stage ? 'bg-accent text-white' : 'bg-shell text-ink-mute'}`
                    }>

                      {i < stage ? <CheckIcon className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className="truncate text-2xs font-semibold text-ink">{s}</span>
                  </button>
                  {i < reviewStages.length - 1 && <span className="h-px w-2 shrink-0 bg-line" aria-hidden="true" />}
                </li>
              )}
            </ol>
          </Panel>

          <Panel>
            <PanelHeader
              title="Draft"
              subtitle={`Generated from ${signal.id} · ${signal.evidence.reduce((n, e) => n + e.samples, 0)} evidence spans`}
              right={
              <button
                type="button"
                onClick={() => setState('drafting')}
                className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 hover:border-accent hover:text-accent-deep">

                  <SparklesIcon className="h-3.5 w-3.5" />
                  Regenerate
                </button>
              } />

            <div className="space-y-4 px-5 py-4">
              {draftSections.map((s) =>
              <label key={s.id} className="block">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">{s.label}</span>
                  <textarea
                  value={sections[s.id]}
                  onChange={(e) => {
                    setSections((prev) => ({ ...prev, [s.id]: e.target.value }));
                    setState('drafting');
                  }}
                  rows={s.id === 'headline' ? 2 : 4}
                  className="mt-1.5 w-full resize-y rounded-xl border border-line bg-shell px-3 py-2.5 text-xs leading-relaxed text-ink focus:outline-none" />

                </label>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel>
            <PanelHeader
              title="Required contents"
              subtitle={`Every ${activeType.label.toLowerCase()} must carry each of these (PRD §6.6)`} />

            <ul className="grid grid-cols-2 gap-1.5 px-5 py-4">
              {activeType.mustContain.map((item) =>
              <li key={item} className="flex items-start gap-1.5 text-2xs text-ink-soft">
                  <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-ok" />
                  {item}
                </li>
              )}
            </ul>
          </Panel>

          <Panel className={blocking > 0 ? 'border-bad/30' : ''}>
            <PanelHeader
              title="Claims flags"
              subtitle="Annotations on the draft — blocking flags prevent approval, which in turn prevents publication"
              right={
              <span
                className={`rounded-full px-2.5 py-1 text-2xs font-semibold ${
                blocking > 0 ? 'bg-bad-soft text-bad' : 'bg-ok-soft text-ok'}`
                }>

                  {blocking > 0 ? `${blocking} blocking` : 'clear'}
                </span>
              } />

            <ul className="space-y-2.5 px-5 py-4">
              {claimsFlags.map((f) => {
                const done = resolved[f.id];
                return (
                  <li
                    key={f.id}
                    className={`rounded-xl border p-3 ${done ? 'border-ok/30 bg-ok-soft' : SEVERITY_STYLES[f.severity]}`}>

                    <div className="flex items-start justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                        {!done && f.severity !== 'note' &&
                        <AlertTriangleIcon className={`h-3.5 w-3.5 ${SEVERITY_TEXT[f.severity]}`} />
                        }
                        {f.kind}
                      </p>
                      <span className={`text-2xs font-semibold ${done ? 'text-ok' : SEVERITY_TEXT[f.severity]}`}>
                        {done ? 'resolved' : f.severity}
                      </span>
                    </div>
                    <p className="mt-1.5 border-l-2 border-ink-mute/30 pl-2 font-mono text-2xs text-ink-soft">
                      {f.excerpt}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{f.guidance}</p>
                    <button
                      type="button"
                      onClick={() => setResolved((r) => ({ ...r, [f.id]: !r[f.id] }))}
                      className="mt-2 text-2xs font-semibold text-accent-deep hover:underline">

                      {done ? 'Reopen flag' : 'Mark resolved'}
                    </button>
                  </li>);

              })}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Citation validation" subtitle="A hard gate, not a style check" />
            <ul className="space-y-2 px-5 py-4">
              {citationChecks.map((c) =>
              <li key={c.check} className="flex items-start gap-2">
                  <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  c.state === 'passed' ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`
                  }>

                    {c.state === 'passed' ?
                  <CheckIcon className="h-2.5 w-2.5" /> :
                  <AlertTriangleIcon className="h-2.5 w-2.5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug text-ink">{c.check}</p>
                    <p className="text-2xs text-ink-mute">{c.detail}</p>
                  </div>
                </li>
              )}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Export" subtitle="Writes a file. Separate from publishing." />
            <div className="space-y-3 px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {EXPORT_FORMATS.map((f) =>
                <button
                  key={f}
                  type="button"
                  disabled={state !== 'approved' && !isPublished}
                  onClick={() => log(`Exported v${CURRENT_VERSION} as ${f} — internal fields stripped`)}
                  className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-accent hover:text-accent-deep disabled:cursor-not-allowed disabled:text-ink-mute disabled:hover:border-line">

                    <DownloadIcon className="h-3.5 w-3.5" />
                    {f}
                  </button>
                )}
              </div>
              <div className="rounded-xl border border-line bg-shell p-3">
                <p className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  <EyeOffIcon className="h-3.5 w-3.5" />
                  Stays internal — never exported, never in the portal
                </p>
                <ul className="mt-2 space-y-1">
                  {internalOnlyFields.map((f) =>
                  <li key={f} className="text-2xs text-ink-soft">
                      {f}
                    </li>
                  )}
                </ul>
              </div>
              <p className="text-2xs leading-relaxed text-ink-mute">
                Export writes a file for you to send. Trend Engine never publishes to Shopify, WordPress, email or social
                on its own.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader
          title="Recent outputs"
          subtitle="drafting → draft → review ready → approved → published → delivered / archived"
          right={
          <Link to="/ops/operations" className="text-xs font-semibold text-accent-deep hover:underline">
              Audit log
            </Link>
          } />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                <th scope="col" className="w-28 py-2.5 pl-5 pr-4 font-semibold">ID</th>
                <th scope="col" className="w-48 py-2.5 pr-4 font-semibold">Type</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold">Title</th>
                <th scope="col" className="w-36 py-2.5 pr-4 font-semibold">Tenant</th>
                <th scope="col" className="w-32 py-2.5 pr-4 font-semibold">State</th>
                <th scope="col" className="w-28 py-2.5 pr-5 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentOutputs.map((o) =>
              <tr key={o.id} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5 pl-5 pr-4 font-mono text-xs text-ink-soft">{o.id}</td>
                  <td className="py-2.5 pr-4 text-xs text-ink-soft">{o.type}</td>
                  <td className="py-2.5 pr-4 text-xs font-semibold text-ink">{o.title}</td>
                  <td className="py-2.5 pr-4 text-xs text-ink-soft">{o.org}</td>
                  <td className="py-2.5 pr-4">
                    <StateChip state={o.state} />
                  </td>
                  <td className="py-2.5 pr-5 font-mono text-xs tabular-nums text-ink-soft">{o.updated}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>);

}
