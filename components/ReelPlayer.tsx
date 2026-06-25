"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Volume2, VolumeX, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReelPlayerProps {
  reel: {
    videoUrl: string;
    caption: string | null;
    category: string;
  };
  gown: {
    id: number;
    name: string;
    price: string | null;
    imageUrls: string | null;
  } | null;
}

export default function ReelPlayer({ reel, gown }: ReelPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [muted, setMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldPreload, setShouldPreload] = useState(false); // New smart loading state

  useEffect(() => {
    // 1. SMART PRELOADER: Triggers when the video is 1 screen away
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldPreload(true);
        }
      },
      { rootMargin: "100% 0px", threshold: 0 } // Looks exactly 1 screen height ahead
    );

    // 2. PLAY OBSERVER: Triggers when video is actually on screen
    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) {
      preloadObserver.observe(containerRef.current);
      playObserver.observe(containerRef.current);
    }

    return () => {
      preloadObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  const gownImage = gown?.imageUrls?.split(",")[0] || "/placeholder.jpg";

  return (
    // FULL SCREEN CONTAINER (Added containerRef here for our observers)
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] flex items-center justify-center bg-[#111] overflow-hidden group snap-center border-b border-[#8c363e]/10"
    >
      <div className="relative w-full h-full max-w-[500px] aspect-[9/16] bg-[#111] shadow-2xl mx-auto flex items-center justify-center">
        {/* Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#1a0f0f]">
            <Loader2 className="w-8 h-8 text-[#d99898] animate-spin mb-4" />
            <p className="text-[#FDF6F5]/50 text-xs tracking-widest uppercase">
              Loading Edit...
            </p>
          </div>
        )}

        {/* 
          THE SMART VIDEO TAG:
          Notice `preload` is set to "none" initially. It only switches to "auto" 
          when `shouldPreload` becomes true (when the user is 1 swipe away).
        */}
        <video
          ref={videoRef}
          src={shouldPreload ? reel.videoUrl : ""}
          loop
          muted={muted}
          playsInline
          preload={shouldPreload ? "auto" : "none"}
          poster={gownImage}
          onCanPlay={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Shoppable Card */}
        {gown && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ delay: 0.3, ease: [0.21, 1.11, 0.81, 0.99] }}
            className="absolute bottom-24 md:bottom-12 left-4 right-4 md:left-6 md:right-6 p-4 md:p-5 bg-[#2d1b1b]/60 backdrop-blur-xl border border-[#d99898]/30 rounded-2xl shadow-2xl z-20"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-16 md:w-16 md:h-20 relative rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10 shadow-inner">
                <Image
                  src={gownImage}
                  alt={gown.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-[#d99898] font-bold flex items-center gap-1.5">
                  <Sparkles size={11} className="text-[#d99898]" /> The{" "}
                  {reel.category} Edit
                </p>
                <h3 className="text-[#FDF6F5] text-sm md:text-base font-serif font-bold line-clamp-1 tracking-wide">
                  {gown.name}
                </h3>
                <p className="text-[#d99898] font-bold text-xs md:text-sm">
                  ₹{gown.price || "On Request"}
                </p>
              </div>
              <Link
                href={`/gown/${gown.id}`}
                className="bg-[#FDF6F5] text-[#5A2A2F] p-3 md:p-3.5 rounded-full hover:bg-[#d99898] hover:text-white transition-colors shadow-[0_5px_15px_rgba(217,152,152,0.2)]"
              >
                <ArrowRight size={16} />
              </Link>
            </div>
            {reel.caption && (
              <p className="text-[#FDF6F5]/80 text-[10px] md:text-[11px] italic mt-3 border-t border-[#d99898]/20 pt-3 line-clamp-2">
                "{reel.caption}"
              </p>
            )}
          </motion.div>
        )}

        {/* Volume Toggle */}
        <button
          onClick={() => setMuted(!muted)}
          className="absolute top-24 md:top-10 right-4 md:right-6 z-30 p-2.5 bg-black/40 text-[#FDF6F5] border border-white/10 rounded-full backdrop-blur-md opacity-75 hover:opacity-100 transition-all shadow-lg"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
}
