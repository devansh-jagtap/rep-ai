import { NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedRoutes = [
  "/dashboard",
  "/onboarding",
  "/api/chat",
  "/api/onboarding",
  "/api/profile",
  "/api/leads",
  "/api/analytics",
];

const authRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAuth = !!request.auth;

  // Check if the user is trying to access an authentication route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    if (isAuth) {
      // If user is already authenticated, redirect them to the dashboard
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
    // Allow unauthenticated users to access auth routes
    return NextResponse.next();
  }

  // Check if the user is trying to access a protected route
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isAuth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signInUrl = new URL("/auth/signin", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/auth/:path*",
    "/api/chat",
    "/api/onboarding/:path*",
    "/api/profile",
    "/api/leads/:path*",
  ],
};