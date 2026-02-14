import { NextRequest, NextResponse } from "next/server";
import { neonAuthMiddleware } from "@neondatabase/auth/next/server";

const authMiddleware = neonAuthMiddleware({
  loginUrl: "/auth/sign-in",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard and admin — redirect to login if not authenticated
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return authMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/sign-in", "/auth/sign-up"],
};
