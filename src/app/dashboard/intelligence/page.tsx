"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Shield, Zap, ArrowRight, BrainCircuit, BarChart3, Clock, Sparkles, Loader2 } from "lucide-react";

export default function IntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const response = await fetch("/api/jobs/intelligence");
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch intelligence:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIntel();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <span className="label-mono !text-slate-400">Decrypting career signals...</span>
      </div>
    );
  }

  const statsWithIcons = data.stats.map((stat: any) => {
    if (stat.label === "Weekly Velocity") return { ...stat, icon: TrendingUp };
    if (stat.label === "Avg DNA Match") return { ...stat, icon: Target };
    return { ...stat, icon: Shield };
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="heading-editorial">Intelligence Hub</h1>
          <p className="label-mono opacity-70">Strategic recon and market analysis</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/50">
          <Clock size={16} className="animate-pulse" />
          <span className="label-mono !text-[11px]">Last Updated: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {statsWithIcons.map((stat: any, i: number) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 bg-${stat.color}-500/10 text-${stat.color}-600 rounded-xl`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
              <div className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider text-${stat.color}-600 bg-${stat.color}-50 px-2.5 py-1 rounded-lg`}>
                {stat.sub}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Market Signals / Skills */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-panel p-10 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-indigo-600" size={22} />
                <h2 className="text-xl font-extrabold text-slate-800">Market Signals</h2>
              </div>
              <span className="label-mono !text-[10px]">Trending Skills</span>
            </div>

            <div className="space-y-8">
              {data.skills.map((skill: any) => (
                <div key={skill.name} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-extrabold text-slate-700 flex items-center gap-2">
                      {skill.name}
                      {skill.trending && <Sparkles size={14} className="text-amber-500" />}
                    </span>
                    <span className="label-mono !text-slate-900">{skill.level}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${skill.trending ? 'from-indigo-600 to-violet-600' : 'from-slate-400 to-slate-500'}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic">
              AI Analysis: Market demand for skills identified in your target roles is shifting. Maintain focus on your trending proficiencies.
            </p>
          </div>
        </div>

        {/* AI Strategic Insight */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-panel p-10 bg-gradient-to-br from-indigo-600 to-violet-700 border-none relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit size={120} className="text-white" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Zap size={24} className="text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-white text-2xl font-extrabold tracking-tight">Strategic Intel</h3>
                <p className="text-indigo-50 text-[15px] font-medium leading-relaxed">
                  {data.insight}
                </p>
              </div>
              <button className="flex items-center gap-3 text-white font-black text-[11px] uppercase tracking-widest hover:translate-x-2 transition-transform">
                View Target List <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          <div className="glass-panel p-8 space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-indigo-600" size={20} />
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Next Objectives</h3>
            </div>
            <div className="space-y-4">
              {[
                "Target roles with > 90% DNA Match",
                "Follow up on 2 active applications",
                "Review interview dossier for top leads"
              ].map((objective, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-200 group-hover:border-indigo-400 transition-colors" />
                  <span className="text-[13px] font-medium text-slate-600">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
