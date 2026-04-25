import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: string;
      displayName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    displayName: string;
    accessToken: string;
    expiresAt: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    role: string;
    displayName: string;
    expiresAt: number;
  }
}
