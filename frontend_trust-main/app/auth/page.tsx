'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  BadgeCheck,
  Video,
  KeyRound,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import type { TokenResponse } from '@/lib/api';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<TokenResponse['role']>('OPERATOR');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setMode('signup');
    } else if (tab === 'signin') {
      setMode('signin');
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    const { error: authError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (authError) {
      setError(authError);
    } else {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.replace(redirect);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!fullName.trim()) {
      setError('Please provide your full officer / analyst name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    setSubmitting(true);
    const { error: authError } = await signUp(email.trim(), password, fullName.trim(), role);
    setSubmitting(false);
    if (authError) {
      setError(authError);
    } else {
      setSuccessMessage('Account registered successfully! Redirecting...');
      setTimeout(() => {
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.replace(redirect);
      }, 600);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    const { error: authError } = await signIn('admin@trustdoc.gov.in', 'TrustDoc2026!');
    setSubmitting(false);
    if (authError) {
      setError(authError);
    } else {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.replace(redirect);
    }
  };

  const handleDemoScannerLaunch = async () => {
    setError(null);
    setSubmitting(true);
    const { error: authError } = await signIn('admin@trustdoc.gov.in', 'TrustDoc2026!');
    setSubmitting(false);
    if (authError) {
      setError(authError);
    } else {
      router.replace('/dashboard/live-cam');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-td-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <a href="/" className="inline-flex items-center justify-center gap-2 mb-3 group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-td-navy shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6 text-td-cyan" strokeWidth={2.2} />
            </div>
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-td-navy">TRUSTDOC</h1>
          <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Forensic Identity Intelligence Platform
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-border/80 bg-white/90 backdrop-blur-md shadow-xl p-6 sm:p-8"
        >
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-muted/50 p-1 mb-6 border border-border/60">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all',
                mode === 'signin'
                  ? 'bg-white text-td-navy shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-td-navy'
              )}
            >
              <KeyRound className="h-3.5 w-3.5 text-td-cyan" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all',
                mode === 'signup'
                  ? 'bg-white text-td-navy shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-td-navy'
              )}
            >
              <UserPlus className="h-3.5 w-3.5 text-td-cyan" />
              Create Account
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-base font-bold text-td-navy">
              {mode === 'signin' ? 'Officer & Analyst Sign In' : 'Register New Personnel'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === 'signin'
                ? 'Authorized security access. All actions cryptographically logged.'
                : 'Create credentials to access verification pipelines and forensic labs.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-foreground/75 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={mode === 'signup'}
                    placeholder="e.g. Officer Rajesh Verma"
                    className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-4 py-2.5 text-sm text-td-navy placeholder:text-muted-foreground/45 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-foreground/75 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="officer@agency.gov.in"
                  className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-4 py-2.5 text-sm text-td-navy placeholder:text-muted-foreground/45 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-foreground/75 mb-1">
                Password {mode === 'signup' && <span className="text-muted-foreground text-[10px]">(min. 8 characters)</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-10 py-2.5 text-sm text-td-navy placeholder:text-muted-foreground/45 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all"
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

            {/* Role Selection on Sign Up */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-foreground/75 mb-1">
                  Access Designation / Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'OPERATOR', label: 'Operator', desc: 'Frontline Scan' },
                    { id: 'REVIEWER', label: 'Reviewer', desc: 'Forensic Lab' },
                    { id: 'AUDITOR', label: 'Auditor', desc: 'Compliance' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as TokenResponse['role'])}
                      className={cn(
                        'flex flex-col items-center p-2 rounded-lg border text-left transition-all',
                        role === r.id
                          ? 'border-td-cyan bg-td-cyan-soft/40 text-td-navy shadow-sm'
                          : 'border-border/70 bg-muted/20 text-muted-foreground hover:border-border'
                      )}
                    >
                      <span className="text-xs font-bold">{r.label}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5"
              >
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-xs text-red-700 font-medium">{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2.5"
              >
                <BadgeCheck className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-xs text-green-700 font-medium">{successMessage}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-td-navy px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-td-navy/90 hover:shadow-lg hover:shadow-td-navy/20 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Authorized Account'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-td-cyan" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
              Fast Demo Access
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleDemoLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-xs font-semibold text-td-navy hover:border-td-cyan/40 hover:bg-td-cyan-soft/20 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4 text-td-cyan" />
              Sign In as Demo Admin (One-Click)
            </button>

            <button
              onClick={handleDemoScannerLaunch}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-td-cyan/30 bg-td-navy/5 px-4 py-2.5 text-xs font-semibold text-td-navy hover:bg-td-cyan-soft/40 transition-all disabled:opacity-50"
            >
              <Video className="h-4 w-4 text-td-cyan" />
              Launch Live OpenCV Scanner directly
            </button>
          </div>

          <p className="mt-4 text-center text-[10px] font-mono text-muted-foreground tracking-wide">
            DEMO CREDENTIALS: admin@trustdoc.gov.in · TrustDoc2026!
          </p>
        </motion.div>

        <p className="text-center text-[11px] text-muted-foreground mt-6 font-mono">
          TRUSTDOC v1.0 · Zero-Trust Biometric &amp; Forensic Architecture
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-td-cyan" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
