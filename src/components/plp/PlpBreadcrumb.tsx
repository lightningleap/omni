import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb trail — "Home › Shop › Men", "Home › Kids › Toddler".
 *
 * The trail is data, not markup: it comes from the category registry, so a new
 * category brings its own path with it. Rendered as an ordered list inside a
 * labelled `nav`, with the current page marked `aria-current` and not linked.
 */
export default function PlpBreadcrumb({
  trail,
  current,
}: {
  trail: { label: string; href: string }[];
  current: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((crumb) => (
          <li key={`${crumb.label}-${crumb.href}`} className="flex items-center gap-x-2">
            <Link
              href={crumb.href}
              className="type-caption text-[11px] uppercase tracking-[0.18em] text-neutral-500 transition-colors duration-200 ease-out hover:text-accent-ink focus-visible:outline-none focus-visible:text-accent-ink"
            >
              {crumb.label}
            </Link>
            <ChevronRight aria-hidden size={12} strokeWidth={2} className="text-neutral-300" />
          </li>
        ))}
        <li>
          <span
            aria-current="page"
            className="type-caption text-[11px] uppercase tracking-[0.18em] text-accent-ink"
          >
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
