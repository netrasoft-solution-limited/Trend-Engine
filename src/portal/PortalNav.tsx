import { NavLink } from 'react-router-dom';
import { BellIcon, BookOpenIcon, CalendarClockIcon, ChevronDownIcon, CreditCardIcon, UsersIcon, ZapIcon } from 'lucide-react';
import { usePortalSession } from './session';
import { notificationsForOrg } from '../data/publications';
import { OrgRole } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{className?: string;}>;
  adminOnly?: boolean;
  badge?: string;
}

const DELIVERY: NavItem[] = [
  { to: '/portal', label: 'Dashboard', icon: BookOpenIcon },
  { to: '/portal/delivery', label: 'What’s coming', icon: CalendarClockIcon },
  { to: '/portal/notifications', label: 'Notifications', icon: BellIcon }
];

const ACCOUNT: NavItem[] = [
  { to: '/portal/team', label: 'Team', icon: UsersIcon, adminOnly: true },
  { to: '/portal/subscription', label: 'Subscription', icon: CreditCardIcon, adminOnly: true }
];

function NavGroup({ label, items, onNavigate }: {label: string;items: NavItem[];onNavigate?: () => void;}) {
  const { role } = usePortalSession();
  const links = items.filter((item) => !item.adminOnly || role === 'Org Admin');

  return (
    <div>
      <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-mute">{label}</p>
      <ul className="space-y-0.5">
        {links.map((item) =>
        <li key={item.to}>
            <NavLink
            to={item.to}
            end={item.to === '/portal'}
            onClick={onNavigate}
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
                isActive ? 'bg-white/20 text-white' : 'bg-shell text-ink-mute'}`}>

                      {item.badge}
                    </span>
              }
                </>}
            </NavLink>
          </li>
        )}
      </ul>
    </div>);
}

export function PortalNav({ isDrawerOpen = false, onNavigate }: {isDrawerOpen?: boolean;onNavigate?: () => void;}) {
  const { orgId, orgName, userName, role, setRole } = usePortalSession();
  const unread = notificationsForOrg(orgId).filter((n) => !n.read).length;
  const delivery = DELIVERY.map((item) =>
  item.to === '/portal/notifications' && unread > 0 ? {...item, badge: String(unread)} :
  item
  );

  return (
    <nav
      aria-label="Portal"
      className={`${
      isDrawerOpen ?
      'fixed inset-y-0 left-0 z-30 flex w-72 border-r border-line bg-card p-3 shadow-lg' :
      'hidden'} h-full shrink-0 flex-col justify-between lg:static lg:z-auto lg:flex lg:w-56 lg:border-r-0 lg:bg-transparent lg:p-3 lg:shadow-none`}>

      <div className="space-y-5 overflow-y-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink">
            <ZapIcon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-ink">{orgName}</p>
            <p className="text-2xs text-ink-mute">Category intelligence from Pure Play</p>
          </div>
        </div>

        <NavGroup label="Delivery" items={delivery} onNavigate={onNavigate} />
        <NavGroup label="Account" items={ACCOUNT} onNavigate={onNavigate} />
      </div>

      <div className="space-y-2 pt-3">
        {/*
          Role switcher — a review aid only. In the real portal the role comes
          from the OrgUser record and cannot be changed by the user.
        */}
        <label className="relative flex items-center gap-1.5 rounded-xl bg-shell py-2 pl-3 pr-2 text-xs">
          <span className="leading-tight">
            <span className="block font-semibold text-ink">{userName}</span>
            <span className="block text-2xs text-ink-mute">{role}</span>
          </span>
          <span className="sr-only">Viewing as role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as OrgRole)}
            className="ml-auto cursor-pointer appearance-none bg-transparent pr-4 text-2xs font-semibold text-ink-soft focus:outline-none">

            <option value="Org Admin">Org Admin</option>
            <option value="Org Viewer">Org Viewer</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2 h-3 w-3 text-ink-mute" />
        </label>
      </div>
    </nav>);

}
