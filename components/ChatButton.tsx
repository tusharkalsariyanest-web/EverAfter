"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatButton() {
  const [showGreeting, setShowGreeting] = useState(false);
  const phoneNumber = "8799282255";
  const message =
    "Namaste Suvarna Mahel, I am interested in a custom bridal inquiry.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // Show greeting after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    // Adjusted padding for better mobile responsiveness (bottom-6 right-6 on small screens)
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[150] flex flex-col items-end gap-4">
      {/* 1. PREMIUM GLASSMORPHISM GREETING BUBBLE */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="relative bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-6 rounded-2xl max-w-[260px]"
          >
            {/* Elevated Close Button */}
            <button
              onClick={() => setShowGreeting(false)}
              className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-[#C6A87C] transition-all shadow-lg hover:scale-110"
              aria-label="Close greeting"
            >
              <X size={12} strokeWidth={2.5} />
            </button>

            <div className="space-y-3">
              <p className="font-serif text-[16px] text-[#C6A87C] italic leading-none">
                Namaste,
              </p>
              <p className="text-[11px] uppercase tracking-widest leading-relaxed text-gray-800">
                Welcome to{" "}
                <span className="font-bold text-black">Suvarna Mahel</span>. How
                may our bridal concierge assist you today?
              </p>

              {/* Upgraded CTA Button with subtle gradient and glow */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[10px] uppercase tracking-[0.2em] font-bold bg-gradient-to-r from-[#C6A87C] to-[#b89a6f] text-white py-3 px-4 mt-4 rounded-xl shadow-md hover:shadow-[0_0_20px_rgba(198,168,124,0.4)] transition-all duration-300"
              >
                Start Consultation
              </a>
            </div>

            {/* Seamless pointing arrow matching the glass effect */}
            <div className="absolute -bottom-2 right-[1.35rem] w-5 h-5 bg-white/70 backdrop-blur-xl border-r border-b border-white/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE FLOATING CONCIERGE BUTTON */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat on WhatsApp"
        className="flex items-center justify-center w-14 h-14 bg-black/90 backdrop-blur-md text-[#C6A87C] rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#C6A87C] hover:text-white"
      >
        <MessageCircle size={26} strokeWidth={1.5} />
      </motion.a>
    </div>
  );
}
