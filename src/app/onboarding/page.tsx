"use client";

import { useState } from "react";
import { Upload, Search, MapPin, CheckCircle2, Loader2, Zap, ArrowRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
    const statuses = ["Extracting...", "Skills Mapping...", "DNA Analysis...", "Ready!"];
    let i = 0;
    const interval = setInterval(() => {
      setAnalysisStatus(statuses[i]);
      i++;
      if (i === statuses.length) {
        clearInterval(interval);
        setTimeout(() => { setIsAnalyzing(false); setStep(2); }, 800);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-slate-50/30">
      <div className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mx-auto mb-4">
                  <FileText className="text-white" size={24} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upload Master Resume</h1>
                <p className="text-sm text-slate-400 font-medium">Standard .docx format only for surgical precision.</p>
              </div>

              {!isAnalyzing ? (
                <div className="glass-panel p-12 border-dashed border-2 border-slate-200 hover:border-blue-400 transition-all cursor-pointer relative group bg-white/40">
                  <input type="file" accept=".docx" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="text-center space-y-3">
                    <Upload className="text-slate-300 group-hover:text-blue-500 mx-auto transition-colors" size={32} />
                    <p className="text-sm font-bold text-slate-600">Drag & drop or browse</p>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-12 text-center space-y-6 overflow-hidden relative bg-white">
                  <div className="scan-line !animation-duration-[2s]" />
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto opacity-10" />
                    <Zap className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={24} />
                  </div>
                  <p className="text-lg font-black text-slate-800 uppercase tracking-widest">{analysisStatus}</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 mx-auto mb-4">
                  <CheckCircle2 className="text-white" size={24} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Identity Mapped</h1>
                <p className="text-sm text-slate-400 font-medium">Now, define your target mission.</p>
              </div>

              <div className="glass-panel p-8 space-y-6 bg-white/80 border-white shadow-xl">
                <div className="space-y-1.5">
                  <label className="label-caps ml-1">Target Role</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="e.g. Senior UX Designer" 
                      className="input-glass pl-11"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="label-caps ml-1">Mission Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Remote, SF, or NY" 
                      className="input-glass pl-11"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleCompleteOnboarding} 
                  disabled={isSubmitting || !targetRole || !location}
                  className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Launch Dashboard <ArrowRight size={20} /></>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
