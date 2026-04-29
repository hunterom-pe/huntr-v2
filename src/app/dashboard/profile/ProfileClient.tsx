"use client";

import { useState } from "react";
import { User, Mail, MapPin, Briefcase, FileText, UploadCloud, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
  const [location, setLocation] = useState(user?.location || "");

  const displayName = user?.name || user?.email?.split('@')[0] || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleRescan = async () => {
    if (!jobTitle || !location) return;
    setIsScanning(true);
    
    try {
      const response = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, location }),
      });
      
      if (response.ok) {
        window.location.href = "/dashboard?scan=true";
      }
    } catch (error) {
      console.error(error);
      setIsScanning(false);
    }
  };

  const handleResumeUpload = () => {
    // Simulating resume upload
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Resume successfully updated!");
    }, 1500);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
        <p className="text-[15px] text-slate-500 font-medium mt-2">Manage your account details, resume, and job search preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Account Details Section */}
        <div className="glass-card p-8 bg-white/60 border-white/80 shadow-lg">
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">Account Details</h2>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-slate-900 rounded-[24px] flex items-center justify-center text-2xl text-white font-black shadow-2xl shadow-slate-900/20">
              {initials}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{displayName}</h3>
              <div className="text-[13px] font-bold text-blue-600 mt-1">Premium Member</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" defaultValue={user?.email || ""} className="input-glass pl-12 bg-slate-50/50 text-slate-500" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" defaultValue={user?.name || ""} className="input-glass pl-12 bg-slate-50/50 text-slate-500" disabled />
              </div>
            </div>
          </div>
        </div>

        {/* Job Preferences Section */}
        <div className="glass-card p-8 bg-white/60 border-white/80 shadow-lg">
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">Job Preferences</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="input-glass pl-12" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Location / Remote</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-glass pl-12" 
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleRescan} 
            disabled={isScanning || !jobTitle || !location} 
            className="btn-primary w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-blue-500/20"
          >
            {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            {isScanning ? "Updating & Scanning..." : "Update & Rescan Jobs"}
          </button>
        </div>

        {/* Resume Section */}
        <div className="glass-card p-8 bg-white/60 border-white/80 shadow-lg">
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">Your Resume</h2>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center border-2 border-dashed border-slate-200/60 rounded-[24px] p-6 bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg text-blue-600">
              <FileText size={28} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-lg font-bold text-slate-900 tracking-tight">Active Resume</h4>
              <p className="text-[14px] text-slate-500 font-medium">Currently using your latest uploaded .docx file for job matching.</p>
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                accept=".docx"
                onChange={handleResumeUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <button disabled={isUploading} className="btn-glass px-6 py-3 flex items-center gap-2 rounded-xl text-[12px] uppercase tracking-widest">
                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                {isUploading ? "Uploading..." : "Replace File"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
