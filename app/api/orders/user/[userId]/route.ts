import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    // Fetch orders and join with the items and gown details to get the images
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: {
          with: {
            gown: true,
          },
        },
      },
    });

    return NextResponse.json(userOrders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
