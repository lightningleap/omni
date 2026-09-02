import { prisma, withDbRetry } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";
import { getSessionUser } from "@/lib/auth";

export async function getVisibleCollections() {
  try {
    const collections = await withDbRetry(() =>
      prisma.collection.findMany({
        select: {
          id: true,
          name: true,
          handle: true,
          imageUrl: true,
        },
      }),
    );
    return collections;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

// Split the collections into the two storefront sections (ADULT / KIDS).
// A collection appears under a section only if it actually has LIVE products
// for that audience — so the KIDS menu never shows an empty category.
export async function getCollectionsByAudience() {
  try {
    // The navigation renders on every page, so a one-second network blip here
    // silently empties every category menu on the site. Retry the whole trio
    // together: a partial result would be just as wrong as an empty one.
    const [collections, adultGroups, kidsGroups] = await withDbRetry(() =>
      Promise.all([
        prisma.collection.findMany({ select: { id: true, name: true, handle: true, imageUrl: true } }),
        prisma.product.groupBy({ by: ["collectionId"], where: { status: "LIVE", audience: "ADULT" }, _count: true }),
        prisma.product.groupBy({ by: ["collectionId"], where: { status: "LIVE", audience: "KIDS" }, _count: true }),
      ]),
    );

    const adultIds = new Set(adultGroups.map((g) => g.collectionId));
    const kidsIds = new Set(kidsGroups.map((g) => g.collectionId));

    const format = (c: (typeof collections)[number]) => ({ id: c.id, handle: c.handle, title: c.name, imageUrl: c.imageUrl });

    return {
      adult: collections.filter((c) => adultIds.has(c.id)).map(format),
      kids: collections.filter((c) => kidsIds.has(c.id)).map(format),
    };
  } catch (error) {
    console.error("Error grouping collections by audience:", error);
    return { adult: [], kids: [] };
  }
}

export default async function Navbar({ user: propUser }: { user?: any }) {
  // The layout normally passes the session down; resolve it here only when it
  // did not, so the role is decided in one place either way.
  const session = propUser ? null : await getSessionUser();
  const user = propUser ?? session?.user;
  const isAdmin = propUser ? propUser.role === 'ADMIN' : Boolean(session?.isAdmin);

  const { adult, kids } = await getCollectionsByAudience();

  const safeUser = user ? {
    id: user.id || (user as any).id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  return <NavbarClient adultCollections={adult} kidsCollections={kids} user={safeUser} />;
}
