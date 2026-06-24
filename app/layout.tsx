import type { Metadata } from "next";
import { Playfair_Display, Lato, Great_Vibes } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import ChatButton from "@/components/ChatButton";
import "@uploadthing/react/styles.css";
import { Toaster } from "@/components/ui/sonner";
import CartDrawer from "@/components/CartDrawer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

// --- UPGRADED SEO METADATA ---
export const metadata: Metadata = {
  title: "EverAfter | Custom Bridal & Wedding Ensembles",
  description:
    "Discover your dream bridal silhouette. Exclusive custom wedding collections, luxury lehengas, and bespoke gowns crafted for your forever.",
  keywords: [
    "custom bridal",
    "wedding ensembles",
    "luxury bridal wear",
    "bespoke lehengas",
    "wedding gowns",
    "bridal boutique",
    "EverAfter bridal",
  ],
  icons: {
    icon: "/icon.svg", // Connects your custom gold monogram
    apple: "/icon.svg", // Ensures it looks good if someone saves it to their iPhone home screen
  },
  openGraph: {
    title: "EverAfter | Custom Bridal & Wedding Ensembles",
    description:
      "Discover your dream bridal silhouette. Exclusive custom wedding collections crafted for your forever.",
    siteName: "EverAfter",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EverAfter | Custom Bridal & Wedding Ensembles",
    description:
      "Discover your dream bridal silhouette. Exclusive custom wedding collections crafted for your forever.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lato.variable} ${greatVibes.variable} font-sans antialiased bg-[#050505]`}
      >
        <Navbar />

        <CartDrawer />

        <main className="relative min-h-screen bg-[#050505]">{children}</main>

        <ChatButton />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
