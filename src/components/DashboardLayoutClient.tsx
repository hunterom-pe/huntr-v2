"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, User, LogOut, Zap, Menu, Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/lib/NotificationContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function DashboardLayoutClient({ children, user }: { children: React.ReactNode, user?: { name?: string | null, email?: string | null } }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const displayName = user?.name || user?.email?.split('@')[0] || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

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
            <Link href="/" className="flex items-center group">
              <span className="text-xl font-black tracking-[0.15em] text-slate-900 group-hover:text-blue-600 transition-colors">
                HUNTR<span className="text-blue-600">.</span>
              </span>
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
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2.5 glass-card rounded-2xl relative text-slate-400 hover:text-slate-900 border-white/80 bg-white/40"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white px-1 shadow-lg shadow-red-500/30">
                    {unreadCount}
                  </div>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-4 w-80 sm:w-96 glass-panel border-white/60 shadow-2xl shadow-slate-200/50 rounded-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-slate-200/50 flex justify-between items-center bg-white/40 backdrop-blur-md">
                      <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={() => { markAllAsRead(); setIsNotifOpen(false); }} className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors flex items-center gap-1">
                          <CheckCircle2 size={12} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto p-2 space-y-2">
                      {notifications.length === 0 ? (
                         <div className="p-8 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => { markAsRead(n.id); }}
                            className={`p-4 rounded-xl transition-all cursor-pointer border border-transparent ${n.read ? 'opacity-60 hover:bg-slate-50' : 'bg-white shadow-lg shadow-slate-200/20 hover:border-blue-100'}`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                              <div>
                                <h4 className={`text-[12px] font-black mb-1 ${n.type === 'report' ? 'text-purple-600' : n.type === 'radar' ? 'text-blue-600' : n.type === 'intel' ? 'text-emerald-600' : 'text-slate-900'}`}>{n.title}</h4>
                                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200/50">
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{displayName}</div>
                <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Premium Plan</div>
              </div>
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-2xl shadow-slate-900/20">
                {initials}
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
              <Link href="/" className="flex items-center group">
                <span className="text-xl font-black tracking-[0.15em] text-slate-900 group-hover:text-blue-600 transition-colors">
                  HUNTR<span className="text-blue-600">.</span>
                </span>
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
