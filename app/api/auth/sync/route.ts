import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { uid, email, name, image } = await req.json();

    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (uid, email)" },
        { status: 400 }
      );
    }

    // Upsert the Google user into PostgreSQL database
    await db
      .insert(users)
      .values({
        id: uid,
        email: email,
        name: name || null,
        image: image || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: email,
          name: name || null,
          image: image || null,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User Sync Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync user data" },
      { status: 500 }
    );
  }
}
