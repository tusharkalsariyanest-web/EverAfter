import { db } from "@/db";
import { gowns, reels, orders } from "@/db/schema"; // 1. Added orders to schema imports
import { desc, eq, sql } from "drizzle-orm";
import { ExternalLink, Plus, Edit, Video, Star, AlertTriangle, ShoppingBag, Truck } from "lucide-react"; // 2. Added ShoppingBag & Truck
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/DeleteButton";
import { toggleFeaturedReel } from "@/actions/reel-actions"; 

export default async function AdminDashboard() {
  // Fetch Gowns
  const allGowns = await db.query.gowns.findMany({
    orderBy: [desc(gowns.createdAt)],
  });

  // Fetch Reels
  const allReels = await db.query.reels.findMany({
    orderBy: [desc(reels.createdAt)],
  });

  // Split the reels for the new Homepage UI
  const featuredReels = allReels.filter(r => r.isFeaturedOnHome);

  // 3. NEW: Fetch Quick Order Metrics for the summary tab
  const totalOrdersCount = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const activePaidOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "PAID"));

  // Delete Actions
  async function deleteGown(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await db.delete(gowns).where(eq(gowns.id, parseInt(id)));
    revalidatePath("/admin");
    revalidatePath("/");
  }

  async function deleteReel(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await db.delete(reels).where(eq(reels.id, parseInt(id)));
    revalidatePath("/admin");
    revalidatePath("/");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-10">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* TOP HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="font-serif text-4xl text-gray-900">Studio Dashboard</h1>
            <p className="text-[#8c363e] text-xs uppercase tracking-widest mt-2 font-bold">Everafter x Rinku Video Lab</p>
          </div>
          
          {/* HEADER BUTTONS: Added Logistics Tab Link Here */}
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/admin/orders" 
              className="bg-[#5A2A2F] text-white px-5 py-3 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-[#2d1b1b] transition-all shadow-md"
            >
              <ShoppingBag size={14} /> Orders Fulfillment
            </Link>
            <Link 
              href="/admin/gowns/add" 
              className="bg-white text-black border border-gray-200 px-5 py-3 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Plus size={14} /> Add Gown
            </Link>
            <Link 
              href="/admin/reels/add" 
              className="bg-black text-white px-5 py-3 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg"
            >
              <Video size={14} /> Upload Reel
            </Link>
          </div>
        </div>

        {/* ========================================= */}
        {/* NEW SECTION: LOGISTICS GATEWAY SUMMARY PANEL */}
        {/* ========================================= */}
        <div className="bg-white border border-[#E8D0D2]/60 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8c363e]/5 text-[#8c363e] rounded-xl flex items-center justify-center border border-[#E8D0D2]/40 shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-gray-900">Order & Delivery Pipeline</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {activePaidOrders[0]?.count || 0} orders waiting for Delhivery allocation • Total logged orders: {totalOrdersCount[0]?.count || 0}
              </p>
            </div>
          </div>
          <Link 
            href="/admin/orders" 
            className="text-[10px] uppercase tracking-widest font-bold border border-gray-300 text-gray-700 bg-gray-50 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            Open Order Tracking Console <ExternalLink size={12} />
          </Link>
        </div>

        {/* ========================================= */}
        {/* SECTION 1: HOMEPAGE REEL SHOWCASE MANAGER */}
        {/* ========================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-gray-900 flex items-center gap-2">
              <Star size={20} className="text-[#d99898] fill-[#d99898]" /> Homepage Showcase
            </h2>
            
            {/* Performance Warning for Mobile Lag */}
            {featuredReels.length > 5 && (
              <div className="bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-md flex items-center gap-2 text-xs font-bold">
                <AlertTriangle size={14} /> 
                Over 5 reels may cause mobile lag.
              </div>
            )}
          </div>

          {featuredReels.length === 0 ? (
            <div className="p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
               <p className="text-gray-500 text-sm">No reels are currently featured on the homepage. Toggle one on below!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredReels.map((reel) => {
                const linkedGown = allGowns.find(g => g.id === reel.gownId);
                return (
                  <div key={reel.id} className="relative rounded-xl overflow-hidden border-2 border-[#d99898] shadow-sm group">
                    <div className="aspect-[9/16] bg-black relative">
                      <video src={reel.videoUrl} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                         <p className="text-white font-bold text-[10px] uppercase truncate">{linkedGown?.name || "No Gown Linked"}</p>
                      </div>
                    </div>
                    {/* Remove from Homepage Quick Action */}
                    <form action={toggleFeaturedReel.bind(null, reel.id, true)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="submit" className="bg-white text-red-600 p-1.5 rounded-full shadow-lg hover:bg-red-50 text-[10px] font-bold">
                        Remove
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ========================================= */}
        {/* SECTION 2: ALL REELS (With Toggle Switch) */}
        {/* ========================================= */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-gray-900">All Cinematic Reels</h2>
          <div className="border border-gray-100 rounded-sm bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                  <th className="p-4 font-bold">Preview</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Linked Gown ID</th>
                  <th className="p-4 font-bold">Homepage Placement</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allReels.map((reel) => (
                  <tr key={reel.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-12 bg-black relative overflow-hidden rounded-sm flex items-center justify-center border border-gray-200">
                           <video src={reel.videoUrl} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{reel.caption || "Untitled Reel"}</p>
                          <p className="text-[10px] text-green-600 uppercase tracking-tighter mt-1">
                            {reel.isActive ? "Published" : "Hidden"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                      {reel.category}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      {reel.gownId ? `#${reel.gownId}` : "None"}
                    </td>
                    <td className="p-4">
                      <form action={toggleFeaturedReel.bind(null, reel.id, reel.isFeaturedOnHome)}>
                        <button 
                          type="submit" 
                          className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-colors ${
                            reel.isFeaturedOnHome 
                              ? "bg-[#8c363e]/10 text-[#8c363e] border border-[#8c363e]/30" 
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {reel.isFeaturedOnHome ? "On Homepage" : "Add to Home"}
                        </button>
                      </form>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end items-center gap-3">
                        <form action={deleteReel}>
                          <input type="hidden" name="id" value={reel.id} />
                          <DeleteButton />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allReels.length === 0 && (
              <div className="p-16 text-center">
                <p className="font-serif text-lg text-gray-400 italic">No cinematic reels uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* SECTION 3: WARDROBE MANAGER               */}
        {/* ========================================= */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-gray-900">Wardrobe Collection</h2>
          <div className="border border-gray-100 rounded-sm bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                  <th className="p-4 font-bold">Gown</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allGowns.map((item) => {
                  const firstImage = item.imageUrls?.split(",")[0] || "/placeholder.jpg";
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-10 bg-gray-100 relative overflow-hidden rounded-sm">
                            <img src={firstImage} alt={item.name} className="object-cover w-full h-full" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">SKU: {item.itemCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                        {item.category}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900">
                        ₹{item.price || "On Request"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end items-center gap-3">
                          <Link href={`/gown/${item.id}`} className="p-2 text-gray-400 hover:text-black transition-colors">
                            <ExternalLink size={16} />
                          </Link>
                          <Link href={`/admin/gowns/edit/${item.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit size={16} />
                          </Link>
                          <form action={deleteGown}>
                            <input type="hidden" name="id" value={item.id} />
                            <DeleteButton />
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {allGowns.length === 0 && (
              <div className="p-16 text-center">
                <p className="font-serif text-lg text-gray-400 italic">The wardrobe is empty.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}