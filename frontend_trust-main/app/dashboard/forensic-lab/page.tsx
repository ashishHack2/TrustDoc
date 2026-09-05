'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Microscope,
  Eye,
  Sparkles,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Zap,
  Sliders,
  Maximize2,
  Download,
  Fingerprint,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ForensicLabPage() {
  const [specimen, setSpecimen] = useState<'forged' | 'authentic'>('forged');
  const [activeLayer, setActiveLayer] = useState<'visible' | 'ela' | 'gradient' | 'qr'>('ela');
  const [selectedPin, setSelectedPin] = useState<number>(0);
  const [elaSensitivity, setElaSensitivity] = useState(85);

  const pins = specimen === 'forged' ? [
    {
      id: 0,
      title: 'Digital Portrait Face-Swap (Photoshop)',
      severity: 'CRITICAL',
      layer: 'ELA & Compression Delta',
      coords: { x: '24%', y: '42%' },
      summary: 'Error Level Analysis (ELA) reveals massive quantization error delta (39.4% vs 4.1% baseline). Spliced edges indicate paste insertion over original laminate substrate.',
      recommendation: 'REJECT: Primary biometric field spliced. Suspected identity theft.',
    },
    {
      id: 1,
      title: 'Altered Expiration & Birth Date',
      severity: 'CRITICAL',
      layer: 'Typography & Kerning',
      coords: { x: '65%', y: '44%' },
      summary: 'Font stroke width is 1.8pt vs official government standard 2.4pt. Kerning spacing is inconsistent. ICAO 9303 Line 2 check digit calculation failed.',
      recommendation: 'REJECT: Mathematical checksum violation in MRZ payload.',
    },
    {
      id: 2,
      title: 'Cryptographic QR Code Payload Conflict',
      severity: 'CRITICAL',
      layer: '2D Barcode Decryption',
      coords: { x: '82%', y: '24%' },
      summary: 'Public-key encrypted 2D barcode decodes to "DOB: 1986-04-12 | EXP: 2026-04-12", but printed visual inspection text was altered to claim "1994-04-12 | EXP: 2034".',
      recommendation: 'REJECT: Physical print contradicts cryptographically signed QR token.',
    },
    {
      id: 3,
      title: 'Broken Guilloche Microprint Line',
      severity: 'HIGH',
      layer: 'Vector Line Continuity',
      coords: { x: '42%', y: '68%' },
      summary: '0.08mm fine-line security wave pattern exhibits pixelation and blurring around photo border. Typical of low-resolution laser/inkjet reprint attacks.',
      recommendation: 'MANUAL REVIEW: Microprinting boundary disruption detected.',
    }
  ] : [
    {
      id: 0,
      title: 'Authentic Photo Substrate',
      severity: 'PASSED',
      layer: 'Error Level Analysis',
      coords: { x: '24%', y: '42%' },
      summary: 'Uniform 8x8 DCT compression error levels across portrait and card surface (< 3.8% variance). Zero local digital resaving detected.',
      recommendation: 'VALIDATED: Authentic digital capture.',
    },
    {
      id: 1,
      title: 'ICAO 9303 Checksum Validated',
      severity: 'PASSED',
      layer: 'Mathematical Modulus-10',
      coords: { x: '65%', y: '44%' },
      summary: 'All three check digits (Doc No, DOB, Expiry Date) pass 7-3-1 weight algorithms. Strict parity with visual inspection text.',
      recommendation: 'VALIDATED: 100% mathematical integrity.',
    },
    {
      id: 2,
      title: 'Cryptographic QR Verified',
      severity: 'PASSED',
      layer: 'Public Key Infrastructure (PKI)',
      coords: { x: '82%', y: '24%' },
      summary: 'Digital signature on 2D barcode matches Ministry Root CA. Payload hashes match visual document text with 100% consistency.',
      recommendation: 'VALIDATED: Sovereign digital certificate confirmed.',
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-td-cyan animate-pulse" />
            <span className="font-mono text-xs font-bold text-td-cyan tracking-wider uppercase">
              DEEP DIGITAL FORENSICS &amp; TAMPER HEATMAPS
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-td-navy flex items-center gap-3">
            <Microscope className="h-7 w-7 text-td-navy" />
            Forensic Lab &amp; Visual Tamper Inspector
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze physical-to-digital forgery, compression quantization anomalies, and cryptographic QR payload conflicts.
          </p>
        </div>

        {/* Specimen Switcher */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-border p-1.5 shadow-sm">
          <button
            onClick={() => { setSpecimen('forged'); setSelectedPin(0); }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5',
              specimen === 'forged'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-muted-foreground hover:text-td-navy'
            )}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Forged Specimen (Tampered)
          </button>
          <button
            onClick={() => { setSpecimen('authentic'); setSelectedPin(0); }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5',
              specimen === 'authentic'
                ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                : 'text-muted-foreground hover:text-td-navy'
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Authentic e-Passport Specimen
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Visualizer Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Layer Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-border/80 p-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'visible', label: 'Visible Spectrum', icon: Eye },
                { id: 'ela', label: 'Error Level (ELA)', icon: Sparkles },
                { id: 'gradient', label: 'Gradient Edge', icon: Layers },
                { id: 'qr', label: 'QR Payload Decrypt', icon: QrCode },
              ].map((layer) => {
                const Icon = layer.icon;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayer(layer.id as any)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all',
                      activeLayer === layer.id
                        ? 'bg-td-navy text-white shadow-sm'
                        : 'bg-muted/30 text-muted-foreground hover:bg-muted/60'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {layer.label}
                  </button>
                );
              })}
            </div>

            {activeLayer === 'ela' && (
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span>ELA Gain:</span>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={elaSensitivity}
                  onChange={(e) => setElaSensitivity(Number(e.target.value))}
                  className="w-20 accent-td-cyan"
                />
                <span className="font-bold text-td-navy">{elaSensitivity}%</span>
              </div>
            )}
          </div>

          {/* Interactive Inspection Canvas */}
          <div className="relative rounded-2xl border-2 border-border/80 bg-slate-950 p-6 overflow-hidden shadow-2xl">
            
            {/* Visual Screen Container */}
            <div className={cn(
              'relative rounded-xl border aspect-[1.58/1] overflow-hidden transition-all duration-300',
              activeLayer === 'visible' ? 'bg-white' : 'bg-slate-950'
            )}>

              {/* Layer 1: Visible Spectrum View */}
              {activeLayer === 'visible' && (
                <div className="w-full h-full p-6 flex flex-col justify-between text-td-navy font-mono select-none">
                  <div className="flex justify-between items-center border-b pb-2 border-slate-200">
                    <span className="font-bold text-sm">PASSPORT · REPUBLIC OF INDIA</span>
                    <span className="text-xs text-muted-foreground">ICAO DOC 9303 / TYPE 3</span>
                  </div>
                  <div className="flex items-center gap-6 my-auto">
                    <div className="w-28 h-32 rounded-lg bg-slate-300 border-2 border-slate-400 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="w-12 h-12 rounded-full bg-slate-500 mb-1" />
                      <div className="w-18 h-10 rounded-t-xl bg-slate-500" />
                      <span className="absolute bottom-1 right-1 bg-amber-400 text-[8px] font-bold px-1 rounded">PORTRAIT</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <p><span className="text-muted-foreground">NAME:</span> <strong>SINGH, GURPREET</strong></p>
                      <p><span className="text-muted-foreground">NATIONALITY:</span> <strong>IND</strong></p>
                      <p>
                        <span className="text-muted-foreground">DOB:</span>{' '}
                        <strong className={specimen === 'forged' ? 'text-red-600 bg-red-50 px-1 rounded' : ''}>
                          {specimen === 'forged' ? '14 NOV 1994 (ALTERED)' : '14 NOV 1991'}
                        </strong>
                      </p>
                      <p><span className="text-muted-foreground">PASSPORT NO:</span> <strong>P9821401</strong></p>
                      <p><span className="text-muted-foreground">EXPIRY:</span> <strong>22 AUG 2031</strong></p>
                    </div>
                  </div>
                  <div className="bg-slate-100 p-2 rounded border font-mono text-[9px] sm:text-[11px] tracking-wider text-slate-800">
                    P&lt;INDSINGH&lt;&lt;GURPREET&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
                    P9821401&lt;4IND9111142M3108225&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04
                  </div>
                </div>
              )}

              {/* Layer 2: ELA (Error Level Analysis) Heatmap */}
              {activeLayer === 'ela' && (
                <div className="w-full h-full relative bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 p-6 flex flex-col justify-between">
                  {specimen === 'forged' ? (
                    <>
                      {/* Spliced Face Heatmap Spike */}
                      <div
                        className="absolute left-[18%] top-[22%] w-36 h-40 rounded-2xl bg-radial from-red-500 via-pink-600/50 to-transparent blur-md animate-pulse"
                        style={{ opacity: elaSensitivity / 100 }}
                      />
                      {/* Altered Date Heatmap Spike */}
                      <div
                        className="absolute left-[54%] top-[40%] w-44 h-12 rounded-lg bg-radial from-amber-400 via-red-600/40 to-transparent blur-sm animate-pulse"
                        style={{ opacity: elaSensitivity / 100 }}
                      />
                      <div className="relative z-10 flex justify-between text-xs font-mono text-red-400 font-bold">
                        <span>[HIGH-PASS DCT RESIDUAL ERROR]</span>
                        <span>RESAVING VARIANCE: +38.4% (CRITICAL)</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center font-mono text-xs text-emerald-400">
                      <CheckCircle2 className="h-10 w-10 mb-2 opacity-80" />
                      <p className="font-bold">HOMOGENEOUS ERROR DISTRIBUTION</p>
                      <p className="text-[10px] text-white/50 mt-1">Variance delta &lt; 0.038 across all image block planes</p>
                    </div>
                  )}
                  <div className="relative z-10 text-[9px] font-mono text-white/40">
                    ELA ENGINE: QUANTIZATION MATRIX DQT[0]=16 DQT[1]=11
                  </div>
                </div>
              )}

              {/* Layer 3: Gradient Edge Derivative */}
              {activeLayer === 'gradient' && (
                <div className="w-full h-full bg-black p-6 flex flex-col justify-between font-mono text-xs text-cyan-400 relative">
                  <div className="flex justify-between text-[10px] text-cyan-300">
                    <span>SOBEL EDGE DETECTOR</span>
                    <span>SEAM DISCONTINUITY INDEX</span>
                  </div>
                  {specimen === 'forged' && (
                    <div className="absolute left-[20%] top-[25%] w-32 h-36 border-2 border-dashed border-red-500 bg-red-500/10 flex items-center justify-center">
                      <span className="text-[9px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-700">
                        CLONE SEAM CUT
                      </span>
                    </div>
                  )}
                  <div className="text-[9px] text-white/30">
                    LAPLACIAN GRADIENT GAIN: 2.4X
                  </div>
                </div>
              )}

              {/* Layer 4: QR Code Cryptographic Decryption */}
              {activeLayer === 'qr' && (
                <div className="w-full h-full bg-slate-950 p-6 flex items-center justify-center font-mono text-xs text-white">
                  <div className="w-full max-w-md rounded-xl border border-td-cyan/40 bg-td-navy/90 p-5 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="font-bold text-td-cyan flex items-center gap-1.5 text-xs">
                        <QrCode className="h-4 w-4" /> 2D CRYPTOGRAPHIC PAYLOAD DECODER
                      </span>
                      <span className={cn(
                        'text-[9px] px-2 py-0.5 rounded font-bold',
                        specimen === 'forged' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-green-500/20 text-green-400 border border-green-500/40'
                      )}>
                        {specimen === 'forged' ? 'HASH MISMATCH' : 'VALID SIGNATURE'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-white/80">
                      <p><span className="text-white/40">NAME:</span> GURPREET SINGH</p>
                      <p><span className="text-white/40">QR SIGNED DOB:</span> <strong className="text-green-400">14 NOV 1991</strong></p>
                      <p><span className="text-white/40">PRINTED VIZ DOB:</span> <strong className={specimen === 'forged' ? 'text-red-400 underline' : 'text-green-400'}>{specimen === 'forged' ? '14 NOV 1994 (CONFLICT)' : '14 NOV 1991'}</strong></p>
                      <p><span className="text-white/40">DIGITAL SIGNATURE:</span> 0x932A...B411 (RSA-PSS 2048)</p>
                      <p><span className="text-white/40">CERTIFICATE CHAIN:</span> MINISTRY ROOT CA (PASS)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Pinpoint Badges */}
              {pins.map((pin) => {
                const isSelected = selectedPin === pin.id;
                return (
                  <button
                    key={pin.id}
                    onClick={() => setSelectedPin(pin.id)}
                    style={{ left: pin.coords.x, top: pin.coords.y }}
                    className={cn(
                      'absolute z-30 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all',
                      isSelected ? 'scale-125' : 'hover:scale-110'
                    )}
                  >
                    <span className="relative flex h-7 w-7 items-center justify-center">
                      <span className={cn(
                        'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                        pin.severity === 'CRITICAL' ? 'bg-red-500' :
                        pin.severity === 'HIGH' ? 'bg-amber-500' : 'bg-green-500'
                      )} />
                      <span className={cn(
                        'relative inline-flex h-6 w-6 rounded-full items-center justify-center text-xs font-bold font-mono text-white shadow-xl ring-2',
                        pin.severity === 'CRITICAL' ? 'bg-red-600 ring-red-300' :
                        pin.severity === 'HIGH' ? 'bg-amber-600 ring-amber-300' : 'bg-green-600 ring-green-300'
                      )}>
                        {pin.id + 1}
                      </span>
                    </span>
                  </button>
                );
              })}

            </div>
          </div>
        </div>

        {/* Forensic Signal Deep-Dive (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-border/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-td-navy flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Fingerprint className="h-4 w-4 text-td-cyan" />
                Selected Forensic Signal
              </span>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded font-bold',
                pins[selectedPin]?.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                pins[selectedPin]?.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              )}>
                {pins[selectedPin]?.severity}
              </span>
            </h3>

            <div className="p-3.5 rounded-lg bg-muted/20 border border-border/60 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 rounded-full bg-td-navy text-white text-xs font-bold items-center justify-center">
                  {selectedPin + 1}
                </span>
                <h4 className="text-sm font-bold text-td-navy">{pins[selectedPin]?.title}</h4>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {pins[selectedPin]?.summary}
              </p>
              <div className="pt-2 border-t border-border/40 text-[11px] font-mono font-bold text-red-700 flex items-center gap-1">
                <span>ACTION:</span>
                <span>{pins[selectedPin]?.recommendation}</span>
              </div>
            </div>

            {/* List of All Signal Pins */}
            <div className="space-y-2 pt-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block">
                ALL DETECTED ANOMALY PINPOINTS:
              </span>
              {pins.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPin(p.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-mono transition-all',
                    selectedPin === p.id
                      ? 'border-td-cyan bg-td-cyan-soft/20 text-td-navy font-bold'
                      : 'border-border/60 bg-white hover:bg-muted/30 text-muted-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-60">#{p.id + 1}</span>
                    <span className="truncate max-w-[190px]">{p.title}</span>
                  </div>
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0',
                    p.severity === 'CRITICAL' ? 'text-red-700 bg-red-100' :
                    p.severity === 'HIGH' ? 'text-amber-700 bg-amber-100' : 'text-green-700 bg-green-100'
                  )}>
                    {p.severity}
                  </span>
                </button>
              ))}
            </div>

            {/* Link to Open Live Cam Scanner */}
            <a
              href="/dashboard/live-cam"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-td-navy px-4 py-3 text-xs font-bold text-white shadow-md shadow-td-navy/20 hover:bg-td-navy/90 transition-all"
            >
              Open Live OpenCV Webcam Scanner
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-td-cyan" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
