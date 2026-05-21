import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const { pathname } = url;

  const publicPaths = ["/login"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return;
  }

  if (pathname.startsWith("/api/auth")) {
    return;
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return;
  }

  const tokenCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");
  if (!tokenCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
}
