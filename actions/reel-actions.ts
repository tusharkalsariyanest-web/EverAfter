"use server";

import { db } from "@/db";
import { reels } from "@/db/schema";
import { eq } from "drizzle-orm"; // <-- Here is the missing import!
import { revalidatePath } from "next/cache";

export async function saveReel(formData: FormData, videoUrl: string) {
  // Grab the boolean value (FormData sends it as the string "true" or "false")
  const isFeatured = formData.get("isFeaturedOnHome") === "true";

  const data = {
    caption: formData.get("caption") as string,
    // Handle the case where gownId might be empty
    gownId: formData.get("gownId")
      ? parseInt(formData.get("gownId") as string)
      : null,
    category: formData.get("category") as string,
    videoUrl: videoUrl,
    isActive: true,
    isFeaturedOnHome: isFeatured,
  };

  await db.insert(reels).values(data);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function toggleFeaturedReel(
  reelId: number,
  currentStatus: boolean | null
) {
  await db
    .update(reels)
    .set({ isFeaturedOnHome: !currentStatus })
    .where(eq(reels.id, reelId));

  // Instantly update the homepage and admin panel!
  revalidatePath("/");
  revalidatePath("/admin");
}
