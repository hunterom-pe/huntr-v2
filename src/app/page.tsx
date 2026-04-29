import Link from "next/link";
import { ArrowRight, Search, Zap, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="max-w-[1400px] mx-auto px-10 py-10 flex justify-between items-center">
        <Link href="/" className="logo-text">
          HUNTR
        </Link>
        <Link href="/login" className="px-8 py-3 bg-[#F1F4F9] text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#E2E8F0] transition-all">
          Sign In
        </Link>
      </header>

      <main className="max-w-[1400px] mx-auto px-10">
        {/* Hero Section */}
        <div className="text-center pt-32 pb-48 space-y-12">
          <div className="space-y-8">
            <h1 className="hero-text-large">
              Your Job Search, <br />
              <span className="text-[#0052FF]">Automated</span>
            </h1>
            <p className="hero-sub">
              Stop wasting hours searching and applying. Let our AI find your <br className="hidden md:block" />
              perfect matches and optimize your resume for every single one.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            <Link href="/login" className="btn-pill-blue justify-center">
              Get Started for Free <ArrowRight size={20} />
            </Link>
            <Link href="#process" className="btn-pill-gray justify-center">
              How it Works
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="process" className="grid lg:grid-cols-3 gap-8 pb-32">
          {[
            { 
              title: "Deep Scan", 
              desc: "Scans thousands of jobs across all major boards in seconds.",
              icon: Search,
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            { 
              title: "Instant Match", 
              desc: "We use intelligence to find the jobs that fit your profile best.",
              icon: Zap,
              color: "text-blue-500",
              bg: "bg-blue-50"
            },
            { 
              title: "Auto-Optimize", 
              desc: "Automatically tailors your resume to every job description.",
              icon: FileText,
              color: "text-blue-700",
              bg: "bg-blue-50"
            }
          ].map((feature, i) => (
            <div key={i} className="feature-card group">
              <div className="flex justify-between items-start mb-20">
                <div className={`w-20 h-20 ${feature.bg} rounded-3xl flex items-center justify-center shadow-inner`}>
                  <feature.icon className={feature.color} size={32} />
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 mt-2">
                  Feature // 0{i + 1}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-100 py-32 text-center">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
          &copy; 2026 HUNTR SYSTEMS &bull; ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}
