import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db";
// 1. ADD 'users' TO THIS IMPORT LIST 👇
import { orders, orderItems, users } from "@/db/schema";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      name,
      email,
      phone,
      address,
      city,
      pincode,
      items,
      subtotal,
    } = body;

    // 💥 NEW: THE SAFETY NET 💥
    // If a userId was passed (meaning they logged in with Google), ensure they exist in our DB first!
    if (userId) {
      await db
        .insert(users)
        .values({
          id: userId,
          email: email,
          name: name,
        })
        .onConflictDoUpdate({
          target: users.id, // Or users.email, depending on what you made unique in schema
          set: { name: name }, // If they already exist, just update their name to be safe
        });
    }

    // 1. Create a Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: subtotal * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // 2. Save the PENDING order to Drizzle Database
    const newOrder = await db
      .insert(orders)
      .values({
        userId: userId || null,
        phone: phone,
        name: name,
        email: email,
        address: address,
        city: city,
        pincode: pincode,
        totalAmount: subtotal,
        razorpayOrderId: razorpayOrder.id,
        status: "PENDING",
      })
      .returning({ id: orders.id });

    const orderId = newOrder[0].id;

    // 3. Save all the individual gowns inside the order
    const itemsToInsert = items.map((item: any) => ({
      orderId: orderId,
      gownId: parseInt(item.gownId),
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    await db.insert(orderItems).values(itemsToInsert);

    // 4. Send the Razorpay Order ID back
    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      dbOrderId: orderId,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { success: false, error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}
