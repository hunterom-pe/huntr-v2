"use client";

import { useState } from "react";
import { Search, Zap, ExternalLink, Loader2, Sparkles, Star, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore: number;
  status: 'WISHLIST' | 'APPLIED' | 'PENDING' | 'INTERVIEWING' | 'REJECTED';
}

export default function DashboardPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  const startScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Senior Product Designer", location: "Remote" })
      });
      const data = await response.json();
      if (data.jobs) {
        setJobs(data.jobs);
        setHasScanned(true);
      }
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: Job['status']) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, status: newStatus } : job));
  };

  const handleOptimize = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    setOptimizingId(id);
    try {
      const formData = new FormData();
      formData.append("jobDescription", job.description);
      const response = await fetch("/api/resume/optimize", { method: "POST", body: formData });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `HUNTR_${job.company}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        handleStatusChange(id, 'APPLIED');
      }
    } finally {
      setOptimizingId(null);
    }
  };

  const kanbanColumns: { name: Job['status']; title: string }[] = [
    { name: 'APPLIED', title: 'Applied' },
    { name: 'PENDING', title: 'Pending' },
    { name: 'INTERVIEWING', title: 'Interviewing' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Recommendations</h1>
          <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Finding your next career move</p>
        </div>
        <button onClick={startScan} disabled={isScanning} className="btn-primary flex items-center gap-3 py-4 px-8 rounded-2xl shadow-2xl shadow-blue-500/20">
          {isScanning ? <><Loader2 className="animate-spin" size={18} /> Searching...</> : <><Search size={18} /> {hasScanned ? "Search Again" : "Find Jobs"}</>}
        </button>
      </div>

      {!hasScanned && !isScanning ? (
        <div className="glass-card p-20 text-center space-y-8 bg-white/40 border-white/60">
          <div className="w-20 h-20 bg-blue-50/50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-blue-100/50 shadow-inner">
            <Search className="text-blue-600" size={40} />
          </div>
          <div className="space-y-3 max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ready to find matches?</h2>
            <p className="text-[15px] text-slate-500 font-medium leading-relaxed">Search across major boards to find jobs that perfectly match your experience.</p>
          </div>
          <button onClick={startScan} className="btn-primary px-10 py-4 rounded-2xl">Start Job Search</button>
        </div>
      ) : isScanning ? (
        <div className="glass-card p-20 text-center space-y-10 relative overflow-hidden bg-white/60">
          <div className="scan-line !animation-duration-[3s]" />
          <div className="space-y-6 relative z-10">
            <div className="flex justify-center gap-4">
              {['Indeed', 'LinkedIn', 'Glassdoor'].map((site) => (
                <div key={site} className="px-4 py-1.5 bg-slate-900 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] shadow-xl">{site}</div>
              ))}
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Searching for opportunities...</h2>
            <div className="max-w-md mx-auto h-2 bg-slate-200/50 rounded-full overflow-hidden p-[2px]">
              <motion.div className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4 }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="label-caps !text-[11px]">Recommended for you [{jobs.filter(j => j.status === 'WISHLIST').length}]</span>
            </div>

            <div className="space-y-6">
              <AnimatePresence>
                {jobs.filter(j => j.status === 'WISHLIST').map((job) => (
                  <motion.div key={job.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 group border-white/80 shadow-lg hover:shadow-blue-500/5">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-6">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-blue-400 text-lg shadow-2xl">
                        {job.company[0]}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">{job.title}</h4>
                          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20">{job.matchScore}% Match</span>
                        </div>
                        <p className="text-[14px] text-slate-500 font-bold uppercase tracking-widest opacity-70">{job.company} <span className="mx-2 text-slate-300">/</span> {job.location}</p>
                      </div>
                      <div className="flex gap-3 self-end md:self-center">
                        <button className="p-3 glass-card rounded-2xl text-slate-300 hover:text-yellow-500 transition-colors bg-white/80"><Star size={20} /></button>
                        <button onClick={() => handleStatusChange(job.id, 'REJECTED')} className="p-3 glass-card rounded-2xl text-slate-300 hover:text-red-500 transition-colors bg-white/80"><Trash2 size={20} /></button>
                      </div>
                    </div>

                    <p className="text-slate-500 leading-relaxed text-[15px] font-medium mb-8 line-clamp-3">{job.description}</p>

                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-8 border-t border-slate-100/50">
                      <div className="flex gap-3">
                        <button onClick={() => handleOptimize(job.id)} disabled={optimizingId === job.id} className="btn-primary py-3.5 px-8 flex items-center justify-center gap-3 rounded-2xl text-[12px] uppercase tracking-[0.2em]">
                          {optimizingId === job.id ? <><Loader2 className="animate-spin" size={18} /> Updating Resume...</> : <><Sparkles size={18} /> Optimize Resume</>}
                        </button>
                        <button className="btn-glass py-3.5 px-8 flex items-center justify-center gap-3 rounded-2xl text-[12px] uppercase tracking-[0.2em] border-slate-200">
                          <ExternalLink size={18} /> View Job Post
                        </button>
                      </div>
                      <button onClick={() => handleStatusChange(job.id, 'APPLIED')} className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.3em] transition-all flex items-center gap-2 group/btn">
                        I've already applied <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <span className="label-caps !text-[11px] px-2">Application Tracker</span>
            <div className="space-y-8">
              {kanbanColumns.map(col => {
                const columnJobs = jobs.filter(j => j.status === col.name);
                return (
                  <div key={col.name} className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{col.title}</span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{columnJobs.length}</span>
                    </div>
                    <div className="glass-card p-4 min-h-[100px] space-y-3 bg-white/20 border-dashed border-slate-200/50">
                      {columnJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-20 text-slate-300/40">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Empty</span>
                        </div>
                      ) : (
                        columnJobs.map(job => (
                          <div key={job.id} className="glass-card p-4 rounded-2xl bg-white border-white shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-transform">
                            <div className="text-[13px] font-extrabold text-slate-900 mb-1">{job.title}</div>
                            <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{job.company}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
