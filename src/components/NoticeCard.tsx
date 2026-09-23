interface NoticeCardProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  message?: string;
  tone?: 'neutral' | 'warn' | 'bad' | 'ok';
  action?: React.ReactNode;
}

const TONE_CLASSES: Record<string, string> = {
  neutral: 'bg-shell text-ink-mute',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  ok: 'bg-ok-soft text-ok'
};

/**
 * A centered "nothing to show here" card — an access refusal, a not-found
 * record, a blocked action. Shared by both planes' role guards so the shape
 * of "you can't see this" stays one thing, not a copy per guard.
 */
export function NoticeCard({ icon: Icon, title, message, tone = 'neutral', action }: NoticeCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-card p-8 text-center">
      {Icon && (
        <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      )}
      <h1 className="mt-3 text-lg font-semibold text-ink">{title}</h1>
      {message && <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-soft">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
