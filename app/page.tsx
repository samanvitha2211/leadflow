import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[45rem] h-[45rem] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px]" style={{ animation: "pulseGlow 6s ease-in-out infinite alternate-reverse" }} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10 text-center mt-10">
        
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Powered by advanced Artificial Intelligence</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl">
          Intelligent Inquiries. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Instant Clarity.
          </span>
        </h1>

        {/* Context / Explanation */}
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Welcome to LeadFlow. We use cutting-edge AI to instantly categorize, prioritize, and research your inquiries. Send us a message, and our automated systems will ensure it reaches the right person instantly.
        </p>

        {/* Call to Action */}
        <Link 
          href="/login"
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-lg rounded-2xl transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] hover:-translate-y-1"
        >
          <span>Contact Us Now</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24 max-w-4xl w-full text-left">
          <div className="glass-panel p-8 rounded-3xl border border-white/5">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
            <p className="text-slate-400">Your messages are instantly processed and categorized by our AI engine, ensuring zero delays in routing.</p>
          </div>
          <div className="glass-panel p-8 rounded-3xl border border-white/5">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Fully Transparent</h3>
            <p className="text-slate-400">Receive a unique tracking link the moment you submit your inquiry to view live updates and replies.</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center mt-auto">
        <Link href="/login" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
          Manager Portal Login
        </Link>
      </footer>
    </div>
  );
}
