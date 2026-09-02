/**
 * Etsy listings, generated — DO NOT EDIT BY HAND.
 *
 * Regenerate with:  node scripts/sync-etsy-listings.cjs
 *
 * Every entry below is a product that is currently published to Etsy from the
 * shop's own Printify store, carrying the listing URL Etsy assigned it. A
 * product that is not published to Etsy is not in this file, which is what lets
 * the storefront show only products a customer can actually go and find.
 *
 * Keyed by `printifyId`, which is the same value `Product.printifyId` holds —
 * that join is how a catalogue row becomes an Etsy-backed product.
 *
 * Sources:
 *   adult  https://www.etsy.com/shop/Unrwly
 *   kids   https://www.etsy.com/shop/UNRWLYkids
 *
 * The catalogue moves. Re-run the script when listings are added, retired or
 * repriced rather than editing entries here.
 */

/** One product as it is currently listed on Etsy. */
export interface EtsyListing {
  /** Matches `Product.printifyId` in the database. */
  printifyId: string;
  /** Etsy's own listing id. */
  etsyListingId: string;
  /** The listing title, verbatim. */
  title: string;
  /** The title trimmed to its product clause, for the card. */
  displayTitle: string;
  /** Lowest enabled variant price, in dollars. */
  price: number;
  /** The listing's primary image. */
  image: string;
  /** The exact listing URL. */
  etsyUrl: string;
}

export type EtsyListingsByMode = Record<'adult' | 'kids', EtsyListing[]>;

