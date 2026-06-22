import { Metadata } from "next";
import { LoginForm } from "./components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to LeadFlow AI Platform",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Left side: Login Form */}
      <div className="flex w-full flex-col justify-center px-8 md:w-1/2 lg:px-24 xl:px-32 relative z-10">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold gradient-text tracking-tight mb-2">
              LeadFlow
            </h1>
            <p className="text-slate-400 text-base">
              Welcome back. Please sign in to your account.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -z-10 pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px] -z-10 pointer-events-none"></div>
            
            <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right side: Abstract Mesh Graphic */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#0B0F19] items-center justify-center overflow-hidden border-l border-white/5">
        {/* Animated decorative background elements */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-[20%] left-[20%] w-[40rem] h-[40rem] bg-primary/10 rounded-full mix-blend-screen filter blur-[80px] animate-pulse-glow" />
          <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[80px]" style={{ animation: "pulseGlow 4s ease-in-out infinite alternate-reverse" }} />
          <div className="absolute top-[40%] right-[30%] w-[30rem] h-[30rem] bg-amber-500/10 rounded-full mix-blend-screen filter blur-[80px]" style={{ animation: "pulseGlow 6s ease-in-out infinite alternate" }} />
        </div>
        
        {/* Foreground glass element */}
        <div className="relative z-10 glass-panel p-12 rounded-3xl border border-white/10 max-w-md backdrop-blur-3xl bg-black/20">
          <div className="w-16 h-16 rounded-2xl gradient-ai mb-6 flex items-center justify-center shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">AI-Powered Lead Management</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            LeadFlow automates classification, priority assignment, and reply drafting using advanced AI models, letting your team focus on closing.
          </p>
        </div>
      </div>
    </div>
  );
}
