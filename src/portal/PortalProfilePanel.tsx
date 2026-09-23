import { LogOutIcon, XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { orgUsers, subscriptions } from '../data/orgs';
import { usePortalSession } from './session';

interface PortalProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

export function PortalProfilePanel({ open, onClose }: PortalProfilePanelProps) {
  const { orgId, orgName, userName, role, logout } = usePortalSession();
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const user = orgUsers.find((member) => member.orgId === orgId && member.name === userName);
  const subscription = subscriptions.find((item) => item.orgId === orgId);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', keepFocusInside);
    return () => document.removeEventListener('keydown', keepFocusInside);
  }, [onClose, open]);

  return (
    <aside
      ref={panelRef}
      aria-hidden={!open}
      aria-label="Profile"
      className={`absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-line bg-card p-5 shadow-lg transition-transform duration-200 sm:w-96 ${
      open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink">{orgName}</p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-shell text-ink-soft transition-colors duration-150 hover:text-ink">

          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-mute">User</p>
          <p className="mt-1 text-sm font-semibold text-ink">{userName}</p>
          <p className="text-xs text-ink-mute">{user?.email}</p>
        </div>

        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-mute">Role</p>
          <p className="mt-1 text-sm text-ink">{role}</p>
        </div>

        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-mute">Subscription</p>
          <p className="mt-1 text-sm text-ink">{subscription?.plan}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-accent transition-colors duration-150 hover:bg-accent-soft">

        <LogOutIcon className="h-4 w-4" />
        Sign out
      </button>
    </aside>);

}
