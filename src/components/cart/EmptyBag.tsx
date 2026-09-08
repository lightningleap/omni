import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import EmptyBagMark from './EmptyBagMark';

/**
 * The empty shopping bag as it appears INSIDE the cart drawer — the looping
 * mark, a line of copy, and a way back to the shop.
 *
 * The illustration itself lives in `EmptyBagMark`, which the checkout page's
 * empty state shares. Only the words and the exit differ between the two.
 */
export default function EmptyBag({
  onContinue,
}: {
  /** Closes the drawer. Omit on a full page, where the link navigates instead. */
  onContinue?: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 py-16 text-center">
      <EmptyBagMark />

      <h3 className="type-h3 mt-7 text-[20px] text-ink">Your bag is empty</h3>
      <p className="type-body mt-2 max-w-[30ch] text-[13px] text-neutral-500">
        Nothing in here yet. Have a look at what is in the shop.
      </p>

      <Continue onContinue={onContinue} />
    </div>
  );
}

/**
 * The way out. A real <button> when it closes a drawer, a real <a> when it
 * navigates — never a div dressed as either, so the keyboard and screen reader
 * get the behaviour the element promises.
 *
 * `.btn-commerce` carries the geometry, colour, hover, press, focus and
 * disabled treatment, so this call site adds nothing but the arrow — which
 * slides on hover exactly as the homepage card CTA's does.
 */
function Continue({ onContinue }: { onContinue?: () => void }) {
  const className = 'btn-commerce group';
  const inner = (
    <>
      Continue Shopping
      <ArrowRight
        aria-hidden
        size={15}
        strokeWidth={2}
        className="transition-transform duration-[250ms] ease-out group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </>
  );

  if (onContinue) {
    return (
      <button type="button" onClick={onContinue} className={`${className} mt-8`}>
        {inner}
      </button>
    );
  }

  return (
    <Link href="/collections/all" className={`${className} mt-8`}>
      {inner}
    </Link>
  );
}
