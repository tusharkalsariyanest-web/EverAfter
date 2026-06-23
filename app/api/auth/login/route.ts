import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (
    username === process.env.ADMIN_USERNAME && 
    password === process.env.ADMIN_PASSWORD
  ) {
    const response = NextResponse.json({ success: true });
    
    // Set a secure cookie for 24 hours
    (await cookies()).set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_NODE === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}