
interface PanelProps {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'aside';
}

export function Panel({ children, className = '', as = 'section' }: PanelProps) {
  const Tag = as;
  return (
    <Tag className={`rounded-2xl border border-line bg-card shadow-panel ${className}`}>{children}</Tag>);

}

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  level?: 2 | 3;
}

export function PanelHeader({ title, subtitle, right, level = 2 }: PanelHeaderProps) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <Heading className="text-[15px] font-semibold leading-tight text-ink">{title}</Heading>
        {subtitle && <p className="mt-1 text-xs leading-relaxed text-ink-mute">{subtitle}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>);

}