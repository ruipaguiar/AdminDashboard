import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,

  // Mover rotas de /api/auth/* para /auth/* evita conflito com o rewrite /api/* → .NET
  basePath: "/auth",

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const apiUrl =
          process.env.API_URL_INTERNAL ||
          "http://localhost:5001";

        try {
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
          });

          if (!res.ok) return null;

          const data = await res.json();

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.displayName,
            role: data.user.role,
            displayName: data.user.displayName,
            accessToken: data.accessToken,
            expiresAt: new Date(data.expiresAt).getTime(),
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.displayName = user.displayName;
        token.expiresAt = user.expiresAt;
      }

      // Se o JWT da API expirou, limpar o token para forçar novo login
      if (token.expiresAt && Date.now() > (token.expiresAt as number)) {
        return { ...token, accessToken: "" };
      }

      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.displayName = token.displayName as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },
});
