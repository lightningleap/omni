/**
 * Bring the database in line with what is actually published on Etsy.
 *
 *     node --env-file=.env scripts/fix-catalogue-visibility.mjs            # dry run
 *     node --env-file=.env scripts/fix-catalogue-visibility.mjs --apply    # write
 *
 * ── WHAT IT FIXES ───────────────────────────────────────────────────────────
 * Two things, both measured rather than assumed:
 *
 *   1. AUDIENCE MIS-TAG. Some products published to the UNRWLY Kids Etsy shop
 *      carry `audience: ADULT` on their row, so they surface in the Adult
 *      storefront and never in Kids. The Etsy shop a listing belongs to is the
 *      authority — that is where a customer actually finds it.
 *
 *   2. DRAFT PRODUCTS THAT ARE LIVE ON ETSY. Every storefront query filters
 *      `status: LIVE`, so a DRAFT row is invisible on the site even though the
 *      product is on sale on Etsy. These are flipped to LIVE and, where they
 *      have no collection, given one.
 *
 * ── SAFETY ──────────────────────────────────────────────────────────────────
 * Dry run by default: without `--apply` it writes nothing and only prints the
 * plan. With `--apply` it first saves every affected row's CURRENT values to
 * `scripts/.catalogue-rollback.json`, so the change can be reversed exactly.
 *
 * It only ever touches products whose `printifyId` appears in the generated
 * Etsy listings. A catalogue row that is deliberately unpublished and NOT on
 * Etsy is never made live by this script.
 */

import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const APPLY = process.argv.includes('--apply');
const INCLUDE_AUDIENCE = process.argv.includes('--include-audience');
const audienceSkipped = [];
const ROLLBACK = path.join(process.cwd(), 'scripts', '.catalogue-rollback.json');

// ── Read the generated listings (printifyId -> full Etsy title) ─────────────
const src = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'etsyListings.ts'), 'utf8');
const adultStart = src.indexOf('"adult": [');
const kidsStart = src.indexOf('"kids": [');

function listingsIn(chunk) {
  const out = new Map();
  const re = /"printifyId":\s*"([^"]+)"[\s\S]*?"title":\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(chunk)) !== null) out.set(m[1], m[2].replace(/\\"/g, '"'));
  return out;
}

const LISTINGS = {
  adult: listingsIn(src.slice(adultStart, kidsStart)),
  kids: listingsIn(src.slice(kidsStart)),
};

/**
 * Which collection a listing belongs in, from its own Etsy title.
 *
 * Ordered most specific first: "Ceramic Mug" must match Mugs before the generic
 * apparel fallback, and a kids product goes to Kid's whatever else its title
 * says. The keys are the collection NAMES already in the database — this script
 * never creates a collection, it only assigns to existing ones.
 */
const RULES = [
  // 'cup' and the shop's own 'Mg' typo included: one listing reads
  // 'Halloween Cat Mg | Hat On Vibes On Cup', which without them missed Mugs
  // and matched Hats on the words 'Hat On'.
  ['Mugs', /\bmugs?\b|\bmg\b|\bcups?\b|\btumblers?\b/i],
  ['Bottles', /\bbottles?\b|\bflask\b|\bcanteen\b/i],
  ['Bags', /\btotes?\b|\bbags?\b|\bweekender\b|\bbackpack\b|\bpouch\b|\bduffle\b/i],
  ['Hats', /\bhats?\b|\bcaps?\b|\bbeanie\b|\bvisor\b|\bbucket hat\b/i],
  ['Phone Case', /\bphone case\b|\biphone\b|\bsamsung\b|\bgalaxy\b/i],
  ['Pillows & Covers', /\bpillows?\b|\bcushions?\b|\bpillow case\b/i],
  ['Rugs & Mats', /\brugs?\b|\bmats?\b|\bdoormat\b/i],
  ['Towels', /\btowels?\b/i],
  ['Stationery', /\bnotebooks?\b|\bjournals?\b|\bstickers?\b|\bposters?\b|\bgreeting card\b|\bnotepad\b/i],
  ['Jewellery', /\bnecklaces?\b|\bearrings?\b|\bbracelets?\b|\bpendant\b/i],
  ['Tech Accessories', /\bmouse ?pad\b|\bdesk mat\b|\blaptop\b|\bairpods?\b/i],
  ['Home Decor', /\bcanvas\b|\bwall art\b|\bwall banner\b|\bpennants?\b|\btapestry\b|\bcandle\b|\bapron\b|\bblanket\b/i],
  ['Sports Wear', /\bleggings?\b|\bsports bra\b|\bathletic\b|\bjoggers?\b|\brash guard\b/i],
];

/** Adult apparel with no more specific match lands here — the largest existing collection. */
const APPAREL_FALLBACK = "Women's";

