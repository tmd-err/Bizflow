import { NextResponse, type NextRequest } from "next/server";

import { AUTH_TOKEN_KEY } from "@/lib/auth/session";

const protectedPrefixes = ["/dashboard", "/setup"];
const guestOnlyPrefixes = ["/login", "/register", "/forgot-password", "/reset-password"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (matchesPrefix(pathname, protectedPrefixes) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesPrefix(pathname, guestOnlyPrefixes) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setup/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
