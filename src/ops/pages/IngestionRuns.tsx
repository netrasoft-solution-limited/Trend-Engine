import { useState } from 'react';
import { FilterIcon, KeyIcon, ShieldAlertIcon, SplitIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { fallbackLadder, ingestionRuns, relevanceGate, samplingNote } from '../../data/runs';
import { ErrorClass, RunState } from '../../types';

const RUN_TONES: Record<RunState, string> = {
  succeeded: 'bg-ok-soft text-ok',
  partial: 'bg-warn-soft text-warn',
  running: 'bg-info-soft text-info',
  failed: 'bg-bad-soft text-bad',
  rejected: 'bg-bad-soft text-bad'
};

/** Arch §6.3: network and rate-limit errors back off. Auth and policy errors block instead. */
const RETRY_POSTURE: Record<ErrorClass, string> = {
  none: '—',
  network: 'Backoff with jitter',
  'rate limit': 'Backoff with jitter',
  schema: 'Dead-letter, siblings unaffected',
  auth: 'Blocks connector — does not retry',
  policy: 'Blocks connector — does not retry'
};

const OUTCOME_TONES: Record<string, string> = {
  succeeded: 'text-ok',
  'fell through': 'text-warn',
  'not attempted': 'text-ink-mute'
};

export function IngestionRuns() {
  const [route, setRoute] = useState<'Podcast' | 'YouTube'>('Podcast');

  const funnelPct = Math.round((relevanceGate.passed / relevanceGate.discovered) * 100);
  const ladder = fallbackLadder.filter((f) => f.route === route);

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Evidence · global layer"
        title="Ingestion runs"
        description="Acquisition is tenant-agnostic — everything collected here serves every client in the vertical. This is the layer where cost is spent, so it is also the layer where cost is governed."
        right={
        <div className="rounded-xl border border-line bg-card px-3 py-2 text-2xs text-ink-mute">
            Idempotency key ·{' '}
            <span className="font-mono text-ink-soft">(source_id, external_item_id, content_hash)</span>
          </div>
        } />


      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        {/*
          Arch §6.2: the metadata-only relevance gate is an architectural
          component, not an optimization. It is what makes the transcript
          budget work — ~65 episodes become ~26 transcripts.
        */}
        <Panel>
          <PanelHeader
            title="Relevance gate"
            subtitle="Runs on titles, descriptions, show notes, chapters and guest info only — never on audio or a full transcript"
            right={
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-2xs font-semibold text-accent-deep">
                {funnelPct}% pass
              </span>
            } />

          <div className="space-y-3 px-5 py-4">
            <div className="flex items-stretch gap-2">
              {[
              { label: 'Discovered', value: relevanceGate.discovered, tone: 'bg-shell text-ink' },
              { label: 'Passed the gate', value: relevanceGate.passed, tone: 'bg-accent-soft text-accent-deep' },
              { label: 'Rejected', value: relevanceGate.rejected, tone: 'bg-shell text-ink-mute' }].
              map((b) =>
              <div key={b.label} className={`flex-1 rounded-xl px-3 py-2.5 ${b.tone}`}>
                  <p className="font-mono text-lg font-semibold tabular-nums">{b.value}</p>
                  <p className="text-2xs">{b.label}</p>
                </div>
              )}
            </div>
            <p className="text-2xs text-ink-mute">{relevanceGate.window}</p>

            <div>
              <p className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                <FilterIcon className="h-3.5 w-3.5" />
                Why items were rejected
              </p>
              <ul className="mt-2 space-y-1.5">
                {relevanceGate.rejectionReasons.map((r) =>
                <li key={r.reason} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 font-mono text-xs font-semibold tabular-nums text-ink">{r.count}</span>
                    <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-line">
                      <div
                      className="h-full rounded-full bg-ink-mute"
                      style={{ width: `${r.count / relevanceGate.rejected * 100}%` }} />

                    </div>
                    <span className="min-w-0 text-2xs text-ink-soft">{r.reason}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent-soft p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <SplitIcon className="h-3.5 w-3.5 text-accent-deep" />
                Rejection sampling · {relevanceGate.sampled} sampled, {relevanceGate.sampledRecovered} recovered
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{samplingNote}</p>
            </div>
          </div>
        </Panel>

        {/* Arch §7.2: chains are declarative config. Each step records whether it was the one that succeeded. */}
        <Panel>
          <PanelHeader
            title="Fallback chain"
            subtitle="Declarative configuration, not branching code — reordering a route is a config change, not a deploy"
            right={
            <div className="flex gap-1">
                {(['Podcast', 'YouTube'] as const).map((r) =>
              <button
                key={r}
                type="button"
                onClick={() => setRoute(r)}
                className={`rounded-lg px-2.5 py-1 text-2xs font-semibold transition-colors duration-150 ${
                route === r ? 'bg-accent text-white' : 'bg-shell text-ink-soft hover:text-ink'}`
                }>

                    {r}
                  </button>
              )}
              </div>
            } />

          <ol className="space-y-1.5 px-5 py-4">
            {ladder.map((f, i) =>
            <li key={f.step} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-shell font-mono text-2xs font-semibold text-ink-mute">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-mono text-xs font-semibold text-ink">{f.step}</p>
                    <p className={`text-2xs font-semibold ${OUTCOME_TONES[f.outcome]}`}>
                      {f.outcome} · {f.items} item{f.items === 1 ? '' : 's'}
                    </p>
                  </div>
                  {f.note && <p className="text-2xs leading-relaxed text-ink-mute">{f.note}</p>}
                </div>
              </li>
            )}
          </ol>
          <p className="border-t border-line px-5 py-3 text-2xs leading-relaxed text-ink-mute">
            Items that reach <span className="font-mono text-ink-soft">metadata_only</span> are shown honestly as such
            wherever they appear, and are excluded from claim extraction. They are never presented as fully understood
            content.
          </p>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Runs"
          subtitle="Re-running a job never duplicates evidence. One broken connector degrades coverage; it does not halt the pipeline." />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                <th scope="col" className="w-24 py-2.5 pl-5 pr-3 font-semibold">Run</th>
                <th scope="col" className="py-2.5 pr-3 font-semibold">Source</th>
                <th scope="col" className="w-28 py-2.5 pr-3 font-semibold">State</th>
                <th scope="col" className="w-44 py-2.5 pr-3 text-center font-semibold">
                  Discovered → transcript
                </th>
                <th scope="col" className="w-20 py-2.5 pr-3 text-right font-semibold">DLQ</th>
                <th scope="col" className="w-20 py-2.5 pr-3 text-right font-semibold">Cost</th>
                <th scope="col" className="w-52 py-2.5 pr-5 font-semibold">Retry posture</th>
              </tr>
            </thead>
            <tbody>
              {ingestionRuns.map((r) =>
              <tr key={r.id} className="border-b border-line/70 align-top last:border-0">
                  <td className="py-3 pl-5 pr-3">
                    <p className="font-mono text-xs text-ink-soft">{r.id}</p>
                    <p className="text-2xs text-ink-mute">{r.startedAt}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <p className="text-xs font-semibold text-ink">{r.sourceName}</p>
                    <p className="text-2xs text-ink-mute">{r.connector} · {r.duration}</p>
                    <p className="mt-1 flex items-start gap-1 text-2xs text-ink-mute">
                      <KeyIcon className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                      <span className="font-mono">{r.idempotencyKey}</span>
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-semibold ${RUN_TONES[r.state]}`}>

                      {r.state}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center justify-center gap-1 font-mono text-2xs tabular-nums text-ink-soft">
                      <span title="discovered">{r.discovered}</span>
                      <span className="text-ink-mute">→</span>
                      <span title="metadata fetched">{r.metadataFetched}</span>
                      <span className="text-ink-mute">→</span>
                      <span className="font-semibold text-accent-deep" title="passed the relevance gate">
                        {r.relevancePassed}
                      </span>
                      <span className="text-ink-mute">→</span>
                      <span className="font-semibold text-ink" title="transcripts acquired">
                        {r.transcriptsAcquired}
                      </span>
                    </div>
                    <p className="mt-1 text-center text-2xs text-ink-mute">disc · meta · relevant · transcript</p>
                  </td>
                  <td className="py-3 pr-3 text-right font-mono text-xs tabular-nums text-ink-soft">
                    {r.deadLettered || '—'}
                  </td>
                  <td className="py-3 pr-3 text-right font-mono text-xs tabular-nums text-ink-soft">
                    ${r.cost.toFixed(2)}
                  </td>
                  <td className="py-3 pr-5">
                    <p
                    className={`flex items-start gap-1 text-2xs font-semibold ${
                    r.errorClass === 'auth' || r.errorClass === 'policy' ? 'text-bad' : 'text-ink-soft'}`
                    }>

                      {(r.errorClass === 'auth' || r.errorClass === 'policy') &&
                    <ShieldAlertIcon className="mt-0.5 h-3 w-3 shrink-0" />
                    }
                      {RETRY_POSTURE[r.errorClass]}
                    </p>
                    <p className="mt-0.5 text-2xs leading-relaxed text-ink-mute">{r.note}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>);

}
