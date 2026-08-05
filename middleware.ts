import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  // Existing admin authentication
  if (nextUrl.pathname.startsWith("/admin")) {
    const session = req.cookies.get("admin_session");

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect user profile
  if (nextUrl.pathname.startsWith("/profile") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};
