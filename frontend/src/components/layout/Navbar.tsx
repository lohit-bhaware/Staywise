import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '';

  return (
    <nav
      className={[
        'sticky top-0 z-40 bg-surface/90 backdrop-blur-md transition-[box-shadow,border-color] duration-200',
        scrolled ? 'shadow-nav border-b border-border/80' : 'border-b border-border',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-light transition-colors">
              <Building2 size={18} className="text-sand-100" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight font-serif">
              Stay<span className="text-accent italic font-normal">wise</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Explore
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
              >
                My Trips
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-sand-50 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {user?.firstName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-text-secondary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-modal border border-border py-1 animate-fade-in">
                    <div className="px-3.5 py-2.5 border-b border-border/80">
                      <p className="text-sm font-semibold text-text-primary">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3.5 py-2 text-sm text-text-secondary hover:text-primary hover:bg-sand-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-text-secondary hover:text-primary hover:bg-sand-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield size={15} />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-error hover:bg-red-50/70 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/search"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-slate-50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Explore Hotels
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-slate-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                My Trips
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-slate-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-border">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-error hover:bg-red-50"
                  leftIcon={<LogOut size={15} />}
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => { navigate('/register'); setMobileOpen(false); }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
