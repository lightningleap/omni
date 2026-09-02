/**
 * Global brand canvas — the warm off-white base, fixed behind all content so it
 * stays continuous as the user navigates between pages.
 *
 * The decorative hand-drawn doodle texture has been removed for a clean,
 * distraction-free, product-first look. The subtle tactile grain now lives in
 * globals.css (`body::before`) so it spans the entire site.
 */
export default function BrandBackground() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#F8F6F2]" />;
}
