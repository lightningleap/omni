import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize Supabase Client for Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);

  // 4. ADMIN PROTECTION LOGIC
  // Middleware runs on the Edge, where Prisma is unavailable, so it can only
  // check that a session exists. Whether that session is actually an admin is
  // decided in src/app/admin/layout.tsx and in requireAdmin() — both of which
  // every admin page and action already goes through.
  if (url.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 5. ACCOUNT PROTECTION LOGIC
  // Prevent logged-out users from seeing the /account page
  if (url.pathname.startsWith("/account") && !user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return response;
}

// 6. MATCHER CONFIGURATION
// This ensures the middleware runs on all routes except static assets and images
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
