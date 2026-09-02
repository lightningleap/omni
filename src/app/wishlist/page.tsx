import React from 'react';
import WishlistClient from './WishlistClient';
import { getSessionUser } from "@/lib/auth";

export default async function WishlistPage() {
  const { user, isAdmin } = await getSessionUser();


  const safeUser = user ? {
    id: user.id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  return <WishlistClient user={safeUser} />;
}
