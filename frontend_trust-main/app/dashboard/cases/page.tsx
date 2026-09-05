'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FolderOpen, CheckCircle2, XCircle, AlertTriangle, Clock,
  Loader2, Upload, ChevronRight, Search,
} from 'lucide-react';
import { getCases } from '@/lib/api';
import type { Case } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCases().then(({ data }) => {
      setCases(data);
      setLoading(false);
    });
  }, []);

  const filtered = cases.filter((c) =>
    c.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
    c.reference_number?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-td-navy">Verification Cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">All cases in your workspace</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 rounded-lg bg-td-navy px-4 py-2.5 text-sm font-semibold text-white hover:shadow-md transition-all"
        >
          <Upload className="h-4 w-4" />
          New Case
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by applicant name or reference…"
          className="w-full rounded-lg border border-border bg-white pl-9 pr-4 py-2.5 text-sm text-td-navy placeholder:text-muted-foreground/50 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border">
          <FolderOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-td-navy">No cases found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? 'Try a different search term' : 'Create your first case to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <CaseRow case={c} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseRow({ case: c }: { case: Case }) {
  const decisionCfg = {
    VERIFIED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'VERIFIED' },
    REJECTED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'REJECTED' },
    SUSPICIOUS: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'SUSPICIOUS' },
    MANUAL_REVIEW: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', label: 'REVIEW' },
  };
  const statusCfg = {
    PENDING: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'PENDING' },
    PROCESSING: { icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-50', label: 'PROCESSING' },
    COMPLETED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'DONE' },
    FAILED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'FAILED' },
  };

  const cfg = c.final_decision
    ? (decisionCfg[c.final_decision] || statusCfg.PENDING)
    : (statusCfg[c.status] || statusCfg.PENDING);
  const Icon = cfg.icon;

  return (
    <Link
      href={`/dashboard/cases/${c.id}`}
      className="group flex items-center gap-4 rounded-lg border border-border/50 bg-white p-4 hover:border-td-cyan/30 hover:shadow-sm transition-all"
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg shrink-0', cfg.bg)}>
        <Icon className={cn('h-5 w-5', cfg.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-td-navy truncate">{c.applicant_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[11px] text-muted-foreground">
            {c.expected_document_type || 'Document'} ·{' '}
            {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {c.reference_number && (
            <span className="font-mono text-[10px] text-muted-foreground/60">REF: {c.reference_number}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {c.trust_score != null && (
          <div className="text-right hidden sm:block">
            <div className="font-mono text-sm font-bold text-td-navy">{c.trust_score}%</div>
            <div className="font-mono text-[8px] tracking-wide text-muted-foreground">TRUST</div>
          </div>
        )}
        <span className={cn('font-mono text-[9px] font-bold tracking-wide px-2.5 py-1 rounded', cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-td-cyan transition-colors" />
      </div>
    </Link>
  );
}
