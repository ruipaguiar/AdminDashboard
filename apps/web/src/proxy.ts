import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Rotas de auth do NextAuth — nunca redirecionar
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const isLoginPage = pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    const cryptoUrl = new URL("/crypto", req.url);
    return NextResponse.redirect(cryptoUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Aplica o middleware a tudo exceto assets estáticos
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
