import { NavLink } from 'react-router-dom';
import { BellIcon, ChevronDownIcon, ZapIcon } from 'lucide-react';
import { usePortalSession } from './session';
import { notificationsForOrg } from '../data/publications';
import { OrgRole } from '../types';

const LINKS: { to: string; label: string; adminOnly?: boolean }[] = [
  { to: '/portal', label: 'Published' },
  { to: '/portal/delivery', label: 'What’s coming' },
  { to: '/portal/notifications', label: 'Notifications' },
  { to: '/portal/team', label: 'Team', adminOnly: true },
  { to: '/portal/subscription', label: 'Subscription', adminOnly: true }
];

export function PortalNav() {
  const { orgId, orgName, userName, role, setRole } = usePortalSession();
  const unread = notificationsForOrg(orgId).filter((n) => !n.read).length;

  const links = LINKS.filter((l) => !l.adminOnly || role === 'Org Admin');

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink">
            <ZapIcon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-ink">{orgName}</p>
            <p className="text-2xs text-ink-mute">Category intelligence from Pure Play</p>
          </div>
        </div>

        <nav aria-label="Portal" className="order-3 w-full sm:order-none sm:w-auto">
          <ul className="flex flex-wrap items-center gap-1">
            {links.map((l) =>
            <li key={l.to}>
                <NavLink
                to={l.to}
                end={l.to === '/portal'}
                className={({ isActive }) =>
                `rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                isActive ? 'bg-ink text-white' : 'text-ink-soft hover:bg-shell hover:text-ink'}`
                }>

                  {l.label}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <NavLink
            to="/portal/notifications"
            aria-label={`Notifications, ${unread} unread`}
            className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-shell text-ink-soft transition-colors duration-150 hover:text-ink">

            <BellIcon className="h-4 w-4" />
            {unread > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />}
          </NavLink>

          {/*
            Role switcher — a review aid only. In the real portal the role comes
            from the OrgUser record and cannot be changed by the user.
          */}
          <label className="relative flex items-center gap-1.5 rounded-xl bg-shell py-1.5 pl-2.5 pr-2 text-xs">
            <span className="hidden leading-tight sm:block">
              <span className="block font-semibold text-ink">{userName}</span>
              <span className="block text-2xs text-ink-mute">{role}</span>
            </span>
            <span className="sr-only">Viewing as role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
              className="cursor-pointer appearance-none bg-transparent pr-4 text-2xs font-semibold text-ink-soft focus:outline-none">

              <option value="Org Admin">Org Admin</option>
              <option value="Org Viewer">Org Viewer</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2 h-3 w-3 text-ink-mute" />
          </label>
        </div>
      </div>
    </header>);

}
