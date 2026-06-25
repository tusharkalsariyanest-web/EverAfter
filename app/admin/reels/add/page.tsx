"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary"; // Swapped out UploadThing for Cloudinary!
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  Video,
  Smartphone,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { saveReel } from "@/actions/reel-actions";

interface GownOption {
  id: number;
  name: string;
  category: string;
}

export default function AddReel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingGowns, setFetchingGowns] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [gowns, setGowns] = useState<GownOption[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    caption: "",
    gownId: "",
    category: "Prewedding",
    isFeaturedOnHome: false,
  });

  useEffect(() => {
    async function loadGowns() {
      try {
        const response = await fetch("/api/gowns");
        if (response.ok) {
          const data = await response.json();
          setGowns(data);
        }
      } catch (err) {
        console.error("Failed loading gowns for selector:", err);
      } finally {
        setFetchingGowns(false);
      }
    }
    loadGowns();
  }, []);

  const filteredGownsForSelection = gowns.filter(
    (g) => g.category.toLowerCase() === formData.category.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl) {
      toast.error("Please upload a video reel first.");
      return;
    }
    if (!formData.gownId) {
      toast.error("Please select a linked gown masterpiece.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("caption", formData.caption);
      data.append("gownId", formData.gownId);
      data.append("category", formData.category);
      data.append("isFeaturedOnHome", formData.isFeaturedOnHome.toString());

      await saveReel(data, videoUrl);
      toast.success("Cinematic Reel Published!");
      router.push("/admin");
    } catch (err) {
      toast.error("Failed to save reel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] pb-20 pt-10 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 hover:text-black mb-10 transition-colors"
        >
          <ChevronLeft size={14} /> Back to Studio Dashboard
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 shadow-xl overflow-hidden rounded-xl"
        >
          {/* Header */}
          <div className="p-10 border-b border-gray-100 bg-gray-50/50">
            <h1 className="font-serif text-3xl text-gray-900 mb-2 flex items-center gap-3">
              Creator Studio
            </h1>
            <p className="text-gray-500 text-sm">
              Upload optimized reels and configure the shopper experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* LEFT: Phone Preview (Instagram UI Look) */}
            <div className="p-10 flex flex-col items-center justify-center bg-gray-50 border-r border-gray-100">
              <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-[2rem] border-8 border-gray-800 relative overflow-hidden shadow-2xl flex flex-col justify-center items-center">
                {/* iPhone Notch Mockup */}
                <div className="absolute top-0 w-1/2 h-6 bg-gray-800 rounded-b-xl z-20"></div>

                {videoUrl ? (
                  <>
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover z-10"
                    />
                    <button
                      type="button"
                      onClick={() => setVideoUrl("")}
                      className="absolute top-8 right-4 bg-white/90 backdrop-blur text-black px-3 py-1 text-[10px] font-bold uppercase rounded-full z-30 shadow-lg hover:bg-white transition"
                    >
                      Remove
                    </button>

                    {/* Floating Shoppable Overlay Mockup */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl z-20 text-white shadow-xl">
                      <p className="text-[9px] uppercase tracking-widest text-gray-300 font-bold mb-1 flex items-center gap-1">
                        <Sparkles size={10} /> Featuring Look
                      </p>
                      <p className="text-sm font-bold truncate">
                        {gowns.find((g) => g.id === parseInt(formData.gownId))
                          ?.name || "No Gown Selected"}
                      </p>
                      <p className="text-[11px] text-white/80 font-light mt-1 italic line-clamp-1">
                        "{formData.caption || "Add a preview caption..."}"
                      </p>
                    </div>
                  </>
                ) : (
                  // --- THE NEW CLOUDINARY UPLOAD UI ---
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 z-10 text-center">
                    <Smartphone size={40} className="text-white/30 mb-6" />

                    <CldUploadWidget
                      uploadPreset="everafter_reels"
                      options={{
                        maxFiles: 1,
                        resourceType: "video",
                        clientAllowedFormats: ["mp4", "mov"],
                      }}
                      onSuccess={(result: any) => {
                        setVideoUrl(result.info.secure_url);
                        toast.success("Video compressed and uploaded!");
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => open()}
                          className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 hover:bg-gray-200"
                        >
                          <Upload size={14} /> Choose Video
                        </button>
                      )}
                    </CldUploadWidget>

                    <p className="text-white/40 text-[10px] mt-4 max-w-[200px] leading-relaxed">
                      Upload directly from your device. Cloudinary will
                      automatically compress the file for mobile streaming.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Meta Settings Layout */}
            <div className="p-10 space-y-8 flex flex-col justify-center">
              {/* 1. REEL FILTER CATEGORY */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  Step 1: Content Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                      gownId: "",
                    })
                  }
                  className="w-full border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:border-black transition-colors rounded-sm appearance-none cursor-pointer"
                >
                  <option value="Prewedding">Prewedding Shoot</option>
                  <option value="Maternity">Maternity Shoot</option>
                  <option value="Bridal">Bridal Gowns</option>
                  <option value="Engagement">Engagement</option>
                </select>
              </div>

              {/* 2. LIVE DATA DROPDOWN */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  Step 2: Link to Gown Masterpiece
                </label>
                {fetchingGowns ? (
                  <div className="w-full border border-gray-200 bg-gray-50 p-4 text-sm text-gray-400 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Loading
                    studio wardrobe inventory...
                  </div>
                ) : (
                  <select
                    required
                    value={formData.gownId}
                    onChange={(e) =>
                      setFormData({ ...formData, gownId: e.target.value })
                    }
                    className="w-full border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:border-black transition-colors rounded-sm appearance-none cursor-pointer"
                  >
                    <option value="">
                      -- Choose a dress from the matching collection --
                    </option>
                    {filteredGownsForSelection.map((gown) => (
                      <option key={gown.id} value={gown.id}>
                        {gown.name} (ID: #{gown.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 3. CAPTION */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  Step 3: Caption / Creative Vibe
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the cinematic layout and feel of this clip..."
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  className="w-full border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:border-black transition-colors rounded-sm resize-none"
                />
              </div>

              {/* 4. HOMEPAGE TOGGLE */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#8c363e] font-bold flex items-center gap-2">
                  <Star size={14} /> Step 4: Homepage Spotlight
                </label>
                <label className="flex items-center gap-4 p-4 border border-[#d99898]/30 bg-[#FDF6F5]/50 rounded-lg cursor-pointer hover:bg-[#FDF6F5] transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isFeaturedOnHome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isFeaturedOnHome: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#8c363e] cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-bold text-[#5A2A2F]">
                      Feature on Landing Page
                    </p>
                    <p className="text-xs text-[#8A4A52] font-light">
                      Instantly add this to the Director's Cut cover flow.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  disabled={loading || !videoUrl || !formData.gownId}
                  className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:bg-gray-900 rounded-sm shadow-xl"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Video size={16} /> Publish Cinematic Reel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
