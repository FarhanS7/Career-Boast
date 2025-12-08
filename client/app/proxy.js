import { protect } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/onboarding",
];

// Helper: check if request path starts with a protected route
function isProtectedRoute(pathname) {
  return protectedPaths.some((p) => pathname.startsWith(p));
}

export async function proxy(req) {
  const pathname = req.nextUrl.pathname;

  // Check protected routes
  if (isProtectedRoute(pathname)) {
    try {
      // Enforces authentication with Clerk
      await protect({ req });
    } catch (error) {
      // Redirect unauthenticated users to sign-in page
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);

      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}
