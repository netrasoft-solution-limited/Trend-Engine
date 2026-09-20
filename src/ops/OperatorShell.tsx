import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/**
 * OPERATOR PLANE — `/ops/*`.
 *
 * Arch §5.3: in the real system this is served by its own WSGI process behind
 * its own cookie path (`__Host-te_ops`, path `/ops`) with its own user model
 * and auth backend. Portal traffic never loads this URL routing at all.
 */
interface OperatorShellProps {
  children: React.ReactNode;
}

export function OperatorShell({ children }: OperatorShellProps) {
  return (
    <div className="min-h-full w-full bg-canvas p-3 lg:p-5">
      <div className="mx-auto w-full max-w-[1680px] rounded-4xl bg-shell p-3">
        <TopBar />
        <div className="mt-3 flex items-start gap-3">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-4">{children}</main>
        </div>
      </div>
    </div>);

}
