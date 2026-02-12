import { NextRequest, NextResponse } from "next/server";
import { neonAuthMiddleware } from "@neondatabase/auth/next/server";

const authMiddleware = neonAuthMiddleware({
  loginUrl: "/auth/sign-in",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard — redirect to login if not authenticated
  if (pathname.startsWith("/dashboard")) {
    return authMiddleware(request);
  }

  // Redirect logged-in users away from auth pages
  if (pathname === "/auth/sign-in" || pathname === "/auth/sign-up") {
    const sessionCookie = request.cookies.get("__Secure-neon-auth.session_token")
      || request.cookies.get("neon-auth.session_token");
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/sign-in", "/auth/sign-up"],
};
