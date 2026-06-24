import type { Metadata } from "next";
import { Sora, Space_Mono } from "next/font/google";
import "./globals.css";
import ThemeSync from "@/components/layout/ThemeSync";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aurora Type — Typing Speed Practice",
  description:
    "A glassmorphism typing speed test with live WPM analytics, custom word lists, and a Block Defence arcade mode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="aurora" className={`${sora.variable} ${spaceMono.variable}`}>
      <body className="font-display antialiased min-h-screen">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
