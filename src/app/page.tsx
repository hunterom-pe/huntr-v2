"use client";

import Link from "next/link";
import { ArrowRight, Search, Zap, FileText, CheckCircle2, Shield, Target } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen font-sans pt-32 overflow-x-hidden">
      {/* Redundant background removed as it is now in layout.tsx */}


      {/* Locked Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 h-24 flex justify-between items-center">
          <Link href="/" className="logo-text !text-3xl tracking-[0.3em]">
            HUNTR
          </Link>
          <nav className="flex items-center gap-10">
            <Link href="#how-it-works" className="hidden lg:block label-mono !text-slate-900 opacity-60 hover:opacity-100 transition-opacity">
              How it Works
            </Link>
            <Link href="/pricing" className="hidden lg:block label-mono !text-slate-900 opacity-60 hover:opacity-100 transition-opacity">
              Pricing
            </Link>
            <Link href="/login" className="px-10 py-3.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <motion.section 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center pt-12 pb-16 space-y-10"
        >
          <div className="space-y-6">
            <motion.h1 variants={fadeInUp} className="hero-text-large">
              Your Job Search, <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">Automated</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="hero-sub text-slate-500 font-medium text-xl max-w-3xl mx-auto leading-relaxed">
              Stop wasting hours searching and applying. Let our intelligent system find your 
              perfect matches and tailor your resume for every single opportunity.
            </motion.p>
          </div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            <Link href="/login" className="btn-pill-blue justify-center text-base">
              Get Started for Free <ArrowRight size={20} />
            </Link>
            <Link href="#how-it-works" className="btn-pill-gray justify-center text-base">
              See How It Works
            </Link>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="pt-4 flex justify-center items-center gap-8 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-2 hidden sm:flex"><Shield size={16} className="text-blue-500" /> Private & Secure</span>
          </motion.div>
        </motion.section>

        {/* Integration Logo Cloud */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="pt-8 pb-32 border-b border-slate-200/40 mb-32 relative z-20"
        >
          <p className="text-center label-mono mb-12 !tracking-[0.4em] opacity-40">Seamlessly connects with</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            {["LinkedIn", "indeed", "Glassdoor", "ZipRecruiter"].map((logo) => (
              <motion.span 
                key={logo}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
                className="text-2xl font-black tracking-tighter text-slate-900"
              >
                {logo}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* How It Works Section */}
        <section id="how-it-works" className="pb-32 space-y-16 scroll-mt-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center space-y-6 max-w-3xl mx-auto mb-10"
          >
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#F1F4F9] text-slate-500 text-[11px] font-black tracking-[0.2em] uppercase">
              The Process
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">How it works</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              A seamless three-step process to land your dream role without the manual heavy lifting.
            </p>
          </motion.div>

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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="feature-card group relative overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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

        {/* Additional Information Section (CTA) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="pb-32"
        >
          <div className="bg-white border border-slate-200/60 rounded-[40px] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-blue-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[100%] bg-cyan-500/10 blur-[120px] pointer-events-none" />
            
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight relative z-10">
              Ready to automate your search?
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium relative z-10 leading-relaxed">
              Join the professionals who are landing interviews faster by letting the system do the hard work.
            </p>
            <div className="pt-6 relative z-10">
              <Link href="/login" className="inline-flex items-center gap-3 px-12 py-5 bg-blue-600 text-white font-black rounded-full text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/30">
                Create Free Account <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Structured Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="logo-text !text-xl">HUNTR</span>
            <p className="text-sm font-medium text-slate-400">The automated job search platform.</p>
          </div>
          
          <nav className="flex items-center gap-8 text-sm font-bold text-slate-500">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="mailto:support@huntr.com" className="hover:text-blue-600 transition-colors">Contact Support</Link>
          </nav>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            &copy; 2026 HUNTR SYSTEMS &bull; ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
