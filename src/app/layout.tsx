import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Design Summit 2026 — Book Free Tickets",
  description: "Join India's premier AI & Design conference. Book your free tickets for AI Design Summit 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-surface antialiased">{children}</body>
    </html>
  );
}
