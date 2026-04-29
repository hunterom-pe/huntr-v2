"use client";

import { Briefcase, Download, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";

export default function ApplicationsPage() {
  const applications = [
    {
      id: "1",
      company: "Figma",
      role: "Senior Product Designer",
      date: "2 hours ago",
      status: "Optimized",
      fileName: "Resume_Figma_Optimized.docx"
    },
    {
      id: "2",
      company: "Stripe",
      role: "UX Designer",
      date: "Yesterday",
      status: "Optimized",
      fileName: "Resume_Stripe_Optimized.docx"
    }
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Applications</h1>
        <p className="text-slate-500 font-medium">History of all resumes optimized for specific roles.</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel p-20 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Briefcase size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">No applications yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Once you optimize a resume for a job match, it will appear here for you to download and track.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <div key={app.id} className="glass-panel p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                  {app.company[0]}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-slate-900">{app.role}</h4>
                  <p className="text-slate-500 font-bold flex items-center gap-2">
                    {app.company} • <span className="flex items-center gap-1 font-medium"><Calendar size={14} /> {app.date}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-slate-100/50">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-tighter mr-auto md:mr-0">
                  <CheckCircle2 size={14} /> {app.status}
                </div>
                <button className="btn-primary flex items-center gap-2 px-6 py-3 text-sm">
                  <Download size={18} /> Download .docx
                </button>
                <button className="btn-glass p-3 rounded-2xl text-slate-500 hover:text-slate-900 transition-colors">
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
