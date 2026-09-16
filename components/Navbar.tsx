"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
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

// ═══════════════════════════════════════════════════════════
// DYNAMIC PAGE THEMES — Each page gets its own color personality
// Like the colorful gowns in the wardrobe, each page has its own vibe
// ═══════════════════════════════════════════════════════════
interface PageTheme {
  /** Scrolled navbar background */
  scrolledBg: string;
  /** Accent color for active indicators, rings, borders */
  accent: string;
  /** Muted text color */
  muted: string;
  /** Hover accent */
  hoverAccent: string;
  /** Cart badge bg */
  badgeBg: string;
  /** Drawer accent glow color */
  drawerGlow: string;
  /** Drawer secondary glow */
  drawerGlow2: string;
  /** Active link drawer bg */
  drawerActiveBg: string;
  /** Bottom accent line gradient */
  accentLine: string;
  /** Sign-in border color */
  signInBorder: string;
  /** Sign-in hover bg */
  signInHoverBg: string;
}

const PAGE_THEMES: Record<string, PageTheme> = {
  // Home — Signature Rose
  "/": {
    scrolledBg: "rgba(26, 15, 16, 0.92)",
    accent: "#d99898",
    muted: "#d4a3a7",
    hoverAccent: "#f0c4c8",
    badgeBg: "#8c363e",
    drawerGlow: "rgba(140, 54, 62, 0.15)",
    drawerGlow2: "rgba(217, 152, 152, 0.10)",
    drawerActiveBg: "rgba(140, 54, 62, 0.15)",
    accentLine: "rgba(217, 152, 152, 0.4)",
    signInBorder: "rgba(217, 152, 152, 0.3)",
    signInHoverBg: "rgba(217, 152, 152, 0.1)",
  },
  // Prewedding — Romantic Blush Pink
  "/category/prewedding": {
    scrolledBg: "rgba(30, 14, 22, 0.92)",
    accent: "#f4a0b5",
    muted: "#dba0b0",
    hoverAccent: "#fcc8d6",
    badgeBg: "#b5446e",
    drawerGlow: "rgba(181, 68, 110, 0.15)",
    drawerGlow2: "rgba(244, 160, 181, 0.10)",
    drawerActiveBg: "rgba(181, 68, 110, 0.15)",
    accentLine: "rgba(244, 160, 181, 0.4)",
    signInBorder: "rgba(244, 160, 181, 0.3)",
    signInHoverBg: "rgba(244, 160, 181, 0.1)",
  },
  // Maternity — Warm Golden Champagne
  "/category/maternity": {
    scrolledBg: "rgba(26, 20, 12, 0.92)",
    accent: "#d4a86a",
    muted: "#c9a87a",
    hoverAccent: "#f0d4a0",
    badgeBg: "#8a6830",
    drawerGlow: "rgba(138, 104, 48, 0.15)",
    drawerGlow2: "rgba(212, 168, 106, 0.10)",
    drawerActiveBg: "rgba(138, 104, 48, 0.15)",
    accentLine: "rgba(212, 168, 106, 0.4)",
    signInBorder: "rgba(212, 168, 106, 0.3)",
    signInHoverBg: "rgba(212, 168, 106, 0.1)",
  },
  // Bridal — Elegant Ivory Pearl
  "/category/bridal": {
    scrolledBg: "rgba(22, 18, 20, 0.92)",
    accent: "#e8d0c4",
    muted: "#cbb8af",
    hoverAccent: "#f5e6dc",
    badgeBg: "#7a5c50",
    drawerGlow: "rgba(122, 92, 80, 0.15)",
    drawerGlow2: "rgba(232, 208, 196, 0.10)",
    drawerActiveBg: "rgba(122, 92, 80, 0.15)",
    accentLine: "rgba(232, 208, 196, 0.4)",
    signInBorder: "rgba(232, 208, 196, 0.3)",
    signInHoverBg: "rgba(232, 208, 196, 0.1)",
  },
  // Reels — Cinematic Deep Red
  "/reels": {
    scrolledBg: "rgba(20, 10, 12, 0.92)",
    accent: "#e06070",
    muted: "#c87880",
    hoverAccent: "#f09098",
    badgeBg: "#a03040",
    drawerGlow: "rgba(160, 48, 64, 0.15)",
    drawerGlow2: "rgba(224, 96, 112, 0.10)",
    drawerActiveBg: "rgba(160, 48, 64, 0.15)",
    accentLine: "rgba(224, 96, 112, 0.4)",
    signInBorder: "rgba(224, 96, 112, 0.3)",
    signInHoverBg: "rgba(224, 96, 112, 0.1)",
  },
  // Profile — Royal Plum Purple
  "/profile": {
    scrolledBg: "rgba(18, 12, 24, 0.92)",
    accent: "#c4a0d8",
    muted: "#b090c0",
    hoverAccent: "#dcc0ec",
    badgeBg: "#6a3880",
    drawerGlow: "rgba(106, 56, 128, 0.15)",
    drawerGlow2: "rgba(196, 160, 216, 0.10)",
    drawerActiveBg: "rgba(106, 56, 128, 0.15)",
    accentLine: "rgba(196, 160, 216, 0.4)",
    signInBorder: "rgba(196, 160, 216, 0.3)",
    signInHoverBg: "rgba(196, 160, 216, 0.1)",
  },
  // Checkout — Sophisticated Emerald
  "/checkout": {
    scrolledBg: "rgba(10, 18, 16, 0.92)",
    accent: "#70c4a8",
    muted: "#80b0a0",
    hoverAccent: "#a0e0c8",
    badgeBg: "#2a6850",
    drawerGlow: "rgba(42, 104, 80, 0.15)",
    drawerGlow2: "rgba(112, 196, 168, 0.10)",
    drawerActiveBg: "rgba(42, 104, 80, 0.15)",
    accentLine: "rgba(112, 196, 168, 0.4)",
    signInBorder: "rgba(112, 196, 168, 0.3)",
    signInHoverBg: "rgba(112, 196, 168, 0.1)",
  },
  // Track Order — Deep Ocean Blue
  "/track": {
    scrolledBg: "rgba(10, 14, 22, 0.92)",
    accent: "#80b0e0",
    muted: "#90a8c8",
    hoverAccent: "#a8d0f0",
    badgeBg: "#2a5080",
    drawerGlow: "rgba(42, 80, 128, 0.15)",
    drawerGlow2: "rgba(128, 176, 224, 0.10)",
    drawerActiveBg: "rgba(42, 80, 128, 0.15)",
    accentLine: "rgba(128, 176, 224, 0.4)",
    signInBorder: "rgba(128, 176, 224, 0.3)",
    signInHoverBg: "rgba(128, 176, 224, 0.1)",
  },
};

