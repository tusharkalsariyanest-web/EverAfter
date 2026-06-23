"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Truck,
  Clock,
  ExternalLink,
  LogOut,
  Loader2,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

// IMPORTANT: Adjust this import to match where your Firebase auth is initialized!
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

// Helper to dynamically route the tracking ID to the correct website
const getTrackingUrl = (courier: string | null, awb: string) => {
  if (!awb) return "#";
  const c = (courier || "").toLowerCase();

  if (c.includes("delhivery"))
    return `https://www.delhivery.com/track/package/${awb}`;
  if (c.includes("bluedart")) return `https://www.bluedart.com/tracking`; // BlueDart portal
  if (c.includes("xpressbees"))
    return `https://www.xpressbees.com/track?awb=${awb}`;

  // The Ultimate Fallback: A universal tracking engine for any other courier
  return `https://parcelsapp.com/en/tracking/${awb}`;
};

export default function ProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Google Login State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch their orders using the API we just created
        try {
          const res = await fetch(`/api/orders/user/${currentUser.uid}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setOrderHistory(data);
          }
        } catch (error) {
          console.error("Failed to fetch orders", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6F5] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8c363e]" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDF6F5] font-sans selection:bg-[#C0858B] selection:text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
          <User size={48} className="text-[#E8D0D2] mb-6" />
          <h2 className="font-serif text-3xl text-[#2d1b1b] mb-2">
            Welcome to the Studio
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md">
            Please log in with Google to view your cinematic wardrobe and track
            your premium shipments.
          </p>
          <button
            onClick={() => {
              /* Trigger your existing Google Login flow here */
            }}
            className="bg-[#8c363e] text-white px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold shadow-lg hover:bg-[#6b272f] transition-all"
          >
            Log In / Register
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6F5] font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* PROFILE HEADER (Glassmorphism subtle aesthetic) */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-[0_10px_40px_rgba(140,54,62,0.05)] mb-12 flex flex-col md:flex-row items-center gap-6 md:justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E8D0D2] shadow-sm">
              <Image
                src={user.photoURL || "/placeholder-user.png"}
                alt="Profile"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-[#2d1b1b] tracking-tight">
                {user.displayName}
              </h1>
              <p className="text-sm text-gray-500 font-medium">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#8A4A52] hover:text-[#2d1b1b] transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* ORDER HISTORY SECTION */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-[#2d1b1b] tracking-tight mb-8">
            Your Wardrobe Collection
          </h2>

          {orderHistory.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E8D0D2]/50 text-center shadow-sm">
              <Package size={40} className="mx-auto text-[#E8D0D2] mb-4" />
              <p className="text-gray-500 font-medium">
                Your cinematic wardrobe is currently empty.
              </p>
            </div>
          ) : (
            orderHistory.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E8D0D2]/60 overflow-hidden shadow-[0_5px_20px_rgba(140,54,62,0.03)] hover:shadow-[0_10px_30px_rgba(140,54,62,0.08)] transition-all duration-500"
              >
                {/* Header of the Card */}
                <div className="bg-[#FCFBF9] px-6 py-4 border-b border-[#E8D0D2]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#C0858B] font-bold">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Dynamic Status Badge */}
                  <div>
                    {order.status === "PENDING" && (
                      <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold border border-yellow-200">
                        <Clock size={12} /> Awaiting Payment
                      </span>
                    )}
                    {order.status === "PAID" && (
                      <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold border border-green-200">
                        <Package size={12} /> Preparing to Dispatch
                      </span>
                    )}
                    {order.status === "SHIPPED" && (
                      <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold border border-blue-200">
                        <Truck size={12} /> In Transit
                      </span>
                    )}
                  </div>
                </div>

                {/* Body of the Card */}
                <div className="p-6">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-6 items-center mb-4 last:mb-0"
                    >
                      <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden relative shrink-0 border border-[#E8D0D2]/30">
                        {item.gown?.imageUrls ? (
                          <Image
                            src={item.gown.imageUrls.split(",")[0]}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-xs text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif text-lg text-[#2d1b1b]">
                          {item.gown?.name || "Premium Gown"}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-[#5A2A2F] mt-2">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer of the Card (Tracking Integration) */}
                {order.status === "SHIPPED" && order.trackingId && (
                  <div className="bg-[#5A2A2F] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                    <div className="text-xs space-y-1 text-center sm:text-left">
                      <p className="uppercase tracking-widest font-bold text-[#E8D0D2] text-[9px]">
                        Live Tracking Update
                      </p>
                      <p>
                        Courier:{" "}
                        <b>{order.courierPartner || "Standard Shipping"}</b> |
                        AWB:{" "}
                        <span className="font-mono">{order.trackingId}</span>
                      </p>
                    </div>

                    {/* Auto-routes to Delhivery if specified, otherwise generic track button */}
                    <a
                      href={getTrackingUrl(
                        order.courierPartner,
                        order.trackingId
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white text-[#5A2A2F] px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#FDF6F5] transition-colors shadow-sm"
                    >
                      Track Live <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
