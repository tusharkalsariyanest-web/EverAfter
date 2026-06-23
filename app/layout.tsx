import type { Metadata } from "next";
import { Playfair_Display, Lato, Great_Vibes } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar"; // ONE navbar only
import ChatButton from "@/components/ChatButton";
import "@uploadthing/react/styles.css";
import { Toaster } from "@/components/ui/sonner";
import CartDrawer from "@/components/CartDrawer"; // <-- Your import is here!

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes" });

export const metadata: Metadata = {
  title: "Suvarna Mahel | Premium 1gm Jewellery",
  description: "Exclusive imitation jewellery collection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lato.variable} ${greatVibes.variable} font-sans antialiased bg-[#050505]`}
      >
        <Navbar />
        
        {/* <-- DROP IT RIGHT HERE --> */}
        <CartDrawer /> 

        <main className="relative min-h-screen bg-[#050505]">
          {children}
        </main>

        <ChatButton />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}