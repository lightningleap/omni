/**
 * One step of the checkout, as a card.
 *
 * ── WHY CARDS RATHER THAN RULED SECTIONS ────────────────────────────────────
 * The form used to be three blocks separated by hairlines on the page ground.
 * That reads as one continuous document, so a shopper scanning it cannot tell
 * where "contact" ends and "shipping" begins without reading the headings —
 * and on a checkout, knowing how many steps are left is most of what keeps
 * someone going.
 *
 * Each step is now a bordered white plate with its own number. The number is
 * the cheapest possible progress indicator: three plates numbered 1–3 tell you
 * the shape of the task before you have read a single label.
 *
 * ── RESTRAINT ───────────────────────────────────────────────────────────────
 * `rounded-panel` (8px) and a single hairline, no shadow. A checkout with
 * elevated, heavily rounded cards reads as a series of dialogs, each asking to
 * be dealt with separately, which is the opposite of a flow.
 */
export default function CheckoutCard({
  step,
  title,
  description,
  headingId,
  children,
}: {
  /** Position in the flow. Rendered, so the reader can see how far in they are. */
  step: number;
  title: string;
  /** One line of context, where a step genuinely needs it. */
  description?: string;
  headingId: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="rounded-panel border border-[#EAE6DF] bg-white p-5 md:p-7"
    >
      <div className="mb-5 flex items-start gap-3">
        {/* Decorative: the heading below already carries the step's identity,
            and a screen reader announcing "1" before "Contact" adds nothing. */}
        <span
          aria-hidden
          className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#EAE6DF] text-[11px] font-semibold text-neutral-500"
        >
          {step}
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="text-[15px] font-semibold leading-tight text-ink">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-[12px] leading-snug text-neutral-400">{description}</p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}
