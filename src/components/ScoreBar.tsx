
interface ScoreBarProps {
  value: number;
  label?: string;
  width?: string;
  showValue?: boolean;
  tone?: 'accent' | 'ink' | 'auto';
}

function autoTone(value: number) {
  if (value >= 75) return 'bg-accent';
  if (value >= 55) return 'bg-ink-soft';
  return 'bg-ink-mute';
}

export function ScoreBar({ value, label, width = 'w-16', showValue = true, tone = 'auto' }: ScoreBarProps) {
  const fill = tone === 'accent' ? 'bg-accent' : tone === 'ink' ? 'bg-ink' : autoTone(value);
  return (
    <div className="flex items-center gap-2">
      {showValue &&
      <span className="w-7 shrink-0 font-mono text-xs font-medium tabular-nums text-ink">{value}</span>
      }
      <div
        className={`${width} h-1.5 overflow-hidden rounded-full bg-line`}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'score'}>
        
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${value}%` }} />
      </div>
    </div>);

}