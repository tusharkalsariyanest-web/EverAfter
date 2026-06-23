"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, alt }: { images: string[], alt: string }) {
  const [mainImage, setMainImage] = useState(images[0] || "/placeholder.jpg");

  return (
    <div className="space-y-4">
      <div className="aspect-[3/4] w-full bg-gray-50 relative overflow-hidden group border border-gray-100">
        <Image src={mainImage} alt={alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
      </div>
      
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {images.map((img, idx) => (
            <button key={idx} onClick={() => setMainImage(img)} className={`relative w-24 h-32 flex-shrink-0 bg-gray-50 overflow-hidden transition-all duration-300 ${mainImage === img ? "border-2 border-black shadow-md opacity-100" : "border border-gray-200 opacity-50 hover:opacity-100"}`}>
              <Image src={img} alt={`${alt} thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}