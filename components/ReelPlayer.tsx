"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Volume2, VolumeX } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    // 1. Set up the Intersection Observer
    const options = {
      root: null, // use the viewport
      rootMargin: "0px",
      threshold: 0.6, // Fire when 60% of the video is visible
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Video is central, play it
          videoRef.current?.play().catch(() => {
            // Autoplay might be blocked by browser
          });
        } else {
          // Video is scrolled away, pause it
          videoRef.current?.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    // 2. Clean up when component unmounts
    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const gownImage = gown?.imageUrls?.split(",")[0] || "/placeholder.jpg";

  return (
    // FULL SCREEN VIDEO CONTAINER (Deep twilight background instead of harsh black)
    <div className="relative w-full h-[100dvh] flex items-center justify-center bg-[#1a0f0f] overflow-hidden group snap-center border-b border-[#8c363e]/10">
      
      {/* THE MP4 VIDEO (Centered 9:16) */}
      <div className="relative aspect-[9/16] h-[100dvh] bg-[#1a0f0f] shadow-2xl">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          muted={muted}
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay (Warm Twilight Fade for text legibility) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0f] via-[#1a0f0f]/40 to-transparent pointer-events-none" />

        {/* --- THE SHOPPABLE CARD (Rose Glassmorphism) --- */}
        {gown && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ delay: 0.5, ease: [0.21, 1.11, 0.81, 0.99] }}
            className="absolute bottom-10 left-6 right-6 p-5 bg-[#2d1b1b]/40 backdrop-blur-xl border border-[#d99898]/20 rounded-2xl shadow-2xl z-20"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 relative rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                <Image src={gownImage} alt={gown.name} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-[#d99898] font-bold flex items-center gap-1.5">
                  <Sparkles size={11} className="text-[#d99898]" /> The {reel.category} Edit
                </p>
                <h3 className="text-[#FDF6F5] text-base font-serif font-bold line-clamp-1 tracking-wide">{gown.name}</h3>
                <p className="text-[#d99898] font-bold text-sm">₹{gown.price || "On Request"}</p>
              </div>
              <Link 
                href={`/gown/${gown.id}`}
                className="bg-[#FDF6F5] text-[#5A2A2F] p-3.5 rounded-full hover:bg-[#d99898] hover:text-white transition-colors shadow-[0_5px_15px_rgba(217,152,152,0.2)]"
              >
                <ArrowRight size={18} />
              </Link>
            </div>
            {reel.caption && (
               <p className="text-[#FDF6F5]/70 text-[11px] italic mt-4 border-t border-[#d99898]/20 pt-3 line-clamp-2">
                 "{reel.caption}"
               </p>
            )}
          </motion.div>
        )}

        {/* Volume Toggle (Frosted Glass) */}
        <button 
          onClick={() => setMuted(!muted)}
          className="absolute top-6 right-6 z-30 p-2.5 bg-[#2d1b1b]/50 text-[#FDF6F5] border border-[#d99898]/20 rounded-full backdrop-blur-md opacity-50 hover:opacity-100 transition-all shadow-lg"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

      </div>
    </div>
  );
}