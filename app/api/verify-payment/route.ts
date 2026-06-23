import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { Resend } from "resend"; // 1. Import Resend

const resend = new Resend(process.env.RESEND_API_KEY); // 2. Initialize Resend

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = body;

    // SECURITY CHECK: Verify Razorpay Authenticity
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ success: false, message: "Signature verification failed" }, { status: 400 });
    }

    // RETRIEVE CURRENT ORDER FROM DATABASE
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, dbOrderId),
    });

    if (!orderData) {
      return NextResponse.json({ success: false, message: "Order records missing" }, { status: 404 });
    }

    // CONSTRUCT NATIVE DELHIVERY API PAYLOAD
    const delhiveryPayload = {
      shipments: [
        {
          order: `EVR-${dbOrderId}`,
          name: orderData.name,
          address: orderData.address,
          city: orderData.city,
          state: "Maharashtra", 
          pin: orderData.pincode,
          phone: orderData.phone,
          email: orderData.email,
          payment_mode: "Pre-paid",
          total_amount: orderData.totalAmount,
          weight: 1500, 
          quantity: 1,
          pickup_location: "Rinku Video Lab",
          products_desc: "Premium Cinematic Gown Wardrobe Selection",
          fragile_shipment: true
        }
      ],
      pickup_location: {
        name: "Rinku Video Lab"
      }
    };

    // EXECUTE DISPATCH WITH DELHIVERY
    const delhiveryRes = await fetch("https://track.delhivery.com/api/cmu/create.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${process.env.DELHIVERY_API_TOKEN}`
      },
      body: JSON.stringify(delhiveryPayload),
    });

    const responseData = await delhiveryRes.json();

    if (!responseData.success || responseData.packages.length === 0) {
      console.error("Delhivery API Manifestation Fault:", responseData);
      return NextResponse.json({ success: false, message: "Delhivery gateway booking failed" }, { status: 500 });
    }

    const assignedWaybill = responseData.packages[0].waybill;

    // UPDATE DATABASE LOG TO SHIPPED
    await db
      .update(orders)
      .set({
        status: "SHIPPED",
        razorpayPaymentId: razorpay_payment_id,
        trackingId: assignedWaybill,
        courierPartner: "Delhivery Direct",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, dbOrderId));

    // 3. 🚀 FIRE AUTOMATED PREMIUM SHIPPING EMAIL TO CUSTOMER 🚀
    await resend.emails.send({
      from: "Everafter Wardrobe <onboarding@resend.dev>", // Replace with your domain email later (e.g., hello@yourdomain.com)
      to: [orderData.email],
      subject: `Your Cinematic Wardrobe is on its way! (Order #${dbOrderId})`,
      html: `
        <div style="font-family: 'Georgia', serif; color: #2d1b1b; background-color: #FDF6F5; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8c363e; font-size: 24px; font-weight: normal; margin-bottom: 4px;">Forever Begins Now.</h2>
          <p style="font-size: 14px; color: #666; margin-top: 0;">Hi ${orderData.name}, your premium gown selection has been securely handed over to Delhivery.</p>
          
          <hr style="border: none; border-top: 1px solid #E8D0D2; margin: 24px 0;" />
          
          <div style="background-color: #white; padding: 20px; border-radius: 12px; border: 1px solid #E8D0D2;">
            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; tracking: 0.1em; color: #8A4A52; font-weight: bold;">Courier Tracking Details</p>
            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold;">Partner: Delhivery Direct</p>
            <p style="margin: 0 0 16px 0; font-family: monospace; font-size: 14px; color: #555;">Waybill AWB: ${assignedWaybill}</p>
            
            <a href="https://www.delhivery.com/track/package/${assignedWaybill}" target="_blank" style="background-color: #5A2A2F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; display: inline-block;">
              Track Live Shipment Journey
            </a>
          </div>
          
          <p style="font-size: 11px; color: #999; margin-top: 30px; text-align: center;"> You can also track this order inside your dashboard at any time by verifying your phone number.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, trackingId: assignedWaybill });
    
  } catch (error) {
    console.error("Direct Delhivery Automation Core Error:", error);
    return NextResponse.json({ success: false, message: "Internal Logistics Routing Failure" }, { status: 500 });
  }
}