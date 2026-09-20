import { useState } from 'react';
import { LockIcon, PlayCircleIcon, PlusIcon, XIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { StateChip } from '../../components/StateChip';
import { activationRequirements, CAPABILITY_NOTES, sources } from '../../data/sources';
import { Source } from '../../types';

const TYPE_LABELS: Record<string, string> = {
  podcast: 'Podcast',
  youtube: 'YouTube',
  research: 'Research',
  web: 'Web',
  social: 'Social'
};

export function Sources() {
  const [editing, setEditing] = useState<Source | null>(null);
  const [tested, setTested] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('All types');

  const rows = sources.filter((s) => typeFilter === 'All types' ? true : TYPE_LABELS[s.type] === typeFilter);
  const monthly = sources.reduce((sum, s) => sum + s.monthlyCost, 0);

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Sources"
        title="Monitored source registry"
        description="Everything the pipeline collects from, its lifecycle state, and the rights basis it operates under. Gated and blocked sources are not collecting."
        right={
        <>
            <span className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-medium text-ink-soft">
              Driving <span className="font-mono font-semibold text-ink">${monthly.toFixed(2)}</span> / month
            </span>
            <button
            type="button"
            onClick={() => setEditing(sources[sources.length - 1])}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-accent-deep">
            
              <PlusIcon className="h-3.5 w-3.5" />
              Add source
            </button>
          </>
        } />
      

      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <Panel>
          <PanelHeader
            title="Registry"
            subtitle={`${rows.length} sources · state, freshness, rights basis and cost`}
            right={
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by source type"
              className="rounded-xl border border-line bg-shell px-2.5 py-1.5 text-xs font-medium text-ink focus:outline-none">
              
                {['All types', ...Object.values(TYPE_LABELS)].map((t) =>
              <option key={t}>{t}</option>
              )}
              </select>
            } />
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  <th scope="col" className="py-2.5 pl-5 pr-4 font-semibold">Source</th>
                  <th scope="col" className="w-24 py-2.5 pr-4 font-semibold">Type</th>
                  <th scope="col" className="w-28 py-2.5 pr-4 font-semibold">State</th>
                  <th scope="col" className="w-28 py-2.5 pr-4 font-semibold">Last success</th>
                  <th scope="col" className="w-56 py-2.5 pr-4 font-semibold">Policy / rights basis</th>
                  <th scope="col" className="w-24 py-2.5 pr-4 font-semibold">Cost / mo</th>
                  <th scope="col" className="w-40 py-2.5 pr-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const inactive = s.state === 'gated' || s.state === 'blocked';
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-line/70 align-top last:border-0 ${inactive ? 'bg-shell/50' : ''}`}>
                      
                      <td className="py-3 pl-5 pr-4">
                        <p className={`text-xs font-semibold ${inactive ? 'text-ink-mute' : 'text-ink'}`}>
                          {s.name}
                          {inactive &&
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-line px-1.5 py-0.5 text-2xs font-semibold text-ink-mute">
                              <LockIcon className="h-2.5 w-2.5" />
                              post-MVP, not active
                            </span>
                          }
                        </p>
                        <p className="mt-0.5 font-mono text-2xs text-ink-mute">{s.id} · {s.connector}</p>
                        <p className="mt-0.5 text-2xs text-ink-mute">{s.note}</p>
                        {/*
                          Arch §7.1: capability flags are what make "metadata-only" structural
                          rather than a UI convention. A source with no TRANSCRIPT capability
                          cannot produce content that claim extraction is allowed to read.
                        */}
                        {s.capabilities.length > 0 &&
                        <p className="mt-1.5 flex flex-wrap gap-1">
                            {s.capabilities.map((c) =>
                          <span
                            key={c}
                            title={CAPABILITY_NOTES[c]}
                            className="rounded bg-shell px-1.5 py-0.5 font-mono text-2xs text-ink-mute">

                                {c}
                              </span>
                          )}
                          </p>
                        }
                        <p className="mt-1 font-mono text-2xs text-ink-mute">
                          {s.fallbackChain.join(' → ')}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-xs text-ink-soft">{TYPE_LABELS[s.type]}</td>
                      <td className="py-3 pr-4">
                        <StateChip state={s.state} />
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs tabular-nums text-ink-soft">{s.lastSuccess}</td>
                      <td className="py-3 pr-4 text-xs leading-relaxed text-ink-soft">
                        {s.policy}
                        {s.accessBasis ?
                        <span className="mt-0.5 block text-2xs text-ink-mute">{s.accessBasis}</span> :

                        <span className="mt-0.5 flex items-center gap-1 text-2xs font-semibold text-bad">
                            <LockIcon className="h-2.5 w-2.5" />
                            No access basis recorded — cannot run
                          </span>
                        }
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs tabular-nums text-ink">
                        {s.monthlyCost ? `$${s.monthlyCost.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 pr-5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={inactive}
                            onClick={() => setTested(s.id)}
                            className="flex items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-2xs font-semibold text-ink transition-colors duration-150 hover:border-accent hover:text-accent-deep disabled:cursor-not-allowed disabled:text-ink-mute disabled:hover:border-line">
                            
                            <PlayCircleIcon className="h-3 w-3" />
                            Test
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(s)}
                            className="rounded-lg border border-line px-2 py-1.5 text-2xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">
                            
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>);

                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-3">
          {editing &&
          <Panel>
              <PanelHeader
              title={editing.state === 'draft' ? 'Add source' : 'Edit source'}
              subtitle={editing.name}
              right={
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close source form"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-mute transition-colors duration-150 hover:bg-shell hover:text-ink">
                
                    <XIcon className="h-4 w-4" />
                  </button>
              } />
            
              <form className="space-y-3 px-5 py-4">
                <Field label="Connector type" defaultValue={editing.connector} />
                <Field label="Input config (feeds / channels / queries)" defaultValue={editing.inputs} />
                <Field label="Policy version" defaultValue={editing.policy} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Per-run cost cap (USD)" defaultValue={String(editing.runCap)} />
                  <Field label="Monthly cost cap (USD)" defaultValue={String(editing.monthCap)} />
                </div>
                <Field label="Retry policy" defaultValue={editing.retry} />
                <div className="flex items-center gap-2 pt-1">
                  <button
                  type="button"
                  onClick={() => setTested(editing.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-accent hover:text-accent-deep">
                  
                    <PlayCircleIcon className="h-3.5 w-3.5" />
                    Test config
                  </button>
                  <button
                  type="button"
                  className="rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">
                  
                    Save
                  </button>
                </div>
              </form>
            </Panel>
          }

          {tested &&
          <Panel>
              <PanelHeader
              title="Normalized preview"
              subtitle={`Test run for ${tested} · nothing was stored`}
              right={<StateChip state="validating" />} />
            
              <div className="space-y-2.5 px-5 py-4">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Sample item</p>
                <dl className="space-y-1.5 rounded-xl bg-shell p-3 font-mono text-2xs text-ink-soft">
                  {[
                ['external_id', 'tddy_918273'],
                ['title', 'Creatine beyond the gym: cognition & aging'],
                ['published_at', '2026-09-18T14:02:00Z'],
                ['duration_s', '4,812'],
                ['transcript', 'present · 98% coverage'],
                ['rights_basis', 'RSS public feed · v2.1']].
                map(([k, v]) =>
                <div key={k} className="flex gap-2">
                      <dt className="w-28 shrink-0 text-ink-mute">{k}</dt>
                      <dd className="min-w-0 text-ink">{v}</dd>
                    </div>
                )}
                </dl>
                <p className="text-2xs leading-relaxed text-ink-mute">
                  Config validated: 1 of 1 sample items normalized without error. Go live requires a policy version and a
                  monthly cap.
                </p>
              </div>
            </Panel>
          }

          {/*
            Arch §12: a gated source cannot transition to active without a
            recorded approved access basis. That is enforced in the state
            machine, not left to operator discipline — which is why the
            activate control below is disabled rather than merely discouraged.
          */}
          <Panel className="border-warn/30">
            <PanelHeader
              title="Gated & blocked"
              subtitle="Not collecting, and cannot be activated until each requirement below is recorded" />

            <ul className="divide-y divide-line">
              {sources.
              filter((s) => s.state === 'gated' || s.state === 'blocked').
              map((s) =>
              <li key={s.id} className="px-5 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-xs text-ink-mute">{s.name}</span>
                      <StateChip state={s.state} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                    type="button"
                    disabled
                    title="Blocked: no approved access basis recorded"
                    className="cursor-not-allowed rounded-lg border border-line px-2 py-1 text-2xs font-semibold text-ink-mute">

                        Activate
                      </button>
                      <span className="text-2xs text-ink-mute">{s.policy}</span>
                    </div>
                  </li>
              )}
            </ul>
            <div className="border-t border-line px-5 py-3">
              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">Required to activate</p>
              <ul className="mt-1.5 space-y-1">
                {activationRequirements.map((r) =>
                <li key={r} className="text-2xs leading-relaxed text-ink-soft">
                    · {r}
                  </li>
                )}
              </ul>
            </div>
          </Panel>
        </div>
      </div>
    </div>);

}

function Field({ label, defaultValue }: {label: string;defaultValue: string;}) {
  return (
    <label className="block">
      <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">{label}</span>
      <input
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-xl border border-line bg-shell px-3 py-2 text-xs text-ink focus:outline-none" />
      
    </label>);

}