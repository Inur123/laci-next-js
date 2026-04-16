import { NextResponse, type NextRequest } from "next/server";

/**
 * OPTIMIZED MIDDLEWARE
 * 
 * Menggunakan fetch ke /api/auth/get-session karena middleware
 * berjalan di Edge Runtime dan tidak bisa import Prisma secara langsung.
 * 
 * Optimasi: Skip fetch untuk halaman login/register jika tidak ada cookie session.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // OPTIMASI: Cek cookie dulu sebelum fetch
  // Jika tidak ada cookie session, skip fetch (hemat ~200-400ms)
  const sessionCookie = request.cookies.get("better-auth.session_token") 
    || request.cookies.get("__Secure-better-auth.session_token");

  // Jika di halaman auth dan TIDAK ada cookie → langsung lanjut (tidak perlu fetch)
  if (isOnAuthPage && !sessionCookie) {
    return NextResponse.next();
  }

  // Jika di dashboard dan TIDAK ada cookie → langsung redirect login
  if (isOnDashboard && !sessionCookie) {
    console.warn(`[Proxy DEBUG] Redirect to Login: No Session Cookie found at ${pathname}`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Hanya fetch session jika ada cookie (artinya mungkin sudah login)
  let session: any = null;
  let user: any = null;
  if (sessionCookie) {
    try {
      // Gunakan URL internal dari .env (jika ada) untuk menghindari SSL error di VPS
      const internalUrl = process.env.BETTER_AUTH_URL_INTERNAL || "http://localhost:3000";
      const res = await fetch(`${internalUrl}/api/auth/get-session`, {
        headers: {
          "cookie": request.headers.get("cookie") || "",
          "x-forwarded-proto": request.headers.get("x-forwarded-proto") || "https",
          "host": request.headers.get("host") || "laci.web.id",
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const authData = await res.json();
        if (authData) {
          session = authData.session || null;
          user = authData.user || null;
        }
      } else {
        console.error(`[Proxy DEBUG] Internal Fetch Failed (Status ${res.status}): ${pathname}`);
      }
    } catch (err) {
      console.error("[Proxy DEBUG] Internal Fetch Error:", err);
      // Jika fetch gagal (e.g. timeout), jangan langsung tendang user.
      const response = NextResponse.next();
      response.headers.set("x-pathname", pathname);
      return response;
    }
  }

  // 1. Dashboard: cek login dan status aktif
  if (isOnDashboard) {
    if (!session || !user) {
      console.warn(`[Proxy DEBUG] Redirect to Login: Session or User data NULL at ${pathname}`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user.isActive === false) {
      console.warn(`[Proxy DEBUG] Redirect to Login: User "${user.email}" is INACTIVE at ${pathname}`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "account_inactive");
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // 2. Auth page: redirect ke dashboard jika sudah login
  if (isOnAuthPage && session && user) {
    if (user.isActive === false) {
      return NextResponse.next(); // Biarkan tetap di halaman login/register
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
