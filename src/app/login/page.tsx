"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, Mail, Lock, Search as Google, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/onboarding";
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Mesh Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/10 blur-[120px]" />

      <div className="w-full max-w-[440px] space-y-6 relative z-10">
        <div className="text-center space-y-4 mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
            <Image 
              src="/logo.png" 
              alt="HUNTR Logo" 
              width={160} 
              height={50} 
              className="h-8 w-auto object-contain mix-blend-multiply mx-auto" 
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLogin ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-[13px] text-slate-500 font-medium">
              {isLogin ? "Welcome back to your dashboard." : "Join thousands of professionals landing better roles."}
            </p>
          </div>
        </div>

        <div className="glass-panel p-10 space-y-8 border-white/60 shadow-2xl shadow-blue-500/5">
          <button className="w-full btn-glass flex items-center justify-center gap-3 py-3.5 text-slate-700 font-bold border-white/80 bg-white/60 hover:bg-white transition-all text-[13px] uppercase tracking-wider">
            <Google size={18} />
            Continue with Google
          </button>

          <div className="relative flex items-center gap-4 py-1">
            <div className="flex-1 h-[1px] bg-slate-200/50" />
            <span className="label-caps !text-[9px] text-slate-400">or use email</span>
            <div className="flex-1 h-[1px] bg-slate-200/50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="label-caps ml-1">Username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="johndoe" className="input-glass pl-11" required />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="label-caps ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" placeholder="name@company.com" className="input-glass pl-11" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="label-caps ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" placeholder="••••••••" className="input-glass pl-11" required />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary py-4 flex items-center justify-center gap-2 mt-4 text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>{isLogin ? "Sign In" : "Get Started"} <ArrowRight size={20} /></>}
            </button>
          </form>

          {isLogin && (
            <div className="pt-2">
              <button 
                onClick={() => { setIsLoading(true); setTimeout(() => window.location.href = "/onboarding", 1000); }}
                className="w-full py-3 glass-card bg-blue-50/50 border-blue-100/50 text-blue-600 font-black text-[10px] hover:bg-blue-600 hover:text-white transition-all uppercase tracking-[0.3em]"
              >
                Log in with Sandbox Account
              </button>
            </div>
          )}
        </div>

        <div className="text-center pt-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 text-[10px] font-black hover:text-blue-600 transition-colors uppercase tracking-[0.3em]">
            {isLogin ? "New user? Create an account" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
