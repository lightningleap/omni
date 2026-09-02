import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Unified, left-aligned editorial section header used across the site.
 *
 * One design language for every section: an optional small uppercase label, a
 * large primary title, a neutral descriptive subtitle, and an optional action on
 * the same row (desktop) that drops below on mobile — sits inside each section's
 * existing max-w-[1440px] container, so it inherits the page's alignment.
 *
 * Typography comes straight from the type system (globals.css): the title is
 * `.type-section-title` (Mellos Regular, a flat 24px), the subtitle is
 * `.type-section-subtitle` (Manrope Regular, a flat 12px), the label is
 * `.type-label`. Nothing is restated locally, so every section header on the site
 * moves together and no two can drift apart.
 *
 * Title colour is set inline to beat the global unlayered h1–h6 rule.
 */
interface SectionHeaderProps {
  /**
   * Omitted → no heading is rendered and none of its space is taken. For a
   * section that leads with its label alone; the label is then the heading.
   */
  title?: string;
  /** Optional small uppercase label above the title (Manrope 700 / 0.18em). */
  label?: string;
  /** Plain string or rich node (e.g. with styled @handles). */
  subtitle?: ReactNode;
  /** Pre-built action node (button/link) shown on the title row. */
  actionButton?: ReactNode;
  /**
   * Node rendered inside the LEFT column, directly beneath the subtitle.
   *
   * For a call to action that belongs to the copy rather than to the section —
   * one the sentence above it is actually asking for. `actionButton` puts a
   * control on the title row, opposite the heading, which reads as a section
   * utility (a sort control, a "view all"); a CTA placed there detaches from the
   * sentence that motivates it. Omitted → nothing renders and no space is taken.
   */
  footer?: ReactNode;
  /** Convenience: renders a default pill link when actionButton isn't given. */
  actionLabel?: string;
  actionLink?: string;
  /** Layout alignment. Defaults to left per the design system. */
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeader({
  title,
  label,
  subtitle,
  actionButton,
  footer,
  actionLabel,
  actionLink,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const centered = align === 'center';

  const action =
    actionButton ??
    (actionLabel && actionLink ? (
      <Link
        href={actionLink}
        className="type-button group/act inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-neutral-300 px-6 text-[13px] uppercase tracking-[0.08em] text-[#1A1A1A] transition-[background-color,border-color] duration-[250ms] ease-out hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
      >
        {actionLabel}
        <ArrowRight size={15} strokeWidth={2} className="transition-transform duration-[250ms] ease-out group-hover/act:translate-x-1" />
      </Link>
    ) : null);

  // 42px below a heading block; 28px below a lone label, which is one small
  // line rather than a 24px title over a paragraph, and would otherwise sit in
  // a gap measured for something twice its height.
  const bottom = title ? 'mb-[42px]' : 'mb-7';

  return (
    <div
      className={`${bottom} flex flex-col gap-6 ${
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
      } ${className}`}
    >
      <div className={`flex flex-col ${centered ? 'items-center text-center' : 'items-start text-left'}`}>
        {/* The label's own bottom margin is the space between it and the title —
            with no title and no subtitle under it, there is nothing to separate. */}
        {label && (
          <span className={`type-label block text-neutral-500 ${title || subtitle ? 'mb-4' : ''}`}>
            {label}
          </span>
        )}
        {title && (
          <h2 style={{ color: '#1A1A1A' }} className="type-section-title">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="type-section-subtitle mt-[18px] max-w-[700px] text-neutral-500">
            {subtitle}
          </p>
        )}
        {/* 28px below the subtitle — far enough that the CTA reads as a separate
            beat rather than as part of the paragraph, close enough that it still
            clearly belongs to it. */}
        {footer && <div className="mt-7">{footer}</div>}
      </div>

      {action && <div className={centered ? '' : 'shrink-0'}>{action}</div>}
    </div>
  );
}
