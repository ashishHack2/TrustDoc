'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, ShieldCheck, ShieldX, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { getAnalyticsOverview } from '@/lib/api';
import type { AnalyticsOverview } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalyticsOverview().then(({ data: d, error: e }) => {
      setData(d);
      setError(e);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-td-navy mb-4">Analytics</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          {error || 'Analytics endpoint not yet available. Start the backend and run some verifications.'}
        </div>
      </div>
    );
  }

  const total = data.total_cases || 1; // avoid /0
  const decisions = [
    { label: 'Verified', value: data.verified, color: 'bg-green-500', textColor: 'text-green-700', icon: ShieldCheck },
    { label: 'Suspicious', value: data.suspicious, color: 'bg-amber-500', textColor: 'text-amber-700', icon: AlertTriangle },
    { label: 'Rejected', value: data.rejected, color: 'bg-red-500', textColor: 'text-red-700', icon: ShieldX },
    { label: 'Manual Review', value: data.manual_review, color: 'bg-purple-500', textColor: 'text-purple-700', icon: Clock },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-td-cyan" />
          <h1 className="text-2xl font-bold text-td-navy">Analytics</h1>
        </div>
        <p className="text-sm text-muted-foreground">Aggregate verification performance metrics</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Cases', value: data.total_cases, color: 'text-td-navy', bg: 'bg-td-navy/5', delay: 0 },
          { label: 'Avg Trust Score', value: `${data.average_trust_score}%`, color: 'text-td-cyan', bg: 'bg-td-cyan/5', delay: 0.05 },
          { label: 'Avg Process Time', value: `${(data.average_processing_time / 1000).toFixed(1)}s`, color: 'text-purple-600', bg: 'bg-purple-50', delay: 0.1 },
          { label: 'Pass Rate', value: `${data.total_cases > 0 ? Math.round((data.verified / data.total_cases) * 100) : 0}%`, color: 'text-green-600', bg: 'bg-green-50', delay: 0.15 },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: kpi.delay }}
            className="rounded-xl border border-border/60 bg-white p-4 lg:p-5"
          >
            <div className={cn('text-2xl font-bold', kpi.color)}>{kpi.value}</div>
            <div className="text-[11px] font-medium text-muted-foreground mt-0.5">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Decision Distribution */}
      <div className="rounded-xl border border-border/70 bg-white p-6 mb-6">
        <h2 className="text-sm font-bold text-td-navy mb-5">Decision Distribution</h2>

        {/* Bar chart */}
        <div className="space-y-4">
          {decisions.map((d) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            const Icon = d.icon;
            return (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', d.textColor)} />
                    <span className="text-sm font-medium text-td-navy">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('font-mono text-xs font-bold', d.textColor)}>{d.value}</span>
                    <span className="font-mono text-[11px] text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', d.color)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent cases */}
      {data.recent_cases && data.recent_cases.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-white p-6">
          <h2 className="text-sm font-bold text-td-navy mb-4">Recent Cases</h2>
          <div className="space-y-2">
            {data.recent_cases.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-td-navy truncate">{c.applicant_name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.expected_document_type || 'Document'}</p>
                </div>
                {c.trust_score != null && (
                  <span className="font-mono text-sm font-bold text-td-navy">{c.trust_score}%</span>
                )}
                {c.final_decision && (
                  <span className={cn(
                    'font-mono text-[9px] font-bold tracking-wide px-2 py-0.5 rounded',
                    c.final_decision === 'VERIFIED' ? 'bg-green-50 text-green-700' :
                    c.final_decision === 'REJECTED' ? 'bg-red-50 text-red-700' :
                    c.final_decision === 'SUSPICIOUS' ? 'bg-amber-50 text-amber-700' :
                    'bg-purple-50 text-purple-700',
                  )}>
                    {c.final_decision}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
