import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ success: false, message: "Phone parameter required" }, { status: 400 });
  }

  try {
    const customerOrders = await db.query.orders.findMany({
      where: eq(orders.phone, phone),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: {
          with: {
            gown: true // Loads specific gown titles/images directly
          }
        }
      }
    });

    return NextResponse.json({ success: true, orders: customerOrders });
  } catch (error) {
    console.error("Tracking API Error:", error);
    return NextResponse.json({ success: false, message: "Database lookup failed" }, { status: 500 });
  }
}