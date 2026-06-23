"use client";

import Link from "next/link";
import Image from "next/image"; // <-- Added for avatar
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, ShoppingBag, User, Loader2 } from "lucide-react"; // <-- Added User & Loader2
import { useCartStore } from "@/store/useCartStore";

// 🔥 Import Firebase configuration
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 🔥 Authentication State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Cart configuration
  const { items, openCart } = useCartStore();
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 Listen for auth changes across the site
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔥 Premium Google Sign-In Handler
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Sync the new user to your PostgreSQL database in the background
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
        }),
      });
    } catch (error) {
      console.error("Google Auth Sync Failed:", error);
    }
  };

  const links = [
    { name: "The Collection", path: "/" },
    { name: "Cinematic Reels", path: "/reels" },
    { name: "Prewedding", path: "/category/prewedding" },
    { name: "Maternity", path: "/category/maternity" },
    { name: "Bridal", path: "/category/bridal" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 z-[100] w-full transition-all duration-700 ease-in-out ${
          scrolled
            ? "bg-[#FDF6F5]/90 backdrop-blur-xl py-3 shadow-[0_10px_30px_rgba(140,54,62,0.05)] border-b border-[#E8D0D2]/40"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
          <div className="w-20 hidden md:block">
            <p
              className={`text-[8px] uppercase tracking-[0.4em] font-bold flex items-center gap-1.5 transition-colors duration-500 ${
                scrolled ? "text-[#8c363e]" : "text-[#d99898]"
              }`}
            >
              <Camera size={10} /> Studio
            </p>
          </div>

          <Link
            href="/"
            className="text-center select-none group absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          >
            <h1
              className={`font-serif text-[28px] md:text-[34px] tracking-tight leading-none transition-colors duration-500 ${
                scrolled ? "text-[#2d1b1b]" : "text-[#FDF6F5]"
              }`}
            >
              Everafter
            </h1>
            <p
              className={`text-[7px] uppercase tracking-[0.5em] mt-1.5 transition-all duration-500 ${
                scrolled
                  ? "opacity-0 h-0 overflow-hidden text-[#8c363e]"
                  : "opacity-100 text-[#d99898]"
              }`}
            >
              The Cinematic Wardrobe
            </p>
          </Link>

          {/* RIGHT SIDE: Auth + Cart + Hamburger */}
          <div className="flex items-center justify-end gap-4 md:gap-5">
            {/* 🔥 DYNAMIC PROFILE ARCHITECTURE */}
            {isMounted && (
              <div className="flex items-center">
                {authLoading ? (
                  <Loader2
                    className={`animate-spin ${
                      scrolled ? "text-[#C0858B]" : "text-[#d99898]"
                    }`}
                    size={18}
                  />
                ) : user ? (
                  /* LOGGED IN: Render Google Avatar */
                  <Link
                    href="/profile"
                    className={`relative w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border transition-all shadow-sm block hover:scale-105 ${
                      scrolled
                        ? "border-[#C0858B] hover:border-[#8c363e]"
                        : "border-white/40 hover:border-white"
                    }`}
                  >
                    <Image
                      src={user.photoURL || "/placeholder-user.png"}
                      alt="Account Dashboard"
                      fill
                      className="object-cover"
                    />
                  </Link>
                ) : (
                  /* GUEST: Render Login Button */
                  <button
                    onClick={handleGoogleLogin}
                    className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold transition-colors px-3 py-1.5 rounded-full border ${
                      scrolled
                        ? "text-[#8A4A52] hover:text-[#2d1b1b] bg-white/40 border-[#E8D0D2]"
                        : "text-[#FDF6F5] hover:text-white bg-black/20 border-white/20"
                    }`}
                  >
                    <User size={12} />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* CART BUTTON */}
            <button
              onClick={openCart}
              className={`relative transition-colors ${
                scrolled
                  ? "text-[#2d1b1b] hover:text-[#8c363e]"
                  : "text-[#FDF6F5] hover:text-[#d99898]"
              }`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {isMounted && totalItems > 0 && (
                <span
                  className={`absolute -top-1.5 -right-2 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center border ${
                    scrolled
                      ? "bg-[#8c363e] border-white"
                      : "bg-[#8c363e] border-transparent"
                  }`}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* HAMBURGER MENU */}
            <button
              onClick={() => setOpen(true)}
              className={`transition-colors flex flex-col gap-1.5 py-2 pl-2 ${
                scrolled
                  ? "text-[#2d1b1b] hover:text-[#8c363e]"
                  : "text-[#FDF6F5] hover:text-[#d99898]"
              }`}
              aria-label="Open Menu"
            >
              <span className="w-6 h-[1px] bg-current block transition-all"></span>
              <span className="w-4 h-[1px] bg-current block transition-all ml-auto"></span>
            </button>
          </div>
        </div>

        <div
          className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8c363e]/20 to-transparent transition-opacity duration-700 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
      </nav>

      {/* MENU DRAWER */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] bg-[#171112]/95 flex flex-col overflow-hidden"
          >
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#8c363e]/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#d99898]/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex justify-between items-center p-6 lg:p-10 relative z-10">
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#d99898] font-bold flex items-center gap-2">
                  <Sparkles size={12} /> Navigation
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#FDF6F5] text-[10px] uppercase tracking-widest hover:text-[#d99898] transition-colors flex items-center gap-2"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-20 relative z-10">
              {links.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + i * 0.08,
                    ease: [0.21, 1.11, 0.81, 0.99],
                  }}
                >
                  <Link
                    href={link.path}
                    onClick={() => setOpen(false)}
                    className="text-[#FDF6F5] uppercase tracking-[0.3em] text-sm md:text-base hover:text-[#d99898] transition-colors flex flex-col items-center group relative"
                  >
                    {link.name}
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d99898] absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100"></span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center pb-10 relative z-10">
              <p className="text-[8px] uppercase tracking-[0.5em] text-[#d99898]/50 mb-2">
                The Collection
              </p>
              <p className="font-serif italic text-white/40 text-xs">
                Capturing perfection.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
