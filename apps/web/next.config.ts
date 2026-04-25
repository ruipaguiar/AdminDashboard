import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build para imagens Docker pequenas
  output: "standalone",

  // Rewrites: /api/* (browser) → API C# (interno na rede Docker)
  // /api/auth/* fica excluído — é tratado pelo Next.js (NextAuth route handler)
  async rewrites() {
    const apiUrl = process.env.API_URL_INTERNAL || "http://api:8080";
    return [
      {
        // Regex negative lookahead: captura tudo em /api/* EXCEPTO /api/auth/*
        source: "/api/((?!auth/).*)",
        destination: `${apiUrl}/api/$1`,
      },
    ];
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // React strict mode
  reactStrictMode: true,

  // Imagens externas permitidas (para logos de cripto da Binance/CoinGecko)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "bin.bnbstatic.com" },
      { protocol: "https", hostname: "cryptologos.cc" },
    ],
  },
};

export default nextConfig;
