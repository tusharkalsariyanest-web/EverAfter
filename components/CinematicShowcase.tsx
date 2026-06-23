"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  ArrowDown,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

interface Reel {
  id: number;
  videoUrl: string;
  category: string;
  caption: string | null;
  gownId: number | null;
  gownName?: string;
  gownPrice?: string;
  gownImage?: string;
}

interface CinematicShowcaseProps {
  reels: Reel[];
}

export default function CinematicShowcase({ reels }: CinematicShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // FIX 1: Safely import addItem so the component doesn't re-render and pause the video when the drawer opens
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === activeIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % reels.length);
  const handlePrev = () =>
    setActiveIndex((prev) => (prev === 0 ? reels.length - 1 : prev - 1));

  const handleAddToCart = (e: React.MouseEvent, reel: Reel) => {
    e.stopPropagation();

    if (!reel.gownId || !reel.gownName) return;

    const priceNumber = Number(reel.gownPrice?.replace(/[^0-9]/g, "")) || 0;

    addItem({
      gownId: reel.gownId,
      name: reel.gownName,
      price: priceNumber,
      image: reel.gownImage || "/placeholder.jpg",
    });
  };

  if (!reels || reels.length === 0) return null;

  return (
    <section className="relative w-full min-h-[90vh] bg-[#171112] pt-24 pb-10 md:pt-28 md:pb-12 overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* EXTRAORDINARY CINEMATIC LIGHTING SYSTEM */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0708_100%)] z-0 opacity-90 pointer-events-none" />
      <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-[#8c363e]/15 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] bg-[#d99898]/10 rounded-full blur-[140px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-[#5A2A2F]/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* HEADER TEXT (Restored!) */}

      {/* HORIZONTAL CAROUSEL */}
      <div className="relative z-10 w-full max-w-[1400px] h-[400px] md:h-[500px] lg:h-[580px] mt-6 flex justify-center items-center perspective-[1000px]">
        {reels.map((reel, index) => {
          const N = reels.length;
          let offset = index - activeIndex;
          if (offset > Math.floor(N / 2)) offset -= N;
          else if (offset < -Math.floor(N / 2)) offset += N;

          if (Math.abs(offset) > 2) return null;

          return (
            <motion.div
              key={reel.id}
              onClick={() => setActiveIndex(index)}
              animate={{
                x: `calc(${offset * 110}%)`,
                scale: offset === 0 ? 1 : 0.75,
                opacity: offset === 0 ? 1 : 0.4,
                zIndex: 50 - Math.abs(offset),
              }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className={`absolute inset-0 m-auto w-[220px] md:w-[280px] lg:w-[320px] aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer border ${
                offset === 0
                  ? "border-[#d99898]/40 shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
                  : "border-white/5 shadow-2xl hover:opacity-60"
              }`}
            >
              {/* FIX 2: Removed onEnded and added preload="auto" to stop buffering/pausing */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={reel.videoUrl}
                loop
                muted
                playsInline
                preload="auto"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  offset === 0
                    ? "brightness-100 saturate-100"
                    : "brightness-[0.4] saturate-50"
                }`}
              />

              {offset !== 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70">
                    <Play size={24} className="fill-white/70 ml-1" />
                  </div>
                </div>
              )}

              <AnimatePresence>
                {offset === 0 && reel.gownId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-4 left-4 right-4 p-4 bg-[#171112]/70 backdrop-blur-xl border border-[#d99898]/20 rounded-xl shadow-2xl flex flex-col gap-1"
                  >
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-[#d99898] font-bold mb-1">
                        {reel.category}
                      </p>
                      <h3 className="text-[#FDF6F5] font-serif text-lg leading-tight line-clamp-1 mb-1">
                        {reel.gownName || "Cinematic Masterpiece"}
                      </h3>
                      <p className="text-white/80 text-xs mb-3">
                        {reel.gownPrice ? `₹${reel.gownPrice}` : "Coming Soon"}
                      </p>
                    </div>

                    {/* Restored Action Buttons (Details & Add to Cart) */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/gown/${reel.gownId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 border border-[#d99898]/40 text-[#d99898] py-2.5 rounded-lg text-[9px] uppercase tracking-widest font-bold hover:bg-[#d99898] hover:text-[#171112] transition-colors"
                      >
                        Details
                      </Link>
                      <button
                        onClick={(e) => handleAddToCart(e, reel)}
                        className="flex items-center justify-center gap-1.5 bg-[#FDF6F5] text-[#5A2A2F] py-2.5 rounded-lg text-[9px] uppercase tracking-widest font-bold hover:bg-[#d99898] hover:text-white transition-colors"
                      >
                        Add <ShoppingBag size={12} className="mb-[1px]" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {offset === 0 && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0708] via-transparent to-transparent pointer-events-none opacity-80" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="relative z-20 w-full flex items-center justify-center gap-6 mt-4 md:mt-6">
        <button
          onClick={handlePrev}
          className="p-3 md:p-4 rounded-full border border-[#d99898]/20 text-[#d99898] bg-[#171112]/50 backdrop-blur-md hover:bg-[#d99898] hover:text-[#171112] transition-all shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="p-3 md:p-4 rounded-full border border-[#d99898]/20 text-[#d99898] bg-[#171112]/50 backdrop-blur-md hover:bg-[#d99898] hover:text-[#171112] transition-all shadow-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-30 mt-4 md:mt-6 flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() =>
          window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })
        }
      >
        <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-[#d99898] font-bold">
          Scroll to Shop
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] text-[#d99898]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
