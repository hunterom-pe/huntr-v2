"use client";

import { useState, useEffect } from "react";
import { Download, ExternalLink, Calendar, CheckCircle2, X, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Application {
  id: string;
  company: string;
  title: string;
  createdAt: string;
  status: string;
  applyLink: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/jobs/tracked");
        const data = await response.json();
        // Filter for those that have been "Applied" or moved from wishlist
        const apps = (data.jobs || []).filter((j: any) => j.status !== 'WISHLIST');
        setApplications(apps);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this application?")) return;
    
    // Optimistic UI Update
    setApplications(prev => prev.filter(app => app.id !== id));

    try {
      await fetch("/api/jobs/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDeleted: true })
      });
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Applications</h1>
        <p className="text-slate-500 font-medium">History of all resumes optimized for specific roles.</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card p-20 text-center space-y-6 bg-white/40 border-white/60">
          <div className="w-20 h-20 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-300">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">No applications yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Once you optimize a resume for a job match, it will appear here for you to download and track.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden bg-white/60 border-white/80 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100/50">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Role & Company</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Date</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                <AnimatePresence>
                  {applications.map((app) => (
                    <motion.tr 
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group hover:bg-white/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 text-lg tracking-tight">{app.title}</div>
                          <div className="text-[12px] font-black text-blue-500 uppercase tracking-widest">{app.company}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={12} /> {app.status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                          <Calendar size={14} className="opacity-40" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          <button className="p-2.5 glass-card rounded-xl text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 bg-white/80">
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className="p-2.5 glass-card rounded-xl text-slate-400 hover:text-red-500 transition-all hover:scale-110 active:scale-95 bg-white/80"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
