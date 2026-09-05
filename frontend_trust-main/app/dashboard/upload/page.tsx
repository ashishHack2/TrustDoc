'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon, FileText, Scan, ScanLine, CheckCircle2,
  XCircle, Loader2, ArrowRight, X, ShieldCheck, User,
} from 'lucide-react';
import { createCase, uploadDocument, triggerVerification } from '@/lib/api';
import { cn } from '@/lib/utils';

const DOC_TYPES = [
  'Passport', 'National ID', 'Driving Licence', 'Visa', 'Other',
];

const SCAN_STAGES = [
  { label: 'UPLOADING DOCUMENT' },
  { label: 'PREPROCESSING IMAGE' },
  { label: 'DOCUMENT CLASSIFICATION' },
  { label: 'OCR EXTRACTION' },
  { label: 'MRZ VALIDATION' },
  { label: 'FORENSIC ANALYSIS' },
  { label: 'RISK SCORING' },
];

export default function UploadTab() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleStartVerification = async () => {
    if (!selectedFile || !applicantName.trim()) {
      setError('Please fill in the applicant name and upload a document.');
      return;
    }
    setError(null);
    setScanning(true);
    setScanStep(0);

    // Animate scan stages
    const stageInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < SCAN_STAGES.length - 1) return prev + 1;
        clearInterval(stageInterval);
        return prev;
      });
    }, 600);

    try {
      // Step 1: Create the case
      const { data: newCase, error: caseError } = await createCase({
        applicant_name: applicantName,
        expected_document_type: docType,
      });

      if (caseError || !newCase) {
        throw new Error(caseError || 'Failed to create case');
      }

      // Step 2: Upload the document
      const { data: doc, error: uploadError } = await uploadDocument(newCase.id, selectedFile);
      if (uploadError || !doc) {
        throw new Error(uploadError || 'Failed to upload document');
      }

      // Step 3: Trigger Real Verification Pipeline
      await triggerVerification(newCase.id);

      clearInterval(stageInterval);
      setScanning(false);

      // Navigate to case detail page
      router.push(`/dashboard/cases/${newCase.id}`);
    } catch (err) {
      clearInterval(stageInterval);
      setScanning(false);
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setSelfieFile(null);
    setScanning(false);
    setScanStep(0);
    setError(null);
    setApplicantName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (selfieInputRef.current) selfieInputRef.current.value = '';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-td-navy">New Verification Case</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit a document for multi-layer evidence-driven analysis.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {scanning ? (
          <ScanningView key="scanning" scanStep={scanStep} fileName={selectedFile?.name || ''} docType={docType} />
        ) : selectedFile ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="rounded-2xl border border-border/70 bg-white p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-td-navy">Verification Setup</h2>
                <button onClick={reset} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Applicant Name */}
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">Applicant Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Full name as on document"
                    className="w-full rounded-lg border border-border bg-muted/20 pl-9 pr-4 py-2.5 text-sm text-td-navy placeholder:text-muted-foreground/50 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all"
                  />
                </div>
              </div>

              {/* File preview */}
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-td-navy shrink-0">
                  <FileText className="h-6 w-6 text-td-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-td-navy truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'Unknown type'}
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              </div>

              {/* Document type */}
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Document Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {DOC_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setDocType(type)}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
                        docType === type
                          ? 'border-td-cyan bg-td-cyan-soft/30 text-td-navy'
                          : 'border-border bg-white text-muted-foreground hover:border-td-navy/20',
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional selfie */}
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                  Selfie / Live Photo <span className="text-muted-foreground font-normal">(optional — for face match)</span>
                </label>
                <div
                  onClick={() => selfieInputRef.current?.click()}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border border-dashed p-3 cursor-pointer transition-all',
                    selfieFile ? 'border-green-400 bg-green-50' : 'border-border hover:border-td-cyan/40',
                  )}
                >
                  <input
                    ref={selfieInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {selfieFile ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-xs font-medium text-green-700 truncate">{selfieFile.name}</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">Click to attach selfie photo</span>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-xs text-red-700">{error}</span>
                </div>
              )}

              <button
                onClick={handleStartVerification}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-td-navy px-4 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-td-navy/20"
              >
                <ScanLine className="h-4 w-4" />
                Start Verification
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative cursor-pointer rounded-2xl border-2 border-dashed p-12 lg:p-16 text-center transition-all',
                dragging ? 'border-td-cyan bg-td-cyan-soft/20 scale-[1.01]' : 'border-border hover:border-td-cyan/40 hover:bg-muted/20',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-2xl transition-all mb-4',
                  dragging ? 'bg-td-cyan/10 scale-110' : 'bg-td-navy/5',
                )}>
                  <UploadIcon className={cn('h-7 w-7 transition-colors', dragging ? 'text-td-cyan' : 'text-td-navy')} />
                </div>
                <h3 className="text-base font-bold text-td-navy">
                  {dragging ? 'Drop to upload' : 'Drag & drop your document'}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">or click to browse files</p>
                <p className="mt-4 font-mono text-[10px] tracking-wide text-muted-foreground/60">
                  SUPPORTED: JPG · PNG · PDF · MAX 10MB
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScanningView({ scanStep, fileName, docType }: { scanStep: number; fileName: string; docType: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-border/70 bg-white p-6 lg:p-8"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-td-cyan/30 bg-td-cyan-soft/30 px-4 py-1.5 mb-4">
          <span className="h-2 w-2 rounded-full bg-td-cyan animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.12em] text-td-navy font-medium">SUBMITTING TO BACKEND</span>
        </div>
        <h2 className="text-lg font-bold text-td-navy">{fileName}</h2>
        <p className="text-xs text-muted-foreground mt-1">{docType}</p>
      </div>

      <div className="relative h-32 rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 overflow-hidden mb-8">
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-td-cyan to-transparent"
          initial={{ top: '0%' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 12px hsl(199 89% 48% / 0.5)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="h-12 w-12 text-td-navy/20" />
        </div>
      </div>

      <div className="space-y-1.5">
        {SCAN_STAGES.map((stage, i) => {
          const done = i < scanStep;
          const active = i === scanStep;
          return (
            <div
              key={stage.label}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
                active && 'bg-td-cyan-soft/30 border border-td-cyan/20',
                done && 'bg-green-50/50',
              )}
            >
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md shrink-0 transition-all',
                done ? 'bg-green-500' : active ? 'bg-td-cyan' : 'bg-muted',
              )}>
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                )}
              </div>
              <span className={cn(
                'font-mono text-[11px] tracking-wide transition-colors',
                done ? 'text-green-700' : active ? 'text-td-navy font-semibold' : 'text-muted-foreground opacity-50',
              )}>
                {String(i + 1).padStart(2, '0')} {stage.label}
              </span>
              {done && <span className="ml-auto font-mono text-[9px] tracking-wide text-green-600">DONE</span>}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
