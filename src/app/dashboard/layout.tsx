"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, User, LogOut, Zap, Menu, Bell } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex p-4 md:p-6 gap-6 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 h-[calc(100vh-3rem)] sticky top-6 z-20">
        <div className="glass-panel h-full flex flex-col p-6 border-white/60 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center mb-12 px-2">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="HUNTR Logo" 
                width={130} 
                height={35} 
                className="h-6 w-auto object-contain mix-blend-multiply" 
              />
            </Link>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-[12px] font-black uppercase tracking-[0.2em]",
                    isActive 
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                      : "text-slate-400 hover:bg-white/60 hover:text-slate-900 border border-transparent hover:border-white/80"
                  )}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-200/50 mt-auto">
            <div className="glass-card p-4 rounded-2xl mb-6 bg-blue-50/40 border-blue-100/50">
              <div className="label-caps !text-[9px] mb-2 text-blue-500">Live Status</div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = "/login"}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl w-full text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 h-[calc(100vh-3rem)] min-w-0">
        <header className="glass-panel h-20 flex items-center justify-between px-8 border-white/60 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 glass-card rounded-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={22} />
            </button>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hidden sm:block">
              {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2.5 glass-card rounded-2xl relative text-slate-400 hover:text-slate-900 border-white/80 bg-white/40">
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200/50">
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Sandbox User</div>
                <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Premium Plan</div>
              </div>
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-2xl shadow-slate-900/20">
                SU
              </div>
            </div>
          </div>
        </header>

        <main className="glass-panel flex-1 p-8 md:p-12 overflow-y-auto border-white/60 shadow-2xl shadow-slate-200/50 scrollbar-hide">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden p-4">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-80 glass-panel h-full flex flex-col p-8 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="flex items-center">
                <Image src="/logo.png" alt="HUNTR Logo" width={130} height={35} className="h-7 w-auto object-contain brightness-0 contrast-200" />
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 text-xl font-black">✕</button>
            </div>
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 text-[12px] font-black uppercase tracking-[0.2em]", isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "text-slate-400")}>
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
