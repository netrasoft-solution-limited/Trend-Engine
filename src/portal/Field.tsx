/**
 * Shared form primitives for the auth screens.
 *
 * `errors` takes the per-field list DRF returns, so a password rejected by
 * three validators shows all three at once rather than one per round trip.
 */
export function Field({
  label,
  type = 'text',
  value,
  onChange,
  errors,
  autoComplete,
  autoFocus,
  placeholder,
  hint
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  autoComplete?: string;
  autoFocus?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const invalid = Boolean(errors?.length);
  return (
    <label className="mb-4 block">
      <span className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-invalid={invalid}
        className={`mt-1.5 w-full rounded-xl border bg-shell px-3 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-ink/10 ${
        invalid ? 'border-bad' : 'border-line'}`
        } />
      
      {hint && !invalid && <span className="mt-1 block text-2xs text-ink-mute">{hint}</span>}
      {errors?.map((message) =>
      <span key={message} className="mt-1 block text-2xs font-medium text-bad">
          {message}
        </span>
      )}
    </label>);

}

export function SubmitButton({ children, busy }: { children: React.ReactNode; busy: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-mute">
      
      {busy ? 'Working…' : children}
    </button>);

}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mb-4 rounded-xl border border-bad/40 bg-bad-soft px-3 py-2.5 text-xs leading-relaxed text-ink">
      
      {message}
    </p>);

}
