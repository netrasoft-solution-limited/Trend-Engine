import { CreditCardIcon, FlaskConicalIcon, LockIcon, ShieldIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Panel, PanelHeader } from '../../components/Panel';
import { dataProtection, invoices, onboardingSteps, organizations, orgUsers, subscriptions } from '../../data/orgs';
import { PlatformAdminOnly } from '../RoleGate';

const STATUS_TONES: Record<string, string> = {
  active: 'bg-ok-soft text-ok',
  onboarding: 'bg-info-soft text-info',
  fixture: 'bg-slate-soft text-slate',
  'past due': 'bg-warn-soft text-warn',
  cancelled: 'bg-bad-soft text-bad',
  paid: 'bg-ok-soft text-ok',
  open: 'bg-warn-soft text-warn',
  void: 'bg-slate-soft text-slate',
  invited: 'bg-info-soft text-info',
  suspended: 'bg-bad-soft text-bad'
};

export function Tenants() {
  const live = organizations.filter((o) => !o.isFixture);
  const fixtures = organizations.filter((o) => o.isFixture);

  return (
    <PlatformAdminOnly>
    <div className="space-y-3">
      <PageHeader
        eyebrow="Platform Admin"
        title="Organizations"
        description="Each client is an Organization mapping 1:1 to a Client record. Tenancy is structural, not conditional — every tenant-scoped object carries its boundary from the first migration, whether or not a second client ever signs."
        right={
        <span className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-2xs font-semibold text-ink-soft">
            <LockIcon className="h-3.5 w-3.5" />
            Operator-driven onboarding · no self-serve signup
          </span>
        } />


      <Panel>
        <PanelHeader title="Live tenants" subtitle="Real engagements with portal access" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                <th scope="col" className="py-2.5 pl-5 pr-4 font-semibold">Organization</th>
                <th scope="col" className="w-48 py-2.5 pr-4 font-semibold">Domain pack</th>
                <th scope="col" className="w-28 py-2.5 pr-4 font-semibold">Status</th>
                <th scope="col" className="w-20 py-2.5 pr-4 text-right font-semibold">Seats</th>
                <th scope="col" className="w-24 py-2.5 pr-4 text-right font-semibold">Published</th>
                <th scope="col" className="w-36 py-2.5 pr-5 font-semibold">Last portal login</th>
              </tr>
            </thead>
            <tbody>
              {live.map((o) =>
              <tr key={o.id} className="border-b border-line/70 align-top last:border-0">
                  <td className="py-3 pl-5 pr-4">
                    <p className="text-xs font-semibold text-ink">{o.name}</p>
                    <p className="mt-0.5 max-w-lg text-2xs leading-relaxed text-ink-mute">{o.note}</p>
                  </td>
                  <td className="py-3 pr-4 font-mono text-2xs text-ink-soft">{o.domainPack}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-semibold ${STATUS_TONES[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-xs tabular-nums text-ink-soft">{o.seats}</td>
                  <td className="py-3 pr-4 text-right font-mono text-xs tabular-nums text-ink-soft">
                    {o.publishedOutputs}
                  </td>
                  <td className="py-3 pr-5 text-xs text-ink-soft">{o.lastPortalLogin ?? '—'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        {/*
          PRD §2: these are CI fixtures, not clients. They exist so the build can
          prove tenancy isolation and domain portability without onboarding a
          real second client.
        */}
        <Panel className="border-slate/30">
          <PanelHeader
            title="Architecture proof fixtures"
            subtitle="Test fixtures, not live clients — they exist so CI can prove what the architecture claims"
            right={<FlaskConicalIcon className="h-4 w-4 text-slate" />} />

          <ul className="space-y-2.5 px-5 py-4">
            {fixtures.map((f) =>
            <li key={f.id} className="rounded-xl border border-line bg-shell p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink">{f.name}</p>
                  <span className="font-mono text-2xs text-ink-mute">{f.domainPack}</span>
                </div>
                <p className="mt-1.5 text-2xs leading-relaxed text-ink-soft">{f.note}</p>
              </li>
            )}
          </ul>
          <p className="border-t border-line px-5 py-3 text-2xs leading-relaxed text-ink-mute">
            One public signal must receive different scores for Jarrow and the second-client fixture, and private context
            must never cross. The non-supplement pack must complete an ingestion-to-output cycle with no core schema
            migration.
          </p>
        </Panel>

        <Panel>
          <PanelHeader title="Onboarding a tenant" subtitle="Operator-driven, in this order" />
          <ol className="space-y-2.5 px-5 py-4">
            {onboardingSteps.map((s) =>
            <li key={s.step} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-2xs font-semibold text-accent-deep">
                  {s.step}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-xs font-semibold text-ink">{s.label}</p>
                    <span className="text-2xs text-ink-mute">{s.owner}</span>
                  </div>
                  <p className="mt-0.5 text-2xs leading-relaxed text-ink-soft">{s.detail}</p>
                </div>
              </li>
            )}
          </ol>
        </Panel>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <PanelHeader
            title="Subscriptions & invoices"
            subtitle="Status tracking only at launch — automated collection is deliberately out of scope"
            right={<CreditCardIcon className="h-4 w-4 text-ink-mute" />} />

          <div className="space-y-3 px-5 py-4">
            {subscriptions.map((s) => {
              const org = organizations.find((o) => o.id === s.orgId);
              return (
                <div key={s.orgId} className="rounded-xl border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-ink">{org?.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${STATUS_TONES[s.status]}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-1 text-2xs text-ink-soft">{s.plan}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-2xs">
                    <div>
                      <p className="text-ink-mute">Monthly</p>
                      <p className="font-mono font-semibold text-ink">${s.amountMonthly.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-ink-mute">Renews</p>
                      <p className="font-semibold text-ink">{s.renewsOn}</p>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-shell px-2 py-1.5 text-2xs text-ink-mute">
                    <ShieldIcon className="h-3 w-3 shrink-0" />
                    Processor token only: <span className="font-mono text-ink-soft">{s.processorRef}</span>. No card or
                    bank data exists in this database.
                  </p>
                </div>);

            })}

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  <th scope="col" className="py-2 pr-3 font-semibold">Invoice</th>
                  <th scope="col" className="w-24 py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="w-20 py-2 pr-3 font-semibold">Status</th>
                  <th scope="col" className="w-40 py-2 font-semibold">Method</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) =>
                <tr key={inv.id} className="border-b border-line/70 last:border-0">
                    <td className="py-2 pr-3">
                      <p className="font-mono text-2xs text-ink-soft">{inv.id}</p>
                      <p className="text-2xs text-ink-mute">{inv.period}</p>
                    </td>
                    <td className="py-2 pr-3 text-right font-mono text-xs tabular-nums text-ink">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-semibold ${STATUS_TONES[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2 text-2xs text-ink-soft">{inv.method}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Portal users" subtitle="Invite-based provisioning only" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">User</th>
                    <th scope="col" className="w-28 py-2.5 pr-3 font-semibold">Role</th>
                    <th scope="col" className="w-24 py-2.5 pr-3 font-semibold">Status</th>
                    <th scope="col" className="w-32 py-2.5 pr-5 font-semibold">Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {orgUsers.map((u) =>
                  <tr key={u.id} className="border-b border-line/70 last:border-0">
                      <td className="py-2.5 pl-5 pr-3">
                        <p className="text-xs font-semibold text-ink">{u.name}</p>
                        <p className="text-2xs text-ink-mute">{u.email}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-2xs text-ink-soft">{u.role}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-semibold ${STATUS_TONES[u.status] ?? 'bg-ok-soft text-ok'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-5 text-2xs text-ink-soft">{u.lastLogin ?? '—'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* PRD §7.6: portal users are identifiable individuals, so GDPR/CCPA applies here independently. */}
          <Panel>
            <PanelHeader
              title="Client data retention"
              subtitle="Portal users are identifiable individuals — this is a separate basis from the evidence rights framework" />

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  <th scope="col" className="py-2 pl-5 pr-3 font-semibold">Data</th>
                  <th scope="col" className="w-44 py-2 pr-3 font-semibold">Retention</th>
                  <th scope="col" className="w-48 py-2 pr-5 font-semibold">Basis</th>
                </tr>
              </thead>
              <tbody>
                {dataProtection.map((d) =>
                <tr key={d.item} className="border-b border-line/70 last:border-0">
                    <td className="py-2 pl-5 pr-3 text-xs text-ink">{d.item}</td>
                    <td className="py-2 pr-3 text-2xs text-ink-soft">{d.retention}</td>
                    <td className="py-2 pr-5 text-2xs text-ink-mute">{d.basis}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className="border-t border-line px-5 py-3 text-2xs leading-relaxed text-ink-mute">
              Account deletion removes or anonymizes personal data on request without destroying the tenant's output
              history.
            </p>
          </Panel>
        </div>
      </div>
    </div>
    </PlatformAdminOnly>);

}
