// app/api/auth/sync/route.ts (or wherever your POST route lives)
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/db";
import { users } from "@/db/schema";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing token" },
        { status: 400 }
      );
    }

    // 1. Verify the Google JWT token securely
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    // 2. Extract user data directly from Google's verified payload
    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid token payload");

    const { sub: uid, email, name, picture: image } = payload;

    // 3. Upsert the Google user into PostgreSQL database
    await db
      .insert(users)
      .values({
        id: uid,
        email: email as string,
        name: name || null,
        image: image || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: email as string,
          name: name || null,
          image: image || null,
        },
      });

    // NOTE: You should set an HttpOnly session cookie here before returning success!

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User Sync Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync user data" },
      { status: 500 }
    );
  }
}
