"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Loader2,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Prewedding", path: "/category/prewedding" },
  { name: "Maternity", path: "/category/maternity" },
  { name: "Bridal", path: "/category/bridal" },
  { name: "Reels", path: "/reels" },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: session, status } = useSession();
  const user = session?.user;
  const authLoading = status === "loading";
  const pathname = usePathname();

  const { items, openCart } = useCartStore();
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/profile" });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Determine text color based on scroll state
  // Scrolled = dark bg → light text. Unscrolled = transparent over hero → light text.
  // Both states use light text, but scrolled has the dark glass background for contrast.
  const textColor = scrolled ? "text-[#FDF6F5]" : "text-[#FDF6F5]";
  const textMuted = scrolled ? "text-[#d4a3a7]" : "text-[#d99898]";
  const hoverColor = scrolled
    ? "hover:text-white"
    : "hover:text-white";

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          MAIN NAVBAR
      ═══════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 z-[100] w-full transition-all duration-500 ease-out ${
          scrolled
            ? "bg-[#1a0f10]/92 backdrop-blur-2xl py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-gradient-to-b from-black/40 via-black/15 to-transparent py-4 md:py-5"
        }`}
      >
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12 md:h-14">
            {/* ── LEFT: Hamburger (mobile) + Desktop Nav ── */}
            <div className="flex items-center gap-6 w-[140px] md:w-auto">
              {/* Mobile Hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className={`md:hidden p-2 -ml-2 transition-colors ${textColor} ${hoverColor}`}
                aria-label="Open Menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>

              {/* Desktop Links */}
              <div className="hidden md:flex items-center gap-7">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      href={link.path}
                      className={`relative text-[11px] uppercase tracking-[0.18em] font-medium transition-colors duration-300 py-1 ${
                        isActive
                          ? "text-white"
                          : `${textMuted} ${hoverColor}`
                      }`}
                    >
                      {link.name}
                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d99898]"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── CENTER: Logo ── */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 select-none group flex flex-col items-center"
            >
              <h1
                className={`font-serif text-[24px] sm:text-[28px] md:text-[32px] tracking-tight leading-none transition-all duration-500 ${textColor}`}
              >
                Everafter
              </h1>
              <span
                className={`text-[6px] sm:text-[7px] uppercase tracking-[0.5em] mt-1 transition-all duration-500 ${
                  scrolled
                    ? "opacity-0 h-0 overflow-hidden"
                    : "opacity-70 text-[#d99898]"
                }`}
              >
                The Cinematic Wardrobe
              </span>
            </Link>

            {/* ── RIGHT: Cart + User ── */}
            <div className="flex items-center justify-end gap-3 sm:gap-4 w-[140px] md:w-auto">
              {isMounted && (
                <>
                  {/* Sign In / Avatar */}
                  {authLoading ? (
                    <Loader2
                      className={`animate-spin ${textMuted}`}
                      size={18}
                    />
                  ) : user ? (
                    <Link
                      href="/profile"
                      className="outline-none"
                      aria-label="Profile"
                    >
                      <div
                        className={`relative w-8 h-8 rounded-full overflow-hidden ring-2 transition-all duration-300 hover:scale-110 ${
                          scrolled
                            ? "ring-[#d99898]/50 hover:ring-[#d99898]"
                            : "ring-white/30 hover:ring-white/70"
                        }`}
                      >
                        <Image
                          src={user.image || "/placeholder-user.png"}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={handleGoogleLogin}
                      className={`hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-medium transition-all duration-300 px-3 py-1.5 rounded-full border ${
                        scrolled
                          ? "border-[#d99898]/30 text-[#d99898] hover:bg-[#d99898]/10 hover:text-white hover:border-[#d99898]/60"
                          : "border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40"
                      }`}
                    >
                      <User size={12} />
                      Sign In
                    </button>
                  )}

                  {/* Cart */}
                  <button
                    onClick={openCart}
                    className={`relative p-2 -mr-2 transition-all duration-300 ${textColor} ${hoverColor}`}
                    aria-label="Shopping Cart"
                  >
                    <ShoppingBag size={20} strokeWidth={1.5} />
                    {isMounted && totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0.5 right-0 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center bg-[#8c363e] ring-2 ring-[#1a0f10]/80"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Subtle gold accent line at bottom when scrolled */}
        <div
          className={`absolute bottom-0 left-0 w-full h-px transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#d99898]/40 to-transparent" />
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE DRAWER MENU
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              onClick={closeDrawer}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[201] w-[85vw] max-w-[380px] bg-[#130b0c] flex flex-col overflow-hidden"
            >
              {/* Ambient Glow */}
              <div className="absolute top-[-15%] right-[-30%] w-[60vw] h-[60vw] bg-[#8c363e]/15 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-20%] w-[40vw] h-[40vw] bg-[#d99898]/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 relative z-10">
                <h2 className="font-serif text-xl text-[#FDF6F5] tracking-tight">
                  Everafter
                </h2>
                <button
                  onClick={closeDrawer}
                  className="p-2 -mr-2 text-[#d99898] hover:text-white transition-colors"
                  aria-label="Close Menu"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-gradient-to-r from-[#d99898]/20 via-[#d99898]/10 to-transparent" />

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
                <p className="text-[9px] uppercase tracking-[0.4em] text-[#d99898]/60 font-semibold mb-6">
                  Collections
                </p>
                <div className="space-y-1">
                  {NAV_LINKS.map((link, i) => {
                    const isActive = pathname === link.path;
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.1 + i * 0.06,
                          ease: [0.21, 1.11, 0.81, 0.99],
                        }}
                      >
                        <Link
                          href={link.path}
                          onClick={closeDrawer}
                          className={`flex items-center justify-between py-3.5 px-3 rounded-xl transition-all duration-300 group ${
                            isActive
                              ? "bg-[#8c363e]/15 text-white"
                              : "text-[#d4a3a7] hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="text-[13px] uppercase tracking-[0.2em] font-medium">
                            {link.name}
                          </span>
                          <ChevronRight
                            size={14}
                            className={`transition-all duration-300 ${
                              isActive
                                ? "text-[#d99898] opacity-100"
                                : "opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0"
                            }`}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* User Section in Drawer */}
                <div className="mt-10">
                  <div className="h-px bg-gradient-to-r from-[#d99898]/20 via-[#d99898]/10 to-transparent mb-6" />
                  <p className="text-[9px] uppercase tracking-[0.4em] text-[#d99898]/60 font-semibold mb-4">
                    Account
                  </p>

                  {authLoading ? (
                    <div className="flex items-center gap-3 px-3 py-3">
                      <Loader2
                        className="animate-spin text-[#d99898]"
                        size={18}
                      />
                      <span className="text-[12px] text-[#d99898]/70">
                        Loading...
                      </span>
                    </div>
                  ) : user ? (
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        onClick={closeDrawer}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-[#d4a3a7] hover:text-white hover:bg-white/5 transition-all"
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#d99898]/30">
                          <Image
                            src={user.image || "/placeholder-user.png"}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium tracking-wide">
                            {user.name || "Profile"}
                          </p>
                          <p className="text-[10px] text-[#d99898]/50">
                            View Profile
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          closeDrawer();
                          signOut();
                        }}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-[#d4a3a7]/60 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
                      >
                        <LogOut size={16} />
                        <span className="text-[12px] uppercase tracking-[0.15em]">
                          Sign Out
                        </span>
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <button
                        onClick={() => {
                          closeDrawer();
                          handleGoogleLogin();
                        }}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-[#d4a3a7] hover:text-white hover:bg-white/5 transition-all w-full"
                      >
                        <User size={18} />
                        <span className="text-[13px] uppercase tracking-[0.2em] font-medium">
                          Sign In
                        </span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </nav>

              {/* Footer */}
              <div className="px-6 py-6 relative z-10">
                <div className="h-px bg-gradient-to-r from-[#d99898]/20 via-[#d99898]/10 to-transparent mb-5" />
                <p className="text-[8px] uppercase tracking-[0.5em] text-[#d99898]/30 mb-1">
                  EverAfter Studio
                </p>
                <p className="font-serif italic text-[11px] text-[#d99898]/40">
                  Capturing perfection, one frame at a time.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
