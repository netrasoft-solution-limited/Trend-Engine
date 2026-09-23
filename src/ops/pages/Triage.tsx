import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagonIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FlaskConicalIcon,
  InboxIcon,
  RadarIcon,
  SlidersHorizontalIcon } from
'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { ScoreBar } from '../../components/ScoreBar';
import { StateChip } from '../../components/StateChip';
import { digest, signals, sourceHealthSnapshot } from '../../data/signals';
import { clientScoreFor } from '../../data/clientScores';
import { SuggestedAction } from '../../types';

const ACTIONS: SuggestedAction[] = ['approve deep dive', 'watch', 'validate', 'merge'];

/** Triage reviews Jarrow's queue. A tenant selector would widen this later — Arch §5.3. */
const JARROW_ORG_ID = 'org-jarrow';

type SortKey = 'domainScore' | 'clientFit' | 'confidence';

const SUMMARY = [
{ label: 'New candidates', value: digest.newCandidates, sub: 'Since last digest', icon: RadarIcon, tone: 'accent' },
{ label: 'Review ready', value: digest.reviewReady, sub: 'Awaiting your judgment', icon: SlidersHorizontalIcon, tone: 'info' },
{ label: 'Research alerts', value: digest.researchAlerts, sub: 'Needs scientific routing', icon: FlaskConicalIcon, tone: 'warn' },
{ label: 'Blocking failures', value: digest.blockingFailures, sub: 'Nothing is stuck', icon: AlertOctagonIcon, tone: 'ok' }] as
const;

const TONE_BG: Record<string, string> = {
  accent: 'bg-accent-soft text-accent-deep',
  info: 'bg-info-soft text-info',
  warn: 'bg-warn-soft text-warn',
  ok: 'bg-ok-soft text-ok'
};

