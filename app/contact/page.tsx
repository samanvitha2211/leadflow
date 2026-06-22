import { Metadata } from "next";
import { ContactForm } from "./components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with LeadFlow",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[100px]" style={{ animation: "pulseGlow 5s ease-in-out infinite alternate-reverse" }} />
      </div>

      <div className="w-full max-w-2xl mx-auto flex flex-col justify-center px-6 py-20 relative z-10">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl gradient-ai mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Have a question or want to work with us? Send us a message and our team will get back to you shortly.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-3xl relative">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
