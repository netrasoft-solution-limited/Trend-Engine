import { ZapIcon } from 'lucide-react';
import { Panel } from '../components/Panel';

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Chrome for the operator plane's pre-auth pages — login and MFA. Deliberately
 * not `OperatorShell`: no sidebar, no tenant scope selector, nothing that
 * assumes a signed-in operator, on the plane whose access is private and
 * identity-aware (PRD §3.1) rather than public.
 */
export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-full w-full items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <ZapIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold text-ink">Trend Engine · Operator</span>
        </div>
        <Panel className="p-6">
          {eyebrow && <p className="mb-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">{eyebrow}</p>}
          <h1 className="text-xl font-bold leading-tight tracking-tight text-ink">{title}</h1>
          {description && <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{description}</p>}
          <div className="mt-5">{children}</div>
        </Panel>
        {footer && <p className="mt-4 text-center text-xs text-ink-soft">{footer}</p>}
      </div>
    </div>
  );
}
