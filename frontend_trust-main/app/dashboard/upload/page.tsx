'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon,
  FileText,
  Scan,
  ScanLine,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  X,
  ShieldCheck,
  User,
  Camera,
  SwitchCamera,
  Smile,
  RotateCcw,
  Sparkles,
  Zap,
  AlertTriangle,
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

  // Camera Refs & State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'document' | 'selfie'>('document');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [applicantName, setApplicantName] = useState('');
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);

    // Create preview if it is an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setSelectedFilePreview(null);
    }
  }, []);

  const handleSelfieFile = useCallback((file: File) => {
    setSelfieFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setSelfiePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setSelfiePreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Start live webcam for in-tab camera capture
  const openCamera = (target: 'document' | 'selfie') => {
    setCameraTarget(target);
    setCameraActive(true);
    setCameraError(null);
    const mode = target === 'selfie' ? 'user' : 'environment';
    setFacingMode(mode);
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraError(null);
  };

  useEffect(() => {
    if (!cameraActive) return;

    let mediaStream: MediaStream | null = null;
    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API is not supported in this browser environment.');
        }
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err: any) {
        setCameraError(err.message || 'Unable to access camera hardware. Please check browser permissions.');
      }
    };

    initCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraActive, facingMode]);

  const snapPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const fileName = cameraTarget === 'document' ? `document_cam_${Date.now()}.jpg` : `selfie_cam_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      if (cameraTarget === 'document') {
        handleFile(file);
      } else {
        handleSelfieFile(file);
      }
      closeCamera();
    }, 'image/jpeg', 0.92);
  };

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
    }, 550);

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

      // Step 2b: Optional selfie — uploaded as a second document for face match
      if (selfieFile) {
        await uploadDocument(newCase.id, selfieFile);
      }

      // Step 3: Trigger Real Multi-layer Verification Pipeline
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
    setSelectedFilePreview(null);
    setSelfieFile(null);
    setSelfiePreview(null);
    setScanning(false);
    setScanStep(0);
    setError(null);
    setApplicantName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (selfieInputRef.current) selfieInputRef.current.value = '';
    closeCamera();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-td-navy">New Verification Case</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit an identity document or capture directly via webcam for multi-layer evidence analysis.
        </p>
      </div>

      {/* In-Tab Live Camera Viewfinder Modal */}
      <AnimatePresence>
        {cameraActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border-2 border-td-cyan/60 bg-slate-950 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono text-xs font-bold text-td-cyan uppercase tracking-wider">
                  LIVE CAMERA CAPTURE — {cameraTarget === 'document' ? 'IDENTITY DOCUMENT' : 'BIOMETRIC SELFIE'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono flex items-center gap-1.5 transition-all"
                >
                  <SwitchCamera className="h-3.5 w-3.5 text-td-cyan" />
                  Flip Camera
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {cameraError ? (
              <div className="p-6 rounded-xl bg-red-950/40 border border-red-500/30 text-center text-xs text-red-300 space-y-2">
                <AlertTriangle className="h-6 w-6 text-red-400 mx-auto" />
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px]"
                >
                  Close Viewfinder
                </button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-white/10 shadow-inner">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder Overlay Guides */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  {cameraTarget === 'document' ? (
                    <div className="w-full h-full border-2 border-dashed border-td-cyan/70 rounded-2xl flex items-center justify-center">
                      <span className="bg-black/60 px-3 py-1 rounded-md font-mono text-[11px] text-td-cyan">
                        ALIGN DOCUMENT WITHIN BORDER
                      </span>
                    </div>
                  ) : (
                    <div className="w-48 h-64 border-2 border-dashed border-green-400/80 rounded-full flex items-center justify-center">
                      <span className="bg-black/60 px-3 py-1 rounded-md font-mono text-[11px] text-green-400">
                        CENTER FACE IN OVAL
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!cameraError && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={snapPhoto}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-mono font-bold text-xs shadow-lg shadow-green-600/30 transition-all"
                >
                  <Camera className="h-4 w-4" />
                  CAPTURE PHOTO
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-4 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 font-mono text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="rounded-2xl border border-border/70 bg-white p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-td-navy">Verification Setup</h2>
                <button onClick={reset} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Applicant Name */}
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">Applicant Full Name *</label>
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

              {/* Document Preview Card */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-foreground/70">Attached Document</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                  {selectedFilePreview ? (
                    <div className="h-20 w-32 rounded-lg overflow-hidden border border-border/80 bg-black shrink-0">
                      <img src={selectedFilePreview} alt="Document Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-td-navy shrink-0">
                      <FileText className="h-6 w-6 text-td-cyan" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-td-navy truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'Unknown type'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openCamera('document')}
                      className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-mono font-medium text-td-navy hover:bg-muted/40 transition-all flex items-center gap-1.5"
                    >
                      <Camera className="h-3.5 w-3.5 text-td-cyan" />
                      Retake via Camera
                    </button>
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Document type */}
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Document Type Category</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {DOC_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setDocType(type)}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
                        docType === type
                          ? 'border-td-cyan bg-td-cyan-soft/30 text-td-navy font-bold'
                          : 'border-border bg-white text-muted-foreground hover:border-td-navy/20',
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Selfie / Live Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-foreground/70">
                  Live Selfie / Face Photo <span className="text-muted-foreground font-normal">(optional — enables 1:1 Biometric Face Match)</span>
                </label>

                {selfieFile ? (
                  <div className="flex items-center gap-4 rounded-xl border border-green-300 bg-green-50/50 p-3.5">
                    {selfiePreview ? (
                      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-green-500 bg-black shrink-0">
                        <img src={selfiePreview} alt="Selfie Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Smile className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-green-900 truncate">{selfieFile.name}</p>
                      <p className="text-[11px] text-green-700">{(selfieFile.size / 1024).toFixed(1)} KB · Biometric Frame Ready</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelfieFile(null);
                        setSelfiePreview(null);
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => openCamera('selfie')}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-border/80 bg-white hover:border-td-cyan hover:bg-td-cyan-soft/10 text-xs font-mono font-bold text-td-navy transition-all shadow-sm"
                    >
                      <Camera className="h-4 w-4 text-td-cyan" />
                      Take Live Selfie with Camera
                    </button>

                    <div
                      onClick={() => selfieInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-border hover:border-td-cyan/50 hover:bg-muted/20 text-xs font-mono text-muted-foreground cursor-pointer transition-all"
                    >
                      <UploadIcon className="h-4 w-4" />
                      Browse Existing Photo
                    </div>
                  </div>
                )}

                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleSelfieFile(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-xs text-red-700">{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleStartVerification}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-td-navy px-4 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-td-navy/20"
              >
                <ScanLine className="h-4 w-4" />
                Start Multi-Layer Verification
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Initial Dropzone & Camera Trigger Screen */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative cursor-pointer rounded-2xl border-2 border-dashed p-10 lg:p-14 text-center transition-all',
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
                <p className="mt-1 text-sm text-muted-foreground">or click to browse local files</p>
                <p className="mt-3 font-mono text-[10px] tracking-wide text-muted-foreground/60">
                  SUPPORTED: JPG · PNG · PDF · MAX 10MB
                </p>
              </div>
            </div>

            {/* Quick Live Camera Option */}
            <div className="flex items-center justify-center">
              <span className="text-xs font-mono text-muted-foreground uppercase px-3 bg-slate-50 relative -top-3">
                — OR CAPTURE INSTANTLY —
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => openCamera('document')}
                className="flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-border/80 bg-white hover:border-td-cyan hover:bg-td-cyan-soft/10 text-td-navy transition-all shadow-sm group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-td-navy/5 group-hover:bg-td-navy text-td-navy group-hover:text-white transition-all">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold font-mono">Use Live Camera</h4>
                  <p className="text-[11px] text-muted-foreground">Snap document via webcam right here</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/live-cam')}
                className="flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-border/80 bg-white hover:border-green-500 hover:bg-green-50/20 text-td-navy transition-all shadow-sm group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 group-hover:bg-green-600 text-green-600 group-hover:text-white transition-all">
                  <Scan className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold font-mono">Full OpenCV CV Scanner</h4>
                  <p className="text-[11px] text-muted-foreground">Auto-boundary &amp; 3D face liveness HUD</p>
                </div>
              </button>
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
      className="rounded-2xl border border-border/70 bg-white p-6 lg:p-8 shadow-sm"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-td-cyan/30 bg-td-cyan-soft/30 px-4 py-1.5 mb-4">
          <span className="h-2 w-2 rounded-full bg-td-cyan animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.12em] text-td-navy font-medium">SUBMITTING TO BACKEND</span>
        </div>
        <h2 className="text-lg font-bold text-td-navy">{fileName}</h2>
        <p className="text-xs text-muted-foreground mt-1">{docType}</p>
      </div>

      <div className="relative h-28 rounded-xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 overflow-hidden mb-8">
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-td-cyan to-transparent"
          initial={{ top: '0%' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 12px hsl(199 89% 48% / 0.5)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="h-10 w-10 text-td-navy/20" />
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
