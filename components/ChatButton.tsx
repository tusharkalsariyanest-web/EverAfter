"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatButton() {
  const [showGreeting, setShowGreeting] = useState(false);
  const phoneNumber = "9377603050";

  // Updated romantic bridal inquiry message
  const message =
    "Namaste EverAfter! I would love to begin the beautiful journey of finding my dream bridal ensemble for my big day.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // Show greeting after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">
      {/* 1. BOUTIQUE GREETING BUBBLE (Sizes strictly locked to original) */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white/85 backdrop-blur-md border border-[#C6A87C]/40 p-5 shadow-[0_8px_32px_rgba(198,168,124,0.15)] max-w-[240px] rounded-sm"
          >
            {/* Close Greeting Button */}
            <button
              onClick={() => setShowGreeting(false)}
              className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full hover:bg-[#C6A87C] transition-colors shadow-md"
            >
              <X size={10} />
            </button>

            <div className="space-y-2">
              <p className="font-serif text-[14px] text-[#C6A87C] italic">
                Namaste,
              </p>
              <p className="text-[10px] uppercase tracking-widest leading-relaxed text-gray-800">
                Welcome to{" "}
                <span className="font-bold text-black">EverAfter</span>. Let us
                help you craft the perfect silhouette for your forever.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[9px] uppercase tracking-[0.2em] font-bold bg-gradient-to-r from-[#C6A87C] to-[#b3915f] text-white py-2 mt-2 shadow-sm hover:shadow-[0_0_15px_rgba(198,168,124,0.4)] transition-all"
              >
                Begin Your Journey
              </a>
            </div>

            {/* Little arrow pointing to the button */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white/85 backdrop-blur-md border-r border-b border-[#C6A87C]/40 rotate-45" />
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
        className="bg-[#C6A87C] text-black p-4 rounded-full shadow-[0_0_25px_rgba(198,168,124,0.5)] transition-all hover:bg-black hover:text-[#C6A87C]"
      >
        <MessageCircle size={24} strokeWidth={1.5} />
      </motion.a>
    </div>
  );
}
