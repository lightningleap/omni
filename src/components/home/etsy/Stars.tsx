import { Star } from 'lucide-react';

/**
 * A five-star rating.
 *
 * Shared by every Etsy trust surface so a star is the same star everywhere —
 * same glyph, same warm accent, same spacing — rather than each section sizing
 * its own. The warm tone is the site's existing accent; nothing Etsy-orange is
 * introduced.
 *
 * The row carries ONE accessible label and the glyphs are hidden, so a screen
 * reader announces "5 out of 5 stars" instead of the word "star" five times.
 */
export default function Stars({
  rating,
  size = 16,
  className = '',
}: {
  rating: number;
  /** Glyph size in px. */
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          aria-hidden
          className={
            i < Math.round(rating)
              ? 'fill-[#E8956B] text-[#E8956B]'
              : 'fill-none text-neutral-300'
          }
        />
      ))}
    </span>
  );
}
