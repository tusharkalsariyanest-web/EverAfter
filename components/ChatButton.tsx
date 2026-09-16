"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatButton() {
  const [showGreeting, setShowGreeting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const phoneNumber = "9377603050";

  // Updated romantic bridal inquiry message
  const message =
    "Namaste EverAfter! I would love to begin the beautiful journey of finding my dream bridal ensemble for my big day.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show greeting after 3 seconds — only on desktop
  useEffect(() => {
    if (isMobile) {
      setShowGreeting(false);
      return;
    }
    const timer = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(timer);
  }, [isMobile]);

  return (
    <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[150] flex flex-col items-end gap-3">
      {/* 1. BOUTIQUE GREETING BUBBLE — Desktop only */}
      <AnimatePresence>
        {showGreeting && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white/90 backdrop-blur-md border border-[#C6A87C]/30 p-4 shadow-[0_8px_30px_rgba(198,168,124,0.12)] max-w-[220px] rounded-lg"
          >
            {/* Close Greeting Button */}
            <button
              onClick={() => setShowGreeting(false)}
              className="absolute -top-2 -right-2 bg-[#1a0f10] text-white p-1 rounded-full hover:bg-[#C6A87C] transition-colors shadow-md"
            >
              <X size={10} />
            </button>

            <div className="space-y-2">
              <p className="font-serif text-[13px] text-[#C6A87C] italic">
                Namaste,
              </p>
              <p className="text-[9px] uppercase tracking-[0.12em] leading-relaxed text-gray-700">
                Welcome to{" "}
                <span className="font-bold text-[#1a0f10]">EverAfter</span>.
                Let us help you craft the perfect silhouette for your forever.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[8px] uppercase tracking-[0.2em] font-bold bg-gradient-to-r from-[#C6A87C] to-[#b3915f] text-white py-2 mt-1.5 rounded-md shadow-sm hover:shadow-[0_0_15px_rgba(198,168,124,0.4)] transition-all"
              >
                Begin Your Journey
              </a>
            </div>

            {/* Little arrow pointing to the button */}
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white/90 backdrop-blur-md border-r border-b border-[#C6A87C]/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE FLOATING CONCIERGE BUTTON */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-[#C6A87C] text-black p-3.5 md:p-4 rounded-full shadow-[0_0_25px_rgba(198,168,124,0.5)] transition-all hover:bg-black hover:text-[#C6A87C]"
      >
        <MessageCircle size={22} strokeWidth={1.5} className="md:w-6 md:h-6" />
      </motion.a>
    </div>
  );
}
