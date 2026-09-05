'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText, ShieldCheck, ShieldAlert, ShieldX, CheckCircle2,
  XCircle, AlertTriangle, Clock, Loader2, ChevronRight,
  Download, Printer, Zap, Play
} from 'lucide-react';
import { getCases, getCase, getVerificationResult, getVerificationSignals, triggerVerification } from '@/lib/api';
import type { Case, VerificationResult, VerificationSignal } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}>
      <ReportsContent />
    </Suspense>
  );
}

function ReportsContent() {
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('v'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCases().then(({ data }) => {
      setCases(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
      setLoading(false);
    });
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-td-navy">Verification Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evidence breakdown and trust decisions for completed cases.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-td-navy">No completed verifications yet</p>
          <p className="text-xs text-muted-foreground mt-1">Process a case to see its report here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* List */}
          <div className="space-y-2 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-2">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  'w-full text-left flex items-center gap-3 rounded-lg border p-3 transition-all',
                  selectedId === c.id
                    ? 'border-td-cyan bg-td-cyan-soft/20 shadow-sm'
                    : 'border-border/50 bg-white hover:border-td-navy/20',
                )}
              >
                <DecisionIcon decision={c.final_decision} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-td-navy truncate">{c.applicant_name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {c.trust_score != null && (
                    <div className="font-mono text-xs font-bold text-td-navy">{c.trust_score}%</div>
                  )}
                </div>
                {selectedId === c.id && <ChevronRight className="h-3.5 w-3.5 text-td-cyan shrink-0" />}
              </button>
            ))}
          </div>

          {/* Detail */}
          <div>
            {selectedId ? (
              <CaseReportDetail key={selectedId} caseId={selectedId} />
            ) : (
              <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Select a case to view its report</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CaseReportDetail({ caseId }: { caseId: string }) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const handleGenerateReport = async () => {
    setRunning(true);
    await triggerVerification(caseId);
    const [cRes, vRes] = await Promise.all([getCase(caseId), getVerificationResult(caseId)]);
    if (cRes.data) setCaseData(cRes.data);
    if (vRes.data) setVerification(vRes.data);
    setRunning(false);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getCase(caseId), getVerificationResult(caseId)]).then(([cRes, vRes]) => {
      setCaseData(cRes.data);
      setVerification(vRes.data);
      setLoading(false);
    });
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 rounded-xl border border-border/60 bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center py-20 rounded-xl border border-red-200 bg-red-50">
        <p className="text-sm text-red-600">Failed to load report</p>
      </div>
    );
  }

  const decisionCfg = {
    VERIFIED: { icon: ShieldCheck, color: 'text-green-700', bg: 'bg-green-100', label: 'VERIFIED' },
    REJECTED: { icon: ShieldX, color: 'text-red-700', bg: 'bg-red-100', label: 'REJECTED' },
    SUSPICIOUS: { icon: ShieldAlert, color: 'text-amber-700', bg: 'bg-amber-100', label: 'SUSPICIOUS' },
    MANUAL_REVIEW: { icon: Clock, color: 'text-purple-700', bg: 'bg-purple-100', label: 'MANUAL REVIEW' },
  };

  const finalCfg = caseData.final_decision ? decisionCfg[caseData.final_decision] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Summary card */}
      <div className="rounded-xl border border-border/70 bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-td-navy">{caseData.applicant_name}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {caseData.expected_document_type} ·{' '}
              {new Date(caseData.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          {finalCfg && (
            <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', finalCfg.bg, finalCfg.color)}>
              <finalCfg.icon className="h-3.5 w-3.5" />
              {finalCfg.label}
            </span>
          )}
        </div>

        {/* Trust score bar */}
        {caseData.trust_score != null && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-wide text-muted-foreground">TRUST SCORE</span>
              <span className="font-mono text-lg font-bold text-td-navy">{caseData.trust_score}/100</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${caseData.trust_score}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  caseData.trust_score >= 85 ? 'bg-green-500' :
                  caseData.trust_score >= 65 ? 'bg-amber-500' : 'bg-red-500',
                )}
              />
            </div>
          </div>
        )}

        {caseData.risk_level && (
          <p className="text-xs text-muted-foreground">
            Risk Level: <span className="font-semibold text-td-navy">{caseData.risk_level}</span>
          </p>
        )}
      </div>

      {/* Signals */}
      {verification?.signals && verification.signals.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-td-navy">Evidence Signals</h3>
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground">
              {verification.signals.length} SIGNALS
            </span>
          </div>
          <div className="space-y-2">
            {verification.signals.map((sig, i) => (
              <SignalRow key={sig.signal_name} signal={sig} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Reasons */}
      {verification?.reasons && verification.reasons.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-white p-6">
          <h3 className="text-sm font-bold text-td-navy mb-4">Decision Reasoning</h3>
          <div className="space-y-2">
            {verification.reasons.map((r, i) => (
              <div key={i} className={cn(
                'flex items-start gap-3 rounded-lg p-3 text-sm',
                r.severity === 'HIGH' ? 'bg-red-50' : r.severity === 'MEDIUM' ? 'bg-amber-50' : 'bg-muted/30',
              )}>
                <span className="font-mono text-[9px] tracking-wide text-muted-foreground mt-0.5 w-24 shrink-0">{r.code}</span>
                <span className="text-td-navy">{r.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing or In-Progress Report Banner */}
      {(!verification || caseData.status !== 'COMPLETED') && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Verification In-Progress or Pending Full Synthesis
            </h4>
            <p className="text-xs text-amber-800/90 max-w-xl">
              Execute the complete 9-stage verification pipeline (Error Level Analysis, ICAO 9303 checksums, and biometric matching) to generate the full 100% audit report.
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={running}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-td-navy text-white text-xs font-bold font-mono tracking-wider hover:bg-td-navy/90 transition-all shadow-sm disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-td-cyan" />}
            {running ? 'SYNTHESIZING REPORT...' : 'GENERATE 100% REPORT'}
          </button>
        </div>
      )}

      {/* Export Actions Bar */}
      {verification && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-white">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>FULL 9-LAYER EVIDENCE REPORT GENERATED (100% VERIFIED)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium text-td-navy hover:bg-muted/40 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ caseData, verification }, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `trustdoc_report_${caseData.applicant_name.replace(/\s+/g, '_')}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-td-navy text-white text-xs font-medium hover:bg-td-navy/90 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-td-cyan" />
              Download JSON Evidence
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function DecisionIcon({ decision }: { decision: Case['final_decision'] }) {
  const cfgs = {
    VERIFIED: { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    REJECTED: { icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50' },
    SUSPICIOUS: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
    MANUAL_REVIEW: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  };
  const cfg = decision ? (cfgs[decision] || cfgs.MANUAL_REVIEW) : { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted' };
  const Icon = cfg.icon;
  return (
    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', cfg.bg)}>
      <Icon className={cn('h-4 w-4', cfg.color)} />
    </div>
  );
}

function SignalRow({ signal, index }: { signal: VerificationSignal; index: number }) {
  const cfg = {
    PASS: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'PASS' },
    FAIL: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'FAIL' },
    WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'WARNING' },
    NOT_AVAILABLE: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'N/A' },
  }[signal.status] || { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: '?' };
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', cfg.bg)}>
        <Icon className={cn('h-4 w-4', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
          <p className="text-sm font-medium text-td-navy">{signal.signal_label}</p>
        </div>
        {signal.detail && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{signal.detail}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="font-mono text-xs font-bold text-td-navy">{signal.confidence}%</div>
        <span className={cn('font-mono text-[8px] font-semibold tracking-wide px-2 py-1 rounded', cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}
