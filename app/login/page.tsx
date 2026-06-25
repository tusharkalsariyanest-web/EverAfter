"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success("Welcome to the Studio");
        router.push("/admin");
        router.refresh();
      } else {
        toast.error("Invalid Credentials. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Cinematic Dark Background with subtle gradients
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8c363e]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d99898]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="bg-[#1a1a1a]/60 backdrop-blur-2xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-md rounded-3xl border border-white/10 z-10 relative">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-4 shadow-inner">
            <Lock className="text-[#d99898] w-5 h-5" />
          </div>
          <h1 className="font-serif text-3xl text-[#FDF6F5] mb-2 text-center tracking-wide">
            EverAfter
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#d99898] flex items-center gap-1.5 font-bold">
            <Sparkles size={12} /> Creator Studio Access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FDF6F5] outline-none focus:border-[#d99898] transition-all placeholder:text-white/20 shadow-inner"
              placeholder="Enter your handle..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/60 font-bold ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FDF6F5] outline-none focus:border-[#d99898] transition-all placeholder:text-white/20 shadow-inner"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-[#d99898] hover:bg-[#c48282] disabled:opacity-50 disabled:cursor-not-allowed text-black py-4 rounded-xl uppercase tracking-[0.2em] text-[10px] font-bold mt-4 transition-all shadow-[0_0_20px_rgba(217,152,152,0.15)] hover:shadow-[0_0_25px_rgba(217,152,152,0.3)]"
          >
            {isLoading ? "Authenticating..." : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
