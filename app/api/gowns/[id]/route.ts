import { db } from "@/db";
import { gowns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// 1. GET ONE GOWN
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gown = await db.query.gowns.findFirst({
      where: eq(gowns.id, parseInt(id)),
    });

    if (!gown) {
      return NextResponse.json(
        { error: "Masterpiece not found" },
        { status: 404 }
      );
    }

    // FIX 1: Wrapped in an object so the frontend `data.gown` works perfectly
    return NextResponse.json({ gown });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch masterpiece" },
      { status: 500 }
    );
  }
}

// 2. UPDATE GOWN (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = await db
      .update(gowns)
      .set({
        name: body.name,
        description: body.description,

        // FIX 2: Convert the text string from the form into a true Integer for Drizzle!
        // FIX 2: Just pass the string directly since the schema uses varchar!
        price: body.price ? String(body.price) : null,

        itemCode: body.itemCode,
        fabric: body.fabric,
        color: body.color,
        sizeOptions: body.sizeOptions,
        style: body.style,
        occasion: body.occasion,
        imageUrls: body.imageUrls,
        category: body.category,
        targetAudience: body.targetAudience,
      })
      .where(eq(gowns.id, parseInt(id)));

    console.log(`Revalidating cache for gown ${id}`);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/gown/${id}`);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update masterpiece" },
      { status: 500 }
    );
  }
}
