import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Only protect the /dashboard route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check if there's a session cookie (better-auth stores it as 'better-auth.session_token' or similar)
    const sessionCookie = request.cookies.get("better-auth.session_token");

    // If no session cookie, redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
