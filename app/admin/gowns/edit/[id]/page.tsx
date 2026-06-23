"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { UploadDropzone } from "@/utils/uploadthing";

export default function EditGown({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  
  // Updated to match your Drizzle Gowns Schema
  const [formData, setFormData] = useState({
    name: "", 
    description: "",
    price: "", 
    itemCode: "", 
    fabric: "Premium Net", 
    color: "", 
    sizeOptions: "Free Size / Adjustable",
    category: "Prewedding", 
    style: "",
    targetAudience: "Women",
    occasion: ""
  });

  // Load existing data
  useEffect(() => {
    fetch(`/api/gowns/${id}`)
      .then(res => res.json())
      .then(data => {
       if (data.gown) {
  setFormData(data.gown);
  // The .filter(Boolean) automatically removes any empty strings!
  setImages(data.gown.imageUrls ? data.gown.imageUrls.split(",").filter(Boolean) : []);
}
        setFetching(false);
      })
      .catch(err => {
        console.error("Failed to fetch gown:", err);
        setFetching(false);
      });
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/gowns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, imageUrls: images.join(",") }),
      });

      if (res.ok) {
        alert("Gown Updated Successfully");
        router.push("/admin"); // Or wherever your gown list is
      } else {
        alert("Failed to update gown");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  console.log("Current Images Array:", images);

  if (fetching) return <div className="h-screen flex items-center justify-center font-serif text-2xl text-[#8c363e]">Loading Gown...</div>;

  return (
    <div className="min-h-screen bg-[#FDF6F5] pb-20 pt-10 text-[#2d1b1b]">
      <div className="max-w-6xl mx-auto px-6">
        <Link href="/admin" className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C0858B] hover:text-[#8c363e] transition-colors mb-10 font-bold">
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>
        
        <h1 className="font-serif text-4xl mb-12 tracking-tight">Edit Cinematic Gown</h1>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Images Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E8D0D2]/60 shadow-sm">
                <UploadDropzone
  endpoint="gownImageUploader" // <--- Matches your core.ts exactly!
                  onClientUploadComplete={(res) => setImages([...images, ...res.map(f => f.url)])}
                  className="border-2 border-dashed border-[#E8D0D2] p-10 ut-button:bg-[#5A2A2F] ut-button:ut-readying:bg-[#5A2A2F]/50 ut-label:text-[#8c363e]"
                />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {images.map((url, i) => (
                <div key={url} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#E8D0D2]/60 shadow-sm">
                  <img src={url} className="object-cover w-full h-full" alt="Gown" />
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors">X</button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Details Section */}
          <div className="lg:col-span-7 space-y-8 bg-white p-8 md:p-10 rounded-2xl border border-[#E8D0D2]/60 shadow-sm">
            
            <div className="space-y-6">
              <InputGroup label="Gown Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-[#E8D0D2] rounded-xl p-4 bg-[#FCFBF9] outline-none focus:border-[#8c363e] transition-colors text-sm resize-none"
                  placeholder="Tell the story of this piece..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Notice price is now handled properly for wholesale */}
                <InputGroup type="number" label="Wholesale Price (₹)" value={formData.price} onChange={(v: string) => setFormData({...formData, price: v})} />
                <InputGroup label="Item Code / SKU" value={formData.itemCode} onChange={(v: string) => setFormData({...formData, itemCode: v})} />
                
                <InputGroup label="Fabric" value={formData.fabric} onChange={(v: string) => setFormData({...formData, fabric: v})} />
                <InputGroup label="Color" value={formData.color} onChange={(v: string) => setFormData({...formData, color: v})} />
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#E8D0D2]/40">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border-b border-[#E8D0D2] py-2 bg-transparent outline-none focus:border-[#8c363e] text-sm">
                        <option value="Prewedding">Prewedding</option>
                        <option value="Maternity">Maternity</option>
                    </select>
                 </div>
                 <InputGroup label="Style (e.g. Long Trail)" value={formData.style} onChange={(v: string) => setFormData({...formData, style: v})} />
              </div>
            </div>

            <button disabled={loading} className="w-full flex items-center justify-center bg-[#5A2A2F] text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-all disabled:opacity-50 mt-8 shadow-lg">
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Save Gown Updates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">{label}</label>
      <input 
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-[#E8D0D2] py-2 bg-transparent outline-none focus:border-[#8c363e] text-sm transition-colors"
      />
    </div>
  );
}