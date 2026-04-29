"use client";

import { useState } from "react";
import { User, Mail, MapPin, Briefcase, Trash2, Shield, Loader2, Save, Zap } from "lucide-react";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); alert("Identity updated."); }, 1000);
  };

  const handleClearData = () => {
    if (confirm("Permanently wipe all node data?")) {
      setIsClearing(true);
      setTimeout(() => { setIsClearing(false); window.location.href = "/onboarding"; }, 2000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Identity</h1>
        <p className="text-[13px] text-slate-500 font-medium">Manage operator credentials and mission parameters.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 space-y-6 bg-white/50 border-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-xl text-white font-bold shadow-lg shadow-slate-300">
                SU
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sandbox User</h3>
                <div className="label-caps !text-[9px]">Status: Verified Operator</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="label-caps ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" defaultValue="sandbox@huntr.ai" className="input-glass pl-11 bg-slate-50/50" disabled />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label-caps ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" defaultValue="Sandbox User" className="input-glass pl-11" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label-caps ml-1">Target Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" defaultValue="Senior UX Designer" className="input-glass pl-11" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label-caps ml-1">Current Base</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" defaultValue="Remote / San Francisco" className="input-glass pl-11" />
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={isLoading} className="btn-primary px-8 py-3 flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Identity</>}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 border-red-100 bg-red-50/10 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <Shield size={18} />
              <h4 className="text-[11px] font-black uppercase tracking-widest">Protocol Zero</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
              Permanently wipe resume DNA and board history.
            </p>
            <button onClick={handleClearData} disabled={isClearing} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all">
              {isClearing ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={16} /> Wipe Data</>}
            </button>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Node Cluster</h4>
            <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <div>
                <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Pro License</div>
                <div className="text-xs font-bold text-slate-700 tracking-tight">Active Lifetime</div>
              </div>
              <Zap className="text-blue-600 fill-blue-600 opacity-20" size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
