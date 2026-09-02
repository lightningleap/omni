# Fonts

## Mellos Regular — the display face (licensed, not committed)

Mellos is the editorial display font for the whole site: hero headline, section
titles, editorial banners, campaign headings. It is a **licensed** typeface, so
the file is deliberately not in git.

### To install it

Drop the web font into this folder with these exact names:

```
public/fonts/mellos-regular.woff2   <- required
public/fonts/mellos-regular.woff    <- optional legacy fallback
```

That's it. The `@font-face` in [`src/app/globals.css`](../../src/app/globals.css)
already points at those paths, so it starts rendering on the next page load with
no code change.

If your licence only ships `.otf` / `.ttf`, convert to `.woff2` first — it is
~40% smaller and every browser the site supports understands it.

### Only load Regular

The type scale never asks for a bolder display cut (all three display steps are
weight 400), so a single Regular file is all that should ever live here. Do not
add extra weights or italics "just in case" — each one is an extra download on
first paint.

### What happens before it's installed

The `@font-face` fails to resolve and the family stack falls through to **Playfair
Display** (loaded via `next/font`), which occupies the same editorial-serif
register. The site looks intentional either way, and because both faces are
declared in one stack there is no layout shift when you add the real file.

## Manrope — the UI face

Loaded automatically from Google Fonts via `next/font` in
[`src/app/layout.tsx`](../../src/app/layout.tsx). Nothing to install. It powers
every interface element: navigation, product info, prices, buttons, forms,
footer, cart, checkout, account.
