import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas do NextAuth nunca são bloqueadas
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isLoginPage = pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/crypto", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclui assets estáticos E rotas do NextAuth (api/auth/*) para não interferir
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
