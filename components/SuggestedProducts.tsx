import { db } from "@/db";
import { gowns } from "@/db/schema"; // Updated to gowns schema
import { desc, ne, eq, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export default async function SuggestedProducts({ currentId, category }: { currentId: number, category: string }) {
  // Updated to query the gowns table
  const suggested = await db.query.gowns.findMany({
    where: and(eq(gowns.category, category), ne(gowns.id, currentId)),
    limit: 4,
    orderBy: [desc(gowns.createdAt)],
  });

  if (suggested.length === 0) return null;

  return (
    <section className="mt-24 border-t border-gray-200 pt-16">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl uppercase tracking-tighter text-gray-900">Similar Masterpieces</h2>
        {/* Changed the gold line to a sleek black line */}
        <div className="w-12 h-px bg-black mx-auto mt-4"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {suggested.map((item) => {
          const img = item.imageUrls?.split(",")[0] || "/placeholder.jpg";
          return (
            // Updated the route from /product/ to /gown/
            <Link href={`/gown/${item.id}`} key={item.id} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 border border-gray-100">
                <Image 
                  src={img} 
                  alt={item.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-900 group-hover:text-gray-500 transition-colors">
                  {item.name}
                </h3>
                {/* Changed the gold text to a premium gray */}
                <p className="text-gray-500 text-xs mt-1">₹{item.price}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}