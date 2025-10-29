import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Pastikan JWT_SECRET ada
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET tidak dikonfigurasi di .env.local");
}

// Konversi secret ke Uint8Array (wajib untuk jose)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("token")?.value;

    // 1. Tidak ada token → redirect
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // 2. Verifikasi token dengan jose
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Pastikan payload valid
      if (!payload.id || !payload.username) {
        throw new Error("Invalid token payload");
      }

      // 3. Token valid → lanjutkan
      const response = NextResponse.next();
      response.headers.set("x-user-id", String(payload.id));
      response.headers.set("x-username", payload.username);
      return response;
    } catch (err) {
      console.warn("[Middleware] Token invalid/expired:", err.message);

      // 4. Token expired/invalid → hapus cookie + redirect
      const url = new URL("/login", request.url);
      url.searchParams.set("error", "session_expired");

      const response = NextResponse.redirect(url);
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};