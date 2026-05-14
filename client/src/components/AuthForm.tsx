'use client';

import { useState } from 'react';
import { ArrowRight, Lock, Mail, User, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast.success('Authentication successful.');
      } else {
        if (formData.name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters.');
        }
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created.');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 text-white flex items-center justify-center rounded-xl font-bold text-xl shadow-lg" style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))' }}>
            C
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter" style={{ color: 'var(--color-fg)' }}>Candor</h1>
        <p className="text-sm tracking-wide uppercase" style={{ color: 'var(--color-fg-muted)' }}>Technical Simulation Environment</p>
      </div>

      <div className="glass-card p-8">
        <div className="flex border-b mb-8" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              mode === 'login' ? '' : ''
            }`}
            style={{ color: mode === 'login' ? 'var(--color-fg)' : 'var(--color-fg-muted)' }}
          >
            Sign In
            {mode === 'login' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }}></span>
            )}
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              mode === 'register' ? '' : ''
            }`}
            style={{ color: mode === 'register' ? 'var(--color-fg)' : 'var(--color-fg-muted)' }}
          >
            Create Account
            {mode === 'register' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }}></span>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field pl-10"
                  placeholder="Jane Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field pl-10"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4" style={{ color: 'var(--color-fg-muted)' }} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2.5 mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {mode === 'login' ? 'Authenticate' : 'Initialize Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          <ShieldAlert className="w-3 h-3" style={{ color: 'var(--color-fg-muted)' }} />
          <span style={{ color: 'var(--color-fg-muted)' }}>Secure end-to-end encrypted session.</span>
        </div>
      </div>
    </div>
  );
}
