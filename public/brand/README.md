# Brand assets

## The studio photograph — homepage welcome section

```
public/brand/studio.jpg   (.jpeg / .png / .webp / .avif also accepted)
```

The image on the right of the brand introduction, beside "INDEPENDENT STUDIO ·
DRAWN BY HAND". **In place** — the studio flat-lay (sketchbook of hand-drawn
figures, fabric swatches, laptop, workspace) at 1536 × 1024.

To replace it, overwrite this file. No code change and no restart in dev: the
page checks for it on render and falls back to a related image only if it is
missing.

The panel is **4:3 landscape**, capped at 500px wide (≈500 × 375), cropped from
the centre. A 3:2 source like the current one loses about 85px from each side,
so keep the subject — the sketchbook — near the middle of the frame and nothing
essential at the extreme edges. Export 1200 × 900 or larger to stay sharp on a
retina display.

Keep it natural: no text over it, no heavy filter, no crop so tight the
workspace disappears. One thing to watch — another label's branding in shot
(books, notebooks, bags) sits awkwardly on a page arguing UNRWLY is its own
brand. Reference books on a designer's desk read as authentic; a competitor's
logo front and centre does not.

It sits directly above the "Meet UNRWLY" button, so the two should feel like the
same story.

## The founder portrait — `/meet-unrwly`

```
public/brand/founder.jpg   (.jpeg / .png / .webp / .avif also accepted)
```

The photograph at the top of the Meet UNRWLY page. Until it exists, that panel
shows the UNRWLY mark on a plain plate instead — deliberately, rather than a
stock photo of somebody else, because a page whose whole argument is "a real
person makes this" cannot open on a stranger's face.

Export portrait (roughly 4:5) — the panel crops to that shape and centres it.
Anything works: at the desk, mid-drawing, holding a finished print. It does not
need to be a formal headshot, and it will read better if it isn't.

## The homepage banners — one per storefront mode

The wide brand plate that sits between the header and the hero. There is one per
mode, and only the selected mode's plate ever renders — they can never both
appear. Save the artwork here as exactly:

```
public/brand/unrwly-banner.png        ← Adult   (.jpg / .jpeg also accepted)
public/brand/unrwly-kids-banner.png   ← Kids    (.jpg / .jpeg also accepted)
```

Each renders full-bleed at its own natural aspect ratio, **capped at 380px
tall** — the page reads the real pixel size out of the file's own header, so the
two banners do not have to be the same shape and a differently-shaped
replacement needs no code change. Notes:

- **Export wide.** ~2000px on the long edge is right; the plate spans the full
  viewport, so anything narrower will soften on large displays.
- **Keep the lockup vertically centred, with margin above and below it.** The
  plate is capped at 380px, so on a wide screen the artwork is scaled to the
  full viewport width and then cropped top and bottom to fit that height. A
  lockup sitting near the top or bottom edge of the file will lose its ends;
  one centred in its canvas will not. Below the width where the natural height
  is already under 380px the whole file is shown uncropped, so nothing is ever
  cut on a phone or tablet.
- **PNG or JPEG.** Both are read for their dimensions, and `.png` wins if both
  exist for the same mode. Don't re-encode a JPEG export as PNG just to match a
  filename — that only costs quality. An `.svg` would need `BANNER_EXTENSIONS`
  in `src/app/page.tsx` widened, since it carries no pixel dimensions.
- **If a file is missing, that mode's banner simply doesn't render** and its
  homepage opens on the hero as before — the other mode is unaffected. The
  server logs a warning naming the mode and the expected path, so a typo'd
  filename is easy to spot — check the terminal running `npm run dev`.
- Both artworks are wide horizontal lockups, so on a phone they scale down to a
  narrow strip and the smaller tagline gets hard to read. If that matters, the
  usual fix is a second, squarer crop per mode shown below `md` — say the word
  and I'll wire it up.

### Adding a third mode

`BRAND_BANNER_FILES` in `src/app/page.tsx` maps mode → filename, label and alt
text. A new mode is one more entry there plus its file here; `BrandBannerSection`
needs no change.

## The logo

`unrwly-logo.png` is the studio's Adult mark. It is drawn by a single
component — `src/components/BrandMark.tsx` — which the desktop header, the mobile
drawer and the footer all use, so the mark is identical everywhere the Adult
storefront appears. Kids has its own lockup, drawn by the same component; see
"The Kids storefront has its own lockup" below.

### The logo has no colour of its own

This is the important part, and the reason there are two logo files here.

