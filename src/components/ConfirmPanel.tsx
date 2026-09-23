interface ConfirmPanelProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: 'accent' | 'bad';
  busy?: boolean;
}

const TONE = {
  accent: { wrap: 'border-accent/40 bg-accent-soft', button: 'bg-accent hover:bg-accent-deep' },
  bad: { wrap: 'border-bad/40 bg-bad-soft', button: 'bg-bad hover:bg-bad/90' }
} as const;

/**
 * "Are you sure?" — extracted from the publish confirmation in
 * `ops/pages/OutputBuilder.tsx`, which keeps its own inline copy since it
 * predates this component. Anything destructive or hard to undo gets this
 * shape rather than a fresh one per screen.
 */
export function ConfirmPanel({ title, description, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel, tone = 'accent', busy = false }: ConfirmPanelProps) {
  const t = TONE[tone];
  return (
    <div className={`rounded-xl border p-3 ${t.wrap}`}>
      <p className="text-xs font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{description}</p>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${t.button}`}>

          {busy ? 'Working…' : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50 disabled:cursor-not-allowed disabled:opacity-60">

          {cancelLabel}
        </button>
      </div>
    </div>);

}
