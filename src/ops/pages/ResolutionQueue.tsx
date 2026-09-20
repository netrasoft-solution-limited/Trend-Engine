import { useState } from 'react';
import { ArrowRightIcon, GitMergeIcon, ScaleIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { ScoreBar } from '../../components/ScoreBar';
import { normalizationRules, resolutionQueue, retainedContradictions } from '../../data/resolution';
import { ResolutionKind } from '../../types';

const KIND_LABELS: Record<ResolutionKind, string> = {
  syndication: 'Syndication',
  'cross-post': 'Cross-post',
  alias: 'Alias',
  'creator cap': 'Creator cap',
  sponsored: 'Sponsored',
  'metadata-only': 'Metadata-only'
};

const KIND_TONES: Record<ResolutionKind, string> = {
  syndication: 'bg-info-soft text-info',
  'cross-post': 'bg-info-soft text-info',
  alias: 'bg-accent-soft text-accent-deep',
  'creator cap': 'bg-warn-soft text-warn',
  sponsored: 'bg-warn-soft text-warn',
  'metadata-only': 'bg-slate-soft text-slate'
};

export function ResolutionQueue() {
  const [decided, setDecided] = useState<Record<string, 'accepted' | 'dismissed'>>({});
  const [kind, setKind] = useState<ResolutionKind | 'all'>('all');

  const kinds = Array.from(new Set(resolutionQueue.map((r) => r.kind)));
  const visible = kind === 'all' ? resolutionQueue : resolutionQueue.filter((r) => r.kind === kind);
  const open = resolutionQueue.filter((r) => !decided[r.id]).length;

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Evidence · global layer"
        title="Resolution queue"
        description="Normalization happens before any tenant sees a score, because these corrections change the score itself. A syndicated episode counted three times inflates momentum; one prolific creator counted unchecked manufactures source diversity that is not there."
        right={
        <span className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink">
            {open} open
          </span>
        } />


      <Panel className="p-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setKind('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            kind === 'all' ? 'bg-accent text-white' : 'text-ink-soft hover:bg-shell hover:text-ink'}`
            }>

            All
          </button>
          {kinds.map((k) =>
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
            kind === k ? 'bg-accent text-white' : 'text-ink-soft hover:bg-shell hover:text-ink'}`
            }>

              {KIND_LABELS[k]}
            </button>
          )}
        </div>
      </Panel>

      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {visible.map((item) => {
            const decision = decided[item.id];
            return (
              <Panel
                key={item.id}
                className={decision === 'accepted' ? 'border-ok/30' : decision === 'dismissed' ? 'opacity-60' : ''}>

                <div className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${KIND_TONES[item.kind]}`}>

                          {KIND_LABELS[item.kind]}
                        </span>
                        <span className="font-mono text-2xs text-ink-mute">{item.id}</span>
                      </div>
                      <h2 className="mt-1.5 text-[15px] font-semibold leading-tight text-ink">{item.title}</h2>
                    </div>
                    <div className="shrink-0">
                      <ScoreBar value={item.confidence} label="resolution confidence" width="w-14" />
                    </div>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">{item.detail}</p>

                  <ul className="mt-2.5 space-y-1 rounded-xl bg-shell px-3 py-2">
                    {item.members.map((m) =>
                    <li key={m} className="font-mono text-2xs text-ink-soft">
                        {m}
                      </li>
                    )}
                  </ul>

                  <div className="mt-2.5 flex flex-wrap items-start gap-2 rounded-xl border border-line p-3">
                    <GitMergeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-deep" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink">{item.suggested}</p>
                      <p className="mt-0.5 flex items-start gap-1 text-2xs text-ink-mute">
                        <ArrowRightIcon className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                        {item.effect}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDecided((d) => ({ ...d, [item.id]: 'accepted' }))}
                      className="rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-accent-deep">

                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecided((d) => ({ ...d, [item.id]: 'dismissed' }))}
                      className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">

                      Leave as-is
                    </button>
                    {decision &&
                    <span className="text-2xs font-semibold text-ink-mute">
                        {decision === 'accepted' ? 'Applied — rescoring queued' : 'Dismissed — reason recorded'}
                      </span>
                    }
                  </div>
                </div>
              </Panel>);

          })}
        </div>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Normalization rules" subtitle="Applied before scoring, every run" />
            <ul className="space-y-2 px-5 py-4">
              {normalizationRules.map((r) =>
              <li key={r.rule} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug text-ink">{r.rule}</p>
                    <p className="text-2xs text-ink-mute">{r.note}</p>
                  </div>
                  <span className="mt-0.5 shrink-0 rounded-full bg-ok-soft px-2 py-0.5 text-2xs font-semibold text-ok">
                    {r.state}
                  </span>
                </li>
              )}
            </ul>
          </Panel>

          {/*
            PRD §6.3: contradictions are retained, not discarded. Hiding them
            would make every downstream output read more confident than the
            underlying evidence supports.
          */}
          <Panel className="border-warn/30">
            <PanelHeader
              title="Retained contradictions"
              subtitle="Never discarded — they travel with the signal into every output"
              right={
              <ScaleIcon className="h-4 w-4 text-warn" />
              } />

            <ul className="space-y-2.5 px-5 py-4">
              {retainedContradictions.map((c) =>
              <li key={c.statement} className="rounded-xl border border-line bg-shell p-3">
                  <p className="font-mono text-2xs font-semibold text-ink-mute">{c.signal}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink">{c.statement}</p>
                  <p className="mt-1 text-2xs leading-relaxed text-ink-mute">{c.disposition}</p>
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </div>);

}
