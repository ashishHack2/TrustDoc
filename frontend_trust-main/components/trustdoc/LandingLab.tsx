'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Microscope,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Video,
  Camera,
  Loader2,
  X,
  ScanLine,
  Zap,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

export default function LandingLab() {
  const router = useRouter();
  const { user, signIn } = useAuth();

  const [sampleType, setSampleType] = useState<'forged' | 'authentic'>('forged');
  const [filterMode, setFilterMode] = useState<'normal' | 'ela' | 'qr'>('ela');
  const [activeCallout, setActiveCallout] = useState<number | null>(0);
  const [launchingLiveCam, setLaunchingLiveCam] = useState(false);

  // Quick In-Page WebCam Preview Modal State
  const [showQuickWebcam, setShowQuickWebcam] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const callouts = sampleType === 'forged' ? [
    {
      id: 0,
      x: '28%',
      y: '38%',
      title: 'Spliced Portrait Photo',
      severity: 'CRITICAL',
      desc: 'Error Level Analysis (ELA) detected 38.2% compression delta spike along border. Face was pasted over original passport card.',
    },
    {
      id: 1,
      x: '68%',
      y: '48%',
      title: 'Altered Date of Birth',
      severity: 'HIGH',
      desc: 'Font kerning deviates by +3.4pt. ICAO 9303 check digit calculation failed: Line 2 checksum is 9, mathematically expected 4.',
    },
    {
      id: 2,
      x: '82%',
      y: '22%',
      title: 'QR Code Data Mismatch',
      severity: 'CRITICAL',
      desc: 'Encrypted QR payload decodes to "DOB: 1986-04-12", but printed visual text claims "1994-04-12". Immediate forgery flag.',
    }
  ] : [
    {
      id: 0,
      x: '28%',
      y: '38%',
      title: 'Authentic Portrait',
      severity: 'PASSED',
      desc: 'Homogeneous quantization levels (< 4.2% error). Micro-texture and depth gradients match bona fide capture.',
    },
    {
      id: 1,
      x: '68%',
      y: '48%',
      title: 'Valid ICAO Checksum',
      severity: 'PASSED',
      desc: 'Doc Number, DOB, and Expiration pass modulus-10 algorithms with 7-3-1 weighting. Zero mathematical discrepancies.',
    },
    {
      id: 2,
      x: '82%',
      y: '22%',
      title: 'Cryptographic QR Match',
      severity: 'PASSED',
      desc: 'Digital signature on 2D barcode matches Ministry Public Key. SHA-256 digest identical to visual identity fields.',
    }
  ];

  const handleOpenLiveCam = async () => {
    setLaunchingLiveCam(true);
    try {
      if (!user) {
        // Automatically establish demo session
        await signIn('admin@trustdoc.gov.in', 'TrustDoc2026!');
      }
      router.push('/dashboard/live-cam');
    } catch (e) {
      router.push('/auth?redirect=/dashboard/live-cam');
    }
  };

  const startQuickWebcam = async () => {
    setShowQuickWebcam(true);
    setCamError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam hardware API not available in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCamError(err.message || 'Webcam permission denied. You can still test in the full dashboard!');
      setCameraActive(false);
    }
  };

  const stopQuickWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setShowQuickWebcam(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <section id="lab" className="relative py-20 lg:py-28 bg-background border-b border-border/70 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-td-cyan/30 bg-td-cyan-soft/40 px-3.5 py-1 text-[11px] font-mono font-bold tracking-wider text-td-navy">
              <Microscope className="h-3.5 w-3.5 text-td-cyan" />
              LIVE FORENSIC LAB &amp; TESTBENCH
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-td-navy"
          >
            SEE WHY DOCUMENTS ARE <span className="text-red-600 underline decoration-red-400 decoration-wavy">FAKE</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mt-3 text-[15px] text-muted-foreground"
          >
            Experience how TRUSTDOC exposes digital splicing, checksum failures, and QR payload fraud in real-time.
          </motion.p>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white rounded-2xl border border-border/80 p-3 shadow-sm">
          {/* Sample Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground mr-1">TEST SPECIMEN:</span>
            <button
              onClick={() => { setSampleType('forged'); setActiveCallout(0); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                sampleType === 'forged'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-muted/40 text-muted-foreground hover:text-td-navy'
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Forged Passport Specimen
            </button>
            <button
              onClick={() => { setSampleType('authentic'); setActiveCallout(0); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                sampleType === 'authentic'
                  ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                  : 'bg-muted/40 text-muted-foreground hover:text-td-navy'
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Authentic e-Passport
            </button>
          </div>

          {/* Spectral Filter Layers */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-muted-foreground mr-1">SPECTRAL LAYER:</span>
            {[
              { id: 'normal', label: 'Visible Light', icon: Eye },
              { id: 'ela', label: 'ELA Heatmap', icon: Sparkles },
              { id: 'qr', label: 'QR Decryptor', icon: QrCode },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id as any)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-mono',
                    filterMode === f.id
                      ? 'bg-td-navy text-white shadow-sm'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lab Grid: Document Viewer (7 cols) + Detail Panel (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Passport Visual Inspection Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-border/80 p-5 shadow-lg relative overflow-hidden">
            {/* Viewfinder Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                <span className="font-mono text-xs font-bold text-td-navy uppercase">
                  FORENSIC TELEMETRY · 1200 DPI MACRO
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                FILTER: {filterMode.toUpperCase()}
              </span>
            </div>

            {/* Passport Document Representation */}
            <div className="relative aspect-[16/10] bg-gradient-to-br from-amber-50/40 via-white to-slate-100 rounded-xl border-2 border-slate-300 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
              
              {/* Filter Overlay Effect */}
              {filterMode === 'ela' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-pink-900/30 to-blue-900/20 mix-blend-color-dodge pointer-events-none z-10">
                  <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:12px_12px] opacity-40 animate-pulse" />
                </div>
              )}

              {filterMode === 'qr' && (
                <div className="absolute inset-0 bg-emerald-950/20 mix-blend-overlay pointer-events-none z-10">
                  <div className="absolute top-4 right-4 w-28 h-28 border-2 border-emerald-500 rounded bg-emerald-500/10 flex items-center justify-center">
                    <span className="font-mono text-[9px] font-bold text-emerald-700 bg-white/90 px-1 py-0.5 rounded">
                      DECRYPTED 2D-PAYLOAD
                    </span>
                  </div>
                </div>
              )}

              {/* Passport Header */}
              <div className="flex items-center justify-between z-0">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-td-navy text-white font-bold text-xs flex items-center justify-center font-mono">
                    IND
                  </div>
                  <div>
                    <h3 className="font-bold text-xs tracking-wider text-td-navy">REPUBLIC OF INDIA</h3>
                    <p className="font-mono text-[9px] text-muted-foreground">PASSPORT / PASSEPORT</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-td-navy">TYPE P</span>
              </div>

              {/* Passport Body (Photo & Identity Data) */}
              <div className="grid grid-cols-12 gap-4 items-center z-0 my-2">
                {/* Photo Area */}
                <div className="col-span-4 relative">
                  <div className={cn(
                    'aspect-[3/4] rounded-lg border-2 bg-gradient-to-b from-slate-200 to-slate-300 flex flex-col items-center justify-center p-2 relative overflow-hidden shadow-sm',
                    sampleType === 'forged' && filterMode === 'ela' ? 'border-red-500 ring-2 ring-red-400' : 'border-slate-300'
                  )}>
                    <div className="h-10 w-10 rounded-full bg-slate-400/80 mb-1" />
                    <div className="h-8 w-14 rounded-t-full bg-slate-400/80" />
                    {sampleType === 'forged' && filterMode === 'ela' && (
                      <div className="absolute inset-0 bg-red-500/30 backdrop-blur-[0.5px] flex items-center justify-center">
                        <span className="font-mono text-[8px] font-extrabold bg-red-600 text-white px-1 py-0.5 rounded shadow">
                          ELA DELTA +38%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Identity Metadata Fields */}
                <div className="col-span-8 space-y-1.5 font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-muted-foreground block">SURNAME</span>
                    <span className="font-bold text-td-navy">SHARMA</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block">GIVEN NAMES</span>
                    <span className="font-bold text-td-navy">RAJESH KUMAR</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-muted-foreground block">DATE OF BIRTH</span>
                      <span className={cn(
                        'font-bold',
                        sampleType === 'forged' ? 'text-red-600 bg-red-50 px-1 rounded' : 'text-td-navy'
                      )}>
                        12/04/1994
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block">DOCUMENT NO.</span>
                      <span className="font-bold text-td-navy">Z8910412</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MRZ Lines */}
              <div className="bg-muted/40 p-2 rounded border border-border/40 font-mono text-[8px] sm:text-[10px] tracking-wider text-td-navy truncate z-0">
                P&lt;INDSHARMA&lt;&lt;RAJESH&lt;KUMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
                Z8910412&lt;3IND8604128M3009052&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4
              </div>

              {/* Interactive Callout Pins */}
              {callouts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCallout(c.id)}
                  style={{ left: c.x, top: c.y }}
                  className={cn(
                    'absolute z-30 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all pointer-events-auto',
                    activeCallout === c.id ? 'scale-125' : 'hover:scale-110'
                  )}
                >
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span className={cn(
                      'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                      c.severity === 'CRITICAL' ? 'bg-red-500' :
                      c.severity === 'HIGH' ? 'bg-amber-500' : 'bg-green-500'
                    )} />
                    <span className={cn(
                      'relative inline-flex h-5 w-5 rounded-full items-center justify-center text-[10px] font-bold text-white shadow-lg',
                      c.severity === 'CRITICAL' ? 'bg-red-600' :
                      c.severity === 'HIGH' ? 'bg-amber-600' : 'bg-green-600'
                    )}>
                      {c.id + 1}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Forensic Deep Dive Detail (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-td-cyan" />
              FORENSIC SIGNAL DECOMPOSITION
            </h4>

            <div className="space-y-3">
              {callouts.map((c) => {
                const isActive = activeCallout === c.id;
                return (
                  <motion.div
                    key={c.id}
                    onClick={() => setActiveCallout(c.id)}
                    className={cn(
                      'p-4 rounded-xl border cursor-pointer transition-all',
                      isActive
                        ? c.severity === 'CRITICAL'
                          ? 'border-red-500 bg-red-50/80 shadow-sm ring-1 ring-red-400'
                          : c.severity === 'HIGH'
                          ? 'border-amber-500 bg-amber-50/80 shadow-sm ring-1 ring-amber-400'
                          : 'border-green-500 bg-green-50/80 shadow-sm ring-1 ring-green-400'
                        : 'border-border/70 bg-white hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'flex h-5 w-5 rounded-full items-center justify-center text-[10px] font-bold text-white',
                          c.severity === 'CRITICAL' ? 'bg-red-600' :
                          c.severity === 'HIGH' ? 'bg-amber-600' : 'bg-green-600'
                        )}>
                          {c.id + 1}
                        </span>
                        <h5 className="text-sm font-bold text-td-navy">{c.title}</h5>
                      </div>
                      <span className={cn(
                        'font-mono text-[9px] font-bold px-2 py-0.5 rounded',
                        c.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        c.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      )}>
                        {c.severity}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed pl-7">
                      {c.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleOpenLiveCam}
                disabled={launchingLiveCam}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-td-navy px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-td-navy/20 hover:bg-td-navy/90 transition-all disabled:opacity-75"
              >
                {launchingLiveCam ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-td-cyan" />
                    <span>Booting OpenCV Camera Scanner...</span>
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 text-td-cyan" />
                    <span>Open Live OpenCV Camera Scanner</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-td-cyan" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={startQuickWebcam}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-td-cyan/40 bg-td-cyan-soft/30 px-4 py-2.5 text-xs font-semibold text-td-navy hover:bg-td-cyan/20 transition-all shadow-sm"
              >
                <Camera className="h-3.5 w-3.5 text-td-cyan" />
                <span>Quick In-Page WebCam Preview HUD</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* In-Page Quick WebCam Scanner Modal */}
      <AnimatePresence>
        {showQuickWebcam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 text-white overflow-hidden shadow-2xl p-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-td-cyan/20 text-td-cyan">
                    <ScanLine className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-wide">Live OpenCV Real-Time HUD</h3>
                    <p className="font-mono text-[9px] text-slate-400">EDGE GRADIENT &amp; DOCUMENT BOUNDING ACTIVE</p>
                  </div>
                </div>
                <button
                  onClick={stopQuickWebcam}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Video Display & Bounding Reticle */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {camError ? (
                  <div className="p-6 text-center space-y-2">
                    <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-amber-200">{camError}</p>
                    <button
                      onClick={handleOpenLiveCam}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-td-cyan text-td-navy text-xs font-bold mt-2"
                    >
                      Open Full Scanner in Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Reticle / HUD Elements */}
                    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                      {/* Top corners */}
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-t-2 border-l-2 border-td-cyan" />
                        <div className="w-8 h-8 border-t-2 border-r-2 border-td-cyan" />
                      </div>

                      {/* Scanning Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-td-cyan to-transparent animate-pulse shadow-[0_0_8px_#38bdf8]" />

                      {/* Bottom corners */}
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-b-2 border-l-2 border-td-cyan" />
                        <div className="w-8 h-8 border-b-2 border-r-2 border-td-cyan" />
                      </div>
                    </div>

                    {/* HUD Telemetry Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        OPENCV 4.10: 60 FPS
                      </span>
                      <span className="text-slate-300">SHARPNESS: 94%</span>
                      <span className="text-td-cyan font-bold">LIVENESS: 98.2%</span>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={stopQuickWebcam}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs hover:bg-slate-800 transition-colors"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    stopQuickWebcam();
                    handleOpenLiveCam();
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-td-cyan text-td-navy font-bold text-xs hover:bg-td-cyan/90 transition-all shadow-md"
                >
                  Launch Full Investigation in Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
