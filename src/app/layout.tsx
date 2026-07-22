import type { Metadata, Viewport } from "next";
import { Heebo, Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { BottomNav } from "@/components/BottomNav";

const rubik = Rubik({ subsets: ["hebrew", "latin"], variable: "--font-sans", display: "swap" });
const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-display", display: "swap", weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "WHEN COMP — לוח קומפים",
  description: "קובעים קומפים, מאשרים הגעה ומקבלים ספירה לאחור. CS2, Valorant, COD. חינם, מותקן כמו אפליקציה.",
  applicationName: "WHEN COMP",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "WHEN COMP" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: { title: "WHEN COMP", description: "קובעים. מתחייבים. משחקים.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body className={`${rubik.variable} ${heebo.variable} font-sans no-tap`}>
        <Providers>
          <div className="relative min-h-[100dvh] bg-grid">
            <div className="pointer-events-none fixed inset-0 bg-brand-sheen" aria-hidden />
            <Navbar />
            <MobileTopBar />
            <main className="safe-top relative mx-auto w-full max-w-6xl px-4 pb-28 pt-[4.75rem] md:pb-16 md:pt-24">
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
