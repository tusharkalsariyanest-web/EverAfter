import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 1. EXTRACT RAW BODY AND SIGNATURE FOR CRYPTO VERIFICATION
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { success: false, message: "Missing authorization headers" },
        { status: 400 }
      );
    }

    // 2. VERIFY THE PAYLOAD SIGNATURE SECURELY
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { success: false, message: "Webhook validation failed" },
        { status: 400 }
      );
    }

    // SIGNATURE MATCHES -> SAFE TO PARSE BODY
    const jsonBody = JSON.parse(rawBody);
    const eventType = jsonBody.event;

    // We specifically want to watch for the payment.captured milestone
    if (eventType === "payment.captured") {
      const paymentEntity = jsonBody.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      // 3. FETCH THE MATCHING ORDER FROM DRIZZLE
      const orderData = await db.query.orders.findFirst({
        where: eq(orders.razorpayOrderId, razorpayOrderId),
      });

      if (!orderData) {
        return NextResponse.json(
          { success: false, message: "Associated order row missing" },
          { status: 404 }
        );
      }

      // 4. CLOSING THE LOOPHOLE: If frontend already marked it PAID or SHIPPED, ignore the webhook
      if (orderData.status !== "PENDING") {
        return NextResponse.json({
          success: true,
          message: "Idempotent block: Order already processed by frontend",
        });
      }

      // 5. BACKUP EXECUTION: Flip to PAID (Wait for Admin Panel to mark as SHIPPED)
      await db
        .update(orders)
        .set({
          status: "PAID",
          razorpayPaymentId: razorpayPaymentId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderData.id));

      // 6. FIRE COMPLEMENTARY ORDER CONFIRMED RECEIPT
      await resend.emails.send({
        from: "Everafter Wardrobe <onboarding@resend.dev>",
        to: [orderData.email],
        subject: `Payment Secured in Background (#${orderData.id})`,
        html: `
          <div style="font-family: 'Georgia', serif; color: #2d1b1b; background-color: #FDF6F5; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8c363e; font-size: 24px; font-weight: normal;">Payment Recovered & Secured.</h2>
            <p style="font-size: 14px; color: #666;">Hi ${orderData.name}, it looks like your browser disconnected, but your payment was safely authenticated via our backend framework!</p>
            <p style="font-size: 14px; color: #666;">Your order is now confirmed. Our studio will notify you the moment your gown ships.</p>
          </div>
        `,
      });
    }

    // Always respond with a 200 OK signature to stop Razorpay from retrying the event
    return NextResponse.json(
      { success: true, processed: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Critical Webhook Pipeline System Fault:", error);
    return NextResponse.json(
      { success: false, message: "Internal tracking server exception" },
      { status: 500 }
    );
  }
}
