'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, QrCode, AlertTriangle, CheckCircle2, Eye, ShieldAlert, Sparkles, ArrowRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingLab() {
  const [sampleType, setSampleType] = useState<'forged' | 'authentic'>('forged');
  const [filterMode, setFilterMode] = useState<'normal' | 'ela' | 'qr'>('ela');
  const [activeCallout, setActiveCallout] = useState<number | null>(0);

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

        {/* Interactive Document Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visualizer (7 cols) */}
          <div className="lg:col-span-7 relative rounded-2xl border-2 border-border/80 bg-td-navy/5 p-4 sm:p-6 overflow-hidden shadow-inner">
            <div className={cn(
              'relative rounded-xl border aspect-[1.58/1] overflow-hidden transition-all duration-500',
              filterMode === 'ela' ? 'bg-[#0f172a] shadow-2xl' : 'bg-white'
            )}>
              
              {/* ELA Heatmap Overlay */}
              {filterMode === 'ela' && (
                <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
                  {sampleType === 'forged' ? (
                    <div className="w-full h-full relative bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-950">
                      {/* Spliced Face Heatmap Spike */}
                      <div className="absolute left-[20%] top-[25%] w-32 h-36 rounded-2xl bg-radial from-red-500/80 via-pink-600/40 to-transparent blur-md animate-pulse" />
                      {/* Altered DOB Heatmap Spike */}
                      <div className="absolute left-[60%] top-[45%] w-36 h-12 rounded-lg bg-radial from-amber-400/80 via-orange-600/30 to-transparent blur-sm" />
                      <div className="absolute top-2 right-3 font-mono text-[9px] text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                        HIGH-FREQUENCY COMPRESSION ANOMALIES DETECTED
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                      <div className="font-mono text-[10px] text-emerald-400 font-semibold bg-emerald-950/50 px-3 py-1 rounded border border-emerald-800">
                        UNIFORM COMPRESSION ERROR DELTA &lt; 0.04 (NO LOCAL RESAVING)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* QR Code Decryption Overlay */}
              {filterMode === 'qr' && (
                <div className="absolute inset-0 z-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-white font-mono">
                  <div className="w-full max-w-sm rounded-xl border border-td-cyan/40 bg-td-navy/90 p-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="text-xs font-bold text-td-cyan flex items-center gap-1.5">
                        <QrCode className="h-4 w-4" /> 2D CRYPTOGRAPHIC BARCODE
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                        DECRYPTED
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-white/80">
                      <p><span className="text-white/40">NAME:</span> RAJESH K. SHARMA</p>
                      <p><span className="text-white/40">DOC NO:</span> Z8910412</p>
                      <p className={cn(sampleType === 'forged' ? 'text-red-400 font-bold' : '')}>
                        <span className="text-white/40">PAYLOAD DOB:</span> 1986-04-12 {sampleType === 'forged' && '(CONFLICT WITH PRINT: 1994)'}
                      </p>
                      <p><span className="text-white/40">DIGITAL SIGNATURE:</span> 0x8F3C...A129 (RSA-2048)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Visual Elements */}
              <div className="relative z-10 w-full h-full p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-td-navy/20 flex items-center justify-center font-bold text-xs">🏛️</div>
                    <span className="font-mono text-[10px] font-bold tracking-widest text-td-navy">REPUBLIC PASSPORT</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">ICAO DOC 9303</span>
                </div>

                {/* Body: Photo + Fields */}
                <div className="flex items-center gap-6 my-auto">
                  {/* Photo Box */}
                  <div className="w-24 sm:w-28 h-28 sm:h-32 rounded-lg bg-slate-300 border-2 border-slate-400/80 flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-slate-500 mb-1" />
                    <div className="w-16 h-8 rounded-t-xl bg-slate-500" />
                    <div className="absolute bottom-1 right-1 bg-amber-400/80 text-[8px] font-bold px-1 rounded">PORTRAIT</div>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-muted-foreground block">GIVEN NAMES</span>
                      <span className="font-bold text-td-navy">RAJESH KUMAR</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block">DATE OF BIRTH</span>
                      <span className={cn('font-bold', sampleType === 'forged' ? 'text-red-600 bg-red-50 px-1 rounded' : 'text-td-navy')}>
                        {sampleType === 'forged' ? '12 APR 1994 (TAMPERED)' : '12 APR 1986'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground block">DOCUMENT NO.</span>
                      <span className="font-bold text-td-navy">Z8910412</span>
                    </div>
                  </div>
                </div>

                {/* MRZ Lines */}
                <div className="bg-muted/40 p-2 rounded border border-border/40 font-mono text-[8px] sm:text-[10px] tracking-wider text-td-navy truncate">
                  P&lt;INDSHARMA&lt;&lt;RAJESH&lt;KUMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
                  Z8910412&lt;3IND8604128M3009052&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4
                </div>
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
                          ? 'border-red-500 bg-red-50/70 shadow-sm ring-1 ring-red-400'
                          : c.severity === 'HIGH'
                          ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-400'
                          : 'border-green-500 bg-green-50/70 shadow-sm ring-1 ring-green-400'
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

            {/* Link to Open Live Cam Scanner in Dashboard */}
            <div className="pt-2">
              <a
                href="/dashboard/live-cam"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-td-navy px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-td-navy/20 hover:bg-td-navy/90 transition-all"
              >
                Open Live OpenCV Camera Scanner
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-td-cyan" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