export const ETSY_LISTINGS: EtsyListingsByMode = {
  "adult": [
    {
      "printifyId": "670f1a56d1822ec7540bc47f",
      "etsyListingId": "4513369278",
      "title": "Tiger Art Racerback Tank | Tiger Illustration Tank Top",
      "displayTitle": "Tiger Art Racerback Tank",
      "price": 20.05,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2024/10/20241027183506-1ef94923-00a2-6df8-b713-1631ce4b283f.jpg",
      "etsyUrl": "https://www.etsy.com/listing/4513369278/tiger-art-racerback-tank-tiger"
    },
    {
      "printifyId": "67298cb053eaf0e39d0b91f5",
      "etsyListingId": "4542384206",
      "title": "Witch Graphic Distressed Baseball Cap",
      "displayTitle": "Witch Graphic Distressed Baseball Cap",
      "price": 31.18,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260722235612-1f18628e-adfd-602c-a184-2a0e761d735f.png",
      "etsyUrl": "https://www.etsy.com/listing/4542384206/witch-graphic-distressed-baseball-cap"
    },
    {
      "printifyId": "6738cf6f7463389a39063a82",
      "etsyListingId": "4524942730",
      "title": "Yes But No (Oui Mais Non) Sturdy Tote Bag",
      "displayTitle": "Yes But No (Oui Mais Non) Sturdy Tote Bag",
      "price": 20.13,
      "image": "https://images.printify.com/mockup/6738cf6f7463389a39063a82/103599/100877/yes-but-no-oui-mais-non-sturdy-tote-bag.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4524942730/yes-but-no-oui-mais-non-sturdy-tote-bag"
    },
    {
      "printifyId": "6746427fb62661e916095ec2",
      "etsyListingId": "4530612796",
      "title": "Pink Leopard Heads T-Shirt | Repeating Animal Print Tee",
      "displayTitle": "Pink Leopard Heads T-Shirt",
      "price": 26.7,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260630211159-1f174c85-5316-66ec-8dde-9ec9d3f29b29.png",
      "etsyUrl": "https://www.etsy.com/listing/4530612796/pink-leopard-heads-t-shirt-repeating"
    },
    {
      "printifyId": "675f2044321a7ce1d5045eb7",
      "etsyListingId": "4506124816",
      "title": "Shoebill Bird Graphic Tee | Wildlife Illustration, Bird Lover Shirt",
      "displayTitle": "Shoebill Bird Graphic Tee",
      "price": 28.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260504211047-1f147fdb-8931-6a2a-9ca4-f2df98d8e563.png",
      "etsyUrl": "https://www.etsy.com/listing/4506124816/shoebill-bird-graphic-tee-wildlife"
    },
    {
      "printifyId": "6843a96b30ecfb9f4806cbe0",
      "etsyListingId": "4519742069",
      "title": "Floral Heart Tank Top, Red Botanical Graphic Tank, Womens Romantic Summer Shirt, Comfort Colors Tank",
      "displayTitle": "Floral Heart Tank Top",
      "price": 21.76,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260715213830-1f180958-5b8a-6a18-ba4f-c2e0348dcdc2.png",
      "etsyUrl": "https://www.etsy.com/listing/4519742069/floral-heart-tank-top-red-botanical"
    },
    {
      "printifyId": "68459db6d25246190601527f",
      "etsyListingId": "4516072413",
      "title": "Oui Mais Non Weekender Bag (beige) |Bag with an Attitude, French Humor, Yes but No",
      "displayTitle": "Oui Mais Non Weekender Bag (beige)",
      "price": 46,
      "image": "https://images.printify.com/mockup/68459db6d25246190601527f/44271/12810/oui-mais-non-weekender-bag-beige-bag-with-an-attitude-french-humor-yes-but-no.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4516072413/oui-mais-non-weekender-bag-beige-bag"
    },
    {
      "printifyId": "688d1bec099f0be04a0c96e9",
      "etsyListingId": "4520905142",
      "title": "Classic Cap with Leaping Fox Design, Gift for Animal Lovers, Casual Summer Hat, Everyday Wear, Unique Gift, Original design",
      "displayTitle": "Classic Cap with Leaping Fox Design",
      "price": 29.99,
      "image": "https://images.printify.com/mockup/688d1bec099f0be04a0c96e9/105380/102307/classic-cap-with-leaping-fox-design-gift-for-animal-lovers-casual-summer-hat-everyday-wear-unique-gift-original-design.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4520905142/classic-cap-with-leaping-fox-design-gift"
    },
    {
      "printifyId": "68af1a4cc80547a2fc014bd6",
      "etsyListingId": "4506117053",
      "title": "Serval Cat Illustration Tee | Wild Serval Cat Graphic Shirt, Animal Lover",
      "displayTitle": "Serval Cat Illustration Tee",
      "price": 25.99,
      "image": "https://images.printify.com/mockup/68af1a4cc80547a2fc014bd6/21753/97933/serval-cat-illustration-tee-wild-serval-cat-graphic-shirt-animal-lover.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4506117053/unisex-serval-cat-art-tee-hand-drawn"
    },
    {
      "printifyId": "68b221a94e5b73c183084fea",
      "etsyListingId": "4516735898",
      "title": "Weekender Bag OuiMaisNon, Bag with an Attitude, French Humor, Yes but No",
      "displayTitle": "Weekender Bag OuiMaisNon",
      "price": 46,
      "image": "https://images.printify.com/mockup/68b221a94e5b73c183084fea/44271/12810/weekender-bag-ouimaisnon-bag-with-an-attitude-french-humor-yes-but-no.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4516735898/weekender-bag-ouimaisnon-bag-with-an"
    },
    {
      "printifyId": "68ddb7b567a9b4b0660c5b77",
      "etsyListingId": "4506124284",
      "title": "Poison Dart Frog T-Shirt | Original Frog Illustration Tee | Nature Lover Gift | Botanical Graphic Shirt | Wildlife Art Tee | UNRWLY",
      "displayTitle": "Poison Dart Frog T-Shirt",
      "price": 25,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260716054040-1f180d8e-1167-6cc6-9e9c-669f2c30dd57.png",
      "etsyUrl": "https://www.etsy.com/listing/4506124284/unisex-frog-art-t-shirt-poison-dart"
    },
    {
      "printifyId": "68ddc347f7c1658c4f0161c4",
      "etsyListingId": "4509322693",
      "title": "Vintage Tropical Adventure T-Shirt | Unisex Softstyle Tee, Nature Lover Gift, Eco-Friendly Apparel, Summer Tour Outfit, Unisex Fashion",
      "displayTitle": "Vintage Tropical Adventure T-Shirt",
      "price": 25,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2025/10/20251003131911-1f0a05b8-cabc-605a-85bd-8ec12c8b1484.png",
      "etsyUrl": "https://www.etsy.com/listing/4509322693/vintage-tropical-adventure-t-shirt"
    },
    {
      "printifyId": "68defbdaf6050b9ad00da18e",
      "etsyListingId": "4530447352",
      "title": "Je t'adore Skeleton Hands heart Tee | Women's Boxy Tee",
      "displayTitle": "Je t'adore Skeleton Hands heart Tee",
      "price": 28.78,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260714023839-1f17f2d1-f162-6baa-baaf-962004e13294.png",
      "etsyUrl": "https://www.etsy.com/listing/4530447352/je-tadore-skeleton-hands-heart-tee"
    },
    {
      "printifyId": "690787a53fb2b41f910b63f8",
      "etsyListingId": "4545798492",
      "title": "Wildflower Heart Shirt | Botanical Graphic Tee | Vintage Flower Shirt | UNRWLY Original Art",
      "displayTitle": "Wildflower Heart Shirt",
      "price": 25,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260728213820-1f18acca-6c14-6706-a1ad-ba8f5baede8c.png",
      "etsyUrl": "https://www.etsy.com/listing/4545798492/wildflower-heart-shirt-botanical-graphic"
    },
    {
      "printifyId": "6908b68f11566e84f603eb4b",
      "etsyListingId": "4516026612",
      "title": "Oui Mais Non Weekender Bag (Green) - French Humor Travel Tote",
      "displayTitle": "Oui Mais Non Weekender Bag (Green) - French Humor Travel Tote",
      "price": 46.6,
      "image": "https://images.printify.com/mockup/6908b68f11566e84f603eb4b/44271/12810/oui-mais-non-weekender-bag-green-french-humor-travel-tote.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4516026612/oui-mais-non-weekender-bag-green-french"
    },
    {
      "printifyId": "690960b17cb899fee800d6f6",
      "etsyListingId": "4506117275",
      "title": "The Oui Mais Non T-shirt with a (French) attitude",
      "displayTitle": "The Oui Mais Non T-shirt with a (French) attitude",
      "price": 20.7,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260506152826-1f149603-8a6d-6446-a8d9-128176ed0463.png",
      "etsyUrl": "https://www.etsy.com/listing/4506117275/the-oui-mais-non-t-shirt-with-a-french"
    },
    {
      "printifyId": "690fb20642f8ea74070419f5",
      "etsyListingId": "4506117911",
      "title": "Floral Anatomical Heart T-Shirt — Original Unisex Botanical Line Art",
      "displayTitle": "Floral Anatomical Heart T-Shirt — Original Unisex Botanical Line Art",
      "price": 28,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260722010527-1f185696-cd8d-67d8-b197-8ef470774217.png",
      "etsyUrl": "https://www.etsy.com/listing/4506117911/floral-anatomical-heart-t-shirt-original"
    },
    {
      "printifyId": "69253118456657cb99088449",
      "etsyListingId": "4506152743",
      "title": "My Other Bag Is Also Not A Birkin Bag Tote Bag | Canvas Tote, Funny Quote",
      "displayTitle": "My Other Bag Is Also Not A Birkin Bag Tote Bag",
      "price": 20.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260526232134-1f15959a-2e76-68f8-9843-e24443384d1c.png",
      "etsyUrl": "https://www.etsy.com/listing/4506152743/my-other-bag-is-also-not-a-birkin-bag"
    },
    {
      "printifyId": "6934f3c22e3cac24640afccd",
      "etsyListingId": "4506152841",
      "title": "Fueled by Coffee and Feminist rage Artsy Tote",
      "displayTitle": "Fueled by Coffee and Feminist rage Artsy Tote",
      "price": 20.99,
      "image": "https://images.printify.com/mockup/6934f3c22e3cac24640afccd/101409/93895/fueled-by-coffee-and-feminist-rage-artsy-tote.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4506152841/fueled-by-coffee-and-feminist-rage-artsy"
    },
    {
      "printifyId": "6941b5f5892a23a4d60b704b",
      "etsyListingId": "4506120603",
      "title": "Yes But No (Oui Mais Non) Sturdy Tote Bag (Green)",
      "displayTitle": "Yes But No (Oui Mais Non) Sturdy Tote Bag (Green)",
      "price": 25.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260521201002-1f155510-cfe7-6edc-a1ad-f2ddf1da8df9.png",
      "etsyUrl": "https://www.etsy.com/listing/4506120603/yes-but-no-oui-mais-non-sturdy-tote-bag"
    },
    {
      "printifyId": "69a798ea2ee5a692be00ca24",
      "etsyListingId": "4538704228",
      "title": "I Love You But I Love Me More T-Shirt | Self Love Graphic Tee",
      "displayTitle": "I Love You But I Love Me More T-Shirt",
      "price": 28,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260716064028-1f180e13-b85d-658c-b4de-9e755c20232a.png",
      "etsyUrl": "https://www.etsy.com/listing/4538704228/i-love-you-but-i-love-me-more-t-shirt"
    },
    {
      "printifyId": "69ae357c430a6183840783ee",
      "etsyListingId": "4511898195",
      "title": "Rainbow Moth 15oz Mug | Graphic Coffee Tea Mug, Bug Lover Design",
      "displayTitle": "Rainbow Moth 15oz Mug",
      "price": 16.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260527022704-1f159738-cefa-62c6-ae62-2e9971714f70.png",
      "etsyUrl": "https://www.etsy.com/listing/4511898195/rainbow-moth-15oz-mug-graphic-coffee-tea"
    },
    {
      "printifyId": "69fbb8f7ff28e7d4030abf48",
      "etsyListingId": "4506117371",
      "title": "Ironic Hat | Washed Mesh-Back Cap",
      "displayTitle": "Ironic Hat",
      "price": 19.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260526132452-1f159064-746a-6840-9abe-d2578887b813.jpg",
      "etsyUrl": "https://www.etsy.com/listing/4506117371/ironic-hat-washed-mesh-back-cap"
    },
    {
      "printifyId": "6a089dcd51e2b3a2d802e7c4",
      "etsyListingId": "4507451228",
      "title": "Poison Dart Frog Notebook Softcover Journal | Illustrated Frog Sketch",
      "displayTitle": "Poison Dart Frog Notebook Softcover Journal",
      "price": 18.99,
      "image": "https://images.printify.com/mockup/6a089dcd51e2b3a2d802e7c4/104026/102738/poison-dart-frog-notebook-softcover-journal-illustrated-frog-sketch.jpg?camera_label=context-5",
      "etsyUrl": "https://www.etsy.com/listing/4507451228/poison-dart-frog-notebook-softcover"
    },
    {
      "printifyId": "6a14b1f1cb8516b5720c4c56",
      "etsyListingId": "4511585657",
      "title": "Embrace the Chaos T-Shirt | Women's Graphic Tee",
      "displayTitle": "Embrace the Chaos T-Shirt",
      "price": 27.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260617165359-1f16a6d2-2c66-6820-a9ce-fa31f2217ce7.png",
      "etsyUrl": "https://www.etsy.com/listing/4511585657/embrace-the-chaos-t-shirt-womens-graphic"
    },
    {
      "printifyId": "6a164a15197a0f28d90f39b0",
      "etsyListingId": "4511830257",
      "title": "Blue Nostalgic Dinosaur Tee | Vintage Dinosaur Graphic T-Shirt",
      "displayTitle": "Blue Nostalgic Dinosaur Tee",
      "price": 28.99,
      "image": "https://images.printify.com/mockup/6a164a15197a0f28d90f39b0/18158/102048/blue-nostalgic-dinosaur-tee-vintage-dinosaur-graphic-t-shirt.jpg?camera_label=hanging-1",
      "etsyUrl": "https://www.etsy.com/listing/4511830257/blue-nostalgic-dinosaur-tee-vintage"
    },
    {
      "printifyId": "6a166432adc2e860a90ea843",
      "etsyListingId": "4512351887",
      "title": "je t'adore Tee | French Phrase T-Shirt, Minimal Typography Shirt",
      "displayTitle": "je t'adore Tee",
      "price": 26,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260527212352-1f15a125-bdb6-650e-9c0d-3e675096a568.png",
      "etsyUrl": "https://www.etsy.com/listing/4512351887/je-tadore-tee-french-phrase-t-shirt"
    },
    {
      "printifyId": "6a1890d4bb9dc25bbe07c7d8",
      "etsyListingId": "4512832902",
      "title": "Art Flounder Tee | Nautical Marine Illustration",
      "displayTitle": "Art Flounder Tee",
      "price": 28.78,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260528190417-1f15ac80-6311-6ffc-a05b-a663dea2b95a.png",
      "etsyUrl": "https://www.etsy.com/listing/4512832902/art-flounder-tee-nautical-marine"
    },
    {
      "printifyId": "6a19c50b9b04f4271a0c7184",
      "etsyListingId": "4513291132",
      "title": "Solo Vibrant Frog Art Tee - Unisex Jersey Short Sleeve, Nature Lover Gift, Casual Wear, Eco-Friendly Fashion, Animal Print T-Shirt",
      "displayTitle": "Solo Vibrant Frog Art Tee - Unisex Jersey Short Sleeve",
      "price": 29,
      "image": "https://images.printify.com/mockup/6a19c50b9b04f4271a0c7184/38608/102044/solo-vibrant-frog-art-tee-unisex-jersey-short-sleeve-nature-lover-gift-casual-wear-eco-friendly-fashion-animal-print-t-shirt.jpg?camera_label=front-2",
      "etsyUrl": "https://www.etsy.com/listing/4513291132/solo-vibrant-frog-art-tee-unisex-jersey"
    },
    {
      "printifyId": "6a19f0b59b65237b60025d9e",
      "etsyListingId": "4511929050",
      "title": "Joi de Vivre Tank Top | Joyful Typography Tee, Positive Vibes",
      "displayTitle": "Joi de Vivre Tank Top",
      "price": 27.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260529204125-1f15b9ec-279e-6b18-b50c-e2d5c9bf55c9.png",
      "etsyUrl": "https://www.etsy.com/listing/4511929050/joi-de-vivre-tank-top-joyful-typography"
    },
    {
      "printifyId": "6a1e3b4fd4fc2b31d710156d",
      "etsyListingId": "4520506534",
      "title": "Shine Bright Cotton Canvas Tote Bag | Pride Carry All",
      "displayTitle": "Shine Bright Cotton Canvas Tote Bag",
      "price": 24.47,
      "image": "https://images.printify.com/mockup/6a1e3b4fd4fc2b31d710156d/101409/94289/shine-bright-cotton-canvas-tote-bag-pride-carry-all.jpg?camera_label=context-back",
      "etsyUrl": "https://www.etsy.com/listing/4520506534/shine-bright-cotton-canvas-tote-bag"
    },
    {
      "printifyId": "6a205743bc4dad924d09486b",
      "etsyListingId": "4516102748",
      "title": "I Love You But I Love Me More T-Shirt | Self Love Graphic Tee",
      "displayTitle": "I Love You But I Love Me More T-Shirt",
      "price": 16.03,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260713011132-1f17e57c-946b-6de6-8b7c-22ea32efc431.png",
      "etsyUrl": "https://www.etsy.com/listing/4516102748/women-vintage-style-tee-self-love-t"
    },
    {
      "printifyId": "6a2071eff75ca55a1a0055a9",
      "etsyListingId": "4515904350",
      "title": "Shine Bright Tote Bag | Inspirational Quote All-Over Print",
      "displayTitle": "Shine Bright Tote Bag",
      "price": 25.99,
      "image": "https://images.printify.com/mockup/6a2071eff75ca55a1a0055a9/103599/100877/shine-bright-tote-bag-inspirational-quote-all-over-print.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4515904350/shine-bright-tote-bag-inspirational"
    },
    {
      "printifyId": "6a21762429df92509d022988",
      "etsyListingId": "4516358582",
      "title": "Girls Will Be Girls Tank Top | Resist Tank Top, Feminist Tank Top, Smash The Patriarchy Tank Tee, Women's Rights Tank",
      "displayTitle": "Girls Will Be Girls Tank Top",
      "price": 27.5,
      "image": "https://images.printify.com/mockup/6a21762429df92509d022988/105754/102834/girls-will-be-girls-tank-top-resist-tank-top-feminist-tank-top-smash-the-patriarchy-tank-tee-womens-rights-tank.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4516358582/girls-will-be-girls-renaissance-graphic"
    },
    {
      "printifyId": "6a21e9fdcb31404d08001db1",
      "etsyListingId": "4516692490",
      "title": "You Are Not a Drop in the Ocean tank top | Inspirational Quote Graphic Tank",
      "displayTitle": "You Are Not a Drop in the Ocean tank top",
      "price": 27.5,
      "image": "https://images.printify.com/mockup/6a21e9fdcb31404d08001db1/105754/102969/you-are-not-a-drop-in-the-ocean-tank-top-inspirational-quote-graphic-tank.jpg?camera_label=person-1-front",
      "etsyUrl": "https://www.etsy.com/listing/4516692490/you-are-not-a-drop-in-the-ocean-tank-top"
    },
    {
      "printifyId": "6a22366d0cdf48568f09813b",
      "etsyListingId": "4516725603",
      "title": "Girls Will Be Girls renaissance painting T-Shirt | vintage art portrait tee",
      "displayTitle": "Girls Will Be Girls renaissance painting T-Shirt",
      "price": 19.93,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260811033903-1f195363-2c2a-6d3a-bc42-3e8db7f99007.png",
      "etsyUrl": "https://www.etsy.com/listing/4516725603/girls-will-be-girls-renaissance-painting"
    },
    {
      "printifyId": "6a22461cde5d2b9583034173",
      "etsyListingId": "4520503420",
      "title": "Blue Rose Vine Illustration Tank Top | Floral Botanical Art",
      "displayTitle": "Blue Rose Vine Illustration Tank Top",
      "price": 27.5,
      "image": "https://images.printify.com/mockup/6a22461cde5d2b9583034173/105810/102834/blue-rose-vine-illustration-tank-top-floral-botanical-art.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4520503420/blue-rose-vine-illustration-tank-top"
    },
    {
      "printifyId": "6a23532f8ca6675818029d2e",
      "etsyListingId": "4517238270",
      "title": "Women's Vintage Racerback Tank | Latin Quote Floral Snake Fruit Tank",
      "displayTitle": "Women's Vintage Racerback Tank",
      "price": 30.38,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260608172227-1f1635e9-f082-625e-911d-52bf4ed8be0b.png",
      "etsyUrl": "https://www.etsy.com/listing/4517238270/womens-vintage-racerback-tank-latin"
    },
    {
      "printifyId": "6a26de1ab35d0a67ba03ac74",
      "etsyListingId": "4518508895",
      "title": "Unisex Rumi Quote Relaxed Tank Top | Inspirational Graphic Boxy Tank",
      "displayTitle": "Unisex Rumi Quote Relaxed Tank Top",
      "price": 27.5,
      "image": "https://images.printify.com/mockup/6a26de1ab35d0a67ba03ac74/105768/102834/unisex-rumi-quote-relaxed-tank-top-inspirational-graphic-boxy-tank.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4518508895/unisex-rumi-quote-relaxed-tank-top"
    },
    {
      "printifyId": "6a28a47d26549101eb05e3f2",
      "etsyListingId": "4519289778",
      "title": "Vintage Tropical Adventure Tank Top | Nature Lover, Eco-Friendly Unisex Summer Tee",
      "displayTitle": "Vintage Tropical Adventure Tank Top",
      "price": 27.05,
      "image": "https://images.printify.com/mockup/6a28a47d26549101eb05e3f2/105810/102834/vintage-tropical-adventure-tank-top-nature-lover-eco-friendly-unisex-summer-tee.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4519289778/vintage-tropical-adventure-tank-top"
    },
    {
      "printifyId": "6a29a19236880479c7098777",
      "etsyListingId": "4519738620",
      "title": "Pink Floral Heart Tank Top, Botanical Graphic Shirt for Women, Romantic Summer Tank, Original Hand-Drawn Heart Art",
      "displayTitle": "Pink Floral Heart Tank Top",
      "price": 27.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260730004808-1f18bb05-5665-692a-9a0f-3e863ba8d498.png",
      "etsyUrl": "https://www.etsy.com/listing/4519738620/pink-floral-heart-tank-top-botanical"
    },
    {
      "printifyId": "6a2f5ed29ee0bddb3b0ea6f1",
      "etsyListingId": "4522409416",
      "title": "Art Nouveau Botanical Illustration Tank Top | Vintage Floral Loose Fit",
      "displayTitle": "Art Nouveau Botanical Illustration Tank Top",
      "price": 27.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260714031031-1f17f319-296f-6786-822e-12009bc59783.png",
      "etsyUrl": "https://www.etsy.com/listing/4522409416/art-nouveau-botanical-illustration-tank"
    },
    {
      "printifyId": "6a30c98625d457554f09d07c",
      "etsyListingId": "4522640598",
      "title": "Woman with Green Botanical Hair T-Shirt | Embrace the Chaos Women's Tee",
      "displayTitle": "Woman with Green Botanical Hair T-Shirt",
      "price": 27,
      "image": "https://images.printify.com/mockup/6a30c98625d457554f09d07c/63303/127673/woman-with-green-botanical-hair-t-shirt-embrace-the-chaos-womens-tee.jpg?camera_label=lifestyle",
      "etsyUrl": "https://www.etsy.com/listing/4522640598/woman-with-green-botanical-hair-t-shirt"
    },
    {
      "printifyId": "6a30cd690b7754dd070ed87c",
      "etsyListingId": "4522804313",
      "title": "Embrace the Chaos Tank Top | Original Art for Women Racerback",
      "displayTitle": "Embrace the Chaos Tank Top",
      "price": 21.18,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260730003100-1f18badf-05b7-6788-8c0e-7ef5b120c7fe.png",
      "etsyUrl": "https://www.etsy.com/listing/4522804313/embrace-the-chaos-tank-top-original-art"
    },
    {
      "printifyId": "6a39cc2f26fb4aba3f048728",
      "etsyListingId": "4529472827",
      "title": "Floral Jungle Coffee Mug | Colorful Botanical Pattern, 11oz & 15oz I",
      "displayTitle": "Floral Jungle Coffee Mug",
      "price": 19.99,
      "image": "https://images.printify.com/mockup/6a39cc2f26fb4aba3f048728/105886/102755/floral-jungle-coffee-mug-colorful-botanical-pattern-11oz-15oz-i.jpg?camera_label=right",
      "etsyUrl": "https://www.etsy.com/listing/4529472827/floral-jungle-coffee-mug-colorful"
    },
    {
      "printifyId": "6a3c3dd0d71d6b94940f1bb1",
      "etsyListingId": "4527568981",
      "title": "Mother of Chickens Tank | Rooster Hen Illustration, Circular Farmyard Design",
      "displayTitle": "Mother of Chickens Tank",
      "price": 25.99,
      "image": "https://images.printify.com/mockup/6a3c3dd0d71d6b94940f1bb1/24621/101889/mother-of-chickens-tank-rooster-hen-illustration-circular-farmyard-design.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4527568981/mother-of-chickens-tank-rooster-hen"
    },
    {
      "printifyId": "6a3fecd41958bb0f40066d59",
      "etsyListingId": "4528922962",
      "title": "Mother of Chickens T-Shirt, Hand-Drawn Chicken Mom Tee, Backyard Chicken Keeper Gift",
      "displayTitle": "Mother of Chickens T-Shirt",
      "price": 16.03,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260721214144-1f1854cf-7c71-6da4-ba3b-1a27c67d6701.png",
      "etsyUrl": "https://www.etsy.com/listing/4528922962/mother-of-chickens-t-shirt-hand-drawn"
    },
    {
      "printifyId": "6a3fef1be7b8a9601e0f7e57",
      "etsyListingId": "4528947287",
      "title": "Vintage Floral Snake with Latin Quote T-Shirt",
      "displayTitle": "Vintage Floral Snake with Latin Quote T-Shirt",
      "price": 16.03,
      "image": "https://images.printify.com/mockup/6a3fef1be7b8a9601e0f7e57/18542/92547/vintage-floral-snake-with-latin-quote-t-shirt.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4528947287/vintage-floral-snake-with-latin-quote-t"
    },
    {
      "printifyId": "6a428aa95980c03e6d04e42b",
      "etsyListingId": "4529858396",
      "title": "Art Nouveau Botanical Illustration T-Shirt, Floral Graphic Tee, Nature Lover Shirt, Vintage Style Top, Unisex Fashion Apparel",
      "displayTitle": "Art Nouveau Botanical Illustration T-Shirt",
      "price": 25.99,
      "image": "https://images.printify.com/mockup/6a428aa95980c03e6d04e42b/18390/92547/art-nouveau-botanical-illustration-t-shirt-floral-graphic-tee-nature-lover-shirt-vintage-style-top-unisex-fashion-apparel.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4529858396/art-nouveau-botanical-illustration-t"
    },
    {
      "printifyId": "6a442a1cb038d24b320192a0",
      "etsyListingId": "4530587351",
      "title": "Floral Mosaic Hearts Women's Boxy Tee | Patterned Heart Grid Shirt",
      "displayTitle": "Floral Mosaic Hearts Women's Boxy Tee",
      "price": 28.78,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260630205523-1f174c60-314c-6d6a-8754-76b708675436.png",
      "etsyUrl": "https://www.etsy.com/listing/4530587351/floral-mosaic-hearts-womens-boxy-tee"
    },
    {
      "printifyId": "6a446c0ea03f30df7e084fbd",
      "etsyListingId": "4530717691",
      "title": "Je Ne Regrette Rien T-Shirt | Original French Art Tee | Paris Graphic Shirt | French Quote Tee | France Gift for Her",
      "displayTitle": "Je Ne Regrette Rien T-Shirt",
      "price": 27.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260716230420-1f1816aa-da22-6d08-97e5-a6fa160487d4.png",
      "etsyUrl": "https://www.etsy.com/listing/4530717691/je-ne-regrette-rien-t-shirt-original"
    },
    {
      "printifyId": "6a4507fdcd149f3f0401263f",
      "etsyListingId": "4530918413",
      "title": "Flounder Fish Tank, Hand-Drawn Coastal Graphic Tank, Ocean Lover Shirt, Beach and Marine Life Gift",
      "displayTitle": "Flounder Fish Tank",
      "price": 27.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260730151816-1f18c29e-3952-6e64-99d4-6aa38044f944.png",
      "etsyUrl": "https://www.etsy.com/listing/4530918413/flounder-fish-tank-hand-drawn-coastal"
    },
    {
      "printifyId": "6a4dc06aa0b9e315150c48e0",
      "etsyListingId": "4536194051",
      "title": "Girls Will Be Girls Crop Top | Renaissance Ladies Graphic",
      "displayTitle": "Girls Will Be Girls Crop Top",
      "price": 28.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260713003204-1f17e524-56cd-65a0-9913-f6c7556fe6d3.png",
      "etsyUrl": "https://www.etsy.com/listing/4536194051/girls-will-be-girls-crop-top-renaissance"
    },
    {
      "printifyId": "6a4eb21f990b37940c09c83a",
      "etsyListingId": "4534745528",
      "title": "Colorful Neon Wolf Head Tank Top | Psychedelic Animal Tee",
      "displayTitle": "Colorful Neon Wolf Head Tank Top",
      "price": 27.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260714024330-1f17f2dc-c9d4-6a10-9032-6a14558d8beb.png",
      "etsyUrl": "https://www.etsy.com/listing/4534745528/neon-wolf-head-tank-top-psychedelic"
    },
    {
      "printifyId": "6a54257b0c29518b1d01752c",
      "etsyListingId": "4536859172",
      "title": "Pink Introvert Tank Top for Women | Do Not Disturb Shirt | Leave Me Alone Graphic Tank | Sarcastic Summer Tank | Gift for Introverts",
      "displayTitle": "Pink Introvert Tank Top for Women",
      "price": 27.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260807140311-1f19268b-9e4e-6772-8a48-8a344e574e7a.png",
      "etsyUrl": "https://www.etsy.com/listing/4536859172/do-not-disturb-tank-top-womens-pink"
    },
    {
      "printifyId": "6a5572d404eddcf6510a8dd1",
      "etsyListingId": "4537916703",
      "title": "Joie de Vivre Fox Racerback Tank | French Saying Workout top",
      "displayTitle": "Joie de Vivre Fox Racerback Tank",
      "price": 21.18,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260714172813-1f17fa96-48aa-6144-a840-4ebdbfc9408e.png",
      "etsyUrl": "https://www.etsy.com/listing/4537916703/joie-de-vivre-fox-racerback-tank-french"
    },
    {
      "printifyId": "6a568ec8356e07b90f07ebf7",
      "etsyListingId": "4537931034",
      "title": "Rainbow Dove Tank Top, Peace Bird Graphic Racerback Workout Tee",
      "displayTitle": "Rainbow Dove Tank Top",
      "price": 19.88,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260729235702-1f18ba93-16c0-6332-91af-f65d428d0672.png",
      "etsyUrl": "https://www.etsy.com/listing/4537931034/rainbow-dove-tank-top-peace-bird-graphic"
    },
    {
      "printifyId": "6a613b31ef5148013c033d4e",
      "etsyListingId": "4542339754",
      "title": "Witchy Cat Sweatshirt, Cute Halloween Crewneck, Black Cat Sweater, Spooky Season Pullover, Witchcore Fall Sweatshirt, Cozy Cat Lover Gift",
      "displayTitle": "Witchy Cat Sweatshirt",
      "price": 35.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260722220245-1f186191-17b9-6bae-b429-ce73cdd22b42.png",
      "etsyUrl": "https://www.etsy.com/listing/4542339754/witchy-cat-sweatshirt-cute-halloween"
    },
    {
      "printifyId": "6a692ce9400d6bef25091fcc",
      "etsyListingId": "4545849422",
      "title": "Oui Mais Non Sweatshirt, French Girl Aesthetic , Paris Inspired Sweatshirt, Francophile Gift, Paris Vacation Sweater",
      "displayTitle": "Oui Mais Non Sweatshirt",
      "price": 29.04,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260728223849-1f18ad51-a424-636c-81c5-5e2f1a14bcc2.png",
      "etsyUrl": "https://www.etsy.com/listing/4545849422/oui-mais-non-sweatshirt-french-girl"
    },
    {
      "printifyId": "6a6ea3b4fd81788b400a64fe",
      "etsyListingId": "4551274273",
      "title": "Ghost Notebook | Halloween Journal | Cute Spooky Spiral Notebook | Witchy Stationery Gift | Ghost Lover Journal",
      "displayTitle": "Ghost Notebook",
      "price": 21.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260806220730-1f191e33-791e-6070-ba79-f68094b60bba.png",
      "etsyUrl": "https://www.etsy.com/listing/4551274273/cute-ghost-pattern-spiral-notebook"
    },
    {
      "printifyId": "6a6eb31c66351e8a9e076354",
      "etsyListingId": "4553240890",
      "title": "Hand-Drawn Ghost Pattern Mugs | Halloween Ceramic Mug, Color Handle",
      "displayTitle": "Hand-Drawn Ghost Pattern Mugs",
      "price": 17.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260810134908-1f194c24-2a85-6a2a-84da-da1f082ea4a6.png",
      "etsyUrl": "https://www.etsy.com/listing/4553240890/hand-drawn-ghost-pattern-mugs-halloween"
    },
    {
      "printifyId": "6a754ca31c96832f30011b32",
      "etsyListingId": "4553624678",
      "title": "Do Not Disturb T-shirt | Pink Retro Text, Minimal Typography Tee",
      "displayTitle": "Do Not Disturb T-shirt",
      "price": 28.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260810232749-1f195131-9977-6eee-8ae2-fa8be2952b81.png",
      "etsyUrl": "https://www.etsy.com/listing/4553624678/do-not-disturb-t-shirt-pink-retro-text"
    },
    {
      "printifyId": "6a754f6a02e809ed9e0f32c8",
      "etsyListingId": "4551609814",
      "title": "Do Not Disturb Pennant | Pink Retro Typography Wall Banner",
      "displayTitle": "Do Not Disturb Pennant",
      "price": 30.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260807034748-1f19212c-20a8-6534-8ae8-7a49f4e28c2e.png",
      "etsyUrl": "https://www.etsy.com/listing/4551609814/do-not-disturb-pennant-pink-retro"
    },
    {
      "printifyId": "6a7554da57bda25fb80994a0",
      "etsyListingId": "4553370764",
      "title": "Do Not Disturb hoodie | White pullover sweatshirt, Pink retro text",
      "displayTitle": "Do Not Disturb hoodie",
      "price": 34.82,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260810173128-1f194e15-1b37-65c6-b0d4-a64ba5eb4720.png",
      "etsyUrl": "https://www.etsy.com/listing/4553370764/do-not-disturb-hoodie-white-pullover"
    },
    {
      "printifyId": "6a7a53f6bc20771ce409d713",
      "etsyListingId": "4553866980",
      "title": "Fueled by Coffee T-Shirt | Funny Feminist Tee",
      "displayTitle": "Fueled by Coffee T-Shirt",
      "price": 21.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260810231107-1f19510c-4430-67e4-bf29-46f89a8e0219.png",
      "etsyUrl": "https://www.etsy.com/listing/4553866980/fueled-by-coffee-t-shirt-funny-feminist"
    },
    {
      "printifyId": "6a7a5f27b2126f827801dd9c",
      "etsyListingId": "4553612979",
      "title": "Floral Anatomical Heart T-Shirt — Original Unisex Botanical Line Art.",
      "displayTitle": "Floral Anatomical Heart T-Shirt — Original Unisex Botanical Line Art.",
      "price": 25.7,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260810234851-1f195160-9f3a-66a4-8f59-8ade85a46413.png",
      "etsyUrl": "https://www.etsy.com/listing/4553612979/floral-anatomical-heart-t-shirt-original"
    },
    {
      "printifyId": "6a7b297dcd62cf828a04f589",
      "etsyListingId": "4554539082",
      "title": "Girls Will Be Girls Hoodie | Girls Humor Pullover",
      "displayTitle": "Girls Will Be Girls Hoodie",
      "price": 36.65,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260811152925-1f195996-f2a0-69e0-a6af-022454308e41.png",
      "etsyUrl": "https://www.etsy.com/listing/4554539082/girls-will-be-girls-hoodie-girls-humor"
    },
    {
      "printifyId": "6a7c83a107ad39b7b2029329",
      "etsyListingId": "4554560436",
      "title": "Girls Will Be Girls Hoodie | Girls Humor Pullover",
      "displayTitle": "Girls Will Be Girls Hoodie",
      "price": 37,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260812143943-1f1965ba-8850-63c6-b6b0-0606c6bf4932.png",
      "etsyUrl": "https://www.etsy.com/listing/4554560436/girls-will-be-girls-hoodie-girls-humor"
    },
    {
      "printifyId": "6a7ca0984110f33cf2034eb8",
      "etsyListingId": "4554614507",
      "title": "Oui Mais Non Sweatshirt, French Girl Aesthetic , Paris Inspired Sweatshirt, Francophile Gift, Paris Vacation Sweater",
      "displayTitle": "Oui Mais Non Sweatshirt",
      "price": 39,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260812164309-1f1966ce-682e-61e6-b117-760bab38aa7e.png",
      "etsyUrl": "https://www.etsy.com/listing/4554614507/oui-mais-non-sweatshirt-french-girl"
    }
  ],
  "kids": [
    {
      "printifyId": "6a086888eeb1cc67a7072a8d",
      "etsyListingId": "4506116841",
      "title": "Rainbowsaurus Toddler Tee | Cute Purple Dinosaur, Rainbow Horn & Spikes",
      "displayTitle": "Rainbowsaurus Toddler Tee",
      "price": 22.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260518142550-1f152c57-80b4-68f6-965a-ca7d2e095029.png",
      "etsyUrl": "https://www.etsy.com/listing/4506116841/rainbowsaurus-toddler-tee-cute-purple"
    },
    {
      "printifyId": "6a086b01b7acc2cf22068357",
      "etsyListingId": "4506127054",
      "title": "I Love You Saurus toddler T-Shirt | Cute Pink Dinosaur Valentine design",
      "displayTitle": "I Love You Saurus toddler T-Shirt",
      "price": 22.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260712172510-1f17e16a-28ad-6958-bbab-8e68f5bcdcc9.png",
      "etsyUrl": "https://www.etsy.com/listing/4506127054/toddler-dinosaur-valentine-shirt-pink"
    },
    {
      "printifyId": "6a087cbb7f210439d40703dd",
      "etsyListingId": "4506154800",
      "title": "Astro-Saurus Dinosaur Toddler Tee | Space Dino Kids Shirt",
      "displayTitle": "Astro-Saurus Dinosaur Toddler Tee",
      "price": 20.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260526143535-1f159102-8651-61aa-8fa2-1223a3c143e9.png",
      "etsyUrl": "https://www.etsy.com/listing/4506154800/astro-saurus-dinosaur-toddler-tee-space"
    },
    {
      "printifyId": "6a087d9c51e2b3a2d802d7d0",
      "etsyListingId": "4506156428",
      "title": "Plantosaurus Dinosaur Tee | Toddler T-Shirt, Cute Plant Dino Graphic",
      "displayTitle": "Plantosaurus Dinosaur Tee",
      "price": 22.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260526225556-1f159560-e4f4-61dc-b8ff-2a1b0defe13e.png",
      "etsyUrl": "https://www.etsy.com/listing/4506156428/plantosaurus-dinosaur-tee-toddler-t"
    },
    {
      "printifyId": "6a087e8ceeb1cc67a707379a",
      "etsyListingId": "4506152273",
      "title": "Astronaut Riding Unicorn Kids Tee | The Sky Is Not The Limit",
      "displayTitle": "Astronaut Riding Unicorn Kids Tee",
      "price": 18.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260520203408-1f1548b4-0c74-69c2-97d7-8a33b4e50931.png",
      "etsyUrl": "https://www.etsy.com/listing/4506152273/astronaut-riding-unicorn-kids-tee-the"
    },
    {
      "printifyId": "6a0ba88d56c75ac490100d99",
      "etsyListingId": "4507454210",
      "title": "Making Magic Everyday Toddler Tee | Cute Wizard Cat, Rainbow Potion, Kids Shirt",
      "displayTitle": "Making Magic Everyday Toddler Tee",
      "price": 22.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260520204252-1f1548c7-8c44-6f5e-967a-025b5298836f.png",
      "etsyUrl": "https://www.etsy.com/listing/4507454210/making-magic-everyday-toddler-tee-cute"
    },
    {
      "printifyId": "6a0e195924c6463e180866a9",
      "etsyListingId": "4508679839",
      "title": "Grumpy Cat Toddler Tee | Cute Cat Illustration, 'Meow Means Meow'",
      "displayTitle": "Grumpy Cat Toddler Tee",
      "price": 22.23,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260520202909-1f1548a8-e18e-668c-84af-46dd107939bc.png",
      "etsyUrl": "https://www.etsy.com/listing/4508679839/grumpy-cat-toddler-tee-cute-cat"
    },
    {
      "printifyId": "6a162c57e997edc8890f5df4",
      "etsyListingId": "4511834418",
      "title": "Blue Dinosaur Toddler Tee | Dino Shirt",
      "displayTitle": "Blue Dinosaur Toddler Tee",
      "price": 22.99,
      "image": "https://images.printify.com/mockup/6a162c57e997edc8890f5df4/21521/99191/blue-dinosaur-toddler-tee-dino-shirt.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4511834418/blue-dinosaur-toddler-tee-dino-shirt"
    },
    {
      "printifyId": "6a1660d9d77396311e0d3b5d",
      "etsyListingId": "4512122774",
      "title": "Lil' Tiger toddler tee | Tiger Doodle kids shirt",
      "displayTitle": "Lil' Tiger toddler tee",
      "price": 21.25,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260608204300-1f1637aa-3470-674c-944e-e2d9d14a69f0.png",
      "etsyUrl": "https://www.etsy.com/listing/4512122774/lil-tiger-toddler-tee-tiger-doodle-kids"
    },
    {
      "printifyId": "6a1668c9b57fcd0c400fba65",
      "etsyListingId": "4512096689",
      "title": "Kids Fox Shirt, Joie de Vivre Youth Graphic Tee, Hand Drawn Woodland Animal Shirt, French Kids T-Shirt",
      "displayTitle": "Kids Fox Shirt",
      "price": 29.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260712181254-1f17e1d4-db85-6da4-9384-96e319587ddf.png",
      "etsyUrl": "https://www.etsy.com/listing/4512096689/kids-fox-shirt-joie-de-vivre-youth"
    },
    {
      "printifyId": "6a17574933108491c709efa7",
      "etsyListingId": "4512329828",
      "title": "Magic Hair Day Toddler Tee | Cute Kids Graphic, Positive Slogan",
      "displayTitle": "Magic Hair Day Toddler Tee",
      "price": 20.5,
      "image": "https://images.printify.com/mockup/6a17574933108491c709efa7/116464/99191/magic-hair-day-toddler-tee-cute-kids-graphic-positive-slogan.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4512329828/toddler-tee-hand-drawn-graphic-combed"
    },
    {
      "printifyId": "6a17934d4dfc88b2080ff1cf",
      "etsyListingId": "4512437274",
      "title": "I Heart Papa Toddler Tee | Kids Daddy Love Shirt",
      "displayTitle": "I Heart Papa Toddler Tee",
      "price": 22.99,
      "image": "https://images.printify.com/mockup/6a17934d4dfc88b2080ff1cf/21493/99191/i-heart-papa-toddler-tee-kids-daddy-love-shirt.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4512437274/i-heart-papa-toddler-tee-kids-daddy-love"
    },
    {
      "printifyId": "6a179d5c41b08d7aa0080a93",
      "etsyListingId": "4512641530",
      "title": "First Day of School Woodland Mouse Shirt | Nature kid Tee",
      "displayTitle": "First Day of School Woodland Mouse Shirt",
      "price": 25,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260806232332-1f191edd-6ff7-67c6-aa9e-3648e1085fdd.png",
      "etsyUrl": "https://www.etsy.com/listing/4512641530/first-day-of-school-woodland-mouse-shirt"
    },
    {
      "printifyId": "6a17a4ee6d8cbf2dd607ac95",
      "etsyListingId": "4512614172",
      "title": "Rainbow Dove Shine Bright Youth Tee | Inspirational Back to School Kids Shirt",
      "displayTitle": "Rainbow Dove Shine Bright Youth Tee",
      "price": 22.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260808021251-1f192cea-89ac-66ba-b0d3-16821b470de8.png",
      "etsyUrl": "https://www.etsy.com/listing/4512614172/rainbow-dove-youth-tee-shine-bright"
    },
    {
      "printifyId": "6a187913bb9dc25bbe07b8b3",
      "etsyListingId": "4512782131",
      "title": "Flower Child Toddler Tee | Cute Girl on Leaf, Butterflies",
      "displayTitle": "Flower Child Toddler Tee",
      "price": 22.99,
      "image": "https://images.printify.com/mockup/6a187913bb9dc25bbe07b8b3/21477/99191/flower-child-toddler-tee-cute-girl-on-leaf-butterflies.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4512782131/flower-child-toddler-tee-cute-girl-on"
    },
    {
      "printifyId": "6a189eeb6b650ce2880b4d9b",
      "etsyListingId": "4512858572",
      "title": "Mosaic Hearts Youth Tee | Rainbow Puzzle Heart Trio",
      "displayTitle": "Mosaic Hearts Youth Tee",
      "price": 28.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/05/20260528222222-1f15ae3b-2909-66e0-90ca-8668953500e7.png",
      "etsyUrl": "https://www.etsy.com/listing/4512858572/colorful-mosaic-hearts-youth-tee-rainbow"
    },
    {
      "printifyId": "6a18a01fb5a887488d0eaf12",
      "etsyListingId": "4515222561",
      "title": "Mint Green Cat Girls' Sleeveless dress | Magical Cat Dress, Birthday Gift, Playwear, Cute Casual Dress, Kids Fashion",
      "displayTitle": "Mint Green Cat Girls' Sleeveless dress",
      "price": 39.99,
      "image": "https://images.printify.com/mockup/6a18a01fb5a887488d0eaf12/79710/46079/mint-green-cat-girls-sleeveless-dress-magical-cat-dress-birthday-gift-playwear-cute-casual-dress-kids-fashion.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4515222561/mint-green-cat-girls-sleeveless-dress"
    },
    {
      "printifyId": "6a20b5bbff056782c6027b2f",
      "etsyListingId": "4516086791",
      "title": "Patriotic Dino Holding Flag Toddler Tee | Cute Blue Dinosaur 4th of July",
      "displayTitle": "Patriotic Dino Holding Flag Toddler Tee",
      "price": 22.99,
      "image": "https://images.printify.com/mockup/6a20b5bbff056782c6027b2f/21521/99191/patriotic-dino-holding-flag-toddler-tee-cute-blue-dinosaur-4th-of-july.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4516086791/patriotic-dino-holding-flag-toddler-tee"
    },
    {
      "printifyId": "6a26c211744ad27cae00b371",
      "etsyListingId": "4518596658",
      "title": "Tiger Dad Mug | Accent Coffee Mug 11oz 15oz",
      "displayTitle": "Tiger Dad Mug",
      "price": 19.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260608202702-1f163786-86aa-6946-92c6-7ece3ad9843a.png",
      "etsyUrl": "https://www.etsy.com/listing/4518596658/tiger-dad-mug-accent-coffee-mug-11oz"
    },
    {
      "printifyId": "6a26c22619ea94c7120f28ca",
      "etsyListingId": "4518594241",
      "title": "Tiger Mom doodle shirt Ringer Tee | hand-drawn tiger illustration",
      "displayTitle": "Tiger Mom doodle shirt Ringer Tee",
      "price": 26.13,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260608201654-1f16376f-defa-6de2-97ed-1677d7de4060.png",
      "etsyUrl": "https://www.etsy.com/listing/4518594241/tiger-mom-doodle-shirt-ringer-tee-hand"
    },
    {
      "printifyId": "6a26c22d744ad27cae00b372",
      "etsyListingId": "4518589967",
      "title": "Tiger Doodle Dad Tee Shirt  | hand-drawn tiger illustration Ringer Tee",
      "displayTitle": "Tiger Doodle Dad Tee Shirt",
      "price": 26.13,
      "image": "https://images.printify.com/mockup/6a26c22d744ad27cae00b372/102303/101491/tiger-doodle-dad-tee-shirt-hand-drawn-tiger-illustration-ringer-tee.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4518589967/tiger-doodle-dad-tee-shirt-hand-drawn"
    },
    {
      "printifyId": "6a277799a33b49539b004dc8",
      "etsyListingId": "4519205204",
      "title": "Made of Stardust Youth Tee | Celestial Text Graphic",
      "displayTitle": "Made of Stardust Youth Tee",
      "price": 20.41,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260807190000-1f192923-0dcc-6010-8ecb-1260ab89b5b8.png",
      "etsyUrl": "https://www.etsy.com/listing/4519205204/made-of-stardust-youth-tee-celestial"
    },
    {
      "printifyId": "6a29a934fe6ec8a6d110761c",
      "etsyListingId": "4519733911",
      "title": "Lil' Tiger Doodle Youth Tee | Kids Tiger Shirt",
      "displayTitle": "Lil' Tiger Doodle Youth Tee",
      "price": 23.88,
      "image": "https://images.printify.com/mockup/6a29a934fe6ec8a6d110761c/96595/110450/lil-tiger-doodle-youth-tee-kids-tiger-shirt.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4519733911/lil-tiger-doodle-youth-tee-kids-tiger"
    },
    {
      "printifyId": "6a2b2c0635ee8841da05d9e1",
      "etsyListingId": "4520440563",
      "title": "Tiger Dad Mug | Large Accent Coffee Mug with Tiger Doodle, 15oz, Father's Day Gift",
      "displayTitle": "Tiger Dad Mug",
      "price": 19.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260611214626-1f165def-f298-6b14-8740-16421736ef93.png",
      "etsyUrl": "https://www.etsy.com/listing/4520440563/tiger-dad-mug-large-accent-coffee-mug"
    },
    {
      "printifyId": "6a2b55b877da709ec903dfdc",
      "etsyListingId": "4522330128",
      "title": "Omasaurus Dinosaur Illustration Mug | Accent Coffee Mug 11oz 15oz",
      "displayTitle": "Omasaurus Dinosaur Illustration Mug",
      "price": 15.99,
      "image": "https://images.printify.com/mockup/6a2b55b877da709ec903dfdc/105883/102755/omasaurus-dinosaur-illustration-mug-accent-coffee-mug-11oz-15oz.jpg?camera_label=right",
      "etsyUrl": "https://www.etsy.com/listing/4522330128/omasaurus-dinosaur-illustration-mug"
    },
    {
      "printifyId": "6a2b63b14b2d21212403d74d",
      "etsyListingId": "4530616731",
      "title": "Pixel Blue Dino pattern Kids Tee | Retro pixel art dinosaur shirt",
      "displayTitle": "Pixel Blue Dino pattern Kids Tee",
      "price": 19.78,
      "image": "https://images.printify.com/mockup/6a2b63b14b2d21212403d74d/38287/101379/pixel-blue-dino-pattern-kids-tee-retro-pixel-art-dinosaur-shirt.jpg?camera_label=front",
      "etsyUrl": "https://www.etsy.com/listing/4530616731/pixel-blue-dino-pattern-kids-tee-retro"
    },
    {
      "printifyId": "6a2b64899d3025bcef01ec14",
      "etsyListingId": "4530656367",
      "title": "Grumpy Cat Sketch toddler tee | Cute cat illustration, 'Meow means Meow'",
      "displayTitle": "Grumpy Cat Sketch toddler tee",
      "price": 21.68,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260808151026-1f1933b4-94d8-6d6a-85ab-5a35502b08c7.png",
      "etsyUrl": "https://www.etsy.com/listing/4530656367/grumpy-cat-sketch-toddler-tee-cute-cat"
    },
    {
      "printifyId": "6a2c57f7aa0cfe0a810b844d",
      "etsyListingId": "4520929040",
      "title": "Capybara Soccer World Cup Germany Youth Tee | Kids Capy T-shirt",
      "displayTitle": "Capybara Soccer World Cup Germany Youth Tee",
      "price": 20,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260612190959-1f166924-ea84-65dc-a4c0-46076570587d.png",
      "etsyUrl": "https://www.etsy.com/listing/4520929040/capybara-soccer-world-cup-germany-kids"
    },
    {
      "printifyId": "6a2cd9ef9ee0bddb3b0c8beb",
      "etsyListingId": "4521321108",
      "title": "Capybara US Soccer Youth Jersey Tee | Cute Capybara Kid Soccer Shirt",
      "displayTitle": "Capybara US Soccer Youth Jersey Tee",
      "price": 20,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260613211757-1f1676d5-98a9-644c-abca-2a809978ee7b.png",
      "etsyUrl": "https://www.etsy.com/listing/4521321108/youth-soccer-jersey-tee-us-capybara-kid"
    },
    {
      "printifyId": "6a2e1a4fa4bf9acfe9031237",
      "etsyListingId": "4521609066",
      "title": "Beach Capybara with Flamingos Youth Tee | Pool Float, Palm Tree, Sunny Summer Design",
      "displayTitle": "Beach Capybara with Flamingos Youth Tee",
      "price": 20,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260712155630-1f17e0a3-f8e6-6312-a4c0-4668386699bb.png",
      "etsyUrl": "https://www.etsy.com/listing/4521609066/beach-capybara-with-flamingos-youth-tee"
    },
    {
      "printifyId": "6a2edc87b795ecdd0f019592",
      "etsyListingId": "4521816655",
      "title": "Don't Worry Be Capy capybara Youth Tee | Cute Animal Graphic",
      "displayTitle": "Don't Worry Be Capy capybara Youth Tee",
      "price": 20,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260614171606-1f16814b-aa1e-6774-9cb6-4ecf1fa417a0.png",
      "etsyUrl": "https://www.etsy.com/listing/4521816655/dont-worry-be-capy-capybara-youth-tee"
    },
    {
      "printifyId": "6a3032502467430e2e0c2921",
      "etsyListingId": "4522381721",
      "title": "Nanasaurus Dinosaur Illustration Mug | Accent Coffee Mug 11oz 15oz",
      "displayTitle": "Nanasaurus Dinosaur Illustration Mug",
      "price": 15.99,
      "image": "https://images.printify.com/mockup/6a3032502467430e2e0c2921/105883/102755/nanasaurus-dinosaur-illustration-mug-accent-coffee-mug-11oz-15oz.jpg?camera_label=right",
      "etsyUrl": "https://www.etsy.com/listing/4522381721/nanasaurus-dinosaur-illustration-mug"
    },
    {
      "printifyId": "6a3068f29398d489070dfce1",
      "etsyListingId": "4522525706",
      "title": "Dont Worry Be Capy Lounge Pants Kids | Capybara Comfy Pijama Pants",
      "displayTitle": "Dont Worry Be Capy Lounge Pants Kids",
      "price": 41.68,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/06/20260620003430-1f16c3fc-d1b2-6fda-8662-dec7c0cbef90.png",
      "etsyUrl": "https://www.etsy.com/listing/4522525706/dont-worry-be-capy-lounge-pants-kids"
    },
    {
      "printifyId": "6a35761208f480b9860f6e85",
      "etsyListingId": "4518967712",
      "title": "Blue Fox Kids Shirt, Cute Woodland Animal Tee, Fox Lover Gift for Kids, Forest Creature T-Shirt, Back to School Outfit, Nature Lover Tee",
      "displayTitle": "Blue Fox Kids Shirt",
      "price": 21.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260807000432-1f191f39-1662-6d12-b4c7-0e456ad37ed6.png",
      "etsyUrl": "https://www.etsy.com/listing/4518967712/blue-fox-kids-shirt-cute-woodland-animal"
    },
    {
      "printifyId": "6a519168daa87b76560f53e9",
      "etsyListingId": "4536199610",
      "title": "Electric Tiger Hoodie kids allover print | Children's Hoodie",
      "displayTitle": "Electric Tiger Hoodie kids allover print",
      "price": 53.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260712145838-1f17e022-9d0a-6254-9736-2a99b9c25b42.png",
      "etsyUrl": "https://www.etsy.com/listing/4536199610/electric-tiger-hoodie-kids-allover-print"
    },
    {
      "printifyId": "6a5e75489063a89207005b61",
      "etsyListingId": "4541117300",
      "title": "Little Ghoul Energy Shirt, Cute Zombie Girl Tee, Spooky Cute Graphic Tee, Kawaii Horror Gift",
      "displayTitle": "Little Ghoul Energy Shirt",
      "price": 20,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/07/20260721162358-1f185209-378d-690e-9f20-868ea25556ed.png",
      "etsyUrl": "https://www.etsy.com/listing/4541117300/little-ghoul-energy-shirt-cute-zombie"
    },
    {
      "printifyId": "6a725563b75441f70803fbd8",
      "etsyListingId": "4551036220",
      "title": "Cute Witches Kids Halloween Shirt | Hand Drawn Cartoon Witches T-shirt |  Youth Trick or Treat Shirt",
      "displayTitle": "Cute Witches Kids Halloween Shirt",
      "price": 20.67,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260806152833-1f191ab7-c63c-6d68-9e0e-0a26d784ecac.png",
      "etsyUrl": "https://www.etsy.com/listing/4551036220/cute-witches-kids-halloween-shirt-hand"
    },
    {
      "printifyId": "6a739ae37d0cf7e59d095e18",
      "etsyListingId": "4551054993",
      "title": "Kids Ghost Halloween Shirt, Just Booh It Tee, Cute Ghost T-Shirt, Funny Halloween Shirt for Girls & Boys, Toddler Spooky Season Outfit",
      "displayTitle": "Kids Ghost Halloween Shirt",
      "price": 20.5,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260806202057-1f191d45-5228-6a54-8ac9-9a146f67585e.png",
      "etsyUrl": "https://www.etsy.com/listing/4551054993/kids-halloween-ghost-shirt-just-booh-it"
    },
    {
      "printifyId": "6a739cbbef324454d708b732",
      "etsyListingId": "4553250522",
      "title": "Hand-Drawn Ghost Pattern Enamel Mug | Cute Halloween Ghosts",
      "displayTitle": "Hand-Drawn Ghost Pattern Enamel Mug",
      "price": 20.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260810141900-1f194c66-e942-66c4-b105-a609cb15b1cb.png",
      "etsyUrl": "https://www.etsy.com/listing/4553250522/hand-drawn-ghost-pattern-enamel-mug-cute"
    },
    {
      "printifyId": "6a74f429cbf92e13e90365b6",
      "etsyListingId": "4551255194",
      "title": "Be Witchin' Kids Tee | Cute Witch Characters, Halloween Shirt",
      "displayTitle": "Be Witchin' Kids Tee",
      "price": 20,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260806211353-1f191dbb-a3cb-662e-8179-9a146f67585e.png",
      "etsyUrl": "https://www.etsy.com/listing/4551255194/be-witchin-kids-tee-cute-witch"
    },
    {
      "printifyId": "6a75e862fdd12714190827dc",
      "etsyListingId": "4551662586",
      "title": "Ghost Cartoon Halloween Hoodie | Fall Spooky Graphic Youth Hoodie",
      "displayTitle": "Ghost Cartoon Halloween Hoodie",
      "price": 36.42,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260807152034-1f192738-9391-60ca-8d78-e20627554f45.png",
      "etsyUrl": "https://www.etsy.com/listing/4551662586/ghost-cartoon-halloween-hoodie-fall"
    },
    {
      "printifyId": "6a7622a3f69ca5980f0c5081",
      "etsyListingId": "4551757057",
      "title": "Kids Halloween Hoodie, Cute Ghost Youth Sweatshirt, Just Booh It Hoodie, Spooky Season Pullover, Fall Ghost Hoodie for Boys & Girls",
      "displayTitle": "Kids Halloween Hoodie",
      "price": 32.42,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260807183346-1f1928e8-654f-60e8-9c97-7695cb48f084.png",
      "etsyUrl": "https://www.etsy.com/listing/4551757057/kids-halloween-hoodie-cute-ghost-youth"
    },
    {
      "printifyId": "6a762d5187770019d10718fa",
      "etsyListingId": "4551792775",
      "title": "Made of Stardust Kids Sweatshirt | Space & Astronomy Gift for Little Astronauts",
      "displayTitle": "Made of Stardust Kids Sweatshirt",
      "price": 35.99,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260807193521-1f192972-0a3a-6bf0-93eb-d24febe6502c.png",
      "etsyUrl": "https://www.etsy.com/listing/4551792775/made-of-stardust-kids-sweatshirt-space"
    },
    {
      "printifyId": "6a763a4f95198794790417b8",
      "etsyListingId": "4554536837",
      "title": "Do Not Disturb Infant Bodysuit | Pink Retro Text Onesie",
      "displayTitle": "Do Not Disturb Infant Bodysuit",
      "price": 21.33,
      "image": "https://d123s6f1z9g2wk.cloudfront.net/files/2026/08/20260812142625-1f19659c-ca83-65b8-a9a9-5e26fae33d61.png",
      "etsyUrl": "https://www.etsy.com/listing/4554536837/do-not-disturb-infant-bodysuit-pink"
    }
  ]
};

/** Lookup by Printify id, scoped to one storefront so the two can never mix. */
export const ETSY_LISTINGS_BY_PRINTIFY_ID: Record<'adult' | 'kids', Map<string, EtsyListing>> = {
  adult: new Map(ETSY_LISTINGS.adult.map((l) => [l.printifyId, l])),
  kids: new Map(ETSY_LISTINGS.kids.map((l) => [l.printifyId, l])),
};
