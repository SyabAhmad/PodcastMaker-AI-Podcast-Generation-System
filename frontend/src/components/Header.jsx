import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Headphones, Menu, X } from 'lucide-react';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = ['/', '/about', '/pricing'].includes(location.pathname);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${isLanding ? 'bg-white/80 backdrop-blur-xl border-b border-border/50' : 'bg-white border-b border-border'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Headphones className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-ink">PodcastMaker</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'text-accent bg-accent/5'
                  : 'text-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted hover:text-ink"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-2">
          {publicLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-ink hover:bg-surface"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2 space-y-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-center px-4 py-2 text-sm font-medium text-muted">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
