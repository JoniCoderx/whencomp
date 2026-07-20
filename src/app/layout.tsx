import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "When Comp — schedule competitive matches",
  description:
    "When Comp is the fastest way to schedule CS2, Valorant & COD matches, fill lobbies, and track post-match stats. Free, installable, dark-mode first.",
  applicationName: "When Comp",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "When Comp",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "When Comp",
    description: "Squad up. Lock the time. Dominate.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${grotesk.variable} font-sans no-tap`}>
        <Providers>
          <div className="relative min-h-[100dvh] bg-grid">
            <div className="pointer-events-none fixed inset-0 bg-grid-glow" aria-hidden />
            <Navbar />
            <main className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:pb-16 md:pt-24">
              {children}
            </main>
            <BottomNav />
          </div>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}
