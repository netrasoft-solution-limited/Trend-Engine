import { Link } from 'react-router-dom';
import { CheckCircle2Icon, ClockIcon, EyeIcon } from 'lucide-react';
import { usePortalSession } from '../session';
import { deliveriesForOrg } from '../../data/publications';
import { DeliveryState } from '../../types';

/**
 * PRD §6.8: the tracker uses client-appropriate language. Every internal
 * pre-publication state — drafting, draft, review ready, approved — collapses
 * to a single "in preparation". The client never learns which internal review
 * stage something is sitting in, and approval is not visible as a milestone
 * because approval is not a promise of delivery.
 */
const STATE_META: Record<DeliveryState, { label: string; icon: typeof ClockIcon; tone: string }> = {
  'in preparation': { label: 'In preparation', icon: ClockIcon, tone: 'bg-shell text-ink-mute' },
  published: { label: 'Ready to read', icon: EyeIcon, tone: 'bg-ok-soft text-ok' },
  delivered: { label: 'Delivered', icon: CheckCircle2Icon, tone: 'bg-shell text-ink-soft' }
};

export function Delivery() {
  const { orgId } = usePortalSession();
  const rows = deliveriesForOrg(orgId);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">What’s coming</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Where each deliverable stands against your agreed cadence. Anything marked ready to read is already available
          under <Link to="/portal" className="font-semibold text-accent-deep hover:underline">published</Link>.
        </p>
      </header>

      <ul className="space-y-2">
        {rows.map((row) => {
          const meta = STATE_META[row.state];
          const Icon = meta.icon;
          return (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-card px-5 py-4 shadow-panel">

              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">{row.type}</p>
                <p className="text-sm font-semibold leading-snug text-ink">{row.title}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-ink">{meta.label}</p>
                <p className="text-2xs text-ink-mute">{row.expected}</p>
              </div>
              <p className="w-full text-2xs text-ink-mute sm:w-auto sm:basis-full">{row.note}</p>
            </li>);

        })}
      </ul>

      <p className="mt-4 text-2xs leading-relaxed text-ink-mute">
        Items in preparation are with the Pure Play team. Nothing is shared with you until it has passed editorial,
        evidence and claims review — and for anything carrying scientific content, an expert sign-off as well.
      </p>
    </div>);

}
