import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <nav className="mb-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-cyan-400">Agentflow_AI</div>
          <div className="space-x-4">
            <Link href="/login" className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Login</Link>
            <Link href="/register" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">Get started</Link>
          </div>
        </nav>

        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
              Agentic AI operations
            </div>
            <h1 className="text-5xl font-bold leading-tight">Turn plain-language automation into an executable workflow.</h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Build, visualize, and monitor AI-driven operations with a modern operator console powered by autonomous planning, execution, validation, and recovery agents.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/register" className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950">Start building</Link>
              <Link href="/dashboard" className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white">View dashboard</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-cyan-500/10">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
                <span>Planner</span>
                <span className="text-emerald-400">98% confidence</span>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Input</div>
                  <div className="mt-2 text-sm text-slate-200">“Send an invoice alert when a payment fails and post it in Slack.”</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">trigger</div>
                  <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-cyan-300">plan</div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">notify</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
