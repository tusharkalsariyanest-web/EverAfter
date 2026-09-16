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
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";

// Helper to dynamically route the tracking ID to the correct website
const getTrackingUrl = (courier: string | null, awb: string) => {
  if (!awb) return "#";
  const c = (courier || "").toLowerCase();

  if (c.includes("delhivery"))
    return `https://www.delhivery.com/track/package/${awb}`;
  if (c.includes("bluedart")) return `https://www.bluedart.com/tracking`;
  if (c.includes("xpressbees"))
    return `https://www.xpressbees.com/track?awb=${awb}`;

  return `https://parcelsapp.com/en/tracking/${awb}`;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: "Awaiting Payment",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  PAID: {
    label: "Preparing",
    icon: Package,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  SHIPPED: {
    label: "In Transit",
    icon: Truck,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: Package,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
};

function OrderCard({
  order,
  isExpanded,
  onToggle,
}: {
  order: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusInfo.icon;
  const totalItems =
    order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const firstItem = order.items?.[0];
  const firstImage = firstItem?.gown?.imageUrls?.split(",")[0];

  return (
    <div className="bg-white rounded-xl border border-[#E8D0D2]/40 overflow-hidden shadow-[0_2px_8px_rgba(140,54,62,0.04)] hover:shadow-[0_4px_16px_rgba(140,54,62,0.08)] transition-all duration-300">
      {/* Compact Row */}
      <button
        onClick={onToggle}
        className="w-full px-3 sm:px-4 py-3 flex items-center gap-3 text-left hover:bg-[#FDF6F5]/50 transition-colors"
      >
        {/* Thumbnail */}
        <div className="w-10 h-13 sm:w-11 sm:h-14 bg-[#FDF6F5] rounded-lg overflow-hidden relative shrink-0 border border-[#E8D0D2]/30">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={firstItem?.name || "Order"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={14} className="text-[#E8D0D2]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[9px] uppercase tracking-widest text-[#8c363e] font-bold">
              #{order.id}
            </p>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] uppercase tracking-wider font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              <StatusIcon size={8} />
              {statusInfo.label}
            </span>
          </div>
          <p className="text-[13px] text-[#2d1b1b] font-medium mt-0.5 truncate">
            {firstItem?.gown?.name || "Premium Gown"}
            {totalItems > 1 && (
              <span className="text-[#C0858B] text-[11px] ml-1">
                +{totalItems - 1} more
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[11px] text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-[11px] font-bold text-[#5A2A2F]">
              ₹{Number(order.totalAmount).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`text-[#C0858B] shrink-0 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded Detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-4 border-t border-[#E8D0D2]/30">
              <div className="pt-3 space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-13 bg-[#FDF6F5] rounded-lg overflow-hidden relative shrink-0 border border-[#E8D0D2]/30">
                      {item.gown?.imageUrls ? (
                        <Image
                          src={item.gown.imageUrls.split(",")[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#FDF6F5]">
                          <Package size={12} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/gown/${item.gownId}`}
                        className="text-[13px] font-serif text-[#2d1b1b] hover:text-[#8c363e] transition-colors line-clamp-1"
                      >
                        {item.gown?.name || "Premium Gown"}
                      </Link>
                      <p className="text-[10px] text-gray-400">
                        Qty: {item.quantity} · ₹
                        {(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {order.status === "SHIPPED" && order.trackingId && (
                <div className="mt-3 bg-[#5A2A2F] rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="text-[10px] text-white/70">
                    <span className="font-mono">{order.trackingId}</span>
                  </div>
                  <a
                    href={getTrackingUrl(order.courierPartner, order.trackingId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white text-[#5A2A2F] px-3 py-1.5 rounded-full text-[8px] uppercase tracking-widest font-bold hover:bg-[#FDF6F5] transition-colors shrink-0"
                  >
                    Track <ExternalLink size={9} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      try {
        const res = await fetch(`/api/orders/user/${session.user.id}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setOrderHistory(data);
          if (data.length > 0) setExpandedOrderId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [status, session]);

  if (loading) {
    return (
      <div className="h-screen bg-[#FDF6F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#8c363e]" size={28} />
          <p className="text-[10px] uppercase tracking-widest text-[#C0858B] font-bold">
            Loading your wardrobe...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen bg-[#FDF6F5] font-sans flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#E8D0D2]/30 flex items-center justify-center mb-6">
          <User size={32} className="text-[#C0858B]" />
        </div>
        <h2 className="font-serif text-3xl text-[#2d1b1b] mb-2">
          Welcome to the Studio
        </h2>
        <p className="text-gray-500 text-sm mb-8 max-w-md leading-relaxed">
          Log in to view your cinematic wardrobe and track your premium
          shipments.
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-[#8c363e] text-white px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold shadow-lg hover:bg-[#6b272f] transition-all"
        >
          Log In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-[#FDF6F5] to-[#f8f0ef] font-sans flex flex-col overflow-hidden">
      {/* ═══════════════════════════════════════════════════════
          PROFILE HEADER — Fixed at top, below navbar
      ═══════════════════════════════════════════════════════ */}
      <div className="shrink-0 pt-20 md:pt-24 px-4 sm:px-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden ring-[3px] ring-white shadow-[0_4px_16px_rgba(140,54,62,0.1)] shrink-0">
              <Image
                src={user?.image || "/placeholder-user.png"}
                alt="Profile"
                width={64}
                height={64}
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-xl md:text-2xl text-[#2d1b1b] tracking-tight truncate">
                {user?.name}
              </h1>
              <p className="text-[12px] text-[#C0858B] truncate">
                {user?.email}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                {orderHistory.length}{" "}
                {orderHistory.length === 1 ? "order" : "orders"}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-[#C0858B] hover:text-[#8c363e] transition-colors p-2 -mr-2"
                title="Sign Out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E8D0D2]/50 to-transparent mt-4" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ORDERS — Scrollable container that fills remaining space
      ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {orderHistory.length === 0 ? (
            /* Empty State — Centered in available space */
            <div className="flex flex-col items-center justify-center py-16 md:py-20">
              <div className="w-14 h-14 rounded-full bg-[#E8D0D2]/20 flex items-center justify-center mb-4">
                <ShoppingBag size={22} className="text-[#E8D0D2]" />
              </div>
              <p className="font-serif text-lg text-[#2d1b1b] mb-1">
                Your wardrobe is empty
              </p>
              <p className="text-[12px] text-gray-400 mb-6 max-w-xs text-center">
                Explore our cinematic collection and find the perfect gown.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#8c363e] text-white px-5 py-2 rounded-full text-[9px] uppercase tracking-widest font-bold hover:bg-[#6b272f] transition-all shadow-md"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {/* Active Orders */}
              {orderHistory.filter(
                (o) => o.status === "PAID" || o.status === "SHIPPED"
              ).length > 0 && (
                <div>
                  <p className="text-[8px] uppercase tracking-[0.4em] text-[#8c363e] font-bold mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8c363e] animate-pulse" />
                    Active
                  </p>
                  <div className="space-y-2">
                    {orderHistory
                      .filter(
                        (o) => o.status === "PAID" || o.status === "SHIPPED"
                      )
                      .map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          isExpanded={expandedOrderId === order.id}
                          onToggle={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id
                            )
                          }
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Past Orders */}
              {orderHistory.filter(
                (o) =>
                  o.status === "DELIVERED" || o.status === "PENDING"
              ).length > 0 && (
                <div>
                  <p className="text-[8px] uppercase tracking-[0.4em] text-gray-400 font-bold mb-2.5">
                    Past Orders
                  </p>
                  <div className="space-y-2">
                    {orderHistory
                      .filter(
                        (o) =>
                          o.status === "DELIVERED" || o.status === "PENDING"
                      )
                      .map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          isExpanded={expandedOrderId === order.id}
                          onToggle={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id
                            )
                          }
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
