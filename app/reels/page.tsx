import { db } from "@/db";
import { reels, gowns } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ReelPlayer from "@/components/ReelPlayer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ReelsFeed() {
  // 1. Fetch all active reels (Discovery Algorithm - Newest First)
  const allReelsRaw = await db.query.reels.findMany({
    where: eq(reels.isActive, true),
    orderBy: [desc(reels.createdAt)],
  });

  // 2. Efficiently fetch linked gown data for all reels in parallel
  const reelsWithData = await Promise.all(
    allReelsRaw.map(async (reel) => {
      let linkedGown = null;
      if (reel.gownId) {
        linkedGown = await db.query.gowns.findFirst({
          where: eq(gowns.id, reel.gownId),
          columns: {
            id: true,
            name: true,
            price: true,
            imageUrls: true,
          },
        });
      }
      return {
        ...reel,
        gown: linkedGown,
      };
    })
  );

  return (
    // DARK MODE FEED CONTAINER
    // Added specific classes to completely hide the scrollbar across all browsers
    <div className="w-full h-[100dvh] bg-[#111] text-white overflow-y-scroll snap-y snap-mandatory relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Floating Back Button (Pushed to top-12 on mobile to clear the notch) */}
      <Link
        href="/"
        className="fixed top-12 left-4 md:top-8 md:left-8 z-[60] p-2.5 md:p-3 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition shadow-lg border border-white/10"
        aria-label="Go back to home"
      >
        <ChevronLeft size={22} strokeWidth={1.5} />
      </Link>

      {/* Rinku Video Lab watermark (Pushed down to align with the back button) */}
      <div className="fixed top-12 right-4 md:top-8 md:right-8 z-[60] text-center opacity-40 select-none pointer-events-none drop-shadow-md">
        <p className="font-serif text-base md:text-lg tracking-tight leading-none text-[#FDF6F5]">
          Rinku
        </p>
        <p className="text-[6px] md:text-[7px] uppercase tracking-[0.4em] text-[#d99898] -mt-0.5">
          Video Lab
        </p>
      </div>

      {reelsWithData.length === 0 ? (
        // Styled the empty state to match the new dark/rose aesthetic
        <div className="flex items-center justify-center h-full text-center p-10 bg-[#1a0f0f]">
          <div className="space-y-4">
            <p className="font-serif text-2xl text-[#d99898] italic">
              The Cinematic Vault is currently locked.
            </p>
            <p className="text-xs tracking-widest uppercase text-white/50">
              Check back soon for new edits
            </p>
          </div>
        </div>
      ) : (
        // Map data to the interactive player component
        reelsWithData.map((data) => (
          <ReelPlayer key={data.id} reel={data} gown={data.gown ?? null} />
        ))
      )}
    </div>
  );
}
