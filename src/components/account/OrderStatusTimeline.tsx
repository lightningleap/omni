'use client';

import { Check } from 'lucide-react';
import type { OrderProgress } from '@/lib/orderStatus';

/**
 * The order progress timeline — horizontal on desktop, vertical on mobile.
 *
 * ── ONE MARKUP, TWO ORIENTATIONS ────────────────────────────────────────────
 * The same list renders both ways: a flex row from `md` up, a flex column below
 * it, with the connector switching between a horizontal and a vertical rule.
 * Two separate trees (one `hidden md:block`, one `md:hidden`) would double the
 * DOM and let the two drift apart, and a screen reader would meet the timeline
 * twice.
 *
 * ── STATUS IS NEVER COLOUR ALONE ────────────────────────────────────────────
 * Every step prints its label, completed steps carry a check mark, and the
 * current step is named in the visually hidden sentence at the top. A customer
 * who cannot distinguish the mint from the neutral still gets the whole state
 * from the text — colour only makes it faster to read, it never carries the
 * meaning by itself.
 *
 * The list is `<ol>` because the steps are ordered and that ordering is the
 * information. `aria-current="step"` marks where the order actually is.
 *
 * ── ANIMATION ───────────────────────────────────────────────────────────────
 * Two things move, both once, both on load: the accent progress line grows to
 * its final length over 700ms, and the current step's ring breathes. Nothing
 * loops except that ring, and it changes only opacity and scale on a
 * pseudo-element, so it never affects layout. Under `prefers-reduced-motion`
 * the line is simply drawn at its final length and the ring holds still — the
 * timeline says exactly the same thing, it just says it immediately.
 */
export default function OrderStatusTimeline({ progress }: { progress: OrderProgress }) {
  const { steps, currentLabel, isException } = progress;
  const pct = Math.round(progress.progress * 100);

  return (
    <section aria-label="Order progress" className="order-timeline">
      {/* The whole state of the order in one sentence, for a screen reader that
          would otherwise have to assemble it from five list items. */}
      <p className="sr-only">
        {isException
          ? `This order is ${currentLabel.toLowerCase()}.`
          : `Current status: ${currentLabel}.`}
      </p>

      <ol className="relative flex flex-col gap-0 md:flex-row md:gap-0">
        {steps.map((step, i) => {
          const done = step.state === 'done';
          const current = step.state === 'current';
          const active = done || current;

          return (
            <li
              key={step.status}
              aria-current={current ? 'step' : undefined}
              className="relative flex flex-1 gap-4 pb-8 last:pb-0 md:flex-col md:gap-0 md:pb-0"
            >
              {/* ── CONNECTOR ──────────────────────────────────────────────
                  Drawn by every step except the first, and it reaches BACKWARDS
                  to the one before. Drawing it forwards would mean the last
                  step trails a line into nothing. */}
              {i > 0 && (
                <span
                  aria-hidden
                  className="absolute left-[11px] top-[-2rem] h-8 w-px bg-[#EAE6DF] md:left-auto md:right-1/2 md:top-[11px] md:h-px md:w-full"
                >
                  {/* The accent overlay is RENDERED only when the step is
                      reached, never merely scaled to zero. The grow keyframe
                      uses `both`, so a line hidden by a transform would be
                      driven straight back to full length by the animation fill
                      and every connector would read as complete. */}
                  {active && (
                    <span className="order-timeline-line block h-full w-full origin-top bg-accent md:origin-left" />
                  )}
                </span>
              )}

              {/* ── MARKER ─────────────────────────────────────────────────
                  24px, which is the smallest a check reads cleanly at. The
                  current step is a filled ring rather than a check, because it
                  has not finished. */}
              <span
                aria-hidden
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                  done
                    ? 'border-accent bg-accent text-accent-on'
                    : current
                      ? 'order-timeline-pulse border-accent bg-white text-accent-ink'
                      : 'border-[#EAE6DF] bg-white text-transparent'
                }`}
              >
                {done ? (
                  <Check size={13} strokeWidth={2.5} />
                ) : (
                  <span
                    className={`h-2 w-2 rounded-full ${current ? 'bg-accent' : 'bg-[#EAE6DF]'}`}
                  />
                )}
              </span>

              <div className="min-w-0 md:mt-4 md:pr-6">
                <p
                  className={`text-[13px] font-semibold leading-tight ${
                    active ? 'text-ink' : 'text-neutral-400'
                  }`}
                >
                  {step.label}
                </p>

                {/* Only rendered where a real timestamp exists — see the note in
                    `lib/orderStatus.ts` on why most steps have none. */}
                {step.at && (
                  <p className="mt-1.5 text-[11px] leading-snug text-neutral-400">
                    <time dateTime={step.at.toISOString()}>
                      {step.at.toLocaleDateString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' · '}
                      {step.at.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* An order that has left the forward path says so in words, under the
          timeline it no longer describes. */}
      {isException && (
        <p className="mt-6 border-t border-[#EAE6DF] pt-5 text-[13px] text-neutral-500">
          This order is <span className="font-semibold text-ink">{currentLabel.toLowerCase()}</span>.
          {' '}Contact us if you need anything about it.
        </p>
      )}

      <span className="sr-only">{pct}% of the way through the order path.</span>
    </section>
  );
}
