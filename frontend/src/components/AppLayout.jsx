import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Headphones,
  Mic,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navSections = [
  {
    label: 'Create',
    items: [
      { to: '/podcasts/new', icon: PlusCircle, label: 'New Podcast' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'All Podcasts' },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({ podcasts: 0, episodes: 0 });

  useEffect(() => {
    api.listPodcasts().then((podcasts) => {
      setStats({
        podcasts: podcasts.length,
        episodes: podcasts.reduce((acc, p) => acc + (p.episodes?.length || 0), 0),
      });
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[68px]' : 'w-64'} bg-white border-r border-border flex flex-col shrink-0 transition-all duration-200`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            {!collapsed && <span className="font-bold text-sm tracking-tight text-ink">PodcastMaker</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick stats */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-border">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-accent/5 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Mic className="w-3 h-3 text-accent" />
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wider">Podcasts</span>
                </div>
                <p className="text-lg font-bold text-ink">{stats.podcasts}</p>
              </div>
              <div className="p-2.5 bg-purple-500/5 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <BarChart3 className="w-3 h-3 text-purple-500" />
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wider">Episodes</span>
                </div>
                <p className="text-lg font-bold text-ink">{stats.episodes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
          {navSections.map(({ label, items }) => (
            <div key={label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold text-muted/60 uppercase tracking-wider">
                  {label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-accent/10 text-accent'
                          : 'text-muted hover:text-ink hover:bg-surface'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Pro banner */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 bg-gradient-to-br from-accent/10 to-purple-500/10 rounded-xl border border-accent/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-ink">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Unlimited podcasts, premium voices, and more.
            </p>
          </div>
        )}

        {/* User section */}
        <div className="p-3 border-t border-border">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{user?.username}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-muted hover:text-error rounded-md hover:bg-surface transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={handleLogout}
              className="w-full mt-2 p-1.5 text-muted hover:text-error rounded-md hover:bg-surface transition-colors flex justify-center"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
