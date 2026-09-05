'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function AuthPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: authError } = await signIn(email, password);
    setSubmitting(false);
    if (authError) {
      setError(authError);
    } else {
      router.replace('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSubmitting(true);
    const { error: authError } = await signIn('admin@trustdoc.gov.in', 'TrustDoc2026!');
    setSubmitting(false);
    if (authError) {
      setError(authError);
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-td-navy mb-4 shadow-lg">
            <ShieldCheck className="h-7 w-7 text-td-cyan" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-td-navy">TRUSTDOC</h1>
          <p className="mt-2 font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
            IDENTITY VERIFICATION PLATFORM
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-border/70 bg-white shadow-sm p-8"
        >
          <h2 className="text-lg font-bold text-td-navy mb-1">Operator Sign In</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Authorised personnel only. All sessions are logged.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@agency.gov.in"
                  className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-4 py-2.5 text-sm text-td-navy placeholder:text-muted-foreground/50 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-10 py-2.5 text-sm text-td-navy placeholder:text-muted-foreground/50 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-td-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-xs text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-td-navy px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-td-navy/20 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-wide">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Demo login */}
          <button
            onClick={handleDemoLogin}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-sm font-medium text-td-navy hover:border-td-cyan/30 hover:bg-td-cyan-soft/10 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4 text-td-cyan" />
            Sign in as Demo Admin
          </button>

          <p className="mt-4 text-center text-[10px] font-mono text-muted-foreground tracking-wide">
            DEMO MODE · admin@trustdoc.gov.in
          </p>
        </motion.div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          TRUSTDOC v1.0 · Secure Identity Verification Platform
        </p>
      </div>
    </div>
  );
}
