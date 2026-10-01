import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BellIcon, BuildingIcon, CheckIcon, ChevronDownIcon, LogOutIcon, ZapIcon } from 'lucide-react';
import { useAsync } from './useAsync';
import { api } from './api';
import { isOrgAdmin, usePortalSession } from './session';

const LINKS: { to: string; label: string; adminOnly?: boolean }[] = [
  { to: '/portal', label: 'Published' },
  { to: '/portal/delivery', label: 'What’s coming' },
  { to: '/portal/notifications', label: 'Notifications' },
  { to: '/portal/team', label: 'Team', adminOnly: true },
  { to: '/portal/subscription', label: 'Subscription', adminOnly: true }
];

export function PortalNav() {
  const session = usePortalSession();
  const admin = isOrgAdmin(session);
  const [menu, setMenu] = useState<null | 'org' | 'account'>(null);
  const [switching, setSwitching] = useState(false);

  const { data: notifications } = useAsync(() => api.notifications(), [session.organization.id]);
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  // Hiding the admin links is convenience, not access control — the server
  // returns 403 for these routes regardless of what the nav renders.
  const links = LINKS.filter((l) => !l.adminOnly || admin);
  const multiOrg = session.memberships.length > 1;

  const choose = async (organizationId: number) => {
    setMenu(null);
    if (organizationId === session.organization.id) return;
    setSwitching(true);
    try {
      await session.switchOrg(organizationId);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink">
            <ZapIcon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            {/*
              With multi-org membership the organisation is a real choice, so
              it gets a control. This is NOT the old role switcher: the list is
              bounded by memberships the server issued, and the server
              re-verifies the choice on the switch and on every request after.
            */}
            {multiOrg ?
            <div className="relative">
                <button
                type="button"
                onClick={() => setMenu(menu === 'org' ? null : 'org')}
                aria-expanded={menu === 'org'}
                disabled={switching}
                className="flex items-center gap-1.5 text-sm font-bold text-ink transition-opacity duration-150 hover:opacity-70 disabled:opacity-50">

                  {session.organization.name}
                  <ChevronDownIcon className="h-3.5 w-3.5 text-ink-mute" />
                </button>
                {menu === 'org' &&
              <ul className="absolute left-0 top-full z-20 mt-1.5 w-64 overflow-hidden rounded-xl border border-line bg-card p-1 shadow-lg">
                    <li className="px-2.5 py-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                      Your organisations
                    </li>
                    {session.memberships.map((m) =>
                <li key={m.id}>
                        <button
                    type="button"
                    onClick={() => void choose(m.organization.id)}
                    className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-shell">

                          <span className="mt-0.5 w-3.5 shrink-0">
                            {m.organization.id === session.organization.id &&
                      <CheckIcon className="h-3.5 w-3.5 text-ok" />
                      }
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-ink">
                              {m.organization.name}
                            </span>
                            <span className="block text-2xs text-ink-mute">{m.role_label}</span>
                          </span>
                        </button>
                      </li>
                )}
                  </ul>
              }
              </div> :

            <p className="text-sm font-bold text-ink">{session.organization.name}</p>
            }
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu(menu === 'account' ? null : 'account')}
              aria-expanded={menu === 'account'}
              className="flex items-center gap-2 rounded-xl bg-shell py-1.5 pl-2.5 pr-2 text-xs">

              <span className="hidden font-semibold leading-none text-ink sm:block">
                {session.user.name}
              </span>
              <span className="text-2xs font-semibold leading-none text-ink-mute">
                {session.roleLabel}
              </span>
              <ChevronDownIcon className="h-3 w-3 text-ink-mute" />
            </button>
            {menu === 'account' &&
            <div className="absolute right-0 top-full z-20 mt-1.5 w-60 overflow-hidden rounded-xl border border-line bg-card p-1 shadow-lg">
                <div className="px-2.5 py-2">
                  <p className="truncate text-xs font-semibold text-ink">{session.user.name}</p>
                  <p className="truncate text-2xs text-ink-mute">{session.user.email}</p>
                  <p className="mt-1 flex items-center gap-1 text-2xs text-ink-mute">
                    <BuildingIcon className="h-3 w-3" />
                    {session.roleLabel} at {session.organization.name}
                  </p>
                </div>
                <div className="my-1 border-t border-line" />
                <button
                type="button"
                onClick={() => void session.logout()}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink-soft transition-colors duration-150 hover:bg-shell hover:text-ink">

                  <LogOutIcon className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>);

}
