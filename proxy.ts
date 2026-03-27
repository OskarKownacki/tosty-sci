import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Only protect the /dashboard route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check for session cookie - better-auth uses various cookie names
    const sessionToken = 
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("better-auth")?.value ||
      request.cookies.get("__Secure-auth.session")?.value;

    // If no session token found, redirect to login
    if (!sessionToken) {
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
