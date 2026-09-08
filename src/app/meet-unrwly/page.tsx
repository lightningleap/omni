import type { Metadata } from 'next';
import MeetUnrwlyClient from './MeetUnrwlyClient';
import { findStudioImage } from '@/lib/studioAssets';
import { ETSY_LISTINGS } from '@/data/etsyListings';

export const metadata: Metadata = {
  title: 'Meet UNRWLY',
  description:
    'UNRWLY is one person, a sketchbook and a stubborn habit of drawing the things nobody else puts on a shirt. The story behind the studio, the artwork and the print-on-demand approach.',
};

// No route segment config here on purpose. The root layout declares
// `dynamic = "force-dynamic"` for the whole tree (it reads StoreConfig and the
// session), so a `revalidate` on this page would contradict it rather than cache
// anything — and it would put this page out of step with /about, /faq and
// /contact, which all declare nothing for the same reason.

export default function MeetUnrwlyPage() {
  // Save a portrait as `public/brand/founder.jpg` (or .png / .webp) and it
  // appears at the top of the page. Until then the opening panel shows the brand
  // mark instead — see the note in MeetUnrwlyClient.
  const founderImage = findStudioImage('brand', 'founder');

  /**
   * Editorial imagery, resolved on the server so a missing file is a missing
   * SECTION rather than a broken <img>. Each is looked up by name; the client
   * only renders the panels it was actually given.
   */
  const studioImage = findStudioImage('brand', 'studio');
  const adultBanner = findStudioImage('brand', 'hero banner adult');
  const kidsBanner = findStudioImage('brand', 'hero banner kids');

  /**
   * The only numbers on this page, and both are counted rather than claimed.
   *
   * They are the live Etsy listings in `data/etsyListings.ts`, which is
   * generated from the Printify shops that publish those listings — so "87
   * designs" means 87 things a customer can actually go and buy today, and the
   * figure moves when the catalogue does.
   *
   * Nothing else numeric appears here. There is no founding year, customer
   * count, order total or country tally anywhere in this project, and inventing
   * one on the page whose entire job is to be believed would be the worst
   * possible place to start.
   */
  const designCounts = {
    adult: ETSY_LISTINGS.adult.length,
    kids: ETSY_LISTINGS.kids.length,
    total: ETSY_LISTINGS.adult.length + ETSY_LISTINGS.kids.length,
  };

  return (
    <MeetUnrwlyClient
      founderImage={founderImage}
      studioImage={studioImage}
      adultBanner={adultBanner}
      kidsBanner={kidsBanner}
      designCounts={designCounts}
    />
  );
}
