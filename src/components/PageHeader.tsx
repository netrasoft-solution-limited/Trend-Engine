
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, right }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-2xs font-semibold text-ink-mute">{eyebrow}</p>}
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>);

}