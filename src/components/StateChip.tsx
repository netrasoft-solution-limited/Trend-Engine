import { AnyState } from '../types';

type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'accent' | 'slate';

const TONES: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  info: 'bg-info-soft text-info',
  accent: 'bg-accent-soft text-accent-deep',
  slate: 'bg-slate-soft text-slate'
};

const STATE_TONES: Record<string, Tone> = {
  // signal
  candidate: 'info',
  'in review': 'accent',
  rejected: 'bad',
  watching: 'warn',
  archived: 'slate',
  // recommendation
  proposed: 'info',
  'operator edited': 'accent',
  completed: 'ok',
  // output — PRD §6.9. `approved` and `published` must never read as the same
  // thing: one is internal sign-off, the other is live to the client.
  drafting: 'slate',
  draft: 'info',
  'review ready': 'accent',
  approved: 'info',
  published: 'ok',
  delivered: 'slate',
  // delivery tracker, client-facing (PRD §6.8)
  'in preparation': 'slate',
  // source
  validating: 'warn',
  active: 'ok',
  gated: 'slate',
  blocked: 'bad',
  paused: 'warn'
};

interface StateChipProps {
  state: AnyState | string;
  dot?: boolean;
  className?: string;
}

export function StateChip({ state, dot = true, className = '' }: StateChipProps) {
  const tone = STATE_TONES[state] ?? 'slate';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-2xs font-semibold tracking-tight ${TONES[tone]} ${className}`}>
      
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />}
      {state}
    </span>);

}