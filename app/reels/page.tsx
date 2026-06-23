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
    // DARK MODE FEED CONTAINER (Enable snap scrolling)
    <div className="w-full h-[100dvh] bg-black text-white overflow-y-scroll snap-y snap-mandatory no-scrollbar font-sans relative">
      {/* Floating Back Button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 p-3 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white transition shadow-2xl border border-white/10"
      >
        <ChevronLeft size={20} />
      </Link>

      {/* Rinku Video Lab watermark */}
      <div className="fixed top-8 right-8 z-50 text-center opacity-40 select-none pointer-events-none">
        <p className="font-serif text-lg tracking-tight leading-none">Rinku</p>
        <p className="text-[7px] uppercase tracking-[0.4em] -mt-0.5">
          Video Lab
        </p>
      </div>

      {reelsWithData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center p-10">
          <p className="font-serif text-2xl text-gray-600 italic">
            The Cinematic Vault is currently locked.
          </p>
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
