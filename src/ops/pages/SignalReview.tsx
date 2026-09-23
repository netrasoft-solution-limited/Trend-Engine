import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  GitMergeIcon,
  PencilIcon,
  XIcon } from
'lucide-react';
import { Panel, PanelHeader } from '../../components/Panel';
import { ScoreBar } from '../../components/ScoreBar';
import { StateChip } from '../../components/StateChip';
import { SCORE_AXES, signals, weightedTotal } from '../../data/signals';
import { clientSignalScores, clientScoreFor } from '../../data/clientScores';
import { outputTypes } from '../../data/outputs';
import { SignalState } from '../../types';

const REJECT_REASONS = [
'weak evidence',
'duplicate topic',
'access-rights problem',
'low client fit',
'claims risk'];


export function SignalReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const signal = signals.find((s) => s.id === id) ?? signals[0];
  const clientScore = clientScoreFor(signal.id, 'org-jarrow') ?? clientSignalScores[0];

  const [state, setState] = useState<SignalState>(signal.state);
  const [openComponent, setOpenComponent] = useState<string | null>(signal.breakdown[0].label);
  const [mode, setMode] = useState<'none' | 'reject' | 'approve' | 'merge'>('none');
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [reasonNote, setReasonNote] = useState('');
  const [outputType, setOutputType] = useState<string>('trend_brief');
  const [axis, setAxis] = useState<'domain' | 'client'>('domain');

  const domainTotal = weightedTotal(signal.breakdown);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <Link
          to="/ops"
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:text-ink">
          
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to triage
        </Link>
        <p className="text-2xs text-ink-mute">
          Legal next states: in review → approved / rejected / watching → archived
        </p>
      </div>

      <Panel className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-medium text-ink-mute">{signal.id}</span>
              <StateChip state={state} />
              {signal.claimsFlags.map((f) =>
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-2xs font-semibold text-warn">
                
                  <AlertTriangleIcon className="h-3 w-3" />
                  {f}
                </span>
              )}
            </div>
            <h1 className="mt-2.5 text-2xl font-bold leading-tight tracking-tight text-ink">{signal.title}</h1>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">{signal.detail}</p>
          </div>

          <div className="flex flex-col items-stretch gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'approve' ? 'none' : 'approve')}
                className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-accent-deep">
                
                <CheckIcon className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setState('in review')}
                className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">
                
                <PencilIcon className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setState('watching')}
                className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">
                
                <EyeIcon className="h-3.5 w-3.5" />
                Watch
              </button>
              <button
                type="button"
                onClick={() => setMode(mode === 'merge' ? 'none' : 'merge')}
                className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">
                
                <GitMergeIcon className="h-3.5 w-3.5" />
                Merge
              </button>
              <button
                type="button"
                onClick={() => setMode(mode === 'reject' ? 'none' : 'reject')}
                className="flex items-center gap-1.5 rounded-xl border border-bad/30 px-3 py-2 text-xs font-semibold text-bad transition-colors duration-150 hover:bg-bad-soft">
                
                <XIcon className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
            <p className="text-right text-2xs text-ink-mute">
              Weighted domain total <span className="font-mono font-semibold text-ink">{domainTotal}</span> · headline{' '}
              <span className="font-mono font-semibold text-ink">{signal.domainScore}</span>
            </p>
          </div>
        </div>

        {mode === 'approve' &&
        <div className="mt-4 rounded-xl border border-accent/30 bg-accent-soft/50 p-4">
            <p className="text-xs font-semibold text-ink">Which output should this generate?</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {outputTypes.map((t) =>
            <label
              key={t.id}
              className={`flex cursor-pointer items-start gap-2 rounded-xl border bg-card p-3 transition-colors duration-150 ${
              outputType === t.id ? 'border-accent' : 'border-line hover:border-ink-mute/40'}`
              }>
              
                  <input
                type="radio"
                name="outputType"
                value={t.id}
                checked={outputType === t.id}
                onChange={() => setOutputType(t.id)}
                className="mt-0.5 accent-accent" />
              
                  <span>
                    <span className="block text-xs font-semibold text-ink">{t.label}</span>
                    <span className="mt-0.5 block text-2xs leading-relaxed text-ink-mute">{t.note}</span>
                  </span>
                </label>
            )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
              type="button"
              onClick={() => {
                setState('approved');
                navigate(`/ops/output?signal=${signal.id}&type=${outputType}`);
              }}
              className="rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">
              
                Approve & open Output Builder
              </button>
              <button
              type="button"
              onClick={() => setMode('none')}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:text-ink">
              
                Cancel
              </button>
            </div>
          </div>
        }

        {mode === 'reject' &&
        <div className="mt-4 rounded-xl border border-bad/30 bg-bad-soft/40 p-4">
            <p className="text-xs font-semibold text-ink">A rejection reason is required</p>
            <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr]">
              <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-label="Rejection reason"
              className="rounded-xl border border-line bg-card px-2.5 py-2 text-xs font-medium text-ink focus:outline-none">
              
                {REJECT_REASONS.map((r) =>
              <option key={r}>{r}</option>
              )}
              </select>
              <input
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              placeholder="Free text — recorded in the audit log, never exported to the client"
              aria-label="Rejection note"
              className="rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink placeholder:text-ink-mute focus:outline-none" />
            
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
              type="button"
              onClick={() => {
                setState('rejected');
                setMode('none');
              }}
              className="rounded-xl bg-bad px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-bad/90">
              
                Confirm rejection
              </button>
              <button
              type="button"
              onClick={() => setMode('none')}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:text-ink">
              
                Cancel
              </button>
            </div>
          </div>
        }

        {mode === 'merge' &&
        <div className="mt-4 rounded-xl border border-line bg-shell p-4">
            <p className="text-xs font-semibold text-ink">Merge into an existing signal</p>
            <div className="mt-2.5 space-y-1.5">
              {signals.
            filter((s) => s.id !== signal.id).
            slice(0, 3).
            map((s) =>
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-card px-3 py-2">
              
                    <input type="radio" name="mergeTarget" className="accent-accent" />
                    <span className="font-mono text-2xs text-ink-mute">{s.id}</span>
                    <span className="truncate text-xs text-ink">{s.title}</span>
                  </label>
            )}
            </div>
            <button
            type="button"
            onClick={() => {
              setState('archived');
              setMode('none');
            }}
            className="mt-3 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">
            
              Merge & archive this signal
            </button>
          </div>
        }
      </Panel>

      <div className="grid gap-3 xl:grid-cols-[1.25fr_1fr]">
        {/*
          Arch §8.1: three axes, deliberately never collapsed into one number.
          A high-momentum signal with thin evidence must stay visibly
          distinguishable from a well-evidenced one.
        */}
        <Panel>
          <PanelHeader
            title="Score breakdown"
            subtitle="Components are persisted at write time, not derived for display — Arch §8.2. Weights sum to 1.00."
            right={
            <div className="flex items-center gap-3">
                {SCORE_AXES.map((a, i) =>
              <div key={a.key} className="flex items-center gap-3">
                    {i > 0 && <div className="h-8 w-px bg-line" />}
                    <button
                  type="button"
                  onClick={() => a.key !== 'confidence' && setAxis(a.key as 'domain' | 'client')}
                  title={`${a.question} — ${a.scope}`}
                  className={`rounded-lg px-1.5 py-0.5 text-right transition-colors duration-150 ${
                  a.key === axis ? 'bg-accent-soft' : a.key !== 'confidence' ? 'hover:bg-shell' : 'cursor-default'}`
                  }>

                      <span className="block text-2xs text-ink-mute">{a.label}</span>
                      <span
                    className={`block font-mono text-lg font-semibold leading-none ${
                    a.key === 'client' ? 'text-accent-deep' : 'text-ink'}`
                    }>

                        {a.key === 'domain' ?
                    signal.domainScore :
                    a.key === 'client' ?
                    clientScore.clientFit :
                    signal.confidence}
                      </span>
                    </button>
                  </div>
              )}
              </div>
            } />

          <p className="border-b border-line bg-shell/60 px-5 py-2 text-2xs text-ink-mute">
            {axis === 'domain' ?
            'Domain signal — is this moving in the category? Computed once per domain pack and shared by every tenant.' :
            'Client rank — does this matter to Jarrow? 60% domain signal + 20% asset relevance + 10% audience fit + 10% strategic priority.'}
          </p>

          <ul className="divide-y divide-line">
            {(axis === 'domain' ? signal.breakdown : clientScore.clientBreakdown).map((c) => {
              const open = openComponent === c.label;
              return (
                <li key={c.label}>
                  <button
                    type="button"
                    onClick={() => setOpenComponent(open ? null : c.label)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors duration-150 hover:bg-shell/70">

                    <span className="w-36 shrink-0 text-xs font-semibold text-ink">{c.label}</span>
                    <span className="w-14 shrink-0 font-mono text-2xs text-ink-mute">w {c.weight.toFixed(2)}</span>
                    <span className="min-w-0 flex-1">
                      <ScoreBar value={c.value} label={c.label} width="w-full" />
                    </span>
                    <span className="shrink-0 font-mono text-2xs text-ink-mute">
                      +{(c.value * c.weight).toFixed(1)}
                    </span>
                  </button>
                  {open &&
                  <p className="border-t border-line bg-shell/60 px-5 py-2.5 text-xs leading-relaxed text-ink-soft">
                      {c.note}
                    </p>
                  }
                </li>);

            })}
          </ul>

          {/* PRD §6.4/§8: exactly one tenant, one client-profile version, one domain-pack version. */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-5 py-3 sm:grid-cols-3">
            {[
            ['Baseline', signal.provenance.baseline],
            ['Domain pack', signal.provenance.domainPackVersion],
            ['Client profile', clientScore.clientProfileVersion],
            ['Model', signal.provenance.modelVersion],
            ['Prompt', signal.provenance.promptVersion],
            ['Sources / creators', `${signal.provenance.sourceCount} / ${signal.provenance.creatorCount}`]].
            map(([k, v]) =>
            <div key={k}>
                <dt className="text-2xs text-ink-mute">{k}</dt>
                <dd className="font-mono text-2xs text-ink-soft">{v}</dd>
              </div>
            )}
          </dl>
        </Panel>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Jarrow connection" subtitle="Portfolio and category exposure" />
            <p className="px-5 py-4 text-xs leading-relaxed text-ink-soft">{clientScore.clientConnection}</p>
          </Panel>

          <Panel className="border-warn/30">
            <div className="flex items-center gap-2 border-b border-warn/25 bg-warn-soft px-5 py-3">
              <AlertTriangleIcon className="h-4 w-4 text-warn" />
              <h2 className="text-[15px] font-semibold text-ink">Contradictions & risks</h2>
            </div>
            <ul className="space-y-2.5 px-5 py-4">
              {signal.contradictions.map((c) =>
              <li key={c} className="flex gap-2 text-xs leading-relaxed text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warn" aria-hidden="true" />
                  {c}
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelHeader
          title="Evidence"
          subtitle="One row per collection route. Qualifications are attached to the evidence, not buried in a footnote." />
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                <th scope="col" className="py-2.5 pl-5 pr-4 font-semibold">Route</th>
                <th scope="col" className="w-24 py-2.5 pr-4 font-semibold">Samples</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold">Observed pattern</th>
                <th scope="col" className="py-2.5 pr-5 font-semibold">Qualification / caveat</th>
              </tr>
            </thead>
            <tbody>
              {signal.evidence.map((e) =>
              <tr key={e.route} className="border-b border-line/70 align-top last:border-0">
                  <td className="py-3 pl-5 pr-4 text-xs font-semibold text-ink">{e.route}</td>
                  <td className="py-3 pr-4 font-mono text-xs tabular-nums text-ink-soft">{e.samples}</td>
                  <td className="py-3 pr-4 text-xs leading-relaxed text-ink-soft">{e.pattern}</td>
                  <td className="py-3 pr-5 text-xs leading-relaxed text-warn">{e.caveat}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>);

}