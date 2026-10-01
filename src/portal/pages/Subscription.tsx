import { ShieldCheckIcon } from 'lucide-react';
import { AdminOnly } from '../AdminOnly';
import { api } from '../api';
import { usePortalSession } from '../session';
import { useAsync } from '../useAsync';
import { Empty, ErrorState, Loading } from '../States';
import { formatDate } from '../format';

const STATUS_TONES: Record<string, string> = {
  active: 'bg-ok-soft text-ok',
  'past due': 'bg-warn-soft text-warn',
  cancelled: 'bg-bad-soft text-bad',
  paid: 'bg-ok-soft text-ok',
  open: 'bg-warn-soft text-warn',
  void: 'bg-slate-soft text-slate'
};

export function Subscription() {
  const session = usePortalSession();
  const { data, loading, error, reload } = useAsync(
    () => api.subscription(),
    [session.organization.id]
  );

  return (
    <AdminOnly>
      <div>
        <header className="mb-6">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">Subscription</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Your plan and invoice history.
          </p>
        </header>

        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {data?.subscription &&
        <section className="mb-4 rounded-2xl border border-line bg-card p-5 shadow-panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{data.subscription.plan}</p>
                <p className="mt-0.5 text-2xs text-ink-mute">{data.subscription.current_period}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-2xs font-semibold ${STATUS_TONES[data.subscription.status]}`}>
                {data.subscription.status}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-2xs text-ink-mute">Monthly</dt>
                <dd className="font-mono text-lg font-semibold tabular-nums text-ink">
                  {data.subscription.currency} {Number(data.subscription.amount_monthly).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-2xs text-ink-mute">Renews</dt>
                <dd className="text-sm font-semibold text-ink">{formatDate(data.subscription.renews_on)}</dd>
              </div>
              <div>
                <dt className="text-2xs text-ink-mute">Billing</dt>
                <dd className="text-sm font-semibold text-ink">Invoiced monthly</dd>
              </div>
            </dl>
          </section>
        }

        {/* PRD §7.5: no payment card or bank account data exists in this
            application. There is no field in the database that could hold one. */}
        <p className="mb-4 flex items-start gap-2 rounded-2xl border border-line bg-shell px-4 py-3 text-2xs leading-relaxed text-ink-soft">
          <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" />
          We never store card or bank details. Payments are handled by a PCI-compliant processor and
          this system holds only a reference token.
        </p>

        {data &&
        <section className="rounded-2xl border border-line bg-card shadow-panel">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-semibold text-ink">Invoices</h2>
            </div>
            {data.invoices.length === 0 ?
          <div className="px-5 py-6"><Empty title="No invoices yet" /></div> :

          <ul className="divide-y divide-line">
                {data.invoices.map((inv) =>
            <li key={inv.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{inv.period}</p>
                      <p className="font-mono text-2xs text-ink-mute">
                        {inv.number} · issued {formatDate(inv.issued_on)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-ink">
                      {inv.currency} {Number(inv.amount).toLocaleString()}
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold ${STATUS_TONES[inv.status]}`}>
                      {inv.status}
                    </span>
                    <span className="w-40 shrink-0 text-right text-2xs text-ink-mute">{inv.method}</span>
                  </li>
            )}
              </ul>
          }
          </section>
        }

        <p className="mt-4 text-2xs leading-relaxed text-ink-mute">
          Questions about an invoice go to your Pure Play contact.
        </p>
      </div>
    </AdminOnly>);

}
