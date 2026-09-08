"use client";

import ModeFade from '@/components/home/ModeFade';
import SocialLinks from '@/components/SocialLinks';
import { useBrandPresence, useHomepageMode } from '@/store/useHomepageMode';

/**
 * Follow UNRWLY — the shop's channels, given a block of their own.
 *
 * WHY IT IS NO LONGER A ROW OF GLYPHS UNDER THE STATISTICS
 * That is exactly where it was, and the note back was that the icons were "too
 * tucked away". They were: four unlabelled circles beneath a wall of numbers,
 * competing with the section's own call to action and losing.
 *
 * So they get their own beat, directly after the reviews. The placement is the
 * argument's last step — the page has just said "here is our record and here is
 * what our customers said", and the natural next line is "and here is where to
 * keep an eye on us". Each destination is named as well as drawn, because the
 * Etsy link in particular has to be unmissable: it is the one that lets a
 * visitor verify everything above it, and asking them to recognise a glyph first
 * is a step that loses people.
 *
 * It stays deliberately short — a heading, a line, and a row of buttons. The
 * brief for this whole area was more prominence, not more page.
 *
 * Mode-aware: the Etsy and Pinterest destinations follow the selected store
 * (Adult and Kids run separate accounts); Instagram and Facebook are shared.
 */
export default function FollowUnrwlySection() {
  const { mode } = useHomepageMode();
  const { follow } = useBrandPresence();

  return (
    <ModeFade mode={mode}>
      <section aria-label="Follow UNRWLY" className="pb-4 pt-2 md:pb-6 md:pt-4">
        <div className="mx-auto max-w-[1440px] px-4 md:px-12">
          <div className="flex flex-col gap-7 rounded-panel border border-[#EAE6DF] bg-[#FCFCFA] px-6 py-10 md:flex-row md:items-center md:justify-between md:gap-12 md:px-12">
            <div>
              <h2 style={{ color: 'var(--color-ink)' }} className="type-section-title">
                {follow.title}
              </h2>
              <p className="type-section-subtitle mt-3 max-w-[42ch] text-neutral-500">
                {follow.subtitle}
              </p>
            </div>

            <SocialLinks variant="labelled" className="shrink-0 md:justify-end" />
          </div>
        </div>
      </section>
    </ModeFade>
  );
}
