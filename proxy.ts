// ============================================================================
// Proxy (Next.js 16's middleware) — runs BEFORE every page is rendered.
//
// Two jobs:
//   1. Refresh the Supabase session cookie so an admin stays logged in across
//      page loads and browser refreshes.
//   2. Defense-in-depth: bounce logged-OUT visitors away from /admin to
//      /admin/login before the page even renders.
//
// The authoritative role check (is this user actually an admin?) happens on
// the SERVER in the dashboard layout via requireAdminContext(), because it
// needs a database lookup. This proxy only checks "is there a session?".
//
// PERFORMANCE: we use getSession() here, NOT getUser(). getSession() reads the
// session from the cookie locally and only reaches the network to refresh an
// EXPIRED token (preserving job #1) — so a normal page load costs no Supabase
// round-trip. getUser() would re-validate the JWT against the server on every
// single request (~0.3–1s), and the layout validates it again anyway as the
// real authority. Skipping that duplicate validation here roughly halves
// time-to-first-paint without weakening security: a forged cookie that slips
// past this gate is still rejected by requireAdminContext().
// ============================================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

// Admin routes that must stay reachable while logged out.
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/unauthorized",
];

function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Important: do not run code between createServerClient and getSession().
  // getSession() reads/refreshes the cookie locally instead of round-tripping
  // to Supabase on every request (see the PERFORMANCE note above).
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminArea && !isPublicAdminPath(pathname) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

// Run on every route except static assets and images.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
