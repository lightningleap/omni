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
 * ── THE SCALE LIVES IN CSS, NOT HERE ────────────────────────────────────────
 * The type steps are the `.type-admin-*` classes in `globals.css`, declared in
 * the same `@layer components` as the storefront's `.type-*` steps — so there
 * is ONE type system with two registers, and the studio's is legible beside
 * the shop's rather than buried in a dozen components:
 *
 *   .type-admin-title    page title (AdminPageHeader) — 20px, 24px from `md`
 *   .type-admin-stat     metric tile figure, tabular
 *   .type-admin-section  panel / section heading — 14px
 *   .type-admin-body     table rows, field values — 13px
 *   .type-admin-meta     hints, counts, timestamps — 12px
 *   .type-admin-label    column + field labels, small caps — 11px
 *   .type-admin-mono     ids, SKUs, tracking numbers — the ONLY monospace
 *
 * The components below compose those classes; none of them restates a size.
 * That is what lets a step be re-tuned in one place — the previous pass had
 * the numbers written out in each component, so "titles cap at 24px" was true
 * of the header and quietly false of three pages that built their own.
 *
 * The register is deliberately tighter than the storefront's. A shop page is
 * read at arm's length one section at a time; an orders table is scanned in
 * bulk by someone who works in it all day. It is also fixed rather than fluid:
 * the storefront's `clamp()` steps scale with the viewport, and a back office
 * wants the same density on a laptop as on a 27" display.
 *
 * Colour comes entirely from `[data-admin-surface]` in `globals.css`, which
 * pins the Adult accent so the back office keeps one identity regardless of
 * which storefront the signed-in admin last browsed. That selector also sets
 * the studio's heading defaults, so an unclassed `<h2>` in the admin gets the
 * 16px UI step rather than the storefront's 29px editorial one.
 */

/** Container width + gutters. One value, so no two pages align differently. */
export const ADMIN_SHELL = 'mx-auto w-full max-w-[1440px]';

/** The studio's hairline. Warmer than neutral-200, matching the storefront. */
export const ADMIN_RULE = '#E8E6E1';

/**
 * The studio's green, for the handful of places that cannot take a class.
 *
 * Recharts renders strokes and gradient stops from props, and the design
 * canvas is Konva drawing to a `<canvas>` — neither reads Tailwind utilities,
 * and Konva cannot resolve a `var()` either, because there is no CSSOM on a
 * canvas context. So a literal is unavoidable; what was avoidable is SIX of
 * them, which is what `#3E715C` typed into the Analytics chart, the Finance
 * chart and the design canvas's transform handles had become.
 *
 * This mirrors `--accent-700` — the ramp step for a graphic or body text on a
 * white ground (5.65:1). It is the same declaration style as `ADMIN_RULE`
 * above, which exists for the same reason: values inline styles need.
 *
 * If the palette moves, this moves with it. That is one edit rather than a
 * grep, which is the whole point.
 */
