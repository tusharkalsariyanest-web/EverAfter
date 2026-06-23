"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatButton() {
  const [showGreeting, setShowGreeting] = useState(false);
  const phoneNumber = "8799282255"; 
  const message = "Namaste Suvarna Mahel, I am interested in a custom bridal inquiry.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Show greeting after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-4">
      
      {/* 1. BOUTIQUE GREETING BUBBLE */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white border border-[#C6A87C]/30 p-5 shadow-2xl max-w-[240px]"
          >
            {/* Close Greeting Button */}
            <button 
              onClick={() => setShowGreeting(false)}
              className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full hover:bg-[#C6A87C] transition-colors"
            >
              <X size={10} />
            </button>

            <div className="space-y-2">
              <p className="font-script text-[14px] text-[#C6A87C] italic">Namaste,</p>
              <p className="text-[10px] uppercase tracking-widest leading-relaxed text-gray-700">
                Welcome to <span className="font-bold text-black">Suvarna Mahel</span>.
                How may our bridal concierge assist you today?
              </p>
              <a 
                href={whatsappUrl}
                target="_blank"
                className="block text-center text-[9px] uppercase tracking-[0.2em] font-bold bg-[#C6A87C] text-black py-2 mt-2 hover:bg-black hover:text-white transition-all"
              >
                Start Consultation
              </a>
            </div>

            {/* Little arrow pointing to the button */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-[#C6A87C]/30 rotate-45" />
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