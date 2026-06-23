"use server";

// Note: If you get a red line on "@/db", change it to "../db"
import { db } from "@/db"; 
import { gowns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveGown(formData: FormData, imageUrls: string, gownId?: number) {
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: formData.get("price") as string, // Updated key
    itemCode: formData.get("itemCode") as string,
    fabric: formData.get("fabric") as string,
    color: formData.get("color") as string,
    sizeOptions: formData.get("sizeOptions") as string,
    category: formData.get("category") as string,
    style: formData.get("style") as string,
    targetAudience: formData.get("targetAudience") as string,
    occasion: formData.get("occasion") as string,
    inStock: formData.get("inStock") === "true",
    imageUrls: imageUrls,
  };

  if (gownId) {
    await db.update(gowns).set(data).where(eq(gowns.id, gownId));
  } else {
    await db.insert(gowns).values(data);
  }

  revalidatePath("/admin");
  redirect("/admin");
}