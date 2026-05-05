"use client";

import { motion } from "framer-motion";

import { Star, Trash2, Sparkles, Loader2, ExternalLink, ArrowRight } from "lucide-react";
import { DraggableStateSnapshot } from "@hello-pangea/dnd";


interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore: number;
  status: string;
  isSaved?: boolean;
  applyLink?: string;
}

interface JobCardProps {
  job: Job;
  index: number;
  snapshot: DraggableStateSnapshot;
  optimizingId: string | null;
  handleToggleSave: (id: string) => void;
  handleStatusChange: (id: string, status: string) => void;
  handleOptimize: (id: string) => void;
}


export function JobCard({ 
  job, 
  index, 
  snapshot, 
  optimizingId, 
  handleToggleSave, 
  handleStatusChange, 
  handleOptimize 
}: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className={`glass-card p-10 group border-white shadow-xl ${snapshot.isDragging ? 'shadow-blue-500/30 scale-[1.02] ring-2 ring-blue-500/20' : 'hover:shadow-blue-500/10 hover:translate-y-[-2px]'} transition-all duration-300 cursor-grab active:cursor-grabbing`}>
        <div className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-8">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <h4 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">{job.title}</h4>
              <div className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-xl uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 shrink-0">
                {job.matchScore}% DNA Match
              </div>
            </div>
            <p className="label-mono !text-blue-600 opacity-90">{job.company} <span className="mx-3 text-slate-300 opacity-40">/</span> {job.location}</p>
          </div>
          <div className="flex gap-3 self-end md:self-center">
            <button 
              onClick={() => handleToggleSave(job.id)}
              className={`p-3 glass-card rounded-2xl transition-all duration-300 ${job.isSaved ? 'text-yellow-500 bg-yellow-50/50 border-yellow-200' : 'text-slate-300 hover:text-yellow-500 bg-white/80'}`}
            >
              <Star size={20} fill={job.isSaved ? "currentColor" : "none"} />
            </button>
            <button onClick={() => handleStatusChange(job.id, 'REJECTED')} className="p-3 glass-card rounded-2xl text-slate-300 hover:text-red-500 transition-colors bg-white/80"><Trash2 size={20} /></button>
          </div>
        </div>

        <p className="text-slate-500 leading-relaxed text-[16px] font-medium mb-10 line-clamp-3 opacity-90">{job.description}</p>

        <div className="flex flex-col sm:flex-row gap-6 items-stretch sm:items-center justify-between pt-10 border-t border-slate-200/40">
          <div className="flex gap-4">
            <button onClick={() => handleOptimize(job.id)} disabled={optimizingId === job.id} className="btn-primary py-4 px-10 flex items-center justify-center gap-3">
              {optimizingId === job.id ? <><Loader2 className="animate-spin" size={18} /> Optimizing...</> : <><Sparkles size={18} className="text-white/80" /> Optimize Resume</>}
            </button>
            <a href={job.applyLink !== '#' ? job.applyLink : undefined} target="_blank" rel="noreferrer" className="btn-glass py-4 px-10 flex items-center justify-center gap-3">
              <ExternalLink size={18} /> View Source
            </a>
          </div>
          <button onClick={() => handleStatusChange(job.id, 'APPLIED')} className="label-mono !text-slate-400 hover:!text-blue-600 transition-all flex items-center gap-3 group/btn cursor-grab active:cursor-grabbing">
            Mark as Applied <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
