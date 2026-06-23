import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Truck,
  ShieldCheck,
  Mail,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Resend } from "resend"; // 🔥 Added Resend Import

export const dynamic = "force-dynamic";

// 1. Updated params type declaration to expect a Promise
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 2. Await the params before extracting the orderId
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.id);

  if (isNaN(orderId)) notFound();

  // Fetch specific order along with items
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: {
        with: {
          gown: true,
        },
      },
    },
  });

  if (!order) notFound();

  // SERVER ACTION TO UPDATE DISPATCH DETAILS & SEND EMAIL
  async function handleDispatch(formData: FormData) {
    "use server";

    const trackingId = formData.get("trackingId") as string;
    const courierPartner = formData.get("courierPartner") as string;
    const shippingSpeed = formData.get("shippingSpeed") as string;
    const adminNotes = formData.get("adminNotes") as string;

    // 1. Update the Database
    await db
      .update(orders)
      .set({
        trackingId,
        courierPartner,
        shippingSpeed,
        adminNotes,
        status: "SHIPPED",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // 2. Fetch the customer's email and name so we can email them
    const customerOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: { email: true, name: true },
    });

    // 3. 🔥 FIRE THE TRACKING EMAIL 🔥
    if (customerOrder && customerOrder.email) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "Everafter Wardrobe <onboarding@resend.dev>", // Change when you add a custom domain
        to: [customerOrder.email],
        subject: `Your Gown is on its way! (Order #${orderId})`,
        html: `
          <div style="font-family: 'Georgia', serif; color: #2d1b1b; background-color: #FDF6F5; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8c363e; font-size: 24px; font-weight: normal; margin-bottom: 4px;">Your wardrobe has dispatched.</h2>
            <p style="font-size: 14px; color: #666; margin-top: 0;">Hi ${customerOrder.name}, your premium gown selection has been handed over to our delivery partners and is on its way to you.</p>
            
            <hr style="border: none; border-top: 1px solid #E8D0D2; margin: 24px 0;" />
            
            <div style="background-color: white; padding: 20px; border-radius: 12px; border: 1px solid #E8D0D2;">
              <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A4A52; font-weight: bold;">Tracking Details</p>
              <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold;">Courier: ${courierPartner}</p>
              <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Speed: ${shippingSpeed}</p>
              <p style="margin: 0 0 16px 0; font-family: monospace; font-size: 14px; color: #555;">Tracking/AWB: ${trackingId}</p>
              
              <p style="font-size: 12px; color: #666; font-style: italic;">Please enter this tracking ID on the ${courierPartner} website to track your shipment.</p>
            </div>
          </div>
        `,
      });
    }

    // 4. Refresh the UI
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
  }

  return (
    <div className="min-h-screen bg-[#FDF6F5] pb-20 pt-10 text-[#2d1b1b]">
      <div className="max-w-6xl mx-auto px-6">
        {/* TOP NAVIGATION */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C0858B] hover:text-[#8c363e] transition-colors mb-4 font-bold"
          >
            <ChevronLeft size={14} /> Back to Fulfillment Center
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl tracking-tight">
                Order #{order.id}
              </h1>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Calendar size={12} /> Placed on{" "}
                {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              {order.status === "PAID" && (
                <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-sm">
                  Paid & Ready to Dispatch
                </span>
              )}
              {order.status === "SHIPPED" && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-sm">
                  Shipped / In Transit
                </span>
              )}
              {order.status === "PENDING" && (
                <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-sm">
                  Awaiting Payment
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MAIN DISPLAY CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SECTION: CUSTOMER & WARDROBE DEETS */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Information Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8D0D2]/60 shadow-sm space-y-4">
              <h3 className="font-serif text-lg border-b border-[#E8D0D2]/40 pb-2 text-[#8c363e]">
                Customer & Delivery Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-[#2d1b1b]">
                    <User size={14} className="text-[#C0858B]" />{" "}
                    <span className="font-bold">{order.name}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-[#C0858B]" /> +91{" "}
                    {order.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-[#C0858B]" /> {order.email}
                  </p>
                </div>
                <div className="flex gap-2 bg-[#FCFBF9] p-3 rounded-xl border border-[#E8D0D2]/40">
                  <MapPin
                    size={16}
                    className="text-[#8c363e] shrink-0 mt-0.5"
                  />
                  <div className="text-xs space-y-1 text-[#2d1b1b]">
                    <p className="font-bold uppercase tracking-wider text-[9px] text-[#C0858B]">
                      Shipping Address
                    </p>
                    <p className="line-clamp-3 leading-relaxed">
                      {order.address}
                    </p>
                    <p className="font-medium">
                      {order.city} - {order.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Ordered Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8D0D2]/60 shadow-sm">
              <h3 className="font-serif text-lg border-b border-[#E8D0D2]/40 pb-4 mb-4 text-[#8c363e]">
                Ordered Wardrobe
              </h3>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-[#FCFBF9] p-3 rounded-xl border border-[#E8D0D2]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-gray-100 rounded-md border overflow-hidden relative">
                        {item.gown?.image && (
                          <img
                            src={item.gown.image}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-serif text-[#2d1b1b]">
                          {item.gown?.name || "Premium Gown Selection"}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Quantity:{" "}
                          <span className="font-bold text-[#2d1b1b]">
                            {item.quantity}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#5A2A2F]">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8D0D2]/40 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-gray-500">
                  Grand Total Received
                </span>
                <span className="font-serif text-xl text-[#8c363e] font-bold">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: LOGISTICS ACTION FORM */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-[#E8D0D2]/60 shadow-[0_10px_30px_rgba(140,54,62,0.02)] sticky top-8">
              <h3 className="font-serif text-lg border-b border-[#E8D0D2]/40 pb-3 mb-6 flex items-center gap-2 text-[#8c363e]">
                <Truck size={18} /> Logistics & Allocation
              </h3>

              <form action={handleDispatch} className="space-y-5">
                {/* Shipping Speed Customization */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">
                    Shipping Velocity
                  </label>
                  <select
                    name="shippingSpeed"
                    defaultValue={order.shippingSpeed || "Standard"}
                    className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#8c363e] font-medium"
                  >
                    <option value="Standard">
                      Standard Logistics (Surface Air)
                    </option>
                    <option value="Express">
                      VIP Premium Speed (BlueDart Air Express)
                    </option>
                  </select>
                </div>

                {/* Courier Partner Allocation */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">
                    Courier Allocation Agent
                  </label>
                  <input
                    required
                    type="text"
                    name="courierPartner"
                    placeholder="e.g., Delhivery, BlueDart, Xpressbees"
                    defaultValue={order.courierPartner || ""}
                    className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#8c363e]"
                  />
                </div>

                {/* Tracking ID Allocation */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">
                    AWB Tracking Identifier
                  </label>
                  <input
                    required
                    type="text"
                    name="trackingId"
                    placeholder="Enter Tracking ID given by Agent"
                    defaultValue={order.trackingId || ""}
                    className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#8c363e] font-mono tracking-wider font-bold"
                  />
                </div>

                {/* Internal Admin Notes */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">
                    Internal Operational Notes
                  </label>
                  <textarea
                    name="adminNotes"
                    rows={2}
                    placeholder="Special packaging instruction or event dates..."
                    defaultValue={order.adminNotes || ""}
                    className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#8c363e] resize-none"
                  />
                </div>

                {/* Submit Trigger Button */}
                <button
                  type="submit"
                  className="w-full bg-[#5A2A2F] text-white py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                >
                  <CreditCard size={14} /> Update Dispatch Status & Notify
                </button>
              </form>

              {/* DELHIIVERY SHIPPING LABEL PRINT ATTACHMENT */}
              {order.trackingId &&
                (order.courierPartner?.toLowerCase().includes("delhivery") ||
                  order.courierPartner?.toLowerCase().includes("auto")) && (
                  <div className="mt-6 pt-6 border-t border-dashed border-[#E8D0D2] space-y-3">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">
                      Physical Dispatch Requirements
                    </p>
                    <a
                      href={`https://track.delhivery.com/api/p/pack_detail?wbns=${order.trackingId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white text-[#5A2A2F] border-2 border-[#5A2A2F] py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#5A2A2F] hover:text-white transition-all text-center block shadow-sm"
                    >
                      📄 Print Delhivery Packing Slip / Label
                    </a>
                    <p className="text-[9px] text-gray-400 text-center leading-normal">
                      This pulls the official manifest PDF directly from
                      Delhivery for label printer application.
                    </p>
                  </div>
                )}

              {order.status === "SHIPPED" && (
                <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-2 text-[11px] text-blue-800">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>
                    Tracking updated. Customer notified via automatic framework
                    updates.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
