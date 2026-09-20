import { DatabaseBackupIcon, RotateCcwIcon, ShieldAlertIcon, ShieldCheckIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { StateChip } from '../../components/StateChip';
import {
  auditLog,
  backupStatus,
  circuitBreakers,
  connectors,
  deadLetter,
  portalHealth,
  queues,
  tenancyStatus,
  transcriptCoverage,
  vendorSpend } from
'../../data/operations';

const KIND_TONE: Record<string, string> = {
  config: 'bg-info-soft text-info',
  review: 'bg-warn-soft text-warn',
  approval: 'bg-ok-soft text-ok',
  publication: 'bg-accent-soft text-accent-deep',
  export: 'bg-slate-soft text-slate',
  system: 'bg-slate-soft text-slate'
};

const QUEUE_TONE: Record<string, string> = {
  healthy: 'bg-ok-soft text-ok',
  'backed up': 'bg-warn-soft text-warn',
  paused: 'bg-bad-soft text-bad'
};

const BREAKER_TONE = {
  ok: 'border-ok/30 bg-ok-soft',
  warn: 'border-warn/40 bg-warn-soft',
  bad: 'border-bad/40 bg-bad-soft'
};

/** Arch §6.3: which failures back off, and which stop the connector instead. */
const RETRY_POSTURE: Record<string, string> = {
  none: 'retrying',
  network: 'backoff with jitter',
  'rate limit': 'backoff with jitter',
  schema: 'dead-lettered, siblings unaffected',
  auth: 'blocks connector — no retry',
  policy: 'blocks connector — no retry'
};

export function Operations() {
  const spend = vendorSpend.reduce((s, v) => s + v.spend, 0);
  const cap = vendorSpend.reduce((s, v) => s + v.cap, 0);

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Operations"
        title="Is the system trustworthy right now?"
        description="Connector freshness, vendor spend against cap, failed items and restore posture. Cost and health are ambient here and in the header — never buried."
        right={
        <span className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-medium text-ink-soft">
            September 2026 · <span className="font-mono font-semibold text-ink">${spend.toFixed(2)}</span> of ${cap}
          </span>
        } />
      

      <div className="grid gap-3 xl:grid-cols-[1.15fr_1fr]">
        <Panel>
          <PanelHeader title="Connector freshness" subtitle="Last success, failures, transcript coverage, latency" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  <th scope="col" className="py-2.5 pl-5 pr-4 font-semibold">Source</th>
                  <th scope="col" className="w-24 py-2.5 pr-4 font-semibold">State</th>
                  <th scope="col" className="w-28 py-2.5 pr-4 font-semibold">Last success</th>
                  <th scope="col" className="w-20 py-2.5 pr-4 font-semibold">Fails</th>
                  <th scope="col" className="w-32 py-2.5 pr-4 font-semibold">Coverage</th>
                  <th scope="col" className="w-20 py-2.5 pr-5 font-semibold">Latency</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((c) =>
                <tr key={c.source} className="border-b border-line/70 last:border-0">
                    <td className="py-2.5 pl-5 pr-4 text-xs font-semibold text-ink">{c.source}</td>
                    <td className="py-2.5 pr-4">
                      <StateChip state={c.state} />
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs tabular-nums text-ink-soft">{c.lastSuccess}</td>
                    <td
                    className={`py-2.5 pr-4 font-mono text-xs tabular-nums ${
                    c.failures > 2 ? 'font-semibold text-bad' : 'text-ink-soft'}`
                    }>
                    
                      {c.failures}
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-mono text-xs tabular-nums text-ink">{c.coverage}%</span>
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-line">
                          <div
                          className={`h-full rounded-full ${c.coverage >= 90 ? 'bg-ok' : c.coverage >= 60 ? 'bg-warn' : 'bg-bad'}`}
                          style={{ width: `${c.coverage}%` }} />
                        
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-5 font-mono text-xs tabular-nums text-ink-soft">{c.latency}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Arch §13: metadata-only items are tracked, never quietly counted as understood content. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-3">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Transcript coverage</p>
            <p className="font-mono text-xs font-semibold tabular-nums text-ink">
              {transcriptCoverage.pct}%
              <span className="ml-1.5 font-sans font-normal text-ink-mute">
                {transcriptCoverage.fullTranscript} full · {transcriptCoverage.metadataOnly} metadata-only
              </span>
            </p>
            <p className="w-full text-2xs leading-relaxed text-ink-mute">{transcriptCoverage.note}</p>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Cost ledger"
            subtitle="Per-vendor spend against cap · enforced before a run starts, not reconciled after"
            right={
            <span className="font-mono text-sm font-semibold text-ink">
                ${spend.toFixed(2)} <span className="text-ink-mute">/ ${cap}</span>
              </span>
            } />
          
          <ul className="divide-y divide-line">
            {vendorSpend.map((v) => {
              const pct = Math.round(v.spend / v.cap * 100);
              const warn = pct >= 80;
              return (
                <li key={v.vendor} className="px-5 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-xs font-semibold text-ink">{v.vendor}</p>
                    <p className={`font-mono text-xs tabular-nums ${warn ? 'font-semibold text-warn' : 'text-ink-soft'}`}>
                      ${v.spend.toFixed(2)} / ${v.cap}
                      <span className="ml-1.5 text-ink-mute">{pct}%</span>
                    </p>
                  </div>
                  <p className="mt-0.5 text-2xs text-ink-mute">{v.line}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full ${warn ? 'bg-warn' : 'bg-accent'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                    
                  </div>
                  {warn &&
                  <p className="mt-1.5 text-2xs font-semibold text-warn">
                      Over 80% of cap — collection will throttle before it overspends.
                    </p>
                  }
                </li>);

            })}
          </ul>
          <ul className="space-y-1.5 border-t border-line px-5 py-3">
            <li className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Circuit breakers</li>
            {circuitBreakers.map((b) =>
            <li key={b.threshold} className={`rounded-lg border px-2.5 py-1.5 ${BREAKER_TONE[b.tone]}`}>
                <p className="text-2xs font-semibold text-ink">{b.threshold}</p>
                <p className="text-2xs text-ink-soft">{b.action}</p>
              </li>
            )}
          </ul>
        </Panel>
      </div>

      {/* Arch §11.1: three queues deliberately — transcription must never starve a user-facing export. */}
      <div className="grid gap-3 xl:grid-cols-[1.15fr_1fr]">
        <Panel>
          <PanelHeader
            title="Queue health"
            subtitle="Separate queues by workload shape, so a 40-minute transcription cannot block an export" />

          <ul className="divide-y divide-line">
            {queues.map((q) =>
            <li key={q.name} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                <span className="w-20 shrink-0 font-mono text-xs font-semibold text-ink">{q.name}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${QUEUE_TONE[q.state]}`}>
                  {q.state}
                </span>
                <span className="shrink-0 font-mono text-2xs tabular-nums text-ink-soft">
                  depth {q.depth} · {q.latency} · {q.concurrency}
                </span>
                <p className="w-full text-2xs text-ink-mute">{q.purpose}</p>
              </li>
            )}
          </ul>
        </Panel>

        {/* Arch §13: any TenantScopeError in production is a P1. */}
        <Panel className={tenancyStatus.scopeErrorsInProduction > 0 ? 'border-bad/40' : 'border-ok/30'}>
          <PanelHeader
            title="Tenancy & portal"
            subtitle={`CI last run ${tenancyStatus.lastCiRun}`}
            right={
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold ${
              tenancyStatus.scopeErrorsInProduction > 0 ? 'bg-bad-soft text-bad' : 'bg-ok-soft text-ok'}`
              }>

                {tenancyStatus.scopeErrorsInProduction > 0 ?
              <ShieldAlertIcon className="h-3.5 w-3.5" /> :
              <ShieldCheckIcon className="h-3.5 w-3.5" />}
                {tenancyStatus.scopeErrorsInProduction} scope errors
              </span>
            } />

          <ul className="divide-y divide-line">
            {tenancyStatus.suites.map((s) =>
            <li key={s.name} className="flex items-start justify-between gap-3 px-5 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">{s.name}</p>
                  <p className="text-2xs leading-relaxed text-ink-mute">{s.detail}</p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block text-2xs font-semibold text-ok">{s.state}</span>
                  <span className="block font-mono text-2xs text-ink-mute">{s.count} tests</span>
                </span>
              </li>
            )}
          </ul>
          <div className="border-t border-line px-5 py-3">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Portal · today</p>
            <p className="mt-1 font-mono text-xs tabular-nums text-ink">
              {portalHealth.loginsSucceeded} logins · {portalHealth.loginsFailed} failed ·{' '}
              {portalHealth.publicationEvents} published · {portalHealth.unpublishEvents} withdrawn
            </p>
            <p className="mt-1 text-2xs leading-relaxed text-ink-mute">
              {portalHealth.note} A TenantScopeError in production is a P1 — it means something tried to read tenant data
              with no tenant bound.
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.15fr_1fr]">
        <Panel>
          <PanelHeader
            title="Dead-letter queue"
            subtitle={`${deadLetter.length} failed items awaiting triage`}
            right={
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 hover:border-accent hover:text-accent-deep">
              
                <RotateCcwIcon className="h-3.5 w-3.5" />
                Retry all
              </button>
            } />
          
          <ul className="divide-y divide-line">
            {deadLetter.map((d) =>
            <li key={d.id} className="flex flex-wrap items-start justify-between gap-2 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">
                    <span className="font-mono text-ink-mute">{d.id}</span> · {d.source}
                  </p>
                  <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-ink-soft">{d.error}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-2xs text-ink-soft">{d.attempts} attempts</p>
                  <p
                    className={`text-2xs ${
                    d.errorClass === 'auth' || d.errorClass === 'policy' ? 'font-semibold text-bad' : 'text-ink-mute'}`
                    }>

                    {RETRY_POSTURE[d.errorClass]}
                  </p>
                  <p className="text-2xs text-ink-mute">{d.queuedAt}</p>
                </div>
              </li>
            )}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader
            title="Backup & restore"
            right={<StateChip state="active" />} />
          
          <dl className="space-y-3 px-5 py-4">
            {[
            ['Last backup', backupStatus.lastBackup],
            ['Last successful restore test', backupStatus.lastRestoreTest],
            ['Retention', backupStatus.retention],
            ['Next scheduled', backupStatus.nextScheduled]].
            map(([k, v]) =>
            <div key={k}>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">{k}</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-ink">{v}</dd>
              </div>
            )}
          </dl>
          <div className="flex items-center gap-2 border-t border-line px-5 py-3">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">
              
              <DatabaseBackupIcon className="h-3.5 w-3.5" />
              Run backup now
            </button>
            <button
              type="button"
              className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">
              
              Test restore to staging
            </button>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Audit log"
          subtitle="Config, review, approval, publication and export events — immutable, reverse chronological" />
        <ol className="divide-y divide-line">
          {auditLog.map((a) =>
          <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5">
              <span className="w-28 shrink-0 font-mono text-2xs tabular-nums text-ink-mute">{a.at}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${KIND_TONE[a.kind]}`}>
                {a.kind}
              </span>
              <span className="w-20 shrink-0 font-mono text-2xs text-ink-soft">{a.actor}</span>
              <span className="min-w-0 flex-1 text-xs text-ink">{a.message}</span>
            </li>
          )}
        </ol>
      </Panel>
    </div>);

}