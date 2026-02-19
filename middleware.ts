import { NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedRoutes = [
  "/dashboard",
  "/onboarding",
  "/api/chat",
  "/api/onboarding",
  "/api/profile",
  "/api/leads",
];

export default auth((request) => {
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !request.auth) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signInUrl = new URL("/auth/signin", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/api/chat",
    "/api/onboarding/:path*",
    "/api/profile",
    "/api/leads/:path*",
  ],
};
