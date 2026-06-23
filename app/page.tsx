import { db } from "@/db";
import { gowns, reels } from "@/db/schema";
import Link from "next/link";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { ChevronRight, Sparkles, ShieldCheck, Camera } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CinematicShowcase from "@/components/CinematicShowcase";

export default async function Home() {
  // 1. Fetch all gowns
  const allGowns = await db.query.gowns.findMany({
    orderBy: [desc(gowns.createdAt)],
  });

  // 2. Fetch all active reels and link them to their gowns for the Showcase
  const rawReels = await db.query.reels.findMany({
    where: eq(reels.isActive, true),
    orderBy: [desc(reels.createdAt)],
  });

  const reelsForShowcase = rawReels.map((reel) => {
    const linkedGown = allGowns.find((g) => g.id === reel.gownId);

    return {
      id: reel.id,
      videoUrl: reel.videoUrl,
      category: reel.category || "Featured",
      caption: reel.caption,
      gownId: reel.gownId,
      gownName: linkedGown?.name,
      gownPrice: linkedGown?.price ?? undefined,
      gownImage: linkedGown?.imageUrls?.split(",")[0] || "/placeholder.jpg",
    };
  });

  // Dynamic Content Logic
  const featuredGowns = allGowns.length > 0 ? allGowns.slice(0, 6) : [];
  const vaultGowns = allGowns;

  return (
    <div className="w-full bg-[#FDF6F5] font-sans selection:bg-[#C0858B] selection:text-white">
      <Navbar />

      {/* 1. CINEMATIC SPOTLIGHT */}
      {reelsForShowcase.length > 0 ? (
        <CinematicShowcase reels={reelsForShowcase} />
      ) : (
        <div className="w-full h-[60vh] flex items-center justify-center bg-[#1a0f0f]">
          <p className="text-[#d99898] font-serif italic text-2xl">
            The Studio is currently preparing new reels...
          </p>
        </div>
      )}

      {/* 3. NEW EDITS */}
      {featuredGowns.length > 0 && (
        <section className="pt-16 pb-20 md:pt-20 md:pb-24 overflow-hidden bg-gradient-to-b from-[#FDF6F5] to-white">
          <div className="max-w-7xl mx-auto px-6 mb-8 flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="font-serif text-3xl md:text-4xl tracking-tight text-[#2d1b1b] leading-none">
                The Studio Edit
              </h3>
              <p className="text-[#C0858B] text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-bold">
                Latest arrivals
              </p>
            </div>
            <p className="text-[8px] uppercase tracking-widest text-[#C0858B] font-bold mb-1 border-b border-[#C0858B] pb-0.5">
              Swipe ➝
            </p>
          </div>

          <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar px-6 md:px-20 pb-10">
            {featuredGowns.map((item) => (
              <Link
                href={`/gown/${item.id}`}
                key={item.id}
                className="min-w-[220px] md:min-w-[320px] group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#FCFBF9] rounded-xl border border-[#E8D0D2]/50 transition-all duration-700 shadow-[0_10px_30px_rgba(140,54,62,0.05)] group-hover:shadow-[0_20px_50px_rgba(140,54,62,0.15)] group-hover:border-[#C0858B]/50">
                  <Image
                    src={item.imageUrls?.split(",")[0] || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-[2000ms]"
                  />
                </div>
                <div className="mt-5 space-y-1 text-center">
                  <p className="text-[#C0858B] text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-bold">
                    {item.category}
                  </p>
                  <h4 className="font-serif text-base md:text-lg tracking-tight text-[#2d1b1b] group-hover:text-[#8c363e] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[#5A2A2F] font-bold text-xs md:text-sm pt-1">
                    {item.price ? `₹${item.price}` : "Coming Soon"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. THE VAULT */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 border-t border-[#E8D0D2]/50">
        <div className="flex flex-col items-center mb-10 md:mb-16 text-center">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tighter text-[#2d1b1b] leading-none">
            The Wardrobe
          </h2>
          <div className="w-12 h-px bg-[#8c363e] mt-6"></div>
          <p className="text-[#C0858B] text-[9px] md:text-[10px] uppercase tracking-[0.4em] mt-5 font-bold">
            Complete Collection
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12 md:gap-x-8 md:gap-y-16">
          {vaultGowns.map((item) => {
            const priceNumber = Number(item.price?.replace(/[^0-9]/g, "")) || 0;
            const isPremium = priceNumber > 20000;

            return (
              <Link href={`/gown/${item.id}`} key={item.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#FCFBF9] rounded-xl shadow-sm border border-[#E8D0D2]/50 transition-all duration-1000 group-hover:shadow-[0_15px_40px_rgba(140,54,62,0.1)]">
                  {isPremium && (
                    <div className="absolute top-3 right-3 z-20 bg-[#5A2A2F] text-white text-[6px] md:text-[8px] uppercase tracking-[0.2em] font-bold px-2.5 py-1.5 rounded-md shadow-md">
                      Premium
                    </div>
                  )}
                  <Image
                    src={item.imageUrls?.split(",")[0] || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-[2500ms]"
                  />
                </div>

                <div className="mt-5 text-center space-y-1.5">
                  <h3 className="font-serif text-sm tracking-wide text-[#2d1b1b] group-hover:text-[#8A4A52] transition-colors truncate px-2">
                    {item.name}
                  </h3>
                  <p className="text-[#5A2A2F] font-bold text-xs">
                    {item.price ? `₹${item.price}` : "Coming Soon"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
