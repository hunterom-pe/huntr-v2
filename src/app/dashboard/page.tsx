/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { Search, Zap, ExternalLink, Loader2, Sparkles, Star, Trash2, ArrowRight, Mail, Copy, Check, X, FolderOpen, ShieldCheck, Info, BrainCircuit, DollarSign, ScrollText, Briefcase, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useNotifications } from "@/lib/NotificationContext";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  matchScore: number;
  status: 'WISHLIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  isSaved?: boolean;
  applyLink?: string;
}

export default function DashboardPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [followUpJob, setFollowUpJob] = useState<Job | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [briefingJob, setBriefingJob] = useState<Job | null>(null);
  const [interviewBrief, setInterviewBrief] = useState<any>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [playbookJob, setPlaybookJob] = useState<Job | null>(null);
  const [playbookData, setPlaybookData] = useState<any>(null);
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const { addNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    setIsBrowser(true);
    if (typeof window !== 'undefined' && window.location.search.includes('scan=true') && !hasScanned && !isScanning) {
      startScan();
      // Remove query param from URL without reloading
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  // Fetch tracked jobs from DB on load
  useEffect(() => {
    if (!isBrowser) return;
    const fetchTrackedJobs = async () => {
      try {
        const response = await fetch("/api/jobs/tracked");
        const data = await response.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
          // If we have wishlist jobs, it means a search has been performed before
          if (data.jobs.some((j: any) => j.status === 'WISHLIST')) {
            setHasScanned(true);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrackedJobs();
  }, [isBrowser]);

  const jobsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(0);

  const startScan = async (page = 0) => {
    setIsScanning(true);
    setCurrentPage(page);
    try {
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page })
      });
      const data = await response.json();
      if (data.jobs) {
        // Merge with existing jobs, but avoid duplicates
        setJobs(prev => {
          const existingIds = new Set(prev.map(j => j.id));
          const newJobs = data.jobs.filter((j: any) => !existingIds.has(j.id));
          return [...prev, ...newJobs];
        });
        setHasScanned(true);
      }
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

    const handleStatusChange = async (id: string, newStatus: Job['status']) => {
      // Optimistic UI Update
      setJobs(prev => prev.map(job => job.id === id ? { ...job, status: newStatus } : job));

      // Sync to Database
      const jobToUpdate = jobs.find(j => j.id === id);
      if (jobToUpdate) {
        try {
          await fetch("/api/jobs/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus })
          });
        } catch (error) {
          console.error("Failed to sync job status to DB:", error);
        }
      }
    };

    const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to remove this application from your tracker?")) return;
      
      // Optimistic UI Update
      setJobs(prev => prev.filter(job => job.id !== id));

      try {
        await fetch("/api/jobs/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isDeleted: true })
        });
        addNotification({
          title: "Application Removed",
          message: "The job has been removed from your tracker.",
          type: "intel"
        });
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    };

    const handleToggleSave = async (id: string) => {
      const job = jobs.find(j => j.id === id);
      if (!job) return;
      
      const newSavedState = !job.isSaved;

      // Optimistic UI Update
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isSaved: newSavedState } : j));

      try {
        await fetch("/api/jobs/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isSaved: newSavedState })
        });
        
        if (newSavedState) {
          addNotification({
            title: "Job Pinned",
            message: "This job will now stay at the top of your radar.",
            type: "intel"
          });
        }
      } catch (error) {
        console.error("Failed to toggle save:", error);
      }
    };

  const handleOptimize = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    setOptimizingId(id);
    try {
      const formData = new FormData();
      formData.append("jobDescription", job.description);
      const response = await fetch("/api/resume/optimize", { method: "POST", body: formData });
      console.log("Optimization Response Status:", response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log("Blob received, size:", blob.size);
        if (blob.size === 0) throw new Error("Received an empty file from the server.");
        
        console.log("Download starting for optimized resume...");
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = 'none';
        a.href = url;
        a.download = `HUNTR_${job.company}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        handleStatusChange(id, 'APPLIED');
        
        addNotification({
          title: "Optimization Complete",
          message: "Your resume has been surgically optimized and downloaded.",
          type: "intel"
        });
      } else {
        const errorData = await response.json();
        addNotification({
          title: "Optimization Failed",
          message: errorData.error || "Could not optimize resume. Please check your AI key or resume format.",
          type: "intel"
        });
      }
    } catch (error) {
      console.error("Optimization failed:", error);
      addNotification({
        title: "Connection Error",
        message: "Failed to connect to the optimization engine.",
        type: "intel"
      });
    } finally {
      setOptimizingId(null);
    }
  };

  const handleFollowUp = async (job: Job) => {
    setFollowUpJob(job);
    setIsGeneratingEmail(true);
    setGeneratedEmail("");
    try {
      const response = await fetch("/api/jobs/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title, company: job.company })
      });
      const data = await response.json();
      if (data.email) {
        setGeneratedEmail(data.email);
      }
    } catch (error) {
      console.error("Follow-up failed:", error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleGenerateBrief = async (job: Job) => {
    setBriefingJob(job);
    setIsGeneratingBrief(true);
    setInterviewBrief(null);
    try {
      const response = await fetch("/api/jobs/interview-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title, company: job.company, description: job.description })
      });
      const data = await response.json();
      if (data.brief) {
        setInterviewBrief(data.brief);
      }
    } catch (error) {
      console.error("Briefing failed:", error);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleGeneratePlaybook = async (job: Job) => {
    setPlaybookJob(job);
    setIsGeneratingPlaybook(true);
    setPlaybookData(null);
    try {
      const response = await fetch("/api/jobs/negotiation-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title, company: job.company, matchScore: job.matchScore })
      });
      const data = await response.json();
      if (data.playbook) {
        setPlaybookData(data.playbook);
      }
    } catch (error) {
      console.error("Playbook failed:", error);
    } finally {
      setIsGeneratingPlaybook(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    // 1. Handle reordering within the same column
    if (source.droppableId === destination.droppableId) {
      if (source.index === destination.index) return;
      
      const columnJobs = jobs.filter(j => j.status === source.droppableId);
      const otherJobs = jobs.filter(j => j.status !== source.droppableId);
      
      const newColumnJobs = Array.from(columnJobs);
      const [removed] = newColumnJobs.splice(source.index, 1);
      newColumnJobs.splice(destination.index, 0, removed);
      
      setJobs([...otherJobs, ...newColumnJobs]);
      return;
    }

    // 2. Handle moving between columns
    handleStatusChange(draggableId, destination.droppableId as Job['status']);

    // Trigger Interview Intel
    if (destination.droppableId === 'INTERVIEWING') {
      const job = jobs.find(j => j.id === draggableId);
      if (job) {
        addNotification({
          title: "Interview Intel",
          message: `You're interviewing with ${job.company}! We've automatically generated a custom 1-page interview cheat sheet based on their exact job description. Click here to view.`,
          type: "intel"
        });
      }
    }
  };

  const kanbanColumns: { name: Job['status']; title: string; color: string; icon: any }[] = [
    { name: 'APPLIED', title: 'Applied', color: 'blue', icon: Zap },
    { name: 'INTERVIEWING', title: 'Interviewing', color: 'amber', icon: Sparkles },
    { name: 'OFFER', title: 'Offer', color: 'emerald', icon: Star },
    { name: 'REJECTED', title: 'Reject', color: 'slate', icon: Trash2 },
  ];

  if (!isBrowser) return null;

  const wishlistJobs = jobs.filter(j => j.status === 'WISHLIST')
    .sort((a, b) => {
      // Starred jobs always come first
      if (a.isSaved && !b.isSaved) return -1;
      if (!a.isSaved && b.isSaved) return 1;
      // Then sort by match score
      return b.matchScore - a.matchScore;
    });
  const paginatedWishlist = wishlistJobs.slice(currentPage * jobsPerPage, (currentPage + 1) * jobsPerPage);
  const totalPages = Math.ceil(wishlistJobs.length / jobsPerPage);

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-10 w-64 bg-slate-200 rounded-xl" />
          <div className="h-12 w-40 bg-slate-200 rounded-2xl" />
        </div>
        <div className="grid xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8 space-y-8">
            <div className="h-6 w-32 bg-slate-100 rounded-lg mb-4" />
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-10 h-64 bg-white/50 border-white/40" />
            ))}
          </div>
          <div className="xl:col-span-4 space-y-6">
            <div className="h-6 w-40 bg-slate-100 rounded-lg" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 glass-card bg-white/30 border-white/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-4">
        <div className="space-y-2">
          <h1 className="heading-editorial">Job Recommendations</h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => startScan(0)} 
          disabled={isScanning} 
          className="btn-primary flex items-center gap-3"
        >
          {isScanning ? <><Loader2 className="animate-spin" size={18} /> Scanning...</> : <><Search size={18} /> {hasScanned ? "Search" : "Find Jobs"}</>}
        </motion.button>
      </div>

      {!hasScanned && !isScanning ? (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-20 text-center space-y-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <div className="w-24 h-24 bg-white/60 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-white/80 shadow-2xl pulse-glow">
            <Search className="text-blue-600" size={40} />
          </div>
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Ready to launch?</h2>
            <p className="text-[17px] text-slate-500 font-medium leading-relaxed">Our AI engine is ready to scan the web and find jobs that match your DNA perfectly.</p>
          </div>
          <button onClick={() => startScan(0)} className="btn-primary px-12 py-5 rounded-2xl shadow-blue-500/30">Initiate Search</button>
        </motion.div>
      ) : isScanning ? (
        <div className="glass-panel p-24 text-center space-y-12 relative overflow-hidden border-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <div className="scan-line !h-[2px] !bg-blue-500 !shadow-[0_0_20px_#3b82f6] !animation-duration-[2.5s]" />
          <div className="space-y-8 relative z-10">
            <div className="flex justify-center gap-6">
              {['Indeed', 'LinkedIn', 'Glassdoor'].map((site) => (
                <div key={site} className="px-6 py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.4em] shadow-2xl border border-white/20">{site}</div>
              ))}
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Searching global job boards...</h2>
            <div className="max-w-lg mx-auto h-3 bg-slate-200/40 rounded-full overflow-hidden p-[2px] border border-white/20">
              <motion.div className="h-full bg-blue-600 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.6)]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4 }} />
            </div>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid xl:grid-cols-12 gap-10">
            <div className="xl:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-2">
                <span className="label-mono">Matches found: {wishlistJobs.length}</span>
              </div>

              <Droppable droppableId="WISHLIST">
                {(provided) => (
                  <div 
                    className="space-y-6 min-h-[200px]" 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                  >
                    <AnimatePresence mode="popLayout">
                      {paginatedWishlist.map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ delay: index * 0.05 }}
                              style={{...provided.draggableProps.style}}
                            >
                              <div className={`glass-card p-10 group border-white shadow-xl ${snapshot.isDragging ? 'shadow-blue-500/30 scale-[1.02] ring-2 ring-blue-500/20' : 'hover:shadow-blue-500/10 hover:translate-y-[-2px]'} transition-all duration-300`} {...provided.dragHandleProps}>
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
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    
                    {wishlistJobs.length > 0 && (
                      <div className="flex items-center justify-between pt-8 px-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Showing {currentPage * jobsPerPage + 1} - {Math.min((currentPage + 1) * jobsPerPage, wishlistJobs.length)} of {wishlistJobs.length} matches
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="btn-glass px-4 py-2 rounded-xl text-[10px] font-black uppercase disabled:opacity-30"
                          >
                            Prev
                          </button>
                          <button 
                            onClick={() => {
                              if ((currentPage + 1) * jobsPerPage >= wishlistJobs.length) {
                                startScan(currentPage + 1);
                              } else {
                                setCurrentPage(prev => prev + 1);
                              }
                            }}
                            disabled={isScanning}
                            className="btn-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                          >
                            {isScanning ? "..." : "Next"}
                          </button>
                        </div>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <span className="label-caps !text-[11px] px-2">Application Tracker</span>
              <div className="space-y-8">
                {kanbanColumns.map(col => {
                  const columnJobs = jobs.filter(j => j.status === col.name);
                  const Icon = col.icon;
                  return (
                    <div key={col.name} className="space-y-4">
                      <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-lg border border-white bg-${col.color}-500/10 text-${col.color}-600`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">{col.title}</span>
                        </div>
                        <span className={`text-[10px] font-black text-${col.color}-600 bg-${col.color}-50 px-3 py-1 rounded-lg border border-${col.color}-100 shadow-sm`}>{columnJobs.length}</span>
                      </div>
                      
                      <Droppable droppableId={col.name}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            className={`glass-card p-5 min-h-[140px] space-y-4 transition-all duration-300 relative overflow-hidden ${snapshot.isDraggingOver ? `bg-${col.color}-50/40 border-${col.color}-300/50 scale-[1.01] ring-4 ring-${col.color}-500/5` : 'bg-white/10 border-white/40'}`}
                          >
                            {columnJobs.length === 0 && !snapshot.isDraggingOver ? (
                              <div className="flex flex-col items-center justify-center py-8 space-y-3 opacity-30">
                                <div className={`w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center`}>
                                  <Icon size={20} className="text-slate-300" />
                                </div>
                                <span className="label-mono !text-[9px] !tracking-[0.5em] text-slate-400">Empty Radar</span>
                              </div>
                            ) : null}

                            {columnJobs.map((job, index) => (
                              <Draggable key={job.id} draggableId={job.id} index={index}>
                                {(provided, snapshot) => (
                                  <motion.div 
                                    ref={provided.innerRef} 
                                    {...provided.draggableProps} 
                                    {...provided.dragHandleProps}
                                    style={{...provided.draggableProps.style}}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`glass-card p-5 rounded-2xl bg-white/80 border-white shadow-xl group/card relative ${snapshot.isDragging ? `shadow-${col.color}-500/30 scale-105 ring-2 ring-${col.color}-500/20` : 'shadow-slate-200/20 hover:shadow-blue-500/5'} cursor-grab active:cursor-grabbing`}
                                  >
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                                      className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-xl opacity-0 group-hover/card:opacity-100 z-10"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                    <div className="flex justify-between items-start gap-3">
                                      <div className="flex-1">
                                        <div className="text-[14px] font-black text-slate-900 mb-1 leading-tight">{job.title}</div>
                                        <div className={`label-mono !text-${col.color}-600 !text-[9px] tracking-[0.1em] opacity-80`}>{job.company}</div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setViewJob(job); }}
                                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
                                          title="View Description"
                                        >
                                          <Eye size={14} />
                                        </button>
                                        {job.applyLink && job.applyLink !== '#' && (
                                          <a 
                                            href={job.applyLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
                                            title="View Original Post"
                                          >
                                            <ExternalLink size={14} />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {col.name === 'APPLIED' && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleFollowUp(job); }}
                                        className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                      >
                                        <Mail size={12} /> Write Follow-up
                                      </button>
                                    )}

                                    {col.name === 'INTERVIEWING' && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleGenerateBrief(job); }}
                                        className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                      >
                                        <FolderOpen size={12} /> Intel Brief
                                      </button>
                                    )}

                                    {col.name === 'OFFER' && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleGeneratePlaybook(job); }}
                                        className="mt-4 w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                      >
                                        <DollarSign size={12} /> Negotiate
                                      </button>
                                    )}
                                  </motion.div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DragDropContext>
      )}
    </div>

      {/* Follow-up Email Modal */}
      <AnimatePresence>
        {followUpJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setFollowUpJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-2xl bg-white/90 p-10 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-white overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="label-mono !text-blue-600 mb-2">Automated Follow-up</div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Email Draft</h2>
                  <p className="text-sm text-slate-500 mt-1">Draft for {followUpJob.company}</p>
                </div>
                <button onClick={() => setFollowUpJob(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="glass-card bg-slate-50/50 p-6 rounded-2xl border-slate-200/50 relative">
                {isGeneratingEmail ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="label-mono !text-slate-400">Synthesizing follow-up...</span>
                  </div>
                ) : (
                  <>
                    <pre className="text-slate-700 text-sm font-medium whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedEmail}
                    </pre>
                    <button 
                      onClick={() => copyToClipboard(generatedEmail)}
                      className="absolute top-4 right-4 p-3 bg-white border border-slate-200 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-slate-600 hover:text-blue-600"
                      title="Copy to clipboard"
                    >
                      {hasCopied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 flex justify-between items-center">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-400" /> AI Generated via Gemini 1.5
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setFollowUpJob(null)} className="btn-glass px-8">Close</button>
                  <button onClick={() => copyToClipboard(generatedEmail)} disabled={!generatedEmail} className="btn-primary px-8 flex items-center gap-2">
                    {hasCopied ? "Copied!" : "Copy Email"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interview Brief Modal */}
      <AnimatePresence>
        {briefingJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setBriefingJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-4xl bg-white/95 p-12 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-white overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
              
              <div className="flex justify-between items-start mb-10 shrink-0">
                <div>
                  <div className="label-mono !text-indigo-600 mb-2 flex items-center gap-2">
                    <ShieldCheck size={14} /> Classified Intelligence
                  </div>
                  <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Interview Intelligence Brief</h2>
                  <p className="text-slate-500 mt-2 font-medium">Mission Prep for {briefingJob.title} @ {briefingJob.company}</p>
                </div>
                <button onClick={() => setBriefingJob(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={28} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-10">
                {isGeneratingBrief ? (
                  <div className="py-32 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <Loader2 className="animate-spin text-indigo-600" size={48} />
                      <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
                    </div>
                    <span className="label-mono !text-slate-400 animate-pulse">Running job-specific simulations...</span>
                  </div>
                ) : interviewBrief ? (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-10">
                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" /> Predicted Technical Questions
                        </h3>
                        <div className="space-y-3">
                          {interviewBrief.technicalQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-[14px] font-medium text-slate-700 leading-relaxed">
                              {q}
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <BrainCircuit size={14} className="text-indigo-500" /> Behavioral Strategy
                        </h3>
                        <div className="space-y-3">
                          {interviewBrief.behavioralQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 text-[14px] font-medium text-slate-700 leading-relaxed">
                              <div className="text-[10px] font-black uppercase text-indigo-600 mb-2 opacity-50">Predicting:</div>
                              {q}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-10">
                      <section className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                          <Info size={80} />
                        </div>
                        <h3 className="label-mono !text-indigo-400 mb-4 flex items-center gap-2">
                          <ShieldCheck size={14} /> Company Dossier
                        </h3>
                        <p className="text-[15px] leading-relaxed font-medium text-indigo-50/90">
                          {interviewBrief.companyDossier}
                        </p>
                      </section>

                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Sparkles size={14} className="text-amber-500" /> Reverse Questions (Ask Them)
                        </h3>
                        <div className="space-y-3">
                          {interviewBrief.reverseQuestions.map((q: string, i: number) => (
                            <div key={i} className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 text-[14px] font-medium text-slate-700 leading-relaxed flex items-start gap-4">
                              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              {q}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 label-mono text-red-500">Failed to decrypt intelligence data.</div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200/40 flex justify-between items-center shrink-0">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400" /> Compiled via Gemini Pro 1.5
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setBriefingJob(null)} className="btn-glass px-10">Dismiss</button>
                  <button onClick={() => window.print()} className="btn-primary px-10 bg-indigo-600 hover:bg-indigo-700">Print Briefing</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Negotiation Playbook Modal */}
      <AnimatePresence>
        {playbookJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setPlaybookJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-4xl bg-white/95 p-12 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-white overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />
              
              <div className="flex justify-between items-start mb-10 shrink-0">
                <div>
                  <div className="label-mono !text-emerald-600 mb-2 flex items-center gap-2">
                    <DollarSign size={14} /> Negotiation Playbook
                  </div>
                  <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">The Winning Leverage</h2>
                  <p className="text-slate-500 mt-2 font-medium">Strategic Defense for {playbookJob.title} @ {playbookJob.company}</p>
                </div>
                <button onClick={() => setPlaybookJob(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={28} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-10">
                {isGeneratingPlaybook ? (
                  <div className="py-32 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <Loader2 className="animate-spin text-emerald-600" size={48} />
                      <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
                    </div>
                    <span className="label-mono !text-slate-400 animate-pulse">Calculating market leverage...</span>
                  </div>
                ) : playbookData ? (
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-10">
                      <section className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-emerald-600">
                          <DollarSign size={80} />
                        </div>
                        <h3 className="label-mono !text-emerald-700 mb-4 flex items-center gap-2 text-[10px]">
                          Market Benchmark
                        </h3>
                        <div className="text-4xl font-black text-emerald-900 tracking-tighter mb-2">{playbookData.salaryRange}</div>
                        <p className="text-[13px] font-medium text-emerald-700 opacity-80">Estimated US National average for this seniority.</p>
                      </section>

                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" /> Your Leverage Points
                        </h3>
                        <div className="space-y-3">
                          {playbookData.leveragePoints.map((p: string, i: number) => (
                            <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl text-[14px] font-medium text-slate-700 leading-relaxed shadow-sm">
                              {p}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-10">
                      <section className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                            <ScrollText size={14} className="text-emerald-500" /> Negotiation Script
                          </h3>
                          <button onClick={() => copyToClipboard(playbookData.negotiationScript)} className="text-[10px] font-black uppercase text-emerald-600 hover:underline">Copy Script</button>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-3xl text-slate-300 text-[13px] font-medium leading-relaxed font-sans whitespace-pre-wrap">
                          {playbookData.negotiationScript}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h3 className="label-mono !text-slate-900 flex items-center gap-2">
                          <Briefcase size={14} className="text-slate-500" /> Benefits Checklist
                        </h3>
                        <div className="space-y-3">
                          {playbookData.benefitsChecklist.map((item: string, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <Check size={16} className="text-emerald-500" />
                              <span className="text-[13px] font-medium text-slate-600">{item}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 label-mono text-red-500">Failed to generate playbook.</div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200/40 flex justify-between items-center shrink-0">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" /> Strategy by Huntr AI
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setPlaybookJob(null)} className="btn-glass px-10">Close</button>
                  <button onClick={() => copyToClipboard(playbookData?.negotiationScript)} disabled={!playbookData} className="btn-primary px-10 bg-emerald-600 hover:bg-emerald-700">Copy Strategy</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Job Details Modal */}
      <AnimatePresence>
        {viewJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setViewJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-3xl bg-white/95 p-12 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-white overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200" />
              
              <div className="flex justify-between items-start mb-10 shrink-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{viewJob.title}</h2>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-indigo-100">
                      {viewJob.matchScore}% Match
                    </div>
                  </div>
                  <p className="label-mono !text-slate-400 !text-[12px]">{viewJob.company} <span className="mx-2 opacity-30">/</span> {viewJob.location}</p>
                </div>
                <button onClick={() => setViewJob(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-8">
                <div className="space-y-4">
                  <h3 className="label-mono !text-slate-900 !text-[11px] uppercase tracking-widest">Full Description</h3>
                  <div className="text-slate-600 text-[15px] font-medium leading-relaxed font-sans whitespace-pre-wrap">
                    {viewJob.description}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200/40 flex justify-between items-center shrink-0">
                <a 
                  href={viewJob.applyLink !== '#' ? viewJob.applyLink : undefined} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  <ExternalLink size={14} /> View Original Source
                </a>
                <button onClick={() => setViewJob(null)} className="btn-primary px-10">Close Details</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
