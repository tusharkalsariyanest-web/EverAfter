"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, KeyRound, Truck, Search, Package, MapPin, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: number;
  price: number;
  quantity: number;
  gown?: {
    name: string;
    image: string;
  };
}

interface Order {
  id: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  courierPartner: string | null;
  trackingId: string | null;
  shippingSpeed: string | null;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
}

export default function TrackingPage() {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Orders Display
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  // Simulate Sending OTP
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  // Verify OTP and Fetch real data via an API endpoint or Server Action
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetching matching orders dynamically by customer phone number
      const response = await fetch(`/api/track?phone=${mobile}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setStep(3);
      } else {
        alert(data.message || "No orders found linked to this number.");
      }
    } catch (error) {
      console.error("Error fetching tracking info:", error);
      alert("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDF6F5] pt-36 pb-20 text-[#2d1b1b]">
      <div className="max-w-4xl mx-auto px-6">
        
        <AnimatePresence mode="wait">
          {step < 3 ? (
            /* ======================================================== */
            /* GATEWAY AUTHENTICATION: PHONE & OTP SELECTION            */
            /* ======================================================== */
            <motion.div 
              key="auth" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#E8D0D2]/60 shadow-sm text-center"
            >
              <div className="w-12 h-12 bg-[#8c363e]/10 text-[#8c363e] rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={22} />
              </div>
              <h1 className="font-serif text-2xl tracking-tight mb-2">Track Your Wardrobe</h1>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mb-8">Verify your mobile context to instantly look up live courier data and dispatch timelines.</p>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form key="phone-form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleSendOTP} className="space-y-5 text-left">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52] flex items-center gap-1.5">
                        <Smartphone size={12} /> Contact Number
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-sm text-[#2d1b1b] font-bold">+91</span>
                        <input required autoFocus type="tel" maxLength={10} pattern="[0-9]{10}" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#8c363e]" placeholder="98765 43210" />
                      </div>
                    </div>
                    <button type="submit" disabled={loading || mobile.length !== 10} className="w-full bg-[#5A2A2F] text-white py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-all disabled:opacity-50">
                      {loading ? "Sending..." : "Request Access Token"}
                    </button>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.form key="otp-form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleVerifyOTP} className="space-y-5 text-left">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52] flex items-center gap-1.5">
                        <KeyRound size={12} /> Secure Token OTP
                      </label>
                      <p className="text-[11px] text-gray-500">Sent to +91 {mobile} <button type="button" onClick={() => setStep(1)} className="underline ml-1 text-[#8c363e] font-semibold">Change</button></p>
                      <input required autoFocus type="text" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3 text-center text-xl tracking-[0.8em] font-mono font-bold focus:outline-none focus:border-[#8c363e]" placeholder="••••" />
                    </div>
                    <button type="submit" disabled={loading || otp.length !== 4} className="w-full bg-[#5A2A2F] text-white py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-all disabled:opacity-50">
                      {loading ? "Authorizing Tracking..." : "Verify & Fetch Data"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ======================================================== */
            /* SUCCESS TIMELINE DISPLAY: REALTIME ORDER CARDS           */
            /* ======================================================== */
            <motion.div key="tracking-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E8D0D2]/50 pb-6 gap-4">
                <div>
                  <h1 className="font-serif text-3xl tracking-tight">Your Order Journey</h1>
                  <p className="text-xs text-gray-500 mt-1">Live fulfillment data linked with +91 {mobile}</p>
                </div>
                <button onClick={() => { setStep(1); setOtp(""); setMobile(""); }} className="text-[10px] uppercase tracking-widest font-bold bg-white text-[#8c363e] border border-[#E8D0D2] px-4 py-2 rounded-xl hover:bg-[#FCFBF9] transition-colors">
                  Logout Account
                </button>
              </div>

              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-[#E8D0D2]/60 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
                  
                  {/* LEFT DETAILS EXPANSION */}
                  <div className="md:col-span-7 p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Order Reference ID</h3>
                        <p className="text-lg font-serif font-bold text-[#2d1b1b]">#{order.id}</p>
                      </div>
                      <div className="text-right">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Placed Date</h3>
                        <p className="text-xs font-medium text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>

                    {/* FULFILLMENT VISUAL TIMELINE PATH */}
                    <div className="relative pt-4 pb-2">
                      <div className="absolute top-[35px] left-3 right-3 h-[2px] bg-gray-100 z-0" />
                      
                      {/* Dynamic highlight filler bar */}
                      <div 
                        className="absolute top-[35px] left-3 h-[2px] bg-green-600 transition-all duration-500 z-0" 
                        style={{ width: order.status === "DELIVERED" ? "100%" : order.status === "SHIPPED" ? "50%" : "0%" }}
                      />

                      <div className="relative flex justify-between text-center z-10">
                        {/* Milestone 1 */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center text-xs shadow-sm font-bold">✓</div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-green-700">Confirmed</span>
                        </div>
                        {/* Milestone 2 */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm font-bold transition-colors ${order.status === "SHIPPED" || order.status === "DELIVERED" ? "bg-green-50 text-green-600 border border-green-200" : "bg-white text-gray-400 border border-gray-200"}`}>
                            {order.status === "SHIPPED" || order.status === "DELIVERED" ? "✓" : "2"}
                          </div>
                          <span className={`text-[9px] uppercase tracking-widest font-bold ${order.status === "SHIPPED" || order.status === "DELIVERED" ? "text-green-700" : "text-gray-400"}`}>Shipped</span>
                        </div>
                        {/* Milestone 3 */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm font-bold transition-colors ${order.status === "DELIVERED" ? "bg-green-50 text-green-600 border border-green-200" : "bg-white text-gray-400 border border-gray-200"}`}>
                            {order.status === "DELIVERED" ? "✓" : "3"}
                          </div>
                          <span className={`text-[9px] uppercase tracking-widest font-bold ${order.status === "DELIVERED" ? "text-green-700" : "text-gray-400"}`}>Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Wardrobe Items Breakdown */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center justify-between text-xs">
                          <span className="font-serif text-[#2d1b1b]">{item.gown?.name || "Exclusive Collection Gown"} <span className="text-gray-400 ml-1 font-sans">x{item.quantity}</span></span>
                          <span className="font-bold text-gray-600">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COURIER METRICS TRACKING DATA */}
                  <div className="md:col-span-5 bg-[#FCFBF9] border-t md:border-t-0 md:border-l border-[#E8D0D2]/60 p-6 md:p-8 flex flex-col justify-between gap-6">
                    <div>
                      <h4 className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-[#8A4A52] mb-3">Courier Logistics Status</h4>
                      
                      {order.trackingId ? (
                        <div className="space-y-4">
                          <div className="bg-white p-3.5 rounded-xl border border-[#E8D0D2]/50 shadow-sm space-y-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Carrier Assignment</p>
                            <p className="text-sm font-serif font-bold text-[#2d1b1b]">{order.courierPartner}</p>
                            <p className="text-[11px] font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block border tracking-wide">AWB: {order.trackingId}</p>
                          </div>
                          
                          <a 
                            href={`https://www.delhivery.com/track/package/${order.trackingId}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full flex items-center justify-center gap-2 bg-[#5A2A2F] text-white py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-all shadow-md"
                          >
                            Live Tracking Network <ExternalLink size={12} />
                          </a>
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-yellow-800 font-bold uppercase tracking-wider">
                            <Package size={14} /> Allocation Phase
                          </div>
                          <p className="text-xs text-yellow-700/90 leading-relaxed">Your order is safely secured! Our design production studio is completing premium packaging before assigning the courier fleet.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-xs text-gray-500 border-t border-gray-200/60 pt-4">
                      <MapPin size={14} className="text-[#C0858B] shrink-0 mt-0.5" />
                      <p className="line-clamp-2 text-[11px] leading-normal">Shipping Address: {order.address}, {order.city} - {order.pincode}</p>
                    </div>
                  </div>

                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E8D0D2] text-gray-500 text-sm">
                  Authentication succeeded, but no orders are registered to +91 {mobile}.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}