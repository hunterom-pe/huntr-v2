import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pt-24">
      {/* Locked Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-24 flex justify-between items-center">
          <Link href="/" className="logo-text">
            HUNTR
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="hidden md:block text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
              Home
            </Link>
            <Link href="/login" className="px-8 py-3 bg-[#F1F4F9] text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#E2E8F0] transition-all">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">Last Updated: April 2026</p>
        
        <div className="space-y-8 text-lg text-slate-600 font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">2. How We Use Your Information</h2>
            <p>We do not use your personal information or resume data for any purpose other than providing the core HUNTR service to you directly. Your data is never used to train external AI models, sold to advertisers, or analyzed for any secondary purposes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">3. Sharing of Information</h2>
            <p>We absolutely will not share, sell, rent, or distribute any of your personal data, resumes, or job search activity to ANY third parties under any circumstances. Your data is strictly yours and remains entirely private.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">4. Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Statement, please contact us at privacy@huntr.com.</p>
          </section>
        </div>
      </main>

      {/* Structured Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 mt-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="logo-text !text-xl">HUNTR</span>
            <p className="text-sm font-medium text-slate-400">The automated job search platform.</p>
          </div>
          
          <nav className="flex items-center gap-8 text-sm font-bold text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/privacy" className="text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="mailto:support@huntr.com" className="hover:text-blue-600 transition-colors">Contact Support</Link>
          </nav>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-8 border-t border-slate-100 text-center">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            &copy; 2026 HUNTR SYSTEMS &bull; ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
