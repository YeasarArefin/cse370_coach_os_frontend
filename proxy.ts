import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // next-auth v4 stores the session as a JWT cookie
  // http  → next-auth.session-token
  // https → __Secure-next-auth.session-token
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const isAuthenticated = !!sessionToken;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/batches") ||
    pathname.startsWith("/students") ||
    pathname.startsWith("/attendance") ||
    pathname.startsWith("/fees") ||
    pathname.startsWith("/exams") ||
    pathname.startsWith("/assignments") ||
    pathname.startsWith("/notices");

  // Authenticated user on login/signup → redirect to dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Root page → dashboard if authenticated, landing page if not
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated user on a protected page → redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/batches/:path*",
    "/students/:path*",
    "/attendance/:path*",
    "/fees/:path*",
    "/exams/:path*",
    "/assignments/:path*",
    "/notices/:path*",
  ],
};
