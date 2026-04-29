"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Zap, Shield, Search, FileText, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#fbfbfd] selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden">
      {/* Texture Layer: Dot Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* Mesh Backgrounds */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400/5 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-400/5 blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 py-8 relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel px-8 py-4 flex justify-between items-center sticky top-8 z-50 shadow-2xl shadow-slate-200/20"
        >
          <Link href="/" className="flex items-center group">
            <span className="text-xl font-black tracking-[0.15em] text-slate-900 group-hover:text-blue-600 transition-all duration-300">
              HUNTR<span className="text-blue-600">.</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
            <Link href="#process" className="hover:text-blue-600 transition-colors">How it works</Link>
            <Link href="#features" className="hover:text-blue-600 transition-colors">Security</Link>
            <Link href="/login" className="btn-primary py-2.5 px-6 text-[10px] rounded-lg">Sign In</Link>
          </nav>
        </motion.header>

        {/* Hero Section */}
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="grid lg:grid-cols-12 gap-6 min-h-[70vh]"
        >
          <div className="lg:col-span-7 glass-panel p-10 md:p-20 flex flex-col justify-center space-y-10 relative overflow-hidden">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 text-blue-600 text-[10px] font-black tracking-[0.2em] uppercase w-fit"
            >
              <Sparkles size={14} className="animate-pulse" /> Precision Job Search
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter"
            >
              Perfect job <br />
              <span className="text-blue-600">matches</span>, faster.
            </motion.h1>

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium"
            >
              The professional-grade platform that scans thousands of job boards and surgically optimizes your resume for every application.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-5 pt-4"
            >
              <Link href="/login" className="btn-primary flex items-center justify-center gap-3 px-12 py-5 rounded-[20px] text-base group shadow-2xl shadow-blue-500/20">
                Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#process" className="btn-glass flex items-center justify-center gap-3 px-10 py-5 rounded-[20px] text-base border-slate-200">
                <Play size={20} className="fill-slate-700" /> Watch Demo
              </Link>
            </motion.div>

            {/* Background Accent */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 glass-panel p-1 border-white/80 shadow-2xl shadow-slate-200/50 overflow-hidden"
          >
            <div className="bg-slate-50/50 rounded-[22px] h-full p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div className="label-caps !text-blue-600 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  Live Market Search
                </div>
                <Globe size={18} className="text-slate-300" />
              </div>

              <div className="space-y-4 relative z-10">
                {[
                  { name: "Senior Designer", company: "Airbnb", score: 98, delay: 0.6 },
                  { name: "UX Lead", company: "Stripe", score: 94, delay: 0.8 },
                  { name: "Product Manager", company: "Linear", score: 91, delay: 1.0 }
                ].map((job, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: job.delay, type: "spring", stiffness: 100 }}
                    className="glass-card bg-white p-5 flex justify-between items-center shadow-sm border-white"
                  >
                    <div>
                      <div className="text-slate-900 font-bold text-sm">{job.name}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{job.company}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-blue-600 font-black text-sm">{job.score}%</div>
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${job.score}%` }}
                          transition={{ delay: job.delay + 0.5, duration: 1 }}
                          className="h-full bg-blue-600"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-8 space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connecting to LinkedIn API...
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Synchronizing Indeed Nodes...
                </div>
              </div>

              <div className="scan-line !animation-duration-[4s]" />
            </div>
          </motion.div>
        </motion.div>


        {/* Process Section */}
        <section id="process" className="py-24 space-y-16">
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="label-caps !text-blue-600"
            >
              The Workflow
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Three steps to a better role.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Smart Upload", desc: "Upload your resume once. Our system analyzes your skills, experience, and career trajectory instantly.", icon: FileText, color: "bg-blue-600" },
              { title: "Real-time Search", desc: "Access the latest job postings across all major boards with surgical filters and live matching.", icon: Search, color: "bg-indigo-600" },
              { title: "Resume Optimization", desc: "Instantly generate a tailored resume for every job you apply to, perfectly matched to the description.", icon: Zap, color: "bg-blue-500" }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-panel p-12 space-y-8 relative group hover:border-blue-200 transition-colors"
              >
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                  <step.icon className="text-white" size={32} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{step.title}</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
                <div className="text-[10px] font-black text-slate-200 absolute top-8 right-12 text-6xl">0{i + 1}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Security / CTA Section */}
        <section id="features" className="py-12">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="glass-panel p-16 md:p-24 text-center space-y-10 bg-white border-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] overflow-hidden relative"
          >
            {/* Decorative Blurs */}
            <div className="absolute top-0 right-0 w-[40%] h-[80%] bg-blue-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[80%] bg-indigo-500/10 blur-[100px] pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="label-caps !text-blue-600">Privacy First</div>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter max-w-4xl mx-auto leading-[0.9]">
                Professional search. <br />
                <span className="text-slate-400">Personal security.</span>
              </h2>
            </div>
            
            <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium relative z-10">
              Your career data is your own. We use 256-bit encryption to ensure your resume and job search remain private and secure.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6 relative z-10">
              <Link href="/login" className="btn-primary py-5 px-12 rounded-2xl text-lg shadow-2xl shadow-blue-500/20">
                Start for free
              </Link>
              <div className="flex items-center gap-8 justify-center sm:justify-start">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Shield size={18} className="text-blue-600" /> Encrypted
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <CheckCircle2 size={18} className="text-blue-600" /> Verified
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="glass-panel py-10 flex flex-col md:flex-row justify-between items-center px-12 border-white text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] gap-6">
          <div>&copy; 2026 HUNTR Systems</div>
          <div className="flex gap-10">
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
