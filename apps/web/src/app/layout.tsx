import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Dashboard pessoal — crypto, news e mais",
  robots: { index: false, follow: false }, // privado
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
