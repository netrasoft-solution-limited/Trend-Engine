import { NavLink } from 'react-router-dom';
import {
  BeakerIcon,
  BuildingIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GaugeIcon,
  GitMergeIcon,
  InboxIcon,
  LayersIcon,
  LogOutIcon,
  PlayCircleIcon,
  RadarIcon,
  SearchCodeIcon,
  UsersIcon } from
'lucide-react';
import { digest } from '../data/signals';
import { resolutionQueue } from '../data/resolution';
import { useOpsSession } from './session';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{className?: string;}>;
  badge?: string;
}

const PIPELINE: NavItem[] = [
{ to: '/ops', label: 'Triage', icon: RadarIcon, badge: String(digest.newCandidates) },
{ to: '/ops/signal/SIG-2041', label: 'Signal Review', icon: SearchCodeIcon },
{ to: '/ops/research', label: 'Research Inbox', icon: InboxIcon, badge: String(digest.researchAlerts) },
{ to: '/ops/output', label: 'Output Builder', icon: FileTextIcon, badge: String(digest.reviewReady) }];


const EVIDENCE: NavItem[] = [
{ to: '/ops/sources', label: 'Sources', icon: LayersIcon },
{ to: '/ops/runs', label: 'Ingestion Runs', icon: PlayCircleIcon },
{ to: '/ops/resolution', label: 'Resolution Queue', icon: GitMergeIcon, badge: String(resolutionQueue.length) }];


const TENANTS: NavItem[] = [
{ to: '/ops/client', label: 'Client Profile', icon: BuildingIcon },
{ to: '/ops/tenants', label: 'Organizations', icon: UsersIcon }];


const SYSTEM: NavItem[] = [{ to: '/ops/operations', label: 'Operations', icon: GaugeIcon }];

function NavGroup({ label, items }: {label: string;items: NavItem[];}) {
  return (
    <div>
      <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-mute">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item) =>
        <li key={item.to}>
            <NavLink
            to={item.to}
            end={item.to === '/ops'}
            className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 ${
            isActive ?
            'bg-accent text-white' :
            'text-ink-soft hover:bg-shell hover:text-ink'}`

            }>

              {({ isActive }) =>
            <>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge &&
              <span
                className={`ml-auto rounded-full px-1.5 py-0.5 font-mono text-2xs tabular-nums ${
                isActive ? 'bg-white/20 text-white' : 'bg-shell text-ink-mute'}`
                }>

                      {item.badge}
                    </span>
              }
                </>
            }
            </NavLink>
          </li>
        )}
      </ul>
    </div>);

}

export function Sidebar() {
  const { role, logout } = useOpsSession();
  // PRD §3.2: tenant onboarding is a Platform Admin capability. Hiding the
  // link is a convenience only — `PlatformAdminOnly` on the page itself is
  // the actual control, same discipline as the portal's `AdminOnly`.
  const tenants = TENANTS.filter((item) => item.to !== '/ops/tenants' || role === 'Platform Admin');

  return (
    <nav
      aria-label="Primary"
      className="sticky top-3 hidden h-[calc(100vh-7.5rem)] w-56 shrink-0 flex-col justify-between rounded-2xl border border-line bg-card p-3 shadow-panel lg:flex">

      <div className="space-y-5 overflow-y-auto">
        <NavGroup label="Pipeline" items={PIPELINE} />
        <NavGroup label="Evidence" items={EVIDENCE} />
        <NavGroup label="Tenants" items={tenants} />
        <NavGroup label="System" items={SYSTEM} />
      </div>
      <div className="space-y-2 pt-3">
        <div className="rounded-xl bg-shell px-3 py-2.5">
          <div className="flex items-center gap-2 text-2xs font-semibold text-ink-soft">
            <BeakerIcon className="h-3.5 w-3.5 text-accent" />
            Pipeline stage
          </div>
          <p className="mt-1 text-2xs leading-relaxed text-ink-mute">
            Collect → Understand → Connect → <span className="font-semibold text-ink">Detect</span> → Recommend → Publish
          </p>
        </div>

        {/*
          The client portal is a separate auth realm, not a view of this one.
          It is linked here for convenience during design review only — in the
          real system these are two processes behind two cookie paths (Arch §5.3).
        */}
        <a
          href="/portal"
          className="flex w-full items-center gap-2.5 rounded-xl border border-line px-3 py-2 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:border-ink-mute/50 hover:text-ink">

          <ExternalLinkIcon className="h-3.5 w-3.5" />
          <span className="min-w-0 truncate">Client portal</span>
          <span className="ml-auto text-2xs font-normal text-ink-mute">separate realm</span>
        </a>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-accent transition-colors duration-150 hover:bg-accent-soft">

          <LogOutIcon className="h-4 w-4" />
          Log out
        </button>
      </div>
    </nav>);

}
