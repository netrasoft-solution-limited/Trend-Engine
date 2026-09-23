import { useState } from 'react';
import { ActivityIcon, BellIcon, ChevronDownIcon, CommandIcon, LogOutIcon, SearchIcon, ShieldIcon, ZapIcon } from 'lucide-react';
import { organizations } from '../data/orgs';
import { vendorSpend } from '../data/operations';
import { useOpsSession } from './session';

/**
 * Arch §5.3: on the operator plane the tenant binding is `OPERATOR_ALL` by
 * default and narrowed by this selector. The portal plane has no equivalent —
 * it is hard-bound to the session's org and cannot widen.
 */
export function TopBar() {
  const { name, email, role, logout } = useOpsSession();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [scope, setScope] = useState<{ id: string; name: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const spend = vendorSpend.reduce((sum, v) => sum + v.spend, 0);
  const cap = vendorSpend.reduce((sum, v) => sum + v.cap, 0);
  const pct = Math.round(spend / cap * 100);
  const spendTone = pct >= 80 ? 'text-warn' : 'text-ink';

  return (
    <header className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2.5 shadow-panel">
      <div className="flex items-center gap-2.5 pr-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
          <ZapIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-ink">Trend Engine</p>
          <p className="text-2xs text-ink-mute">Operator plane · Pure Play</p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setScopeOpen((o) => !o)}
          aria-expanded={scopeOpen}
          className="flex items-center gap-2 rounded-xl border border-line bg-shell px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/40">

          <span className="text-ink-mute">Scope</span>
          {scope ? scope.name : <span className="font-mono text-2xs text-accent-deep">OPERATOR_ALL</span>}
          <ChevronDownIcon className="h-3.5 w-3.5 text-ink-mute" />
        </button>
        {scopeOpen &&
        <ul className="absolute left-0 top-full z-20 mt-1.5 w-72 overflow-hidden rounded-xl border border-line bg-card p-1 shadow-lg">
            <li>
              <button
              type="button"
              onClick={() => {
                setScope(null);
                setScopeOpen(false);
              }}
              className="flex w-full flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-shell">

                <span className="font-mono text-2xs font-semibold text-accent-deep">OPERATOR_ALL</span>
                <span className="text-2xs text-ink-mute">Explicit opt-out of tenant scoping — audited</span>
              </button>
            </li>
            <li className="my-1 border-t border-line" />
            {organizations.map((o) =>
          <li key={o.id}>
                <button
              type="button"
              onClick={() => {
                setScope({ id: o.id, name: o.name });
                setScopeOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink transition-colors duration-150 hover:bg-shell">

                  <span className="min-w-0 truncate">{o.name}</span>
                  <span className="shrink-0 text-2xs text-ink-mute">{o.isFixture ? 'fixture' : o.status}</span>
                </button>
              </li>
          )}
          </ul>
        }
      </div>

      <label className="ml-auto hidden min-w-0 flex-1 items-center gap-2 rounded-xl bg-shell px-3 py-2 xl:flex">
        <SearchIcon className="h-4 w-4 shrink-0 text-ink-mute" />
        <input
          type="search"
          placeholder="Search signals, evidence spans, sources, outputs"
          className="min-w-0 flex-1 bg-transparent text-xs text-ink placeholder:text-ink-mute focus:outline-none" />

        <span className="flex items-center gap-1 rounded-md border border-line bg-card px-1.5 py-0.5 text-2xs text-ink-mute">
          <CommandIcon className="h-3 w-3" />K
        </span>
      </label>

      <div className="ml-auto flex items-center gap-2 xl:ml-0">
        <div className="hidden items-center gap-2.5 rounded-xl border border-line bg-shell px-3 py-2 md:flex">
          <div className="leading-tight">
            <p className="text-2xs text-ink-mute">Vendor spend · Sep</p>
            <p className={`font-mono text-xs font-semibold tabular-nums ${spendTone}`}>
              ${spend.toFixed(0)} <span className="text-ink-mute">/ ${cap}</span>
            </p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="w-14">
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <div className={`h-full rounded-full ${pct >= 80 ? 'bg-warn' : 'bg-accent'}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-2xs text-ink-mute">{pct}% of cap</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-line bg-shell px-3 py-2 md:flex">
          <ActivityIcon className="h-4 w-4 text-ink-mute" />
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />7
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <span className="h-2 w-2 rounded-full bg-warn" aria-hidden="true" />1
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <span className="h-2 w-2 rounded-full bg-bad" aria-hidden="true" />1
          </span>
          <span className="sr-only">Seven connectors healthy, one validating, one blocked</span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-shell text-ink-soft transition-colors duration-150 hover:text-ink">

          <BellIcon className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((o) => !o)}
            aria-expanded={userMenuOpen}
            aria-label={`Account menu for ${name}`}
            className="flex items-center gap-2 rounded-xl bg-shell py-1.5 pl-1.5 pr-3 transition-colors duration-150 hover:bg-line">

            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-2xs font-bold text-white">
              {initials}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-semibold text-ink">{name}</p>
              <p className="flex items-center gap-1 text-2xs text-ink-mute">
                <ShieldIcon className="h-2.5 w-2.5" />
                {role}
              </p>
            </div>
            <ChevronDownIcon className="hidden h-3.5 w-3.5 text-ink-mute sm:block" />
          </button>
          {userMenuOpen &&
          <div className="absolute right-0 top-full z-20 mt-1.5 w-56 overflow-hidden rounded-xl border border-line bg-card p-1 shadow-lg">
              <div className="px-2.5 py-2">
                <p className="text-xs font-semibold text-ink">{name}</p>
                <p className="text-2xs text-ink-mute">{email}</p>
                <p className="mt-0.5 text-2xs font-semibold text-accent-deep">{role}</p>
              </div>
              <div className="my-1 border-t border-line" />
              <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-accent transition-colors duration-150 hover:bg-accent-soft">

                <LogOutIcon className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          }
        </div>
      </div>
    </header>);

}
