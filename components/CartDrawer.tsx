"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();

  // Calculate the total price
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#171112]/60 backdrop-blur-sm z-[200]"
          />

          {/* 2. The Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-full md:w-[400px] bg-[#FDF6F5] shadow-2xl z-[250] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E8D0D2]/50">
              <h2 className="font-serif text-2xl text-[#2d1b1b] flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#8c363e]" /> Your Cart
              </h2>
              <button 
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-[#E8D0D2]/30 text-[#8c363e] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                  <ShoppingBag size={48} className="mb-4 text-[#C0858B]" strokeWidth={1} />
                  <p className="font-serif text-xl text-[#2d1b1b]">Your cart is empty</p>
                  <p className="text-xs uppercase tracking-widest text-[#8c363e] mt-2">Discover the collection</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.gownId} className="flex gap-4 group">
                    {/* Item Image */}
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden border border-[#E8D0D2]/50 bg-white flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-[#2d1b1b] leading-tight line-clamp-2 pr-4">{item.name}</h3>
                          <button 
                            onClick={() => removeItem(item.gownId)}
                            className="text-[#C0858B] hover:text-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-[#8A4A52] font-bold text-sm mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center border border-[#E8D0D2] rounded-full bg-white">
                          <button 
                            onClick={() => updateQuantity(item.gownId, item.quantity - 1)}
                            className="p-1.5 hover:bg-[#FDF6F5] rounded-l-full text-[#8A4A52] transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#2d1b1b]">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.gownId, item.quantity + 1)}
                            className="p-1.5 hover:bg-[#FDF6F5] rounded-r-full text-[#8A4A52] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout Button */}
            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-[#E8D0D2]/50 shadow-[0_-10px_30px_rgba(140,54,62,0.05)]">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#8A4A52] font-bold">Subtotal</span>
                  <span className="font-serif text-2xl text-[#2d1b1b]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[9px] text-[#C0858B] mb-4 text-right">Taxes and shipping calculated at checkout</p>
                
                {/* This will soon link to our Secure Checkout page! */}
               <Link 
  href="/checkout" 
  onClick={closeCart}
  className="w-full flex items-center justify-center gap-2 bg-[#5A2A2F] text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-colors shadow-lg text-center"
>
  Secure Checkout <ArrowRight size={14} />
</Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}