export function Triage() {
  const [sortKey, setSortKey] = useState<SortKey>('domainScore');
  const [routeFilter, setRouteFilter] = useState('All routes');
  const [actionFilter, setActionFilter] = useState('All actions');
  const [expanded, setExpanded] = useState<string | null>('SIG-2041');
  const [overrides, setOverrides] = useState<Record<string, SuggestedAction>>({});

  const rows = useMemo(() => {
    return signals.
    map((s) => ({ signal: s, clientFit: clientScoreFor(s.id, JARROW_ORG_ID)?.clientFit ?? 0 })).
    filter(({ signal: s }) => routeFilter === 'All routes' ? true : s.routes.includes(routeFilter)).
    filter(({ signal: s }) => actionFilter === 'All actions' ? true : (overrides[s.id] ?? s.suggestedAction) === actionFilter).
    sort((a, b) => sortKey === 'clientFit' ? b.clientFit - a.clientFit : b.signal[sortKey] - a.signal[sortKey]);
  }, [sortKey, routeFilter, actionFilter, overrides]);

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Triage · home"
        title="What deserves attention today"
        description="Ranked candidate signals from the last collection window. Every score expands to its component breakdown — nothing here is approved until you approve an exact version."
        right={
        <>
            <span className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-medium text-ink-soft">
              {digest.window}
            </span>
            <Link
            to="/ops/signal/SIG-2041"
            className="flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">
            
              Open top candidate
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </>
        } />
      

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {SUMMARY.map((item) =>
        <Panel key={item.label} className="p-4" as="div">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-ink-soft">{item.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${TONE_BG[item.tone]}`}>
                <item.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-mono text-3xl font-semibold leading-none tabular-nums text-ink">
              {String(item.value).padStart(2, '0')}
            </p>
            <p className="mt-2 text-2xs text-ink-mute">{item.sub}</p>
          </Panel>
        )}
      </div>

      <Panel>
        <PanelHeader
          title="Candidate signals"
          subtitle={`${rows.length} of ${signals.length} candidates · suggested actions are system-generated and editable`}
          right={
          <>
              <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              aria-label="Filter by evidence route"
              className="rounded-xl border border-line bg-shell px-2.5 py-1.5 text-xs font-medium text-ink focus:outline-none">
              
                {['All routes', 'Podcasts', 'YouTube', 'Research', 'Web'].map((r) =>
              <option key={r}>{r}</option>
              )}
              </select>
              <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filter by suggested action"
              className="rounded-xl border border-line bg-shell px-2.5 py-1.5 text-xs font-medium text-ink focus:outline-none">
              
                {['All actions', ...ACTIONS].map((a) =>
              <option key={a}>{a}</option>
              )}
              </select>
              <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort candidates"
              className="rounded-xl border border-line bg-shell px-2.5 py-1.5 text-xs font-medium text-ink focus:outline-none">
              
                <option value="domainScore">Sort: domain score</option>
                <option value="clientFit">Sort: Jarrow fit</option>
                <option value="confidence">Sort: confidence</option>
              </select>
            </>
          } />
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                <th scope="col" className="w-8 py-2.5 pl-5" />
                <th scope="col" className="py-2.5 pr-4 font-semibold">Candidate signal</th>
                <th scope="col" className="w-28 py-2.5 pr-4 font-semibold">State</th>
                <th scope="col" className="w-32 py-2.5 pr-4 font-semibold">Domain score</th>
                <th scope="col" className="w-32 py-2.5 pr-4 font-semibold">Jarrow fit</th>
                <th scope="col" className="w-20 py-2.5 pr-4 font-semibold">Conf.</th>
                <th scope="col" className="w-44 py-2.5 pr-4 font-semibold">Suggested action</th>
                <th scope="col" className="w-20 py-2.5 pr-5 font-semibold text-right">Review</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ signal: s, clientFit }) => {
                const open = expanded === s.id;
                return (
                  <Fragment key={s.id}>
                    <tr className={`border-b border-line/70 align-middle ${open ? 'bg-shell/60' : ''}`}>
                      <td className="py-3 pl-5">
                        <button
                          type="button"
                          onClick={() => setExpanded(open ? null : s.id)}
                          aria-expanded={open}
                          aria-label={`${open ? 'Collapse' : 'Expand'} ${s.id}`}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-ink-mute transition-colors duration-150 hover:bg-line hover:text-ink">
                          
                          {open ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm font-semibold leading-snug text-ink">{s.title}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-ink-mute">
                          <span className="font-mono text-ink-soft">{s.id}</span>
                          <span aria-hidden="true">·</span>
                          <span>first seen {s.firstSeen}</span>
                          <span aria-hidden="true">·</span>
                          <span>{s.routes.join(' / ')}</span>
                          {s.claimsFlags.length > 0 &&
                          <span className="rounded-full bg-warn-soft px-1.5 py-0.5 font-semibold text-warn">
                              {s.claimsFlags.length} claims flag{s.claimsFlags.length > 1 ? 's' : ''}
                            </span>
                          }
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <StateChip state={s.state} />
                      </td>
                      <td className="py-3 pr-4">
                        <ScoreBar value={s.domainScore} label={`${s.id} domain score`} />
                      </td>
                      <td className="py-3 pr-4">
                        <ScoreBar value={clientFit} label={`${s.id} client fit`} />
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs tabular-nums text-ink-soft">{s.confidence}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={overrides[s.id] ?? s.suggestedAction}
                          onChange={(e) =>
                          setOverrides((o) => ({ ...o, [s.id]: e.target.value as SuggestedAction }))
                          }
                          aria-label={`Suggested action for ${s.id}`}
                          className={`w-full rounded-lg border px-2 py-1.5 text-xs font-semibold focus:outline-none ${
                          overrides[s.id] && overrides[s.id] !== s.suggestedAction ?
                          'border-accent bg-accent-soft text-accent-deep' :
                          'border-line bg-card text-ink-soft'}`
                          }>
                          
                          {ACTIONS.map((a) =>
                          <option key={a} value={a}>
                              {a}
                            </option>
                          )}
                        </select>
                      </td>
                      <td className="py-3 pr-5 text-right">
                        <Link
                          to={`/ops/signal/${s.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 hover:border-accent hover:text-accent-deep">
                          
                          Open
                        </Link>
                      </td>
                    </tr>
                    {open &&
                    <tr className="border-b border-line bg-shell/60">
                        <td />
                        <td colSpan={7} className="py-4 pr-5">
                          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                            <div>
                              <p className="text-xs leading-relaxed text-ink-soft">{s.detail}</p>
                              <table className="mt-3 w-full border-collapse text-left">
                                <thead>
                                  <tr className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                                    <th scope="col" className="pb-1.5 pr-3 font-semibold">Route</th>
                                    <th scope="col" className="pb-1.5 pr-3 font-semibold">Samples</th>
                                    <th scope="col" className="pb-1.5 font-semibold">Observed pattern</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {s.evidence.map((e) =>
                                <tr key={e.route} className="border-t border-line align-top">
                                      <td className="py-1.5 pr-3 text-xs font-semibold text-ink">{e.route}</td>
                                      <td className="py-1.5 pr-3 font-mono text-xs tabular-nums text-ink-soft">
                                        {e.samples}
                                      </td>
                                      <td className="py-1.5 text-xs leading-relaxed text-ink-soft">{e.pattern}</td>
                                    </tr>
                                )}
                                </tbody>
                              </table>
                            </div>
                            <div className="rounded-xl border border-line bg-card p-3.5">
                              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                                Top score components
                              </p>
                              <ul className="mt-2.5 space-y-2">
                                {s.breakdown.slice(0, 4).map((c) =>
                              <li key={c.label} className="flex items-center justify-between gap-3">
                                    <span className="text-xs text-ink-soft">
                                      {c.label}
                                      <span className="ml-1.5 font-mono text-2xs text-ink-mute">
                                        w {c.weight.toFixed(2)}
                                      </span>
                                    </span>
                                    <ScoreBar value={c.value} label={c.label} width="w-20" />
                                  </li>
                              )}
                              </ul>
                              <Link
                              to={`/ops/signal/${s.id}`}
                              className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent-deep hover:underline">
                              
                                Full breakdown & evidence spans
                                <ArrowRightIcon className="h-3.5 w-3.5" />
                              </Link>
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

      <Panel>
        <PanelHeader
          title="Source health snapshot"
          subtitle="Collection routes feeding today's candidates"
          right={
          <Link
            to="/ops/operations"
            className="flex items-center gap-1 text-xs font-semibold text-accent-deep hover:underline">
            
              Operations
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          } />
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                <th scope="col" className="py-2.5 pl-5 pr-4 font-semibold">Route</th>
                <th scope="col" className="w-28 py-2.5 pr-4 font-semibold">Status</th>
                <th scope="col" className="w-36 py-2.5 pr-4 font-semibold">Last success</th>
                <th scope="col" className="py-2.5 pr-5 font-semibold">Operator note</th>
              </tr>
            </thead>
            <tbody>
              {sourceHealthSnapshot.map((r) =>
              <tr key={r.route} className="border-b border-line/70 last:border-0">
                  <td className="py-2.5 pl-5 pr-4 text-xs font-semibold text-ink">{r.route}</td>
                  <td className="py-2.5 pr-4">
                    <StateChip state={r.state} />
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs tabular-nums text-ink-soft">{r.lastSuccess}</td>
                  <td className="py-2.5 pr-5 text-xs text-ink-soft">{r.note}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="flex items-center gap-2 px-1 pb-1 text-2xs text-ink-mute">
        <InboxIcon className="h-3.5 w-3.5" />
        Nothing on this screen has been sent anywhere. Outputs reach a client only after you approve an exact version in
        Output Builder.
      </p>
    </div>);

}