The artwork is drawn in `#809B71`, an olive sage. The site's accent is `#75AC95`
in the Adult storefront and `#2BF6C5` in Kids. A painted image cannot follow
that — its colour is baked into its pixels — so the header used to show a logo
that was subtly the wrong colour, and would have stayed wrong in Kids.

So the file is not painted. It is used as a **stencil**: its alpha channel
becomes a CSS mask and the fill comes from the accent token. The shape, the
edges and the anti-aliasing are the studio's file untouched; the colour is the
same `--accent-900` every button on the page reads. There is no logo colour to
keep in sync, which is why it can no longer drift.

- `unrwly-logo.png` — the studio's file. **This is the one to replace.**
- `unrwly-logo-mask.png` — derived from it. Same pixels, same alpha, colour
  planes discarded so it weighs 33 KB instead of 225 KB. Never edit it by hand.

### Dropping in a new logo

1. Save the new file here as `unrwly-logo.png`.
   - Trim the artboard to the mark itself: any built-in padding becomes uneven
     spacing in the header.
   - Keep it **monochrome**. The mask flattens the artwork to one colour by
     design — a two-colour mark would lose its second colour.
   - Export at least 3× the largest rendered height (the footer, 44px → ~132px
     tall). Bigger is fine; the mask is alpha-only and compresses well.
2. Regenerate the mask:
   ```
   node scripts/build-logo-mask.mjs
   ```
   It verifies that every alpha pixel round-trips unchanged and fails loudly if
   the silhouette shifted.
3. Open `src/components/BrandMark.tsx` and set `LOGO_ASPECT` to the new file's
   width ÷ height.

**An SVG is better still.** If the logo is ever supplied as one, point
`LOGO_MASK` at the `.svg` — it masks just as well and stays crisp at any size,
and step 2 goes away entirely. Better again: inline it and give its paths
`fill="currentColor"`.

All three placements pick up the change at once, each at its own height (header
26px, mobile drawer 32px, footer 44px — tune these in the `HEIGHT` map if the
real mark reads larger or smaller), and the fallback wordmark stops rendering.

### The Kids storefront has its own lockup

Kids is not the Adult mark recoloured — it is a different piece of artwork: a
wordmark with a black **KIDS** script beside it. Two colours, which one mask
cannot draw: a mask flattens artwork to a single colour by definition, so
stencilling the whole lockup would paint the script the accent colour too.

The rule above still holds, though; the artwork is just cut along the line the
rule cares about. The wordmark and the script are separate glyphs that never
touch, so each becomes its own stencil, and the two are stacked in one box:

```
public/brand/logo unrwly kids.png           ← the studio's file. This is the one to replace.
public/brand/unrwly-kids-wordmark-mask.png  ← derived. The accent-filled half.
public/brand/unrwly-kids-script-mask.png    ← derived. The black "KIDS" half.
```

**The wordmark takes `--accent-900`,** the same token the Kids buttons and chips
read — so it is the accent rather than a copy of it. The studio supplied the
artwork in `#01CC83`, a near-miss for the `#2BF6C5` the Kids storefront actually
uses; painting it would have left the mark permanently a shade off the page
around it. The **KIDS** script is filled with ink black, which is not a theme
colour and does not follow one — it stays black on both storefronts.

Both files are the studio's alpha, **cropped to the ink**: the artboard carries
~130px of empty space above and below the mark, and at a fixed render height
that padding would shrink the mark by about a third and sit it off-centre in the
header. Regenerate them after dropping in new artwork:

```
node scripts/build-kids-logo.mjs
```

The run refuses to write anything unless the alpha it wrote reassembles the
source exactly, no pixel landed in both stencils, and the artwork is still two
colours — new artwork with a gradient, a shadow or a third ink fails there
rather than silently losing a colour. It prints the trimmed aspect ratio; copy
that into `KIDS_LOGO_ASPECT` in `src/components/BrandMark.tsx`. Nothing else
changes — the header, the mobile drawer and the footer all render `BrandMark`,
which picks the lockup from the active storefront mode, so the Adult mark and
the Kids one can never appear on the wrong storefront.

Export at least 3× the largest rendered height (the footer's 44px), keep the
background transparent, and don't add a plate: the mark sits directly on the
header's `#FCFCFA` and the footer's white.

One knock-on worth knowing: the header's logo link paints an `accent-800` plate
on hover, which is `#0A5C4E` in Kids. The black "KIDS" script would vanish on
it, so that plate is Adult-only (see `NavbarClient`) — the hover lift and scale
still run in both.

### If a light-on-dark variant exists

The footer and header both sit on light backgrounds today, so one mark is
enough. If a reversed version is ever needed, add it as `unrwly-logo-light.svg`
and select it inside `BrandMark` — do not fork the component.
