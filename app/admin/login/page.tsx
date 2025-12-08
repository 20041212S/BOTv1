'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      router.push('/admin');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', position: 'relative', zIndex: 1 }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-400/20 via-blue-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Login Card - Glassmorphic */}
      <div className="relative w-full max-w-md glass-card rounded-3xl shadow-large p-8 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl relative overflow-hidden animate-float" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <span className="material-symbols-outlined !text-5xl text-white relative z-10">school</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold gradient-text" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Providence College of Engineering
          </h1>
          <p className="text-gray-700 mt-1 text-sm font-medium">Campus Assistant - Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-200/50 p-4 text-sm text-red-600 animate-slide-up" style={{ boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-charcoal mb-2">
              Admin ID / Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="modern-input w-full rounded-2xl py-4 px-5 text-charcoal placeholder-charcoal/60"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-charcoal mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="modern-input w-full rounded-2xl py-4 px-5 text-charcoal placeholder-charcoal/60"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full rounded-2xl py-4 text-base font-semibold text-white relative overflow-hidden group disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <span className="relative z-10">{isLoading ? 'Signing in...' : 'Sign in securely'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          <div className="text-center">
            <a href="#" className="text-sm text-accent hover:underline font-medium transition-colors">
              Forgot Password?
            </a>
          </div>

          <p className="text-xs text-gray-600 text-center mt-4">
            Two-factor authentication may be required for additional security.
          </p>
        </form>
      </div>
    </div>
  );
}
