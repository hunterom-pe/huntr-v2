import Link from "next/link";
import { ArrowRight, Search, Zap, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <span className="text-3xl font-black tracking-[-0.02em] text-slate-900 group-hover:text-blue-600 transition-all">
            H U N T R
          </span>
        </Link>
        <Link href="/login" className="px-6 py-2 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-full hover:bg-slate-200 transition-colors">
          Sign In
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Hero Section */}
        <div className="text-center space-y-10">
          <div className="space-y-6">
            <h1 className="hero-title">
              Your Job Search, <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Automated</span>
            </h1>
            <p className="hero-subtitle">
              Stop wasting hours searching and applying. Let our AI find your <br className="hidden md:block" />
              perfect matches and optimize your resume for every single one.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="btn-primary-pill justify-center">
              Get Started for Free <ArrowRight size={20} />
            </Link>
            <Link href="#process" className="btn-secondary-pill justify-center">
              How it Works
            </Link>
          </div>
        </div>

        {/* Features / Bento Grid */}
        <div id="process" className="grid md:grid-cols-3 gap-8 mt-48">
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
            <div key={i} className="card-v1 group">
              <div className="flex justify-between items-start mb-16">
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <feature.icon className={feature.color} size={28} />
                </div>
                <div className="label-caps-v1 opacity-50">Feature // 0{i + 1}</div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-100 py-20 text-center">
        <div className="label-caps-v1 mb-4">The Future of Employment</div>
        <div className="text-xs font-black text-slate-300 uppercase tracking-[0.5em]">
          &copy; 2026 HUNTR ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}
