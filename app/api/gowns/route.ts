import { db } from "@/db";
import { gowns } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// --- 1. THE DROPDOWN FETCHER (GET) ---
// This serves the list of gowns to your Creator Studio dropdown
export async function GET() {
  try {
    const list = await db.query.gowns.findMany({
      columns: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: [desc(gowns.createdAt)],
    });
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch selector items" },
      { status: 500 }
    );
  }
}

// --- 2. THE GOWN UPLOADER (POST) ---
// This saves new gowns from your "Add Gown" form
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Insert into the new gowns table
    const result = await db.insert(gowns).values({
      name: body.name,
      description: body.description,

      // 💥 THE FIX: Ensures price is saved as a strict string for the varchar schema 💥
      price: body.price ? String(body.price) : null,

      itemCode: body.itemCode,

      // New Gown-specific fields
      fabric: body.fabric,
      color: body.color,
      sizeOptions: body.sizeOptions,
      style: body.style,
      occasion: body.occasion,

      // General fields
      imageUrls: body.imageUrls,
      category: body.category,
      targetAudience: body.targetAudience,
    });

    // Refresh the site immediately
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database Insert Error:", error);
    return NextResponse.json(
      { error: "Failed to add masterpiece" },
      { status: 500 }
    );
  }
}
