# Etsy review assets

Product thumbnails and customer photos for the review section on the homepage
(`src/components/home/etsy/EtsyReviewCard.tsx`).

## The rule that matters

**Only put real images here.** This section's entire job is to prove that real
people have bought from this shop. A stock photo, or a studio mockup dressed up
as a customer's own snapshot, would undo that in one glance — and it is exactly
the kind of thing customers notice. If there is no genuine image for a review,
leave it out: the card is built to look complete without one.

---

## Where the review data lives

All of it is in `src/data/brand/presence.ts`, one entry per real Etsy review.

A fully-filled review looks like this:

```ts
{
  id: 'adult-michaela',
  rating: 5,
  quote: 'I love it, thanks a lot!',
  author: 'Michaela',
  date: 'Jun 11, 2026',
  product: {
    name: 'Oui Mais Non Weekender Bag',
    image: '/etsy/oui-mais-non-weekender-bag.jpg',   // optional
    href: 'https://www.etsy.com/listing/…',          // optional
  },
  customerPhoto: {                                    // optional
    src: '/etsy/adult-michaela.jpg',
    alt: 'The weekender bag packed and photographed by the customer',
  },
  sellerResponse: '…',                                // optional
}
```

Only `id`, `rating` and `quote` are required. **Every other field renders the
moment it exists and is silently skipped when it doesn't** — so filling these in
is transcription work, never a code change.

## What is currently missing

Worth doing, in rough order of how much each adds:

1. **Reviewer names and dates for the other Adult reviews.** Four of the five
   recorded reviews are quotes with no attribution. A name and a date is the
   difference between a testimonial and a receipt.
2. **The remaining three Adult reviews.** The shop has 8; five are recorded.
3. **The Kids customer photo.** Tanja's review has a customer-uploaded photo on
   Etsy. Save it as `public/etsy/kids-tanja.jpg` and add the `customerPhoto`
   block above.
4. **Product thumbnails and listing links.** These turn "what they said" into
   "what they bought", which is the strongest single element in the card.
5. **The Etsy seller response on the Kids review**, if you want it shown — it
   reads as two people rather than a billboard.

> Never pair a name you know with a quote you cannot confirm they wrote. A
> mismatched attribution is a fabricated review, and this is the one section
> where that would do real damage.

## Image specs

Thumbnails render at 56 × 56 in a rounded square, cropped to fill. Export square,
around 200px, and keep the subject centred.

## Statistics

The rating, review count, sales figure and time on Etsy are transcribed by hand
in the same file, so they need updating when the shops move:

- Adult — <https://www.etsy.com/shop/Unrwly>
- Kids — <https://www.etsy.com/shop/UNRWLYkids>

Adult and Kids figures must never be mixed. They live in two separate objects
(`adultPresence` / `kidsPresence`) precisely so that they cannot be.
