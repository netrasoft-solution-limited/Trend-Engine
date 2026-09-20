import { ChevronDownIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { clientProfile } from '../../data/client';
import { organizations } from '../../data/orgs';

export function ClientProfile() {
  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Client profile"
        title={clientProfile.name}
        description="Everything that makes scoring and output client-specific. Low-frequency configuration, but every field downstream of it — client fit, voice, claims gating — depends on it being complete."
        right={
        <>
            <label className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink">
              <span className="text-ink-mute">Client</span>
              <span className="flex items-center gap-1.5">
                {clientProfile.name}
                <ChevronDownIcon className="h-3.5 w-3.5 text-ink-mute" />
              </span>
              <select aria-label="Select client" className="sr-only">
                {organizations.map((c) =>
              <option key={c.id}>{c.name}</option>
              )}
              </select>
            </label>
            <span className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-medium text-ink-soft">
              Updated {clientProfile.lastUpdated}
            </span>
            <button
            type="button"
            className="rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-ink-soft">
            
              Save changes
            </button>
          </>
        } />
      

      <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-3">
          <Panel>
            <PanelHeader
              title="Products, categories & assets"
              subtitle="Category priority feeds the client-fit score directly" />
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    <th scope="col" className="py-2.5 pl-5 pr-4 font-semibold">Category</th>
                    <th scope="col" className="w-16 py-2.5 pr-4 font-semibold">SKUs</th>
                    <th scope="col" className="py-2.5 pr-4 font-semibold">Hero products</th>
                    <th scope="col" className="w-24 py-2.5 pr-5 font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {clientProfile.categories.map((c) =>
                  <tr key={c.name} className="border-b border-line/70 last:border-0">
                      <td className="py-2.5 pl-5 pr-4 text-xs font-semibold text-ink">{c.name}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs tabular-nums text-ink-soft">{c.skus}</td>
                      <td className="py-2.5 pr-4 text-xs text-ink-soft">{c.hero}</td>
                      <td className="py-2.5 pr-5">
                        <span className="rounded-full bg-shell px-2 py-0.5 text-2xs font-semibold text-ink-soft">
                          {c.priority}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <ul className="space-y-1.5 border-t border-line px-5 py-3.5">
              {clientProfile.assets.map((a) =>
              <li key={a} className="text-2xs text-ink-mute">
                  {a}
                </li>
              )}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Audiences & priorities" />
            <ul className="divide-y divide-line">
              {clientProfile.audiences.map((a) =>
              <li key={a.name} className="flex flex-wrap items-start gap-x-3 gap-y-1 px-5 py-3">
                  <span className="text-xs font-semibold text-ink">{a.name}</span>
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-2xs font-semibold text-accent-deep">
                    {a.priority}
                  </span>
                  <span className="w-full text-xs leading-relaxed text-ink-soft">{a.note}</span>
                </li>
              )}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Compliance & claims rules" subtitle="Enforced in Output Builder before approval" />
            <ul className="divide-y divide-line">
              {clientProfile.compliance.map((c) =>
              <li key={c.rule} className="px-5 py-3">
                  <p className="text-xs font-semibold text-ink">{c.rule}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{c.detail}</p>
                </li>
              )}
            </ul>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Voice & brand guidelines" subtitle={clientProfile.voice.tone} />
            <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ok">Do</p>
                <ul className="mt-2 space-y-1.5">
                  {clientProfile.voice.do.map((d) =>
                  <li key={d} className="text-xs leading-relaxed text-ink-soft">
                      {d}
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-bad">Don't</p>
                <ul className="mt-2 space-y-1.5">
                  {clientProfile.voice.dont.map((d) =>
                  <li key={d} className="text-xs leading-relaxed text-ink-soft">
                      {d}
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <p className="border-t border-line px-5 py-3 text-2xs text-ink-mute">
              Reading level: {clientProfile.voice.reading}
            </p>
          </Panel>

          <Panel>
            <PanelHeader title="Competitors" />
            <ul className="divide-y divide-line">
              {clientProfile.competitors.map((c) =>
              <li key={c.name} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <span className="text-xs font-semibold text-ink">{c.name}</span>
                  <span className="text-xs text-ink-soft">{c.posture}</span>
                </li>
              )}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Reviewer assignments" subtitle="Maps to the Output Builder review pipeline" />
            <ul className="divide-y divide-line">
              {clientProfile.reviewers.map((r) =>
              <li key={r.stage} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-ink">{r.stage}</span>
                    <span className="block text-2xs text-ink-mute">{r.person}</span>
                  </span>
                  <span className="shrink-0 font-mono text-2xs text-ink-soft">{r.sla}</span>
                </li>
              )}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Output cadence preferences" />
            <ul className="divide-y divide-line">
              {clientProfile.cadence.map((c) =>
              <li key={c.output} className="px-5 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-ink">{c.output}</span>
                    <span className="text-2xs text-ink-mute">{c.channel}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-soft">{c.cadence}</p>
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </div>);

}