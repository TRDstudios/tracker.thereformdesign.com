export function proxy(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  const publicPaths = ["/login", "/register"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return;
  }

  // Let NextAuth handle its own routes
  if (pathname.startsWith("/api/auth")) {
    return;
  }

  // Static files
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

  // This is a simplified proxy — actual session check is done in layout/page
  return;
}
