"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { ShoppingBag, CreditCard, Loader2, CheckCircle } from "lucide-react";

interface GownActionsProps {
  gown: {
    id: number;
    name: string;
    price: any;
    imageUrls: string | null;
  };
}

export default function GownActions({ gown }: GownActionsProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Safely extract the first image or fall back to a generic placeholder
  const firstImage = gown.imageUrls
    ? gown.imageUrls.split(",")[0]
    : "/placeholder-gown.png";
  const parsedPrice = gown.price ? Number(gown.price) : 0;

  const handleAddToCart = () => {
    setIsAdding(true);

    // Fire action to your Zustand Store structure (REMOVED quantity: 1)
    addItem({
      gownId: gown.id,
      name: gown.name,
      price: parsedPrice,
      image: firstImage,
    });

    setTimeout(() => {
      setIsAdding(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 600);
  };

  const handleBuyNow = () => {
    // Clear old state configurations and push only this item for lightning checkout
    useCartStore.setState({ items: [] });

    // (REMOVED quantity: 1)
    addItem({
      gownId: gown.id,
      name: gown.name,
      price: parsedPrice,
      image: firstImage,
    });

    router.push("/checkout");
  };

  return (
    <div className="space-y-4 w-full relative">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="flex-1 bg-transparent text-[#8c363e] border border-[#8c363e] py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#8c363e]/5 transition-colors flex items-center justify-center gap-3 rounded-full disabled:opacity-50"
        >
          {isAdding ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <ShoppingBag size={16} /> Add to Bag
            </>
          )}
        </button>

        {/* BUY NOW */}
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-[#8c363e] text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#6b272f] transition-colors shadow-[0_10px_30px_rgba(140,54,62,0.2)] flex items-center justify-center gap-3 rounded-full"
        >
          <CreditCard size={16} /> Direct Buy Now
        </button>
      </div>

      {/* MINIMAL PREMIUM NOTIFICATION TOAST */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2d1b1b] text-white text-xs px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 z-50 animate-bounce">
          <CheckCircle size={16} className="text-green-400" />
          <span className="font-sans tracking-wide uppercase text-[9px] font-bold">
            Added "{gown.name}" to your collection basket!
          </span>
        </div>
      )}
    </div>
  );
}
