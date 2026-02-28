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
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // 1. Subdomain Routing Logic
  const hostname = request.headers.get("host") || "";
  let baseDomain = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
  baseDomain = baseDomain.replace(/^https?:\/\//, "").replace(/"/g, "").replace(/'/g, "");

  // Check if it's a subdomain 
  // - It must end with the base domain
  // - It must not be EXACTLY the base domain or www.base domain
  // - We also ignore base localhost unless there's a clear subdomain
  const isSubdomain =
    hostname.endsWith(`.${baseDomain}`) &&
    hostname !== baseDomain &&
    hostname !== `www.${baseDomain}` &&
    !hostname.startsWith("localhost:") && // Ignore direct localhost:port access
    hostname !== "localhost";

  if (isSubdomain) {
    // Determine handle by removing the base domain suffix
    // e.g. "anam.rep-ai-nine.vercel.app" -> replace ".rep-ai-nine.vercel.app" -> "anam"
    const handle = hostname.replace(`.${baseDomain}`, "");

    if (handle && !pathname.startsWith(`/${handle}`)) {
      // Rewrite to /[handle]
      return NextResponse.rewrite(new URL(`/${handle}${pathname === "/" ? "" : pathname}`, request.url));
    }
  }

  // 2. Authentication Logic
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
    // We need to match everything except static files/api for subdomain routing
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