export const ADMIN_ACCENT = '#3E715C';

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
        <h1 className="type-admin-title text-ink">{title}</h1>
        {meta && (
          <div className="type-admin-meta mt-2 flex items-center gap-2 text-neutral-500">{meta}</div>
        )}
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
  /** ReactNode, not string: the Finance tiles prefix their label with an icon. */
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** `accent` for the headline figure of a page; `warn` for costs/negatives. */
  tone?: 'default' | 'accent' | 'warn';
}) {
  const valueTone =
    tone === 'accent' ? 'text-accent-800' : tone === 'warn' ? 'text-brand-terracotta' : 'text-ink';

  return (
    <AdminPanel padded>
      <p className="type-admin-label text-neutral-400">{label}</p>
      <p className={`type-admin-stat mt-2 ${valueTone}`}>{value}</p>
      {hint && <p className="type-admin-meta mt-2 text-neutral-400">{hint}</p>}
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
        className="type-admin-body h-10 w-full rounded-card border bg-[#FBFAF8] pl-10 pr-3 text-ink outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-accent-700 focus:bg-white focus:ring-2 focus:ring-accent-700/15"
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
      className={`type-admin-label whitespace-nowrap border-b bg-[#FBFAF8] px-4 py-3 text-neutral-500 ${className}`}
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
    <td className={`type-admin-body px-4 py-3.5 align-middle text-neutral-600 ${className}`} {...rest}>
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
      <p className="type-admin-section text-ink">{title}</p>
      {message && <p className="type-admin-meta mt-1.5 max-w-[42ch] text-neutral-400">{message}</p>}
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
  'type-admin-meta inline-flex h-9 items-center justify-center gap-2 rounded-card px-3.5 font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-700/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

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

/**
 * A heading inside a page — the name of a panel, a form group, a drawer
 * section.
 *
 * Every admin page was rolling its own: `text-lg font-semibold tracking-tight
 * uppercase italic` in Content, `text-sm font-bold uppercase tracking-widest
 * italic` in Finance, `text-xl` in one panel and `text-base` in the next. They
 * are all this now, so a section heading means the same thing on every screen.
 *
 * `as` exists because the right heading LEVEL depends on what encloses it —
 * a panel directly under the page title is an h2, a group inside that panel is
 * an h3 — and the outline should stay correct without changing the look. The
 * default is h2, which is what a top-level panel heading is.
 */
export function AdminSectionHeading({
  children,
  as: Tag = 'h2',
  className = '',
}: {
  children: React.ReactNode;
  as?: 'h2' | 'h3' | 'h4';
  className?: string;
}) {
  return <Tag className={`type-admin-section text-ink ${className}`}>{children}</Tag>;
}

/**
 * Machine strings — order ids, SKUs, Printify ids, tracking numbers.
 *
 * The ONLY monospace in the studio. `font-mono` used to be set on the whole
 * `/admin/analytics` and `/admin/products` pages, which put headings, prose and
 * buttons in a typewriter face; the ids that actually wanted it were mixed in
 * with everything that did not. Now the identifier asks for it and nothing
 * else gets it.
 */
export function AdminMono({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`type-admin-mono ${className}`}>{children}</span>;
}

/**
 * ── FORM CONTROLS ──────────────────────────────────────────────────────────
 *
 * One field chrome, shared by input, select and textarea.
 *
 * The admin had at least six: `rounded-card` beside `rounded-panel`, focus
 * rings at `ring-2`, `ring-4` and none, sizes from `text-xs` to `text-sm`, and
 * one price input in `font-mono` for no reason a reader could infer. The values
 * here are the search field's — the one control that was already right — so the
 * whole studio focuses, rounds and sizes identically.
 *
 * Height is set by padding rather than a fixed `h-`, so the same class works on
 * a one-line input and a multi-line textarea.
 */
export const ADMIN_FIELD =
  'type-admin-body w-full rounded-card border bg-white px-3 py-2.5 text-ink outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-accent-700 focus:ring-2 focus:ring-accent-700/15 disabled:cursor-not-allowed disabled:bg-[#FBFAF8] disabled:text-neutral-400';

export function AdminInput({
  className = '',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input style={{ borderColor: ADMIN_RULE }} className={`${ADMIN_FIELD} ${className}`} {...rest} />;
}

export function AdminTextarea({
  className = '',
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      style={{ borderColor: ADMIN_RULE }}
      className={`${ADMIN_FIELD} resize-y leading-relaxed ${className}`}
      {...rest}
    />
  );
}

export function AdminSelect({
  className = '',
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select style={{ borderColor: ADMIN_RULE }} className={`${ADMIN_FIELD} ${className}`} {...rest}>
      {children}
    </select>
  );
}

/**
 * A labelled field.
 *
 * The label is a real `<label>` bound to the control by id, which is what most
 * of these were missing — several were a `<p>` sitting above an unlabelled
 * input, so a screen reader announced "edit text, blank". `hint` is the line of
 * guidance underneath, and it is `aria-describedby`-linked rather than merely
 * adjacent.
 */
export function AdminField({
  label,
  htmlFor,
  hint,
  children,
  className = '',
}: {
  label: React.ReactNode;
  /** Must match the `id` of the control passed as `children`. */
  htmlFor: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="type-admin-label block text-neutral-500">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${htmlFor}-hint`} className="type-admin-meta text-neutral-400">
          {hint}
        </p>
      )}
    </div>
  );
}
