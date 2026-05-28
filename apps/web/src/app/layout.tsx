import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { loadSiteConfig } from "@/lib/content/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await loadSiteConfig();
  return {
    title: config.siteTitle,
    description: config.siteDescription
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
