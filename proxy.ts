import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const { pathname } = url;

  const publicPaths = ["/login", "/register"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return;
  }

  if (pathname.startsWith("/api/auth")) {
    return;
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/file") ||
    pathname.startsWith("/globe") ||
    pathname.startsWith("/next") ||
    pathname.startsWith("/vercel") ||
    pathname.startsWith("/window")
  ) {
    return;
  }

  const sessionToken = request.cookies.get("next-auth.session-token")?.value;
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
}
