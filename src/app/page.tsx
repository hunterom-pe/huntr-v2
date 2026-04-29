"use client";

import Link from "next/link";
import { ArrowRight, Search, Zap, FileText, CheckCircle2, Shield, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pt-24">
      {/* Locked Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-24 flex justify-between items-center">
          <Link href="/" className="logo-text">
            HUNTR
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="#how-it-works" className="hidden md:block text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
              How it Works
            </Link>
            <Link href="/login" className="px-8 py-3 bg-[#F1F4F9] text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#E2E8F0] transition-all">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6">
        {/* Hero Section */}
        <section className="text-center pt-20 pb-32 space-y-12">
          <div className="space-y-8">
            <h1 className="hero-text-large">
              Your Job Search, <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">Automated</span>
            </h1>
            <p className="hero-sub text-slate-500 font-medium text-xl max-w-3xl mx-auto leading-relaxed">
              Stop wasting hours searching and applying. Let our intelligent system find your 
              perfect matches and tailor your resume for every single opportunity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            <Link href="/login" className="btn-pill-blue justify-center text-base">
              Get Started for Free <ArrowRight size={20} />
            </Link>
            <Link href="#how-it-works" className="btn-pill-gray justify-center text-base">
              See How It Works
            </Link>
          </div>
          
          <div className="pt-8 flex justify-center items-center gap-8 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-2 hidden sm:flex"><Shield size={16} className="text-blue-500" /> Private & Secure</span>
          </div>
        </section>

        {/* Hero Mockup */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-12 relative max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/50 to-transparent z-10 h-full w-full pointer-events-none" />
          <div className="rounded-t-3xl border border-slate-200 bg-white/60 backdrop-blur-xl shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden aspect-[16/9] p-2 flex flex-col relative z-0">
            <div className="flex gap-2 p-4 border-b border-slate-100 bg-white/50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 p-8 flex gap-6 bg-slate-50/50">
              <div className="w-1/3 space-y-4 hidden md:block">
                <div className="h-8 bg-slate-200/50 rounded-lg w-full" />
                <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm" />
                <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm" />
              </div>
              <div className="w-full md:w-2/3 bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Target className="text-blue-600" size={24} />
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-slate-200/50 rounded w-48 animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded w-32" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Integration Logo Cloud */}
        <div className="pt-10 pb-32 border-b border-slate-200/60 mb-32 relative z-20">
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10">Seamlessly connects with</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale">
            <span className="text-2xl font-black tracking-tight text-slate-900">LinkedIn</span>
            <span className="text-2xl font-black tracking-tighter text-slate-900">indeed</span>
            <span className="text-2xl font-black tracking-tight text-slate-900">Glassdoor</span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">ZipRecruiter</span>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="pb-32 space-y-16 scroll-mt-32">
          <div className="text-center space-y-6 max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#F1F4F9] text-slate-500 text-[11px] font-black tracking-[0.2em] uppercase">
              The Process
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">How it works</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              A seamless three-step process to land your dream role without the manual heavy lifting.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { 
                title: "Deep Scan", 
                desc: "We scan thousands of jobs across all major boards in seconds, filtering out the noise to find exactly what fits.",
                icon: Search,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              { 
                title: "Instant Match", 
                desc: "Our intelligence engine cross-references your profile with job requirements to find the highest probability matches.",
                icon: Target,
                color: "text-cyan-600",
                bg: "bg-cyan-50"
              },
              { 
                title: "Auto-Optimize", 
                desc: "Automatically tailors and rewrites your resume to highlight the specific skills each job description is looking for.",
                icon: FileText,
                color: "text-indigo-600",
                bg: "bg-indigo-50"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="feature-card group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-slate-200/40 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="mb-12 relative z-10">
                  <div className={`w-20 h-20 ${feature.bg} rounded-3xl flex items-center justify-center shadow-inner group-hover:shadow-lg transition-all duration-300`}>
                    <feature.icon className={`${feature.color} group-hover:scale-110 transition-transform duration-300`} size={32} />
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Additional Information Section */}
        <section className="pb-32">
          <div className="bg-slate-900 rounded-[40px] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-blue-500/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[100%] bg-cyan-500/20 blur-[120px] pointer-events-none" />
            
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight relative z-10">
              Ready to automate your search?
            </h2>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto font-medium relative z-10 leading-relaxed">
              Join the professionals who are landing interviews faster by letting the system do the hard work.
            </p>
            <div className="pt-6 relative z-10">
              <Link href="/login" className="inline-flex items-center gap-3 px-12 py-5 bg-white text-slate-900 font-black rounded-full text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-white/10">
                Create Free Account <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Structured Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="logo-text !text-xl">HUNTR</span>
            <p className="text-sm font-medium text-slate-400">The automated job search platform.</p>
          </div>
          
          <nav className="flex items-center gap-8 text-sm font-bold text-slate-500">
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Contact Support</Link>
          </nav>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-8 border-t border-slate-100 text-center">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            &copy; 2026 HUNTR SYSTEMS &bull; ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
