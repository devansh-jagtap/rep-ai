import { type NextRequest, NextResponse } from "next/server";
import { authInstance } from "@/auth-helper";

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await authInstance.api.getSession({ headers: request.headers });
  const isAuthenticated = !!session?.user?.id;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signInUrl = new URL("/auth/signin", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/auth/:path*",
    "/api/chat",
    "/api/onboarding/:path*",
    "/api/profile",
    "/api/leads/:path*",
    "/api/analytics/:path*",
  ],
};