function collectionFor(title, audience) {
  if (audience === 'KIDS') return "Kid's";
  for (const [name, re] of RULES) if (re.test(title)) return name;
  return APPAREL_FALLBACK;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 15000,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const allIds = [...LISTINGS.adult.keys(), ...LISTINGS.kids.keys()];

  const collections = await prisma.collection.findMany({ select: { id: true, name: true } });
  const collectionByName = new Map(collections.map((c) => [c.name, c.id]));

  const products = await prisma.product.findMany({
    where: { printifyId: { in: allIds } },
    select: { id: true, printifyId: true, name: true, status: true, audience: true, collectionId: true },
  });

  const plan = [];

  for (const p of products) {
    const pid = String(p.printifyId);
    const onKids = LISTINGS.kids.has(pid);
    const title = (onKids ? LISTINGS.kids.get(pid) : LISTINGS.adult.get(pid)) ?? p.name;
    const shouldBe = onKids ? 'KIDS' : 'ADULT';

    const data = {};
    const why = [];

    // ── AUDIENCE IS OPT-IN, AND DELIBERATELY SO ─────────────────────────────
    // "Published to the Kids Etsy shop" does not mean "is a kids garment". The
    // rows this would move are Dad tees, Mom shirts and Nana/Oma mugs — adult
    // sizes merchandised in the Kids shop as gifts for the grown-ups buying
    // there. They are already LIVE, so flipping them would pull adult apparel
    // out of the Adult storefront and drop it into Kids, which is worse than
    // the state it is in now. Enable with --include-audience only after
    // deciding that is genuinely wanted.
    if (p.audience !== shouldBe) {
      if (INCLUDE_AUDIENCE) {
        data.audience = shouldBe;
        why.push(`audience ${p.audience}->${shouldBe}`);
      } else {
        audienceSkipped.push({ title: title.slice(0, 60), from: p.audience, to: shouldBe });
      }
    }
    if (p.status !== 'LIVE') {
      data.status = 'LIVE';
      why.push(`status ${p.status}->LIVE`);
    }
    if (!p.collectionId) {
      const name = collectionFor(title, data.audience ?? p.audience);
      const id = collectionByName.get(name);
      if (id) {
        data.collectionId = id;
        why.push(`collection -> ${name}`);
      } else {
        why.push(`NO COLLECTION MATCH (${name} missing)`);
      }
    }

    if (Object.keys(data).length > 0) {
      plan.push({ id: p.id, printifyId: pid, title: title.slice(0, 60), data, why, before: { status: p.status, audience: p.audience, collectionId: p.collectionId } });
    }
  }

  console.log(`${APPLY ? 'APPLYING' : 'DRY RUN — nothing will be written'}`);
  console.log(`Etsy listings: ${allIds.length}   matching products: ${products.length}   need changes: ${plan.length}\n`);

  const counts = {};
  for (const row of plan) for (const w of row.why) {
    const key = w.startsWith('collection') ? 'collection assigned' : w.split(' ')[0];
    counts[key] = (counts[key] || 0) + 1;
  }
  console.log('Change summary:', JSON.stringify(counts, null, 0), '\n');

  const byCollection = {};
  for (const row of plan) {
    const c = row.why.find((w) => w.startsWith('collection -> '));
    if (c) { const n = c.replace('collection -> ', ''); byCollection[n] = (byCollection[n] || 0) + 1; }
  }
  console.log('Collections that would be assigned:', JSON.stringify(byCollection, null, 0), '\n');

  for (const row of plan.slice(0, 60)) {
    console.log(`  ${row.why.join(' | ').padEnd(52)}  ${row.title}`);
  }
  if (plan.length > 60) console.log(`  … and ${plan.length - 60} more`);

  if (audienceSkipped.length) {
    console.log('\nHELD BACK — audience differs from the Etsy shop, not changed:');
    for (const a of audienceSkipped) console.log('  ' + a.from + '->' + a.to + '  ' + a.title);
    console.log('  (these are adult-sized items sold in the Kids shop; pass --include-audience to change them)');
  }

  const unmatched = plan.filter((r) => r.why.some((w) => w.startsWith('NO COLLECTION MATCH')));
  if (unmatched.length) console.log(`\n!! ${unmatched.length} product(s) could not be matched to an existing collection.`);

  if (APPLY && plan.length) {
    fs.writeFileSync(ROLLBACK, JSON.stringify(plan.map((r) => ({ id: r.id, before: r.before })), null, 2));
    console.log(`\nRollback written to ${ROLLBACK}`);

    let done = 0;
    for (const row of plan) {
      await prisma.product.update({ where: { id: row.id }, data: row.data });
      done += 1;
    }
    console.log(`Updated ${done} product(s).`);
  } else if (!APPLY) {
    console.log('\nRe-run with --apply to write these changes.');
  }
} finally {
  await pool.end();
}
