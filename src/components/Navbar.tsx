import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getVisibleCollections() {
  try {
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
        imageUrl: true,
      },
    });
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
    const [collections, adultGroups, kidsGroups] = await Promise.all([
      prisma.collection.findMany({ select: { id: true, name: true, handle: true, imageUrl: true } }),
      prisma.product.groupBy({ by: ["collectionId"], where: { status: "LIVE", audience: "ADULT" }, _count: true }),
      prisma.product.groupBy({ by: ["collectionId"], where: { status: "LIVE", audience: "KIDS" }, _count: true }),
    ]);

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
  let user = propUser;

  // Fallback fetch if not provided (safety)
  if (!user) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user: fetchedUser } } = await supabase.auth.getUser();
    user = fetchedUser;
  }

  const { adult, kids } = await getCollectionsByAudience();

  // Determine if user is admin based on environment variable
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase().trim() === masterEmail;

  const safeUser = user ? {
    id: user.id || (user as any).id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  return <NavbarClient adultCollections={adult} kidsCollections={kids} user={safeUser} />;
}
