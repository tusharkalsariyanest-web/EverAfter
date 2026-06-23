"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-white p-10 shadow-2xl w-full max-w-md border-t-4 border-[#C6A87C]">
        <h1 className="font-serif text-3xl mb-2 text-center">Suvarna Mahel</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 text-center mb-8 font-bold">Admin Portal</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold">Username</label>
            <input 
              type="text" 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold">Password</label>
            <input 
              type="password" 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-200 py-2 outline-none focus:border-black transition-colors" 
            />
          </div>
          <button className="w-full bg-black text-[#C6A87C] py-4 uppercase tracking-[0.3em] text-[10px] font-bold mt-4 hover:bg-zinc-800 transition-all">
            Enter Vault
          </button>
        </form>
      </div>
    </div>
  );
}