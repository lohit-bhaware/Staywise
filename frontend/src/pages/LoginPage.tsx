import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // If already logged in, redirect
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => navigate(from, { replace: true }),
      }
    );
  };

  const errorMessage = login.error
    ? (login.error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'Invalid email or password. Please try again.'
    : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="w-10 h-10 rounded-xl bg-primary text-accent flex items-center justify-center font-serif text-xl font-bold shadow-xs">
              S
            </span>
            <span className="font-serif text-2xl font-bold tracking-tight text-text-primary">
              Staywise
            </span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary text-sm mt-1">Sign in to manage your sanctuary and reservations</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-border shadow-card p-7 sm:p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Global error */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-error text-sm px-4 py-3 rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                leftIcon={<Mail size={16} />}
                error={errors.email}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={login.isPending}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 bg-surface-alt border border-border/80 rounded-2xl p-4 text-xs text-text-secondary">
          <p className="font-semibold text-text-primary mb-1">Demo Credentials</p>
          <div className="flex justify-between py-0.5">
            <span>Guest:</span>
            <span className="font-mono text-text-primary">alice@example.com / password123</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Admin:</span>
            <span className="font-mono text-text-primary">admin@stayfinder.com / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
};
