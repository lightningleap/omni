import type { Metadata } from 'next';
import MeetUnrwlyClient from './MeetUnrwlyClient';
import { findStudioImage } from '@/lib/studioAssets';

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

  return <MeetUnrwlyClient founderImage={founderImage} />;
}
