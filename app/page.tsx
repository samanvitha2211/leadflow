import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="glass-panel rounded-2xl p-10 text-center max-w-md w-full">
        <div className="gradient-text text-5xl font-bold mb-3">LeadFlow</div>
        <p className="text-slate-400 mb-8 text-lg">
          AI-powered lead management platform
        </p>
        <Link
          href="/login"
          className="btn-primary inline-block rounded-xl px-8 py-3 text-white font-semibold text-base"
        >
          Get Started →
        </Link>
      </div>
      <p className="text-slate-600 text-sm">Phase 1 — Foundation complete ✓</p>
    </main>
  );
}
