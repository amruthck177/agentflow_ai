import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import {
  LayoutDashboard,
  GitBranch,
  PlaySquare,
  Network,
  Settings,
  Bell,
  LogOut,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function AppShell({ children, title = 'Operator Console' }) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/workflows', label: 'Workflows', icon: GitBranch },
    { href: '/workflows/builder', label: 'AI Generator', icon: Sparkles },
    { href: '/executions', label: 'Executions', icon: PlaySquare },
    { href: '/integrations', label: 'Integrations', icon: Network },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // Quiet fail if not authed
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    clearAuth();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('agentflow-token');
    }
    router.push('/login');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'failure':
      case 'escalation':
        return <XCircle className="h-4 w-4 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-800 bg-slate-900/95 p-5 backdrop-blur z-30 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-slate-950">
              ⚡
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">Agentflow_AI</div>
              <div className="text-xs text-cyan-400 font-mono">OPERATOR CONSOLE</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href) && item.href !== '/workflows/builder');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="truncate">
              <div className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Operator'}</div>
              <div className="text-xs text-slate-400 capitalize">{user?.role || 'operator'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 backdrop-blur">
          <h1 className="text-xl font-semibold text-white">{title}</h1>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowDrawer(!showDrawer)}
                className="relative rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showDrawer && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="font-semibold text-sm text-white">Notifications</div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 text-sm">
                    {notifications.length === 0 ? (
                      <div className="text-xs text-slate-400 py-6 text-center">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          className={`rounded-lg border p-2.5 transition ${
                            n.isRead
                              ? 'border-slate-800/60 bg-slate-950/40 text-slate-400'
                              : 'border-cyan-500/30 bg-cyan-500/5 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-medium text-xs mb-1">
                            {getNotificationIcon(n.type)}
                            <span>{n.title}</span>
                          </div>
                          <p className="text-xs text-slate-300">{n.message}</p>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/workflows/builder"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              New Flow
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
