import Link from "next/link";
import { ArrowRight, Play, Zap, Shield, Search, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen p-4 md:p-8">
      {/* Mesh Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bento */}
        <header className="glass-panel px-8 py-4 flex justify-between items-center z-50">
          <Link href="/" className="flex items-center group">
            <span className="text-xl font-black tracking-[0.15em] text-slate-900 group-hover:text-blue-600 transition-colors">
              HUNTR<span className="text-blue-600">.</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <Link href="#process" className="hover:text-blue-600 transition-colors">How it works</Link>
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="/login" className="btn-glass py-2 px-6 border-none shadow-none text-[11px]">Sign In</Link>
          </nav>
        </header>

        {/* Hero Bento Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-panel p-10 md:p-16 flex flex-col justify-center space-y-8 min-h-[500px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/50 border border-blue-100/50 text-blue-600 text-[10px] font-black tracking-widest uppercase w-fit">
              <Zap size={12} /> The Faster Way to Find Work
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[0.95] tracking-tight">
              Perfect <br /><span className="text-blue-600">job matches</span> faster.
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-lg font-medium">
              The professional platform designed to scan thousands of jobs and optimize your resume for every application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login" className="btn-primary flex items-center justify-center gap-2 px-10 rounded-2xl">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link href="#process" className="btn-glass flex items-center justify-center gap-2 px-10 rounded-2xl">
                <Play size={18} className="fill-slate-700" /> See it in action
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 glass-panel p-8 bg-slate-900/5 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="label-caps text-blue-600 opacity-80">Live matching search</div>
              <div className="space-y-4 py-10">
                {[
                  { name: "Senior Designer", company: "Airbnb", score: 98 },
                  { name: "UX Lead", company: "Stripe", score: 94 },
                  { name: "Product Designer", company: "Linear", score: 91 }
                ].map((job, i) => (
                  <div key={i} className="glass-card bg-white/60 border-white/80 p-4 flex justify-between items-center">
                    <div>
                      <div className="text-slate-900 font-bold text-sm">{job.name}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{job.company}</div>
                    </div>
                    <div className="text-blue-600 font-black text-sm">{job.score}%</div>
                  </div>
                ))}
              </div>
              <div className="scan-line !animation-duration-[3s]" />
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Finding matches...</div>
            </div>
          </div>
        </div>

        {/* Process Bento Grid */}
        <section id="process" className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Smart Upload", desc: "We analyze your experience and skills from your resume instantly.", icon: FileText, color: "bg-blue-600", span: "col-span-1" },
            { title: "Real-time Search", desc: "Access the latest jobs across all major boards with custom filters.", icon: Search, color: "bg-emerald-600", span: "col-span-1" },
            { title: "Resume Optimization", desc: "Instantly update your resume to match each job description perfectly.", icon: Zap, color: "bg-orange-500", span: "col-span-1" }
          ].map((step, i) => (
            <div key={i} className={`glass-panel p-10 space-y-6 hover:translate-y-[-4px] transition-transform duration-500`}>
              <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200`}>
                <step.icon className="text-white" size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Features Bento */}
        <section id="features" className="glass-panel p-12 md:p-20 text-center space-y-8 bg-white/60 text-slate-900 overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-[80%] bg-blue-100/30 blur-[120px]" />
          <div className="label-caps !text-blue-600 relative z-10">Secure & Reliable</div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto relative z-10">Built for the professional search.</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium relative z-10">
            Your data is handled with the highest level of privacy and professional integrity. Encrypted, private, and precise.
          </p>
          <div className="flex flex-wrap justify-center gap-10 pt-6 relative z-10">
            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Shield size={20} className="text-blue-600" /> Secure Data
            </div>
            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Zap size={20} className="text-blue-600" /> Instant Analysis
            </div>
          </div>
        </section>

        <footer className="glass-panel py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          &copy; 2026 HUNTR Systems
        </footer>
      </div>
    </div>
  );
}
