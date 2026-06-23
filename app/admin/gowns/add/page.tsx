"use client";

import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing"; 
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { saveGown } from "@/actions/gown-actions"; 

/* ---------- TYPES ---------- */

interface InputGroupProps {
  label: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

interface SelectGroupProps {
  label: string;
  options: string[];
  onChange: (value: string) => void;
}

/* ---------- PAGE ---------- */

export default function AddGown() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);

  // FIXED: Changed "Price" to lowercase "price" to perfectly match your database schema
  const [formData, setFormData] = useState({
    name: "",
    price: "", 
    itemCode: "",
    sizeOptions: "",
    description: "",
    category: "Prewedding",
    style: "Long Trail",
    targetAudience: "Women",
    occasion: "Outdoor Shoot",
    fabric: "Premium Net",
    color: "Red",
    inStock: "true"
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      await saveGown(data, images.join(","));

      toast.success("Masterpiece Added Successfully!");
      router.push("/admin"); 
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add masterpiece");
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
          className="grid grid-cols-1 lg:grid-cols-12 gap-16"
        >
          {/* LEFT: Image Upload */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white border border-gray-100 p-8 shadow-sm">
              <UploadDropzone
                endpoint="gownImageUploader" 
                onUploadProgress={(p: number) => setUploadProgress(p)}
                onClientUploadComplete={(res) => {
                  setImages((prev) => [...prev, ...res.map((f) => f.url)]);
                  setUploadProgress(0);
                  toast.success("Image uploaded successfully!");
                }}
              />

              {uploadProgress > 0 && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-1 bg-gray-100" />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-8">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-[3/4] border border-gray-100 overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt={`Gown image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-1 right-1 bg-white/90 backdrop-blur text-black p-1.5 shadow-sm hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Data Entry */}
          <div className="lg:col-span-7 space-y-10 bg-white border border-gray-100 p-10 shadow-sm">
            <InputGroup
              label="Gown Name"
              placeholder="e.g. White Lace Mermaid Gown"
              onChange={(v) => setFormData({ ...formData, name: v })}
            />

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                Description
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe the fabric, trail length, and fit..."
                className="w-full border border-gray-200 bg-gray-50 p-4 outline-none focus:border-black transition-colors rounded-sm resize-none text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <InputGroup
                label="Price (INR)"
                placeholder="e.g. 5000"
                // FIXED: lowercase "price"
                onChange={(v) => setFormData({ ...formData, price: v })}
              />
              <InputGroup
                label="SKU / Item Code"
                placeholder="e.g. EVR-001"
                onChange={(v) => setFormData({ ...formData, itemCode: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <InputGroup
                label="Fabric"
                placeholder="e.g. Premium Net, Silk"
                onChange={(v) => setFormData({ ...formData, fabric: v })}
              />
              <InputGroup
                label="Color"
                placeholder="e.g. Crimson Red"
                onChange={(v) => setFormData({ ...formData, color: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <SelectGroup
                label="Category"
                options={["Prewedding", "Maternity", "Bridal", "Engagement"]}
                onChange={(v) => setFormData({ ...formData, category: v })}
              />
              <InputGroup
                label="Size Options"
                placeholder="e.g. Free Size, S/M/L"
                onChange={(v) => setFormData({ ...formData, sizeOptions: v })}
              />
            </div>

            {/* FIXED: Removed the gold color, now it's crisp white to match Everafter */}
            <button
              disabled={loading}
              className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-50 transition-all hover:bg-gray-900 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Add to Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function InputGroup({ label, placeholder, onChange }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{label}</label>
      <input
        required
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-colors text-sm"
      />
    </div>
  );
}

function SelectGroup({ label, options, onChange }: SelectGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{label}</label>
      <select
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-gray-200 py-3 outline-none focus:border-black transition-colors bg-transparent text-sm appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}