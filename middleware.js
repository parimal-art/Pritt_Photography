import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");
  const isLogin = pathname === "/api/admin/auth/login";
  const isProtectedPage = pathname.startsWith("/admin/dashboard");

  if ((isApi && !isLogin) || isProtectedPage) {
    // Fast Edge check: Only verify the cookie is present.
    // The Node runtime handles strict cryptographic verification.
    const hasSession = request.cookies.has(COOKIE_NAME);

    if (!hasSession) {
      if (isApi) {
        return NextResponse.json(
          { ok: false, message: "Please sign in again." },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  const response = NextResponse.next();
  // Private area: never cached by browsers/CDNs, never indexed by search engines.
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
