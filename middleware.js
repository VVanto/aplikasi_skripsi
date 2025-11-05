import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  
  // Kalau nggak ada token → tendang ke /login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.id || !payload.username) {
      throw new Error("Invalid token payload");
    }
    
    const response = NextResponse.next();
    response.headers.set("x-user-id", String(payload.id));
    response.headers.set("x-username", payload.username);
    return response;
  } catch (err) {
    console.warn("[Middleware] Token invalid/expired:", err.message);
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "session_expired");
    const response = NextResponse.redirect(url);
    response.cookies.delete("token");
    return response;
  }
}

// PENTING: Tentukan route mana aja yang dilindungi
export const config = {
  matcher: [
    /*
     * Jalankan middleware untuk semua route KECUALI:
     * - /login, /register (auth pages)
     * - /api/auth/* (auth endpoints)
     * - /_next/* (Next.js internal)
     * - /static, /favicon.ico, dll
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};