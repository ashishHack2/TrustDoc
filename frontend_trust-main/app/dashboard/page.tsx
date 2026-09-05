'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ShieldAlert, ShieldX, Clock, TrendingUp, FileText,
  Upload, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getCases, getAnalyticsOverview } from '@/lib/api';
import type { Case, AnalyticsOverview } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCases(), getAnalyticsOverview()]).then(([casesRes, analyticsRes]) => {
      setCases(casesRes.data.slice(0, 8));
      setAnalytics(analyticsRes.data);
      setLoading(false);
    });
  }, []);

  // Compute stats from cases if analytics endpoint not yet available
  const stats = analytics ?? {
    total_cases: cases.length,
    verified: cases.filter((c) => c.final_decision === 'VERIFIED').length,
    suspicious: cases.filter((c) => c.final_decision === 'SUSPICIOUS').length,
    rejected: cases.filter((c) => c.final_decision === 'REJECTED').length,
    manual_review: cases.filter((c) => c.final_decision === 'MANUAL_REVIEW').length,
    average_trust_score: cases.length > 0
      ? Math.round(cases.reduce((a, c) => a + (c.trust_score || 0), 0) / cases.length)
      : 0,
    average_processing_time: 0,
    recent_cases: cases,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-td-navy">Verification Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, <span className="font-medium text-td-navy">{user?.email}</span> · {user?.role}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FileText} label="Total Cases" value={stats.total_cases} color="text-td-navy" bg="bg-td-navy/5" delay={0} />
            <StatCard icon={ShieldCheck} label="Verified" value={stats.verified} color="text-green-600" bg="bg-green-50" delay={0.05} />
            <StatCard icon={ShieldX} label="Rejected" value={stats.rejected} color="text-red-600" bg="bg-red-50" delay={0.1} />
            <StatCard
              icon={TrendingUp}
              label="Avg Trust Score"
              value={`${stats.average_trust_score}%`}
              color="text-td-cyan"
              bg="bg-td-cyan-soft/30"
              delay={0.15}
            />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={AlertTriangle} label="Suspicious" value={stats.suspicious} color="text-amber-600" bg="bg-amber-50" delay={0.2} />
            <StatCard icon={Clock} label="Manual Review" value={stats.manual_review} color="text-purple-600" bg="bg-purple-50" delay={0.25} />
          </div>

          {/* Quick action */}
          <div className="mb-8">
            <Link
              href="/dashboard/upload"
              className="group flex items-center justify-between rounded-xl border border-border/70 bg-white p-5 hover:border-td-cyan/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-td-navy">
                  <Upload className="h-5 w-5 text-td-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-td-navy">Start New Verification</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload a document for evidence-driven analysis</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-td-cyan group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Recent cases */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-td-navy">Recent Cases</h2>
              <Link href="/dashboard/cases" className="text-xs font-medium text-td-cyan hover:underline">
                View all →
              </Link>
            </div>

            {cases.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-2">
                {cases.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                  >
                    <CaseRow case={c} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, delay }: {
  icon: typeof FileText; label: string; value: string | number; color: string; bg: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl border border-border/60 bg-white p-4 lg:p-5"
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg mb-3', bg)}>
        <Icon className={cn('h-4 w-4', color)} strokeWidth={1.8} />
      </div>
      <div className="text-2xl font-bold text-td-navy">{value}</div>
      <div className="text-[11px] font-medium text-muted-foreground mt-0.5">{label}</div>
    </motion.div>
  );
}

function CaseRow({ case: c }: { case: Case }) {
  const decisionConfig = {
    VERIFIED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'VERIFIED' },
    REJECTED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'REJECTED' },
    SUSPICIOUS: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'SUSPICIOUS' },
    MANUAL_REVIEW: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', label: 'REVIEW' },
  };
  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'PENDING' },
    PROCESSING: { icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-50', label: 'PROCESSING' },
    COMPLETED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'DONE' },
    FAILED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'FAILED' },
  };

  const cfg = c.final_decision
    ? decisionConfig[c.final_decision] || statusConfig.PENDING
    : statusConfig[c.status] || statusConfig.PENDING;
  const StatusIcon = cfg.icon;

  return (
    <Link
      href={`/dashboard/cases/${c.id}`}
      className="group flex items-center gap-3 rounded-lg border border-border/50 bg-white p-3.5 hover:border-td-cyan/30 hover:shadow-sm transition-all"
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', cfg.bg)}>
        <StatusIcon className={cn('h-4 w-4', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-td-navy truncate">{c.applicant_name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {c.expected_document_type || 'Document'} ·{' '}
          {new Date(c.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        {c.trust_score != null && (
          <div className="text-right">
            <div className="font-mono text-sm font-bold text-td-navy">{c.trust_score}%</div>
            <div className="font-mono text-[8px] tracking-wide text-muted-foreground">TRUST</div>
          </div>
        )}
        <span className={cn('font-mono text-[9px] font-semibold tracking-wide px-2 py-1 rounded', cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-td-navy">No verifications yet</h3>
      <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
        Upload your first document to start an evidence-driven verification.
      </p>
      <Link
        href="/dashboard/upload"
        className="mt-4 flex items-center gap-1.5 rounded-lg bg-td-navy px-4 py-2 text-xs font-semibold text-white hover:shadow-md transition-all"
      >
        <Upload className="h-3.5 w-3.5" />
        Upload Document
      </Link>
    </div>
  );
}
