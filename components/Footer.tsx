import Link from "next/link";
import { Camera, Instagram, Youtube, Mail, Heart, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#FFF8F7] text-[#5A2A2F] overflow-hidden border-t border-[#E8D0D2] py-10 lg:py-12">
      
      {/* ========================================= */}
      {/* 1. ROMANTIC ROSE PETAL ANIMATION          */}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-60">
        <div className="petal absolute top-[-10%] left-[15%] w-3 h-4 animate-[fall_8s_linear_infinite]" />
        <div className="petal absolute top-[-10%] left-[45%] w-4 h-5 animate-[fall_12s_linear_infinite_2s]" />
        <div className="petal absolute top-[-10%] left-[75%] w-2.5 h-3 animate-[fall_9s_linear_infinite_4s]" />
        <div className="petal absolute top-[-10%] left-[90%] w-3 h-4 animate-[fall_14s_linear_infinite_1s]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-8">
        
        {/* LEFT: Sleek Brand Signature */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-1/3">
          <Link href="/" className="inline-block group">
            <p className="font-sans text-[8px] uppercase tracking-[0.4em] text-[#C0858B] mb-1 font-bold flex items-center justify-center lg:justify-start gap-1.5">
              <Camera size={10} /> Rinku Video Lab
            </p>
            <h3 className="font-serif text-3xl tracking-tight text-[#5A2A2F] leading-none group-hover:text-[#9A4B54] transition-colors">
              Everafter
            </h3>
          </Link>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#C0858B] mt-2">
            The Cinematic Wardrobe
          </p>
        </div>

        {/* MIDDLE: Minimalist Horizontal Navigation */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10 w-full lg:w-1/3">
          <Link href="/category/prewedding" className="text-[10px] uppercase tracking-[0.2em] text-[#8A4A52] hover:text-[#5A2A2F] transition-colors font-medium">Prewedding</Link>
          <Link href="/category/maternity" className="text-[10px] uppercase tracking-[0.2em] text-[#8A4A52] hover:text-[#5A2A2F] transition-colors font-medium">Maternity</Link>
          <Link href="/category/bridal" className="text-[10px] uppercase tracking-[0.2em] text-[#8A4A52] hover:text-[#5A2A2F] transition-colors font-medium">Bridal</Link>
          <Link href="/reels" className="text-[10px] uppercase tracking-[0.2em] text-[#8A4A52] hover:text-[#5A2A2F] transition-colors font-medium">Reels</Link>
        </div>

        {/* RIGHT: VIP List & Socials */}
        <div className="flex flex-col items-center lg:items-end w-full lg:w-1/3 gap-5">
          <form className="relative flex items-center border-b border-[#C0858B]/50 pb-1.5 group w-64">
            <input 
              type="email" 
              placeholder="Join the VIP Bridal List" 
              className="w-full bg-transparent text-[10px] uppercase tracking-widest text-[#5A2A2F] placeholder:text-[#C0858B] outline-none transition-colors text-center lg:text-right pr-6"
              required
            />
            <button type="submit" className="absolute right-0 text-[#C0858B] group-hover:text-[#5A2A2F] transition-colors">
              <ArrowRight size={12} />
            </button>
          </form>
          
          <div className="flex items-center gap-5 text-[#C0858B]">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#5A2A2F] transition-colors"><Instagram size={14} /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#5A2A2F] transition-colors"><Youtube size={16} /></a>
            <a href="mailto:hello@rinkuvideolab.com" className="hover:text-[#5A2A2F] transition-colors"><Mail size={14} /></a>
          </div>
        </div>

      </div>

      {/* BOTTOM: Micro Copyright */}
      <div className="relative z-10 text-center mt-10 pt-6 border-t border-[#E8D0D2]/50">
        <p className="text-[8px] uppercase tracking-[0.2em] text-[#C0858B] flex items-center justify-center gap-1.5">
          © 2026 Everafter <Heart size={8} className="text-[#9A4B54] fill-[#9A4B54]" /> Pune, India
        </p>
      </div>

      {/* --- CUSTOM CSS FOR ROSE PETALS --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .petal {
          background: linear-gradient(135deg, #F9D8D9 0%, #EFA7AD 100%);
          border-radius: 15% 85% 15% 85% / 85% 15% 85% 15%;
          box-shadow: 0 5px 10px rgba(154, 75, 84, 0.1);
        }
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(150px) rotate(360deg) translateX(40px); opacity: 0; }
        }
      `}} />
    </footer>
  );
}