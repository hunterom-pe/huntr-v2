/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { Search, Zap, ExternalLink, Loader2, Sparkles, Star, Trash2, ArrowRight } from "lucide-react";
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
  const [hasScanned, setHasScanned] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
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
      } catch (error) {
        console.error("Failed to fetch tracked jobs:", error);
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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    
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

  const kanbanColumns: { name: Job['status']; title: string }[] = [
    { name: 'APPLIED', title: 'Applied' },
    { name: 'INTERVIEWING', title: 'Interviewing' },
    { name: 'OFFER', title: 'Offer' },
    { name: 'REJECTED', title: 'Reject' },
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

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Recommendations</h1>
          <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Finding your next career move</p>
        </div>
        <button onClick={() => startScan(0)} disabled={isScanning} className="btn-primary flex items-center gap-3 py-4 px-8 rounded-2xl shadow-2xl shadow-blue-500/20">
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
          <button onClick={() => startScan(0)} className="btn-primary px-10 py-4 rounded-2xl">Start Job Search</button>
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid xl:grid-cols-12 gap-10">
            <div className="xl:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="label-caps !text-[11px]">Recommended for you [{wishlistJobs.length}]</span>
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
                              exit={{ opacity: 0, scale: 0.95 }}
                              style={{...provided.draggableProps.style}}
                            >
                              <div className={`glass-card p-8 group border-white/80 shadow-lg ${snapshot.isDragging ? 'shadow-blue-500/20 scale-[1.02]' : 'hover:shadow-blue-500/5'} transition-all`} {...provided.dragHandleProps}>
                                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-6">
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-3">
                                      <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">{job.title}</h4>
                                      <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20">{job.matchScore}% Match</span>
                                    </div>
                                    <p className="text-[14px] text-slate-500 font-bold uppercase tracking-widest opacity-70">{job.company} <span className="mx-2 text-slate-300">/</span> {job.location}</p>
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

                                <p className="text-slate-500 leading-relaxed text-[15px] font-medium mb-8 line-clamp-3">{job.description}</p>

                                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-8 border-t border-slate-100/50">
                                  <div className="flex gap-3">
                                    <button onClick={() => handleOptimize(job.id)} disabled={optimizingId === job.id} className="btn-primary py-3.5 px-8 flex items-center justify-center gap-3 rounded-2xl text-[12px] uppercase tracking-[0.2em]">
                                      {optimizingId === job.id ? <><Loader2 className="animate-spin" size={18} /> Updating...</> : <><Sparkles size={18} /> Optimize</>}
                                    </button>
                                    <a href={job.applyLink !== '#' ? job.applyLink : undefined} target="_blank" rel="noreferrer" className="btn-glass py-3.5 px-8 flex items-center justify-center gap-3 rounded-2xl text-[12px] uppercase tracking-[0.2em] border-slate-200">
                                      <ExternalLink size={18} /> View Job
                                    </a>
                                  </div>
                                  <button onClick={() => handleStatusChange(job.id, 'APPLIED')} className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.3em] transition-all flex items-center gap-2 group/btn cursor-grab active:cursor-grabbing">
                                    Applied <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
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
                  return (
                    <div key={col.name} className="space-y-3">
                      <div className="flex justify-between items-center px-4">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{col.title}</span>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{columnJobs.length}</span>
                      </div>
                      
                      <Droppable droppableId={col.name}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            className={`glass-card p-4 min-h-[120px] space-y-3 border-dashed transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50 border-blue-300' : 'bg-white/20 border-slate-200/50'}`}
                          >
                            {columnJobs.length === 0 && !snapshot.isDraggingOver ? (
                              <div className="flex flex-col items-center justify-center h-20 text-slate-300/40">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Empty</span>
                              </div>
                            ) : null}

                            {columnJobs.map((job, index) => (
                              <Draggable key={job.id} draggableId={job.id} index={index}>
                                {(provided, snapshot) => (
                                  <div 
                                    ref={provided.innerRef} 
                                    {...provided.draggableProps} 
                                    {...provided.dragHandleProps}
                                    style={{...provided.draggableProps.style}}
                                    className={`glass-card p-4 rounded-2xl bg-white border-white shadow-xl group/card relative ${snapshot.isDragging ? 'shadow-blue-500/20 scale-105' : 'shadow-slate-200/20 hover:scale-[1.02]'} transition-transform cursor-grab active:cursor-grabbing`}
                                  >
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover/card:opacity-100 transition-all z-10"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                    <div className="text-[13px] font-extrabold text-slate-900 mb-1">{job.title}</div>
                                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{job.company}</div>
                                  </div>
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
  );
}
