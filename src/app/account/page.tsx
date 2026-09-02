import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Ensure a Prisma User record exists for this Supabase auth user.
  // On first sign-up, the user only exists in Supabase Auth — this creates
  // the corresponding row in our database automatically.
  const dbUser = await prisma.user.upsert({
    where: { email: user.email! },
    create: {
      email: user.email!,
      name: user.user_metadata?.full_name || null,
      role: user.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
    },
    update: {},
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } }
      }
    }
  });

  return <AccountClient user={dbUser} />;
}
