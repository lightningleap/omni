import React from 'react';
import { Search } from 'lucide-react';

/**
 * The UNRWLY Management Studio design system.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 * The admin had drifted into five different container radii (`rounded-md`,
 * `lg`, `xl`, `2xl`, `3xl`), page titles ranging from `text-2xl` to
 * `text-4xl italic`, and shadows from `shadow-sm` to `shadow-2xl` — often two
 * of each on one screen. Nothing was wrong individually; collectively they
 * meant no two admin pages looked like the same product.
 *
 * These are the shared parts. Every admin page composes them rather than
 * re-declaring its own chrome, so the studio has one page header, one panel,
 * one table and one search field, and changing any of them is one edit.
 *
 * ── THE SCALE ───────────────────────────────────────────────────────────────
 * Deliberately tighter than the storefront. A shop page is read at arm's
 * length one section at a time; an orders table is scanned in bulk by someone
 * who works in it all day. Titles cap at 24px, table headers sit at 11px, body
 * rows at 13px — information-dense without being cramped.
 *
 * Colour comes entirely from `[data-admin-surface]` in `globals.css`, which
 * pins the Adult accent so the back office keeps one identity regardless of
 * which storefront the signed-in admin last browsed.
 */

/** Container width + gutters. One value, so no two pages align differently. */
export const ADMIN_SHELL = 'mx-auto w-full max-w-[1440px]';

/** The studio's hairline. Warmer than neutral-200, matching the storefront. */
export const ADMIN_RULE = '#E8E6E1';

/**
 * A page header: title, optional live/context line, optional action.
 *
 * The action is a slot rather than a prop set, because every page's action is
 * an existing control with its own handler — this component's job is to place
 * it, never to invent one.
 */
export function AdminPageHeader({
  title,
  meta,
  action,
}: {
  title: string;
  /** Small supporting line under the title — a sync clock, a count. */
  meta?: React.ReactNode;
  /** The page's existing primary action, if it has one. */
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[24px]">
          {title}
        </h1>
        {meta && <div className="mt-2 flex items-center gap-2 text-[12px] text-neutral-500">{meta}</div>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </header>
  );
}

/**
 * The workspace panel every page's content sits in.
 *
 * One border, one 8px radius, no shadow. The admin used `shadow-sm` through
 * `shadow-2xl`; on a page that is mostly one large surface, a shadow adds
 * nothing but noise, and the border already separates the panel from the
 * ground.
 */
export function AdminPanel({
  children,
  className = '',
  padded = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Adds internal padding. Off for panels whose child is a full-bleed table. */
  padded?: boolean;
}) {
  return (
    <div
      style={{ borderColor: ADMIN_RULE }}
      className={`overflow-hidden rounded-panel border bg-white ${padded ? 'p-5 md:p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * A labelled metric tile — the Customers and Finance summary cards.
 *
 * The value caps at 24px. These used `text-3xl` (30px) and sat four across, so
 * the numbers shouted over the page title above them.
 */
export function AdminStat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** `accent` for the headline figure of a page; `warn` for costs/negatives. */
  tone?: 'default' | 'accent' | 'warn';
}) {
  const valueTone =
    tone === 'accent' ? 'text-accent-800' : tone === 'warn' ? 'text-brand-terracotta' : 'text-ink';

  return (
    <AdminPanel padded>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className={`mt-2 text-[20px] font-bold leading-none tracking-[-0.02em] tabular-nums md:text-[24px] ${valueTone}`}>
        {value}
      </p>
      {hint && <p className="mt-2 text-[12px] leading-snug text-neutral-400">{hint}</p>}
    </AdminPanel>
  );
}

/**
 * The studio's search field.
 *
 * Controlled from the caller, so the existing filter logic on each page is
 * untouched — this only supplies the chrome.
 */
export function AdminSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  /** Accessible name. Visually hidden — the icon is not a label. */
  label: string;
}) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor="admin-search">
        {label}
      </label>
      <Search
        aria-hidden
        size={15}
        strokeWidth={2}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        id="admin-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ borderColor: ADMIN_RULE }}
        className="h-10 w-full rounded-card border bg-[#FBFAF8] pl-10 pr-3 text-[13px] text-ink outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-accent-700 focus:bg-white focus:ring-2 focus:ring-accent-700/15"
      />
    </div>
  );
}

/**
 * Table primitives — one data surface, not a stack of cards.
 *
 * Rows are separated by a single horizontal hairline and nothing else: no
 * vertical rules, no per-row borders, no alternating fills. The scroll wrapper
 * is on the table, not the page, so a wide table scrolls inside its panel
 * instead of dragging the whole layout sideways.
 */
export function AdminTableWrap({ children }: { children: React.ReactNode }) {
  return <div className="w-full overflow-x-auto">{children}</div>;
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return <table className="w-full min-w-[640px] border-collapse text-left">{children}</table>;
}

export function AdminTh({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      style={{ borderColor: ADMIN_RULE }}
      className={`whitespace-nowrap border-b bg-[#FBFAF8] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500 ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminTd({
  children,
  className = '',
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3.5 align-middle text-[13px] text-neutral-600 ${className}`} {...rest}>
      {children}
    </td>
  );
}

/** A body row. `interactive` adds the hover wash and pointer for clickable rows. */
export function AdminTr({
  children,
  interactive = false,
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      style={{ borderColor: ADMIN_RULE }}
      className={`border-b last:border-b-0 ${
        interactive ? 'cursor-pointer transition-colors duration-150 hover:bg-[#FBFAF8]' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
}

/**
 * Nothing to show.
 *
 * A blank panel reads as a page that failed to load. This says which, and it
 * never invents an action — the caller passes one only if the page has one.
 */
export function AdminEmpty({
  title,
  message,
  icon,
  action,
}: {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && <div className="mb-4 text-neutral-300">{icon}</div>}
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {message && <p className="mt-1.5 max-w-[42ch] text-[12px] leading-relaxed text-neutral-400">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/**
 * A loading skeleton shaped like the table it replaces, so the panel does not
 * jump when data arrives. `animate-pulse` is already disabled by Tailwind under
 * `prefers-reduced-motion`.
 */
export function AdminTableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3 animate-pulse rounded-full bg-[#F1EFEA]"
              style={{ width: c === 0 ? '18%' : c === cols - 1 ? '12%' : '22%' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Admin buttons.
 *
 * Same family, weight and accent as the storefront, at a tighter size — an
 * admin presses these all day in dense toolbars. `.btn-commerce` itself is not
 * reused because it carries a 44px minimum for phone tap targets, which is too
 * tall for a table toolbar; these keep its colour, radius and transition.
 */
const BTN_BASE =
  'inline-flex h-9 items-center justify-center gap-2 rounded-card px-3.5 text-[12px] font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

export function AdminButton({
  variant = 'secondary',
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const tone =
    variant === 'primary'
      ? 'bg-accent-800 text-white hover:bg-accent-950'
      : 'border bg-white text-ink hover:bg-[#FBFAF8]';
  return (
    <button
      style={variant === 'secondary' ? { borderColor: ADMIN_RULE } : undefined}
      className={`${BTN_BASE} ${tone} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** The same treatment for a link that acts as a button. */
export const adminButtonClass = (variant: 'primary' | 'secondary' = 'secondary') =>
  `${BTN_BASE} ${
    variant === 'primary'
      ? 'bg-accent-800 text-white hover:bg-accent-950'
      : 'border border-[#E8E6E1] bg-white text-ink hover:bg-[#FBFAF8]'
  }`;
