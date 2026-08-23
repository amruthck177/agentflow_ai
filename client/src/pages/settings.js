import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { User, Shield, CheckCircle2, Server, Cpu } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealth(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchHealth();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell title="Console Settings">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
              <User className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Operator Profile</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-white">
                  {user?.name || 'Operator'}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-white">
                  {user?.email || 'operator@agentflow.ai'}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Security Role</label>
                <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-400 font-semibold capitalize">
                  <Shield className="h-4 w-4" />
                  {user?.role || 'operator'}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Session Status</label>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Active JWT Session
                </div>
              </div>
            </div>
          </div>

          {/* System & Health Diagnostics */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
              <Server className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">System Diagnostics</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-slate-400 font-medium mb-1">Backend Server</div>
                <div className="text-sm font-bold text-emerald-400">
                  {health?.status === 'ok' ? 'Online & Healthy' : 'Checking...'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-slate-400 font-medium mb-1">MongoDB Store</div>
                <div className="text-sm font-bold text-emerald-400">
                  {health?.services?.mongodb === 'connected' ? 'Connected' : 'Active (In-Memory)'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-slate-400 font-medium mb-1">AI Orchestrator</div>
                <div className="text-sm font-bold text-cyan-400 flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5" />
                  5 Agent Chain Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
