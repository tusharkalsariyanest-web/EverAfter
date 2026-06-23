"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, CreditCard, MapPin, Heart } from "lucide-react";

// NEW FIREBASE IMPORTS FOR GOOGLE AUTH
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// RAZORPAY SCRIPT LOADER
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// CUSTOM X-AXIS SLIDER & CELEBRATION ANIMATION
const CheckoutAnimation = ({ step, paymentSuccess }: { step: number, paymentSuccess: boolean }) => {
  let brideX = -120;
  let groomX = 120;
  
  if (step === 2) {
    brideX = -60;
    groomX = 60;
  }

  return (
    <div className="w-full h-48 md:h-56 bg-transparent mb-8 flex items-center justify-center relative overflow-hidden">
      <AnimatePresence mode="wait">
        {(!paymentSuccess) ? (
          <motion.div 
            key="approach" 
            exit={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }} 
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div animate={{ x: brideX }} transition={{ type: "spring", stiffness: 40, damping: 12 }} className="absolute w-32 h-44 md:w-40 md:h-52 drop-shadow-md z-10">
              <Image src="/bride.png" alt="Bride" fill className="object-contain" priority />
            </motion.div>

            <motion.div animate={{ x: groomX }} transition={{ type: "spring", stiffness: 40, damping: 12 }} className="absolute w-32 h-44 md:w-40 md:h-52 drop-shadow-md z-0">
              <Image src="/groom.png" alt="Groom" fill className="object-contain" priority />
            </motion.div>

            <motion.p key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-0 text-[9px] uppercase tracking-widest text-[#8c363e] font-bold">
              {step === 1 && "Awaiting Couple"}
              {step === 2 && "Taking the Step"}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div key="married" initial={{ opacity: 0, filter: "blur(8px)", scale: 0.8 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute inset-0 flex items-center justify-center flex-col z-20">
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute w-64 h-64 bg-gradient-to-tr from-[#8c363e]/20 to-yellow-300/20 rounded-full blur-2xl z-0" />
            <div className="relative w-44 h-44 md:w-56 md:h-56 drop-shadow-2xl z-10">
              <Image src="/step-3.png" alt="Forever Begins Now" fill className="object-contain" priority />
              <div className="absolute inset-0 pointer-events-none">
                <motion.div animate={{ y: [0, -40, 20], opacity: [0, 1, 0], rotate: [0, 45, 90] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-4 -left-4 text-3xl">🌸</motion.div>
                <motion.div animate={{ y: [0, -60, 30], opacity: [0, 1, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className="absolute top-4 -left-8 text-xl">✨</motion.div>
                <motion.div animate={{ y: [0, -30, 40], opacity: [0, 1, 0], rotate: [0, -45, -90] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }} className="absolute -top-6 -right-2 text-2xl">🌹</motion.div>
                <motion.div animate={{ y: [100, -100], opacity: [0, 1, 0], x: [0, 20, -20, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute bottom-0 left-1/4 w-1.5 h-3 bg-yellow-400 rounded-sm" />
                <motion.div animate={{ y: [100, -100], opacity: [0, 1, 0], x: [0, -20, 20, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1.5 }} className="absolute bottom-0 right-1/4 w-2 h-2 bg-yellow-500 rounded-full" />
              </div>
            </div>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10 text-center mt-2">
              <p className="text-[12px] uppercase tracking-[0.3em] font-extrabold text-green-700 bg-green-50 px-4 py-1 rounded-full border border-green-200 shadow-sm">
                Forever Begins Now
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CheckoutPage() {
  const { items } = useCartStore();
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  // Flow is now 2 steps: 1 = Auth Selection, 2 = Shipping Form
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // NEW SESSION STATE
  const [session, setSession] = useState({
    uid: null as string | null,
    name: "",
    email: "",
    phone: "",
    isGuest: false,
  });

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    pincode: "",
  });

  // 1. HANDLE GOOGLE LOGIN
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sync with your new database structure
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
        }),
      });

      setSession({
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        phone: "", // Captured in step 2
        isGuest: false,
      });

      setStep(2);
    } catch (error) {
      console.error('Google Auth Failed:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. HANDLE GUEST CHECKOUT
  const handleGuestRoute = () => {
    setSession({
      uid: null,
      name: "",
      email: "",
      phone: "",
      isGuest: true,
    });
    setStep(2);
  };

  // 3. FINAL CHECKOUT WITH RAZORPAY
  const handleFinalCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      // Merge session & shipping for the API
      const orderPayload = {
        userId: session.uid,
        name: session.name,
        email: session.email,
        phone: session.phone,
        ...shippingAddress,
        items,
        subtotal
      };

      const orderResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert("Server error creating order. Please try again.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: subtotal * 100, 
        currency: "INR",
        name: "Everafter",
        description: "Cinematic Wardrobe Collection",
        order_id: orderData.orderId, 
        
        handler: async function (response: any) {
           console.log("Payment Successful!", response);
           
           const verifyRes = await fetch("/api/verify-payment", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_order_id: response.razorpay_order_id,
               razorpay_signature: response.razorpay_signature,
               dbOrderId: orderData.id 
             })
           });

           const verifyData = await verifyRes.json();

           if(verifyData.success) {
             setPaymentSuccess(true); 
             useCartStore.setState({ items: [] });
           } else {
             alert("Payment verification failed. Please contact support.");
           }
        },
        
        prefill: {
          name: session.name,
          email: session.email,
          contact: session.phone,
        },
        theme: {
          color: "#8c363e", 
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      setLoading(false);

    } catch (error) {
      console.error("Payment Initiation Error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0 && !paymentSuccess) {
    return (
      <div className="w-full min-h-screen bg-[#FDF6F5] flex flex-col items-center justify-center pt-24 px-6 text-center">
        <h2 className="font-serif text-3xl text-[#2d1b1b] mb-4">Your collection is empty</h2>
        <p className="text-sm text-[#C0858B] uppercase tracking-widest mb-8">Add a cinematic look before checking out</p>
        <Link href="/" className="bg-[#5A2A2F] text-white px-8 py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-colors shadow-lg">
          Return to Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDF6F5] pt-36 pb-16 text-[#2d1b1b] relative">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#171112]/60 to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          
          {paymentSuccess ? (
            <motion.div key="success-screen" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-full max-w-2xl mx-auto scale-110 md:scale-125 mb-16 mt-8">
                 <CheckoutAnimation step={3} paymentSuccess={true} />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl text-[#8c363e] mb-4 tracking-tight">A Beautiful Journey Begins</h1>
              <div className="space-y-4 mb-10 text-gray-600 max-w-xl mx-auto">
                <p className="text-sm md:text-base leading-relaxed font-bold text-[#2d1b1b]">Payment Completed! Your spectacular wardrobe is officially on its way.</p>
                <div className="flex items-center justify-center gap-2 text-[#8c363e] opacity-80 py-2">
                  <Heart size={16} fill="currentColor" />
                  <Heart size={12} fill="currentColor" />
                  <Heart size={16} fill="currentColor" />
                </div>
              </div>
              <Link href="/" className="bg-[#5A2A2F] text-white px-10 py-4 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#2d1b1b] transition-all shadow-xl">
                Return to Gallery
              </Link>
            </motion.div>
          ) : (
            <motion.div key="checkout-form" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              
              <div className="mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#C0858B] hover:text-[#8c363e] transition-colors mb-4 uppercase tracking-widest font-bold">
                  <ArrowLeft size={14} /> Back to Studio
                </Link>
                <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Secure Checkout</h2>
                <div className="flex items-center gap-4 mt-6">
                  <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${step >= 1 ? "text-[#8c363e]" : "text-[#C0858B]/50"}`}>
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">1</span> Login
                  </div>
                  <div className="w-8 h-[1px] bg-[#E8D0D2]"></div>
                  <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${step >= 2 ? "text-[#8c363e]" : "text-[#C0858B]/50"}`}>
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">2</span> Shipping
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8D0D2]/60 shadow-sm relative overflow-hidden">
                    <CheckoutAnimation step={step} paymentSuccess={false} />

                    <AnimatePresence mode="wait">
                      {/* STEP 1: AUTHENTICATION SELECTION */}
                      {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                          
                          <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-900 font-semibold py-4 px-4 rounded-xl transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {loading ? 'Connecting...' : 'Continue with Google'}
                          </button>

                          <div className="flex items-center my-4">
                            <div className="flex-1 border-t border-[#E8D0D2]"></div>
                            <span className="px-3 text-[10px] text-[#C0858B] uppercase tracking-widest font-bold">or</span>
                            <div className="flex-1 border-t border-[#E8D0D2]"></div>
                          </div>

                          <button
                            onClick={handleGuestRoute}
                            className="w-full bg-[#5A2A2F] text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-all shadow-md"
                          >
                            Checkout as Guest
                          </button>
                        </motion.div>
                      )}

                      {/* STEP 2: SHIPPING DETAILS */}
                      {step === 2 && (
                        <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleFinalCheckout} className="space-y-6">
                          
                          <div className="flex items-center justify-between border-b border-[#E8D0D2]/50 pb-4 mb-4">
                             <p className="text-xs font-bold text-[#2d1b1b]">
                               {session.isGuest ? 'Guest Checkout' : `Logged in as ${session.email}`}
                             </p>
                             <button type="button" onClick={() => setStep(1)} className="text-[10px] uppercase tracking-widest text-[#8c363e] font-bold">Change</button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">Full Name</label>
                              <input required type="text" value={session.name} onChange={(e) => setSession({...session, name: e.target.value})} className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#8c363e] transition-colors" placeholder="Ananya Sharma" />
                            </div>

                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">Mobile Number</label>
                              <div className="relative flex items-center">
                                <span className="absolute left-4 text-sm text-[#2d1b1b] font-bold">+91</span>
                                <input required type="tel" maxLength={10} pattern="[0-9]{10}" value={session.phone} onChange={(e) => setSession({...session, phone: e.target.value})} className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#8c363e] transition-colors" placeholder="10-digit number" />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52]">Email Address</label>
                            <input required type="email" disabled={!session.isGuest} value={session.email} onChange={(e) => setSession({...session, email: e.target.value})} className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#8c363e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed" placeholder="ananya@example.com" />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A4A52] flex items-center gap-1.5"><MapPin size={12}/> Complete Shipping Address</label>
                            <textarea required rows={2} value={shippingAddress.address} onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#8c363e] transition-colors resize-none" placeholder="Flat/House No, Building, Street name" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <input required type="text" value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#8c363e] transition-colors" placeholder="City" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <input required type="text" pattern="[0-9]{6}" value={shippingAddress.pincode} onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})} className="w-full bg-[#FCFBF9] border border-[#E8D0D2] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#8c363e] transition-colors" placeholder="Pincode" />
                            </div>
                          </div>

                          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#5A2A2F] text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-all shadow-lg mt-4">
                            <CreditCard size={14} /> {loading ? "Connecting to Gateway..." : "Proceed to Secure Payment"}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#C0858B] uppercase tracking-widest justify-center pt-2">
                    <ShieldCheck size={14} className="text-[#8c363e]" /> 256-bit Encrypted SSL Connection
                  </div>
                </div>

                {/* RIGHT COLUMN: Sticky Order Summary */}
                <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit bg-white border border-[#E8D0D2]/60 rounded-2xl p-6 shadow-[0_10px_40px_rgba(140,54,62,0.03)]">
                  <h3 className="font-serif text-2xl mb-6 pb-4 border-b border-[#E8D0D2]/40">Order Summary</h3>
                  
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                    {items.map((item) => (
                      <div key={item.gownId} className="flex gap-4 items-center justify-between">
                        <div className="flex gap-3 items-center">
                          <div className="relative w-14 h-20 rounded-lg overflow-hidden border border-[#E8D0D2]/40 bg-[#FCFBF9] flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-serif text-sm leading-tight text-[#2d1b1b] line-clamp-1">{item.name}</h4>
                            <p className="text-[10px] text-[#C0858B] mt-1">Qty: <span className="font-bold text-[#2d1b1b]">{item.quantity}</span></p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-[#5A2A2F]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#E8D0D2]/40 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#C0858B] uppercase tracking-wider">Subtotal</span>
                      <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#C0858B] uppercase tracking-wider">Shipping</span>
                      <span className="text-green-600 font-bold uppercase tracking-wider text-[10px]">Free Delivery</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-[#E8D0D2]/40">
                      <span className="font-serif text-lg">Total Amount</span>
                      <span className="font-serif text-2xl text-[#8c363e]">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}