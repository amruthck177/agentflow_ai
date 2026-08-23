import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import api from '../services/api';
import { Mail, MessageSquare, Bot, FileSpreadsheet, CheckCircle2, XCircle, RefreshCw, Key, ShieldCheck } from 'lucide-react';

const PROVIDERS_INFO = [
  {
    provider: 'gmail',
    name: 'Gmail (Google OAuth)',
    description: 'Send emails, invoices, and receive incoming email triggers.',
    icon: Mail,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    provider: 'slack',
    name: 'Slack',
    description: 'Post automated messages, channel updates, and thread notifications.',
    icon: MessageSquare,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    provider: 'discord',
    name: 'Discord',
    description: 'Broadcast bot messages, incident alerts, and channel webhooks.',
    icon: Bot,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    provider: 'google-sheets',
    name: 'Google Sheets',
    description: 'Append rows, query spreadsheet ranges, and log execution records.',
    icon: FileSpreadsheet,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

  const fetchIntegrations = async () => {
    try {
      const res = await api.get('/integrations');
      if (res.data?.success) {
        setIntegrations(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnectOAuth = async (provider) => {
    setConnecting(provider);
    try {
      const res = await api.get(`/integrations/oauth/${provider}/start`);
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      alert(e.response?.data?.message || `OAuth flow for ${provider} requires client keys in server/.env`);
    } finally {
      setConnecting(null);
    }
  };

  const handleSimulateDevConnect = async (provider) => {
    try {
      await api.post('/integrations', {
        provider,
        accessToken: `simulated_${provider}_dev_token_${Date.now()}`,
        metadata: { simulated: true, connectedAt: new Date().toISOString() },
      });
      fetchIntegrations();
    } catch (e) {
      alert('Failed to save simulated connection');
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Third-Party Integrations">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">OAuth & Bot Connections</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Tokens and credentials are encrypted at rest with AES-256 using your application key. If a credential is missing or expired, our Recovery Agent explicitly catches it as <span className="font-mono text-cyan-300">INTEGRATION_NOT_CONNECTED</span>.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="h-4 w-4" />
              AES-256 Encrypted at Rest
            </div>
          </div>

          {/* Integration Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {PROVIDERS_INFO.map((p) => {
              const Icon = p.icon;
              const status = integrations.find((i) => i.provider === p.provider);
              const isConnected = Boolean(status?.isConnected);

              return (
                <div
                  key={p.provider}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${p.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{p.name}</h3>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${
                              isConnected ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Connected & Valid
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" /> Not Connected
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                    <button
                      onClick={() => handleSimulateDevConnect(p.provider)}
                      className="text-[11px] text-slate-500 hover:text-cyan-400 transition"
                      title="Set simulated local token"
                    >
                      (Dev Mock Connect)
                    </button>

                    <button
                      onClick={() => handleConnectOAuth(p.provider)}
                      disabled={connecting === p.provider}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        isConnected
                          ? 'border border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500 hover:text-white'
                          : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                      }`}
                    >
                      {connecting === p.provider ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Key className="h-3.5 w-3.5" />
                      )}
                      {isConnected ? 'Reconnect / Refresh' : 'Connect via OAuth'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
