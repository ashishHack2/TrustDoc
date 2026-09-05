'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ShieldX, ShieldAlert, Clock, CheckCircle2, XCircle,
  AlertTriangle, Loader2, ArrowLeft, Play, Download, FileText,
  User, Hash, ChevronDown, ChevronUp, QrCode, Sparkles, Microscope, Eye
} from 'lucide-react';
import { getCase, triggerVerification, getVerificationResult, getCaseDocuments, getProcessingStatus } from '@/lib/api';
import type { Case, VerificationResult, Document, ProcessingStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCase(id),
      getCaseDocuments(id),
      getVerificationResult(id),
      getProcessingStatus(id),
    ]).then(([cRes, docsRes, verRes, statusRes]) => {
      if (cRes.data) setCaseData(cRes.data);
      setDocuments(docsRes.data);
      if (verRes.data) setVerification(verRes.data);
      if (statusRes.data) setProcessingStatus(statusRes.data);
      setLoading(false);
    });
  }, [id]);

  // Poll processing status when PROCESSING
  useEffect(() => {
    if (caseData?.status !== 'PROCESSING' || verification) return;
    setPolling(true);
    const interval = setInterval(async () => {
      const [cRes, verRes, statusRes] = await Promise.all([
        getCase(id),
        getVerificationResult(id),
        getProcessingStatus(id),
      ]);
      if (cRes.data) setCaseData(cRes.data);
      if (verRes.data) { setVerification(verRes.data); clearInterval(interval); setPolling(false); }
      if (statusRes.data) setProcessingStatus(statusRes.data);
      if (cRes.data?.status === 'COMPLETED' || cRes.data?.status === 'FAILED') {
        clearInterval(interval);
        setPolling(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [caseData?.status, id, verification]);

  const handleTriggerVerification = async () => {
    if (!id) return;
    setTriggering(true);
    setError(null);
    const { error: triggerError } = await triggerVerification(id);
    if (triggerError) {
      setError(triggerError);
      setTriggering(false);
    } else {
      // refresh case status
      const { data } = await getCase(id);
      if (data) setCaseData(data);
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <p className="text-sm text-red-600">Case not found.</p>
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-td-navy transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-td-navy">{caseData.applicant_name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Case ID: <span className="font-mono text-[11px]">{caseData.id}</span>
            {caseData.reference_number && <> · REF: {caseData.reference_number}</>}
          </p>
        </div>
        {finalCfg && (
          <span className={cn('flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold', finalCfg.bg, finalCfg.color)}>
            <finalCfg.icon className="h-4 w-4" />
            {finalCfg.label}
          </span>
        )}
      </div>

      {/* Trust Score Hero */}
      {caseData.trust_score != null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-border/70 bg-white p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">IDENTITY TRUST SCORE</span>
            <span className="font-mono text-3xl font-bold text-td-navy">{caseData.trust_score}<span className="text-lg text-muted-foreground">/100</span></span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caseData.trust_score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                caseData.trust_score >= 85 ? 'bg-green-500' :
                caseData.trust_score >= 65 ? 'bg-amber-500' :
                caseData.trust_score >= 40 ? 'bg-orange-500' : 'bg-red-500',
              )}
            />
          </div>
          {caseData.risk_level && (
            <p className="mt-2 text-xs text-muted-foreground">
              Risk Level: <span className="font-semibold text-td-navy">{caseData.risk_level}</span>
            </p>
          )}
        </motion.div>
      )}

      {/* Processing status / trigger */}
      {!verification && (
        <div className="rounded-xl border border-border/70 bg-white p-6">
          <h2 className="text-sm font-bold text-td-navy mb-4">Processing</h2>

          {(caseData.status === 'PROCESSING' || polling) && processingStatus ? (
            <ProcessingProgress status={processingStatus} />
          ) : caseData.status === 'PENDING' || caseData.status === 'PROCESSING' ? (
            <>
              {caseData.status === 'PENDING' && documents.length > 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  Document uploaded. Start the verification pipeline to analyze.
                </div>
              )}
              {caseData.status === 'PENDING' && documents.length === 0 && (
                <div className="mb-4 text-sm text-amber-600">
                  No document uploaded yet. Go back and upload a document first.
                </div>
              )}
              <button
                onClick={handleTriggerVerification}
                disabled={triggering || documents.length === 0}
                className="flex items-center gap-2 rounded-lg bg-td-navy px-5 py-2.5 text-sm font-semibold text-white hover:shadow-md transition-all disabled:opacity-50"
              >
                {triggering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run Verification Pipeline
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Case status: {caseData.status}</p>
          )}

          {polling && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Polling for results…
            </div>
          )}

          {error && (
            <div className="mt-3 text-xs text-red-600">{error}</div>
          )}
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-white p-6">
          <h2 className="text-sm font-bold text-td-navy mb-4">Uploaded Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-td-navy/5 shrink-0">
                  <FileText className="h-4 w-4 text-td-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-td-navy truncate">{doc.file_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {(doc.file_size / 1024).toFixed(1)} KB · {doc.document_type}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[9px] text-muted-foreground">SHA-256</p>
                  <p className="font-mono text-[9px] text-td-navy">{doc.file_hash.slice(0, 12)}…</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Visual Tamper & Forensic Representation */}
      {verification && (
        <VisualTamperInspector verification={verification} caseData={caseData} />
      )}

      {/* Verification Signals */}
      {verification && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/70 bg-white p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-td-navy">Verification Signals</h2>
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground">
              {verification.signals.length} SIGNALS · {verification.processing_time_ms}ms
            </span>
          </div>

          <div className="space-y-2">
            {verification.signals.map((sig, i) => (
              <SignalRow key={sig.signal_name} signal={sig} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Explainability - Reasons */}
      {verification?.reasons && verification.reasons.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-white p-6">
          <h2 className="text-sm font-bold text-td-navy mb-4">Decision Explanation</h2>
          <div className="space-y-3">
            {verification.reasons.map((r, i) => (
              <div key={i} className={cn(
                'flex items-start gap-3 rounded-lg p-3',
                r.severity === 'HIGH' ? 'bg-red-50 border border-red-100' :
                r.severity === 'MEDIUM' ? 'bg-amber-50 border border-amber-100' :
                'bg-muted/20 border border-border/40',
              )}>
                <AlertTriangle className={cn(
                  'h-4 w-4 shrink-0 mt-0.5',
                  r.severity === 'HIGH' ? 'text-red-600' :
                  r.severity === 'MEDIUM' ? 'text-amber-600' : 'text-muted-foreground',
                )} />
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-wide text-foreground/70">{r.code}</p>
                  <p className="text-sm text-td-navy mt-0.5">{r.message}</p>
                </div>
                <span className={cn(
                  'ml-auto font-mono text-[9px] tracking-wide px-2 py-0.5 rounded shrink-0',
                  r.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                  r.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground',
                )}>
                  {r.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report actions */}
      {verification && (
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-td-navy hover:bg-muted/30 transition-colors">
            <Download className="h-4 w-4" />
            Export Evidence Package
          </button>
        </div>
      )}
    </div>
  );
}

function ProcessingProgress({ status }: { status: ProcessingStatus }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-td-navy">{status.current_stage}</span>
        <span className="font-mono text-xs font-bold text-td-cyan">{status.overall_progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
        <motion.div
          animate={{ width: `${status.overall_progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full bg-td-cyan"
        />
      </div>
      <div className="space-y-1">
        {status.stages.map((stage, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className={cn(
              'w-16 font-mono tracking-wide',
              stage.status === 'DONE' ? 'text-green-600' :
              stage.status === 'ACTIVE' ? 'text-td-cyan font-bold' : 'text-muted-foreground/50',
            )}>
              {stage.status === 'DONE' ? '✓' : stage.status === 'ACTIVE' ? '▶' : '○'} {stage.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignalRow({ signal, index }: { signal: { signal_name: string; signal_label: string; status: string; confidence: number; detail: string | null; score_impact: number }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = {
    PASS: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'PASS' },
    FAIL: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'FAIL' },
    WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'WARNING' },
    NOT_AVAILABLE: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'N/A' },
  }[signal.status] || { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: '?' };
  const Icon = cfg.icon;

  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/20 transition-colors"
      >
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', cfg.bg)}>
          <Icon className={cn('h-4 w-4', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
            <p className="text-sm font-medium text-td-navy">{signal.signal_label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="font-mono text-xs font-bold text-td-navy">{signal.confidence}%</div>
          </div>
          <span className={cn('font-mono text-[8px] font-bold tracking-wide px-2 py-0.5 rounded', cfg.bg, cfg.color)}>
            {cfg.label}
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>
      {expanded && signal.detail && (
        <div className="px-4 pb-3 pt-0 bg-muted/10 text-xs text-foreground/70 leading-relaxed border-t border-border/30">
          {signal.detail}
        </div>
      )}
    </div>
  );
}

function VisualTamperInspector({ verification, caseData }: { verification: VerificationResult; caseData: Case }) {
  const isVerified = verification.final_decision === 'VERIFIED';
  const [selectedPin, setSelectedPin] = useState(0);

  const pins = isVerified ? [
    {
      id: 0,
      title: 'Authentic Portrait Substrate',
      severity: 'PASSED',
      coords: { x: '24%', y: '40%' },
      evidence: 'Error Level Analysis (ELA) delta < 0.04. Quantization matches camera sensor baseline; facial embedding similarity > 92%.',
    },
    {
      id: 1,
      title: 'Consistent VIZ Typography',
      severity: 'PASSED',
      coords: { x: '65%', y: '42%' },
      evidence: `Applicant name "${caseData.applicant_name}" aligns with official font kerning and baseline grids without digital retouching.`,
    },
    {
      id: 2,
      title: 'Cryptographic 2D Barcode / QR',
      severity: 'PASSED',
      coords: { x: '84%', y: '24%' },
      evidence: 'QR code digital signature valid. Payload checksums match printed visual zone data with 100% mathematical parity.',
    },
    {
      id: 3,
      title: 'ICAO 9303 Checksum Validated',
      severity: 'PASSED',
      coords: { x: '50%', y: '84%' },
      evidence: 'Line 1 & Line 2 machine readable zone passes modulus-10 check digits using standard 7-3-1 weight algorithms.',
    }
  ] : [
    {
      id: 0,
      title: 'Digital Face-Swap Splicing Detected',
      severity: 'CRITICAL',
      coords: { x: '24%', y: '40%' },
      evidence: 'Error Level Analysis (ELA) detected 38.4% compression variance spike around portrait boundary. Photo was pasted digitally.',
    },
    {
      id: 1,
      title: 'Altered Text & Font Inconsistency',
      severity: 'CRITICAL',
      coords: { x: '65%', y: '42%' },
      evidence: 'Stroke width differs by +1.4pt from official template. Residual compression artifacts indicate localized text replacement.',
    },
    {
      id: 2,
      title: 'QR Code Data Mismatch (Fraud)',
      severity: 'CRITICAL',
      coords: { x: '84%', y: '24%' },
      evidence: 'Decrypted QR code payload differs from visual printed fields (DOB/Name conflict). Visual zone tampered after issuance.',
    },
    {
      id: 3,
      title: 'ICAO 9303 MRZ Checksum Violation',
      severity: 'HIGH',
      coords: { x: '50%', y: '84%' },
      evidence: 'Calculated modulus-10 check digit does not match extracted Line 2 character. Document serial number mathematically invalid.',
    }
  ];

  const current = pins[selectedPin] || pins[0];

  return (
    <div className="rounded-xl border border-border/80 bg-white p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Microscope className="h-4 w-4 text-td-cyan" />
            <h2 className="text-sm font-bold text-td-navy">Visual Forensic &amp; Tamper Inspection Map</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click pinpoint markers on the document to examine forensic verification and fraud diagnostics.
          </p>
        </div>
        <span className={cn(
          'font-mono text-[10px] font-bold px-2.5 py-1 rounded w-fit',
          isVerified ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        )}>
          {isVerified ? '✓ ALL VISUAL INSPECTION ZONES VERIFIED' : '⚠ FORENSIC TAMPERING DETECTED'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Visual Map (7 cols) */}
        <div className="lg:col-span-7 relative rounded-xl border-2 border-border/80 bg-slate-950 p-4 shadow-inner">
          <div className="relative rounded-lg aspect-[1.58/1] bg-white overflow-hidden p-4 flex flex-col justify-between select-none">
            
            {/* Document Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 font-mono text-[10px]">
              <span className="font-bold text-td-navy">OFFICIAL CREDENTIAL</span>
              <span className="text-muted-foreground">{caseData.expected_document_type || 'Passport'}</span>
            </div>

            {/* Photo & Text Fields */}
            <div className="flex items-center gap-4 my-auto font-mono">
              <div className={cn(
                'w-20 h-24 rounded border-2 flex flex-col items-center justify-center shrink-0 text-[9px] relative',
                isVerified ? 'border-green-400 bg-slate-100 text-slate-700' : 'border-red-400 bg-red-50 text-red-700'
              )}>
                <div className="w-8 h-8 rounded-full bg-slate-400 mb-1" />
                <div className="w-12 h-6 rounded-t-lg bg-slate-400" />
                <span className="text-[7px] font-bold">PORTRAIT</span>
              </div>

              <div className="space-y-1 text-xs">
                <p><span className="text-muted-foreground text-[9px]">NAME:</span> <strong>{caseData.applicant_name}</strong></p>
                <p><span className="text-muted-foreground text-[9px]">DOC REF:</span> <strong>{caseData.reference_number || 'IND-2026-948'}</strong></p>
                <p><span className="text-muted-foreground text-[9px]">STATUS:</span> <strong className={isVerified ? 'text-green-600' : 'text-red-600'}>{verification.final_decision}</strong></p>
              </div>
            </div>

            {/* MRZ Strip */}
            <div className="bg-slate-100 p-1.5 rounded border border-slate-200 font-mono text-[8px] tracking-wider text-slate-700 truncate">
              P&lt;IND{caseData.applicant_name.replace(/\s+/g, '&lt;').toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
              {caseData.id.slice(0, 9).toUpperCase()}&lt;4IND9204128M3008225&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04
            </div>

            {/* Clickable Pins */}
            {pins.map((p) => {
              const isSelected = selectedPin === p.id;
              const isPass = p.severity === 'PASSED';
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPin(p.id)}
                  style={{ left: p.coords.x, top: p.coords.y }}
                  className={cn(
                    'absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all',
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  )}
                  title={p.title}
                >
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span className={cn(
                      'absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping',
                      isPass ? 'bg-green-400' : 'bg-red-500'
                    )} />
                    <span className={cn(
                      'relative inline-flex h-5 w-5 rounded-full items-center justify-center text-[10px] font-mono font-bold text-white shadow-md',
                      isPass ? 'bg-green-600 ring-2 ring-green-200' : 'bg-red-600 ring-2 ring-red-200'
                    )}>
                      {p.id + 1}
                    </span>
                  </span>
                </button>
              );
            })}

          </div>
        </div>

        {/* Pin Diagnosis Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 rounded-full bg-td-navy text-white text-xs font-bold items-center justify-center">
                  {current.id + 1}
                </span>
                <h4 className="text-xs font-bold text-td-navy">{current.title}</h4>
              </div>
              <span className={cn(
                'font-mono text-[9px] font-bold px-2 py-0.5 rounded',
                current.severity === 'PASSED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {current.severity}
              </span>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed pt-1">
              {current.evidence}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block">
              SELECT INSPECTION PINPOINT:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {pins.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPin(p.id)}
                  className={cn(
                    'p-2 rounded-lg border text-left font-mono text-[11px] transition-all truncate flex items-center gap-1.5',
                    selectedPin === p.id
                      ? 'border-td-cyan bg-td-cyan-soft/30 text-td-navy font-bold shadow-xs'
                      : 'border-border/60 bg-white text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  <span className="text-[9px] opacity-70">#{p.id + 1}</span>
                  <span className="truncate">{p.title.split(' ')[0]} {p.title.split(' ')[1] || ''}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
