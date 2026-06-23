import { db } from "@/db";
import { gowns } from "@/db/schema";
import { ilike, desc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Clean the URL slug (e.g., "bridal-set" becomes "bridal")
  const cleanSlug = slug.replace("-", " ");

  // Fetch the masterpieces that match this category
  // Using ilike for a flexible, case-insensitive search
  const categoryGowns = await db.query.gowns.findMany({
    where: ilike(gowns.category, `%${cleanSlug}%`),
    orderBy: [desc(gowns.createdAt)],
  });

  // Format the title beautifully
  const displayTitle = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF6F5] to-[#FCFBF9] font-sans">
      
      {/* --- CATEGORY HERO SECTION --- */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Soft Ambient Glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-[#8c363e]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#8c363e] font-bold flex items-center justify-center gap-2 mb-4 animate-[fade-in_1s_ease-out]">
            <Sparkles size={12} /> The 2026 Edit
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-[#2d1b1b] tracking-tight mb-6 animate-[fade-in_1s_ease-out_0.2s_both]">
            {displayTitle}
          </h1>
          <p className="text-[#8c363e]/80 text-sm max-w-lg mx-auto font-light leading-relaxed animate-[fade-in_1s_ease-out_0.4s_both]">
            Curated pieces engineered for the lens. Explore our exclusive {displayTitle} collection, designed to catch the light and move beautifully on your special day.
          </p>
        </div>
      </div>

      {/* --- MASTERPIECE GRID --- */}
      <div className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        {categoryGowns.length === 0 ? (
          // Empty State
          <div className="text-center py-32 border border-[#8c363e]/10 bg-white/50 backdrop-blur-sm rounded-2xl">
            <p className="font-serif text-2xl text-[#2d1b1b] mb-2">The Vault is sealed.</p>
            <p className="text-sm text-[#8c363e]/60 font-light">We are currently curating new cinematic pieces for this collection.</p>
            <Link href="/" className="inline-block mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-[#8c363e] border-b border-[#8c363e] pb-1 hover:text-[#2d1b1b] hover:border-[#2d1b1b] transition-colors">
              Return to All Collections
            </Link>
          </div>
        ) : (
          // The Cinematic Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
            {categoryGowns.map((gown, index) => {
              const firstImage = gown.imageUrls?.split(",")[0] || "/placeholder.jpg";
              
              return (
                <Link 
                  href={`/gown/${gown.id}`} 
                  key={gown.id}
                  className="group block animate-[fade-in-up_0.8s_ease-out_both]"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Image Card */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-white/50 shadow-[0_20px_40px_rgba(140,54,62,0.05)] mb-6">
                    <Image 
                      src={firstImage} 
                      alt={gown.name} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b1b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                       <div className="flex items-center justify-between text-[#FDF6F5] translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-[10px] uppercase tracking-widest font-bold">View Masterpiece</p>
                          <ArrowRight size={16} />
                       </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="text-center px-4">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#8c363e]/70 font-bold mb-2">
                      {gown.category}
                    </p>
                    <h3 className="font-serif text-xl text-[#2d1b1b] group-hover:text-[#8c363e] transition-colors mb-2 line-clamp-1">
                      {gown.name}
                    </h3>
                    <p className="text-sm font-medium text-[#2d1b1b]">
                      ₹{gown.price} <span className="text-[10px] text-gray-400 font-light uppercase tracking-widest">/ Rental</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      {/* --- CUSTOM CSS ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}