import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* ----------------------------------------------------------------
   FONTS
   Geist Sans       → --font-geist-sans   → var(--font-sans) in @theme
   Geist Mono       → --font-geist-mono   → fallback mono (Geist team)
   JetBrains Mono   → --font-jetbrains-mono → var(--font-mono) in @theme
                      Used for: API keys, task IDs, hashes, code blocks,
                      timestamps, mono-label, mono-data roles.
   ---------------------------------------------------------------- */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  // Only load the weights we actually use per the design system spec
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TRINETRA — Synthetic Media Verification Infrastructure",
  description:
    "Enterprise-grade B2B API for deepfake detection and synthetic media analysis across video, audio, images, and documents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-app text-text-primary">
        {children}
      </body>
    </html>
  );
}
