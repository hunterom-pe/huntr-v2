"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-blue-200">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-black tracking-[0.15em] text-slate-900 group-hover:text-blue-600 transition-colors">
              HUNTR<span className="text-blue-600">.</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">Product</Link>
            <Link href="/pricing" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Pricing</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900 transition-colors">Log In</Link>
            <Link href="/onboarding" className="btn-primary px-8 py-3.5 hidden sm:flex items-center gap-2">
              Start Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-40 pb-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">future</span>.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Choose the plan that fits your job hunt. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-40">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          {/* Free Tier */}
          <div className="glass-card p-10 bg-white/60 border border-slate-200/60 rounded-[32px] shadow-xl shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-slate-400" size={24} />
              <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-600">The Hook</h3>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-slate-900">$0</span>
              <span className="text-slate-500 font-medium"> / forever</span>
            </div>
            <p className="text-[14px] text-slate-500 font-medium mb-8 leading-relaxed">Perfect for testing the waters and seeing the AI in action.</p>
            <Link href="/onboarding" className="btn-glass w-full py-4 mb-8 flex justify-center text-[12px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900">
              Get Started Free
            </Link>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> 1 AI Job Search Scan
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> 3 Resume Optimizations
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> Basic Kanban Tracker
              </li>
            </ul>
          </div>

          {/* Elite Tier (Middle - Highlighted) */}
          <div className="glass-card p-12 bg-slate-900 border-slate-800 rounded-[32px] shadow-2xl shadow-blue-900/20 relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
              Most Popular
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-blue-400" size={24} />
              <h3 className="text-[13px] font-black uppercase tracking-widest text-blue-400">Elite Operator</h3>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-white">$29</span>
              <span className="text-slate-400 font-medium"> / month</span>
            </div>
            <p className="text-[14px] text-slate-300 font-medium mb-8 leading-relaxed">The ultimate 24/7 AI career agent. Zero limits. Full intelligence.</p>
            <Link href="/onboarding" className="w-full py-4 mb-8 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/30">
              Go Elite <ArrowRight size={16} />
            </Link>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> Unlimited AI Job Scans
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> Unlimited Master Resumes
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> High-Match Radar Alerts
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> Custom Interview Prep Intel
              </li>
              <li className="flex items-start gap-3 text-[14px] text-white font-medium">
                <Check className="text-blue-400 mt-0.5 shrink-0" size={18} /> Automated Follow-up Reminders
              </li>
            </ul>
          </div>

          {/* Active Tier */}
          <div className="glass-card p-10 bg-white/60 border border-slate-200/60 rounded-[32px] shadow-xl shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-slate-400" size={24} />
              <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-600">Active Hunter</h3>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-black text-slate-900">$15</span>
              <span className="text-slate-500 font-medium"> / month</span>
            </div>
            <p className="text-[14px] text-slate-500 font-medium mb-8 leading-relaxed">For the casual job seeker who needs more volume and tracking.</p>
            <Link href="/onboarding" className="btn-glass w-full py-4 mb-8 flex justify-center text-[12px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900">
              Start Active
            </Link>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> 5 AI Job Scans / month
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> 15 Resume Optimizations / month
              </li>
              <li className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                <Check className="text-blue-500 mt-0.5 shrink-0" size={18} /> Full Kanban Tracker
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
