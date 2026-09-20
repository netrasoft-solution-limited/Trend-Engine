import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PrinterIcon } from 'lucide-react';
import { usePortalSession } from '../session';
import { publicationById } from '../../data/publications';

/**
 * Resolves through `publicationById` — a Publication record, never an Output or
 * an OutputVersion (Arch §9.2). Consequences a reader can see:
 *
 *   · No version history. Only the published version exists here.
 *   · No internal scores, vendor costs, rejection reasons or policy versions.
 *   · An unpublished record resolves to nothing, not to an older version.
 */
export function OutputDetail() {
  const { id } = useParams<{ id: string }>();
  const { orgId } = usePortalSession();
  const publication = id ? publicationById(orgId, id) : undefined;

  if (!publication) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-ink">This isn’t available</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-soft">
          It may have been withdrawn while it is corrected, or it may belong to a different organisation. If you were
          reading it recently, the Pure Play team will reissue it.
        </p>
        <Link
          to="/portal"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-deep hover:underline">

          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to published
        </Link>
      </div>);

  }

  return (
    <article>
      <Link
        to="/portal"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mute transition-colors duration-150 hover:text-ink">

        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Published
      </Link>

      <header className="mb-6 mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-shell px-2.5 py-1 text-2xs font-semibold text-ink-soft">
            {publication.type}
          </span>
          <span className="text-2xs text-ink-mute">Published {publication.publishedAt}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink">{publication.title}</h1>
        <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-ink-soft">{publication.summary}</p>
      </header>

      <div className="space-y-6 rounded-2xl border border-line bg-card p-6 shadow-panel sm:p-8">
        {publication.body.map((section) =>
        <section key={section.heading}>
            <h2 className="text-base font-semibold text-ink">{section.heading}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{section.text}</p>
          </section>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-2xs leading-relaxed text-ink-mute">
          Questions about anything here go to your Pure Play contact. Approved outputs are retained for the term set out
          in your agreement.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:border-ink-mute/50">

          <PrinterIcon className="h-3.5 w-3.5" />
          Print or save as PDF
        </button>
      </div>
    </article>);

}
