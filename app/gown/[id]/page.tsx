import { db } from "@/db";
import { gowns, reels } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import GownActions from "@/components/GownActions"; // <-- IMPORTED NEW COMPONENT HERE
import { Sparkles, Video, Play, ShieldCheck, ChevronDown, Heart } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default async function GownDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const gown = await db.query.gowns.findFirst({
    where: eq(gowns.id, parseInt(id))
  });

  if (!gown) return notFound();

  
  const linkedReel = await db.query.reels.findFirst({
    where: eq(reels.gownId, gown.id),
    orderBy: [desc(reels.createdAt)]
  });

  const images = gown.imageUrls?.split(",") || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF6F5] to-[#FCFBF9] font-sans relative overflow-hidden">
      
      {/* 1. THE CINEMATIC MANDAP EFFECTS */}
      <div className="fixed inset-0 z-[60] bg-[#FDF6F5] animate-[fade-out_2s_ease-in-out_forwards] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-[#8c363e]/10 via-[#8c363e]/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10vh] left-[-10vw] w-[60vw] h-[30vh] bg-[#a85058]/10 rounded-[100%] blur-[40px] pointer-events-none" />
      <div className="absolute top-[-10vh] right-[-10vw] w-[60vw] h-[30vh] bg-[#d99898]/15 rounded-[100%] blur-[40px] pointer-events-none" />

      {/* Swaying Fairy Lights */}
      <div className="absolute top-0 left-[15%] h-[30vh] pointer-events-none animate-[sway_4s_ease-in-out_infinite] origin-top">
         <div className="w-[1px] h-full bg-gradient-to-b from-white/40 to-transparent mx-auto" />
         <div className="absolute bottom-10 -left-1 w-2.5 h-2.5 bg-yellow-100 rounded-full shadow-[0_0_15px_rgba(255,220,100,0.8)] animate-[twinkle_3s_infinite]" />
         <div className="absolute bottom-24 left-0 w-1.5 h-1.5 bg-yellow-100 rounded-full shadow-[0_0_10px_rgba(255,220,100,0.6)] animate-[twinkle_4s_infinite_1s]" />
      </div>

      <div className="absolute top-0 right-[20%] h-[45vh] pointer-events-none animate-[sway_5s_ease-in-out_infinite_1s] origin-top hidden md:block">
         <div className="w-[1px] h-full bg-gradient-to-b from-white/40 to-transparent mx-auto" />
         <div className="absolute bottom-20 -left-1 w-2 h-2 bg-yellow-100 rounded-full shadow-[0_0_15px_rgba(255,220,100,0.8)] animate-[twinkle_2.5s_infinite_0.5s]" />
         <div className="absolute bottom-40 left-0.5 w-1.5 h-1.5 bg-yellow-100 rounded-full shadow-[0_0_10px_rgba(255,220,100,0.6)] animate-[twinkle_3.5s_infinite_1.5s]" />
      </div>

      {/* Fireflies */}
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
        <div className="absolute bottom-[-10%] left-[10%] w-1.5 h-1.5 bg-[#FFD700] rounded-full shadow-[0_0_10px_#FFD700] animate-[firefly-rise_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[40%] w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_12px_#FFD700] animate-[firefly-rise_15s_ease-in-out_infinite_2s] opacity-70" />
        <div className="absolute bottom-[-10%] left-[70%] w-1 h-1 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700] animate-[firefly-rise_10s_ease-in-out_infinite_5s]" />
        <div className="absolute bottom-[-10%] left-[85%] w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_15px_#FFD700] animate-[firefly-rise_18s_ease-in-out_infinite_1s] opacity-50" />
      </div>

      {/* 2. THE MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* Left: Sticky Image Gallery */}
        <div className="lg:col-span-7 sticky top-20 h-max p-2 bg-white/60 backdrop-blur-md shadow-[0_20px_50px_rgba(140,54,62,0.05)] border border-white rounded-xl">
          <ProductGallery images={images} alt={gown.name} />
        </div>

        {/* Right: The Bridal Details */}
        <div className="lg:col-span-5 space-y-8 lg:pt-10">
          
          <div className="space-y-4">
            <p className="text-[9px] uppercase tracking-[0.4em] text-[#8c363e] font-bold flex items-center gap-2">
              <Sparkles size={12} /> The Sunset {gown.category} Edit
            </p>
            
            <h1 className="font-serif text-4xl lg:text-5xl text-[#2d1b1b] leading-[1.1] tracking-tight">
              {gown.name}
            </h1>
            
            <div className="flex items-center gap-2">
              <Heart size={12} className="text-[#d99898] fill-[#d99898]" />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">A Bride & Creator Favorite</p>
            </div>

            <p className="font-serif text-3xl text-[#2d1b1b] pt-2">
              ₹{gown.price ? Number(gown.price).toLocaleString('en-IN') : "0"}
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8c363e]/20 to-transparent" />

          <p className="text-sm text-gray-600 leading-relaxed font-light">
            {gown.description}
          </p>

          <div className="bg-white/50 border border-[#8c363e]/10 p-5 flex items-start gap-4 rounded-xl backdrop-blur-sm shadow-sm">
            <ShieldCheck className="text-[#8c363e] mt-0.5" size={20} />
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-[#2d1b1b] mb-1">Cinematic Quality</p>
              <p className="text-xs text-gray-600 font-light leading-relaxed">Engineered by Rinku Video Lab. This fabric catches the golden hour light perfectly for flawless, dreamy captures.</p>
            </div>
          </div>

          <div className="border-t border-[#8c363e]/10 divide-y divide-[#8c363e]/10">
            <details className="group py-4 cursor-pointer" open>
              <summary className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2d1b1b] flex justify-between items-center list-none">
                Fabric & Silhouette
                <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pt-4 text-sm text-gray-600 font-light space-y-2">
                <p><strong className="font-medium text-[#2d1b1b]">Material:</strong> {gown.fabric}</p>
                <p><strong className="font-medium text-[#2d1b1b]">Color Palette:</strong> {gown.color}</p>
                <p><strong className="font-medium text-[#2d1b1b]">Designer Style:</strong> {gown.style}</p>
              </div>
            </details>

            <details className="group py-4 cursor-pointer">
              <summary className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2d1b1b] flex justify-between items-center list-none">
                Fit & Sizing
                <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="pt-4 text-sm text-gray-600 font-light">
                <p>Designed to flatter. Current size options available for this piece: <span className="text-[#2d1b1b] font-medium">{gown.sizeOptions}</span>.</p>
              </div>
            </details>
          </div>

          {/* LINKED THE INTERACTIVE CLIENT COMPONENT HERE */}
          <GownActions gown={gown} />
          
        </div>
      </div>

      {/* --- BOTTOM: The Cinematic Reel --- */}
      {linkedReel && (
        <section className="bg-white/80 backdrop-blur-md border-t border-[#8c363e]/10 py-24 mt-12 relative overflow-hidden z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">
            
            <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8c363e] font-bold flex items-center justify-center lg:justify-start gap-2.5">
                <Video size={14} className="text-[#8c363e]" /> Dream in Motion
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl text-[#2d1b1b] leading-tight">
                {linkedReel.caption || "Cinematic Perfection"}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-light max-w-md mx-auto lg:mx-0">
                Watch the fabric flow and catch the light. See exactly how this masterpiece looks on camera before you make it part of your special day.
              </p>
              
              <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/reels" className="w-full sm:w-auto bg-[#2d1b1b] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a2e2e] transition-colors flex items-center justify-center gap-3 shadow-xl rounded-full">
                   <Play size={14} className="fill-white"/> Explore Reel Gallery
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative aspect-[9/16] w-full max-w-[320px] h-auto bg-white p-2 rounded-2xl shadow-[0_20px_50px_rgba(140,54,62,0.15)] border border-[#8c363e]/10 group overflow-hidden">
                <div className="w-full h-full relative rounded-xl overflow-hidden">
                    <video 
                        src={linkedReel.videoUrl} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      <Footer />

      {/* --- CUSTOM CSS ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; display: none; z-index: -1; }
        }
        @keyframes sway {
          0% { transform: rotate(2deg); }
          50% { transform: rotate(-2deg); }
          100% { transform: rotate(2deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes firefly-rise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translateY(-50vh) translateX(20px); }
          80% { opacity: 1; }
          100% { transform: translateY(-110vh) translateX(-20px); opacity: 0; }
        }
      `}} />
    </div>
  );
}