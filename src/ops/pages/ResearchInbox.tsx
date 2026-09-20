import { Fragment, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon, ShieldAlertIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { ScoreBar } from '../../components/ScoreBar';
import { papers } from '../../data/research';

export function ResearchInbox() {
  const [expanded, setExpanded] = useState<string | null>(papers[0].id);
  const [routed, setRouted] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Research inbox"
        title="New papers & trials"
        description="Scientific literature is scored on a separate lane from podcast and content signals. Abstract-level extraction only — nothing here is a clinical assessment."
        right={
        <span className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-medium text-ink-soft">
            {papers.length} records · last sync 2 h ago
          </span>
        } />
      

      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-bad/35 bg-bad-soft px-5 py-4">
        
        <ShieldAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-bad" />
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-bad">Do not auto-publish</p>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-ink-soft">
            An abstract is not a full clinical assessment. No record in this inbox may produce claim language, a client
            deliverable, or a product statement until a named reviewer signs off in the scientific / legal claims stage.
            This notice cannot be dismissed.
          </p>
        </div>
      </div>

      <Panel>
        <PanelHeader
          title="Literature queue"
          subtitle="Sorted by relevance to the Jarrow portfolio"
          right={
          <select
            aria-label="Filter by study design"
            className="rounded-xl border border-line bg-shell px-2.5 py-1.5 text-xs font-medium text-ink focus:outline-none">
            
              {['All designs', 'RCT (crossover)', 'Open-label pilot', 'Systematic review', 'Observational (retrospective)'].map(
              (d) =>
              <option key={d}>{d}</option>

            )}
            </select>
          } />
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                <th scope="col" className="w-8 py-2.5 pl-5" />
                <th scope="col" className="py-2.5 pr-4 font-semibold">Title</th>
                <th scope="col" className="w-48 py-2.5 pr-4 font-semibold">Publication</th>
                <th scope="col" className="w-40 py-2.5 pr-4 font-semibold">Design</th>
                <th scope="col" className="w-44 py-2.5 pr-4 font-semibold">Population / duration</th>
                <th scope="col" className="w-32 py-2.5 pr-5 font-semibold">Relevance</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((p) => {
                const open = expanded === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr className={`border-b border-line/70 align-top ${open ? 'bg-shell/60' : ''}`}>
                      <td className="py-3 pl-5">
                        <button
                          type="button"
                          onClick={() => setExpanded(open ? null : p.id)}
                          aria-expanded={open}
                          aria-label={`${open ? 'Collapse' : 'Expand'} ${p.id}`}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-mute transition-colors duration-150 hover:bg-line hover:text-ink">
                          
                          {open ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="max-w-xl text-sm font-semibold leading-snug text-ink">{p.title}</p>
                        <p className="mt-1 font-mono text-2xs text-ink-mute">
                          {p.id} · {p.identifiers}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-xs text-ink-soft">{p.publication}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-info-soft px-2 py-0.5 text-2xs font-semibold text-info">
                          {p.design}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-ink-soft">{p.population}</td>
                      <td className="py-3 pr-5">
                        <ScoreBar value={p.relevance} label={`${p.id} relevance`} />
                      </td>
                    </tr>
                    {open &&
                    <tr className="border-b border-line bg-shell/60">
                        <td />
                        <td colSpan={5} className="py-4 pr-5">
                          <div className="grid gap-3 xl:grid-cols-[320px_1fr]">
                            <dl className="space-y-2.5 rounded-xl border border-line bg-card p-4">
                              {[
                            ['Design', p.design],
                            ['Population', p.population],
                            ['Intervention', p.intervention],
                            ['Identifiers', p.identifiers]].
                            map(([k, v]) =>
                            <div key={k}>
                                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">{k}</dt>
                                  <dd className="mt-0.5 text-xs leading-relaxed text-ink">{v}</dd>
                                </div>
                            )}
                              <div className="border-t border-line pt-2.5">
                                <dt className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                                  Portfolio connection
                                </dt>
                                <dd className="mt-1">
                                  <input
                                  defaultValue={p.portfolio}
                                  aria-label={`Portfolio connection for ${p.id}`}
                                  className="w-full rounded-lg border border-line bg-shell px-2.5 py-1.5 text-xs text-ink focus:outline-none" />
                                
                                </dd>
                              </div>
                            </dl>

                            <div className="rounded-xl border border-line bg-card">
                              <p className="border-b border-line px-4 py-2.5 text-xs font-semibold text-ink">
                                Review lens
                              </p>
                              <table className="w-full border-collapse text-left">
                                <thead>
                                  <tr className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                                    <th scope="col" className="w-40 px-4 py-2 font-semibold">Dimension</th>
                                    <th scope="col" className="px-4 py-2 font-semibold text-ok">Positive signal</th>
                                    <th scope="col" className="px-4 py-2 font-semibold text-warn">
                                      Qualification / concern
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.lens.map((l) =>
                                <tr key={l.dimension} className="border-t border-line align-top">
                                      <td className="px-4 py-2.5 text-xs font-semibold text-ink">{l.dimension}</td>
                                      <td className="px-4 py-2.5 text-xs leading-relaxed text-ink-soft">{l.positive}</td>
                                      <td className="px-4 py-2.5 text-xs leading-relaxed text-ink-soft">{l.concern}</td>
                                    </tr>
                                )}
                                </tbody>
                              </table>
                              <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
                                {['Add to evidence library', 'Route to scientific review', 'Include in education package'].map(
                                (action) =>
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => setRouted((r) => ({ ...r, [p.id]: action }))}
                                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                                  routed[p.id] === action ?
                                  'border-accent bg-accent-soft text-accent-deep' :
                                  'border-line text-ink hover:border-ink-mute/50'}`
                                  }>
                                  
                                      {action}
                                    </button>

                              )}
                                {(routed[p.id] || p.routed) &&
                              <span className="text-2xs text-ink-mute">
                                    {routed[p.id] ?
                                `Routed: ${routed[p.id]} · awaiting reviewer sign-off` :
                                'Already routed to scientific review'}
                                  </span>
                              }
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    }
                  </Fragment>);

              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>);

}