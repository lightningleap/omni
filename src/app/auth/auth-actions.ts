"use server"

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return redirect('/auth?error=Email and password are required.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password
  });

  if (error) {
    return redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  // Route by the role the app itself resolves (database row, or the break-glass
  // list). The copy stored in Supabase metadata is only a mirror for display —
  // no gate reads it — but keeping it fresh stops the account page from showing
  // a stale clearance after someone is promoted or demoted.
  const { role } = await getSessionUser();

  await supabase.auth.updateUser({ data: { role } });

  return redirect(role === 'ADMIN' ? '/admin/products' : '/account');
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password) {
    return redirect('/auth?error=Email and password are required.');
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: {
        full_name: name,
        // New accounts are always customers. Promotion happens afterwards, from
        // the admin panel — signing up can never grant admin rights.
        role: 'CUSTOMER'
      }
    }
  });

  if (error) {
    return redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  }

  // With email confirmation disabled, the user is auto-signed in.
  const { isAdmin } = await getSessionUser();
  return redirect(isAdmin ? '/admin/products' : '/account');
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  return redirect('/auth');
}
