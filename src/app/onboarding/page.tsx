"use client";

import { useState } from "react";
import { Upload, Search, MapPin, CheckCircle2, Loader2, Zap, ArrowRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, location }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save profile");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".docx")) {
      startAnalysis();
    } else {
      alert("Please upload a .docx file only.");
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    const statuses = ["Extracting context...", "Mapping skills DNA...", "Calibrating targets...", "Ready!"];
    let i = 0;
    const interval = setInterval(() => {
      setAnalysisStatus(statuses[i]);
      i++;
      if (i === statuses.length) {
        clearInterval(interval);
        setTimeout(() => { setIsAnalyzing(false); setStep(2); }, 800);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans relative overflow-hidden">
      {/* Immersive Light Background Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />
      
      {/* Logo */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="logo-text text-2xl">
          HUNTR
        </Link>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-600 text-[10px] font-black tracking-[0.2em] uppercase mb-2">
                  System Initialization
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Upload Master Resume
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
                  Provide your base `.docx` file. We will extract your DNA and build a surgical application profile.
                </p>
              </div>

              {!isAnalyzing ? (
                <div className="relative group cursor-pointer">
                  {/* Hover Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-[2rem] blur opacity-10 group-hover:opacity-30 transition duration-500" />
                  
                  <div className="relative bg-white p-16 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300">
                    <input type="file" accept=".docx" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-slate-200/50 group-hover:scale-110 group-hover:border-blue-400/30 transition-all duration-500">
                        <Upload className="text-blue-600" size={32} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-slate-800">Drag & drop or browse</p>
                        <p className="text-sm font-medium text-slate-400">Microsoft Word (.docx) only</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative bg-white p-16 rounded-[2rem] border border-blue-100 text-center space-y-8 overflow-hidden shadow-2xl shadow-blue-500/10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent scan-line !animation-duration-[2s]" />
                  <div className="relative z-10 space-y-8">
                    <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                      <Zap className="text-blue-500 animate-pulse" size={32} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{analysisStatus}</p>
                      <p className="text-sm font-bold text-blue-500 uppercase tracking-widest opacity-80">Do not close window</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Identity Mapped
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
                  Your base profile is locked. Now, define the parameters for your next mission.
                </p>
              </div>

              <div className="bg-white p-10 space-y-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Role</label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="e.g. Senior UX Designer" 
                      className="w-full pl-14 pr-6 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Remote, SF, or NY" 
                      className="w-full pl-14 pr-6 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 placeholder-slate-400"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleCompleteOnboarding} 
                  disabled={isSubmitting || !targetRole || !location}
                  className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 rounded-xl disabled:opacity-50 mt-4 shadow-[0_0_40px_rgba(37,99,235,0.2)] hover:shadow-[0_0_60px_rgba(37,99,235,0.3)] transition-all duration-300"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Initialize Dashboard <ArrowRight size={20} /></>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