// Default fallback theme (rose)
const DEFAULT_THEME = PAGE_THEMES["/"];

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Prewedding", path: "/category/prewedding" },
  { name: "Maternity", path: "/category/maternity" },
  { name: "Bridal", path: "/category/bridal" },
  { name: "Reels", path: "/reels" },
];

/** Find the best matching theme for the current path */
function getThemeForPath(pathname: string): PageTheme {
  // Exact match first
  if (PAGE_THEMES[pathname]) return PAGE_THEMES[pathname];
  // Prefix match (for /gown/[id], /admin/*, etc.)
  for (const [key, theme] of Object.entries(PAGE_THEMES)) {
    if (key !== "/" && pathname.startsWith(key)) return theme;
  }
  // Gown detail pages use the home rose theme
  if (pathname.startsWith("/gown")) return DEFAULT_THEME;
  return DEFAULT_THEME;
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: session, status } = useSession();
  const user = session?.user;
  const authLoading = status === "loading";
  const pathname = usePathname();

  // Dynamic theme based on current page
  const theme = useMemo(() => getThemeForPath(pathname), [pathname]);

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

  // Hide the navbar entirely on the reels feed for a full-screen cinematic experience
  if (pathname === "/reels") {
    return null;
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          MAIN NAVBAR — Dynamic Color Theme
      ═══════════════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 z-[100] w-full transition-all duration-700 ease-out ${
          scrolled
            ? "backdrop-blur-2xl py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-gradient-to-b from-black/40 via-black/15 to-transparent py-4 md:py-5"
        }`}
        style={scrolled ? { backgroundColor: theme.scrolledBg } : undefined}
      >
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12 md:h-14">
            {/* ── LEFT: Hamburger (mobile) + Desktop Nav ── */}
            <div className="flex items-center gap-6 w-[140px] md:w-auto">
              {/* Mobile Hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 -ml-2 transition-colors text-[#FDF6F5] hover:text-white"
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
                      className="relative text-[11px] uppercase tracking-[0.18em] font-medium transition-colors duration-300 py-1"
                      style={{
                        color: isActive ? "#fff" : theme.muted,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.color = theme.hoverAccent;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          e.currentTarget.style.color = theme.muted;
                      }}
                    >
                      {link.name}
                      {/* Active indicator dot — color matches page theme */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ backgroundColor: theme.accent }}
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
              <h1 className="font-serif text-[24px] sm:text-[28px] md:text-[32px] tracking-tight leading-none transition-all duration-500 text-[#FDF6F5]">
                Everafter
              </h1>
              <span
                className={`text-[6px] sm:text-[7px] uppercase tracking-[0.5em] mt-1 transition-all duration-500 ${
                  scrolled
                    ? "opacity-0 h-0 overflow-hidden"
                    : "opacity-70"
                }`}
                style={{ color: theme.accent }}
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
                      className="animate-spin"
                      style={{ color: theme.muted }}
                      size={18}
                    />
                  ) : user ? (
                    <Link
                      href="/profile"
                      className="outline-none"
                      aria-label="Profile"
                    >
                      <div
                        className="relative w-8 h-8 rounded-full overflow-hidden ring-2 transition-all duration-300 hover:scale-110"
                        style={{
                          "--tw-ring-color": `${theme.accent}80`,
                        } as React.CSSProperties}
                        onMouseEnter={(e) => {
                          (e.currentTarget.style as any)["--tw-ring-color"] = theme.accent;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget.style as any)["--tw-ring-color"] = `${theme.accent}80`;
                        }}
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
                      className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] font-medium transition-all duration-300 px-3 py-1.5 rounded-full border"
                      style={{
                        borderColor: theme.signInBorder,
                        color: theme.accent,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.signInHoverBg;
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = theme.accent;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = theme.accent;
                        e.currentTarget.style.borderColor = theme.signInBorder;
                      }}
                    >
                      <User size={12} />
                      <span className="hidden sm:inline">Sign In</span>
                    </button>
                  )}

                  {/* Cart */}
                  <button
                    onClick={openCart}
                    className="relative p-2 -mr-2 transition-all duration-300 text-[#FDF6F5] hover:text-white"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingBag size={20} strokeWidth={1.5} />
                    {isMounted && totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0.5 right-0 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-black/40"
                        style={{ backgroundColor: theme.badgeBg }}
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

        {/* Dynamic accent line at bottom when scrolled */}
        <div
          className={`absolute bottom-0 left-0 w-full h-px transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(to right, transparent, ${theme.accentLine}, transparent)`,
            }}
          />
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE DRAWER MENU — Themed
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
              {/* Ambient Glow — Themed */}
              <div
                className="absolute top-[-15%] right-[-30%] w-[60vw] h-[60vw] rounded-full blur-[100px] pointer-events-none"
                style={{ backgroundColor: theme.drawerGlow }}
              />
              <div
                className="absolute bottom-[-10%] left-[-20%] w-[40vw] h-[40vw] rounded-full blur-[80px] pointer-events-none"
                style={{ backgroundColor: theme.drawerGlow2 }}
              />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 relative z-10">
                <h2 className="font-serif text-xl text-[#FDF6F5] tracking-tight">
                  Everafter
                </h2>
                <button
                  onClick={closeDrawer}
                  className="p-2 -mr-2 transition-colors hover:text-white"
                  style={{ color: theme.accent }}
                  aria-label="Close Menu"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Divider — Themed */}
              <div
                className="mx-6 h-px"
                style={{
                  background: `linear-gradient(to right, ${theme.accent}33, ${theme.accent}1a, transparent)`,
                }}
              />

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
                <p
                  className="text-[9px] uppercase tracking-[0.4em] font-semibold mb-6"
                  style={{ color: `${theme.accent}99` }}
                >
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
                          className="flex items-center justify-between py-3.5 px-3 rounded-xl transition-all duration-300 group"
                          style={{
                            backgroundColor: isActive
                              ? theme.drawerActiveBg
                              : "transparent",
                            color: isActive ? "#fff" : theme.muted,
                          }}
                        >
                          <span className="text-[13px] uppercase tracking-[0.2em] font-medium">
                            {link.name}
                          </span>
                          <ChevronRight
                            size={14}
                            className={`transition-all duration-300 ${
                              isActive
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0"
                            }`}
                            style={{ color: isActive ? theme.accent : undefined }}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* User Section in Drawer */}
                <div className="mt-10">
                  <div
                    className="h-px mb-6"
                    style={{
                      background: `linear-gradient(to right, ${theme.accent}33, ${theme.accent}1a, transparent)`,
                    }}
                  />
                  <p
                    className="text-[9px] uppercase tracking-[0.4em] font-semibold mb-4"
                    style={{ color: `${theme.accent}99` }}
                  >
                    Account
                  </p>

                  {authLoading ? (
                    <div className="flex items-center gap-3 px-3 py-3">
                      <Loader2
                        className="animate-spin"
                        style={{ color: theme.accent }}
                        size={18}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: `${theme.accent}b3` }}
                      >
                        Loading...
                      </span>
                    </div>
                  ) : user ? (
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        onClick={closeDrawer}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all"
                        style={{ color: theme.muted }}
                      >
                        <div
                          className="relative w-8 h-8 rounded-full overflow-hidden ring-2"
                          style={{
                            "--tw-ring-color": `${theme.accent}4d`,
                          } as React.CSSProperties}
                        >
                          <Image
                            src={user.image || "/placeholder-user.png"}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium tracking-wide text-[#FDF6F5]">
                            {user.name || "Profile"}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: `${theme.accent}80` }}
                          >
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
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all w-full"
                        style={{ color: theme.muted }}
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
                <div
                  className="h-px mb-5"
                  style={{
                    background: `linear-gradient(to right, ${theme.accent}33, ${theme.accent}1a, transparent)`,
                  }}
                />
                <p
                  className="text-[8px] uppercase tracking-[0.5em] mb-1"
                  style={{ color: `${theme.accent}4d` }}
                >
                  EverAfter Studio
                </p>
                <p
                  className="font-serif italic text-[11px]"
                  style={{ color: `${theme.accent}66` }}
                >
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
