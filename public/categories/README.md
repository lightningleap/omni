# Category & collection imagery

This is where the shop's real photography goes. **Save a file with the right
name and it replaces the placeholder — there is no code to change.** If a file
isn't here, the on-brand placeholder renders instead, so the site is never
broken while artwork is still being exported.

Accepted formats, in preference order: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.

---

## Browse Collections circles

The circular category rail below the three promotional windows. Each mode has its
own categories — Adult never shows Kids' and vice versa — so the filename is
prefixed with the store it belongs to:

```
public/categories/<mode>-<id>.jpg
```

### Adult (`src/data/homepage/adultHomepage.ts`)

| File                                          | Category                |
|-----------------------------------------------|-------------------------|
| `adult-all.jpg`                               | All                     |
| `adult-on-sale.jpg`                           | On Sale                 |
| `adult-french-with-attitude.jpg`              | French with Attitude    |
| `adult-vintage-botanical.jpg`                 | Vintage Botanical       |
| `adult-wildlife-and-oddities.jpg`             | Wildlife & Oddities     |
| `adult-feminist-and-unfiltered.jpg`           | Feminist & Unfiltered   |
| `adult-witchy-and-gothic.jpg`                 | Witchy & Gothic         |
| `adult-self-love-statements.jpg`              | Self-Love Statements    |
| `adult-totes-and-travel-bags.jpg`             | Totes & Travel Bags     |
| `adult-mugs-and-drinkware.jpg`                | Mugs & Drinkware        |
| `adult-hats-and-accessories.jpg`              | Hats & Accessories      |
| `adult-home-and-desk.jpg`                     | Home & Desk             |

### Kids (`src/data/homepage/kidsHomepage.ts`)

| File                                    | Category                  |
|-----------------------------------------|---------------------------|
| `kids-all.jpg`                          | All                       |
| `kids-dinosaur-world.jpg`               | Dinosaur World            |
| `kids-capybara-club.jpg`                | Capybara Club             |
| `kids-cats-and-mischief.jpg`            | Cats & Mischief           |
| `kids-imagination-and-positivity.jpg`   | Imagination & Positivity  |
| `kids-tiger-tales.jpg`                  | Tiger Tales               |
| `kids-woodland-friends.jpg`             | Woodland Friends          |
| `kids-halloween.jpg`                    | Halloween                 |

Adding a category later: add it to that mode's `browseCollections.items`, then
drop `<mode>-<its id>.jpg` here.

**Crop:** these render inside a circle, so export square and keep the subject
centred — anything in the corners is cut off.

---

## Making the site and Etsy look like one shop

This is the point of doing it by hand rather than pulling Etsy's images live.
Export the crops **from the same mockups the Etsy listings use**, so the two
storefronts share:

- the same background treatment (same paper/wall/flat-lay ground, not a mix)
- the same lighting and white balance
- the same garment scale and framing within the frame
- the same amount of the print visible — the artwork is the subject, the
  garment is the surface it is on

A useful test: put a website card and its Etsy listing thumbnail side by side. If
they look like two different shops, the crop or the ground is wrong.

**Don't** add typography, badges, borders or UI furniture to these files. The
site draws its own labels over them, and a second layer of text baked into the
image is what makes a product page look like an advert.

---

## The three promotional windows

Those cards are authored in `src/data/homepage/collections.ts`, and their
`image` / `productImage` fields still take URLs directly. To use local artwork,
save it here (any name) and set the field to its public path, e.g.
`image: '/categories/bestsellers.jpg'`.

The middle card of the row is the **video window** — see `videoSlot` in
`src/data/homepage/types.ts`. Its clips come from the admin StoreConfig
(`heroVideoUrls`), not from this folder; the `image` on that card is the poster
frame shown while the video loads.
