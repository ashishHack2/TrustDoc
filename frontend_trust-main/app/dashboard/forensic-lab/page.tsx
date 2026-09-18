'use client';

import { useState, useRef } from 'react';
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
  ShieldAlert,
  Upload,
  Loader2,
  X,
  FileText
} from 'lucide-react';
import { inspectForensicImage, ForensicAnalysisResult, TamperPin } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ForensicLabPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode: Preset specimen vs Custom Upload
  const [activeMode, setActiveMode] = useState<'preset' | 'custom'>('preset');
  const [specimen, setSpecimen] = useState<'forged' | 'authentic'>('forged');
  const [activeLayer, setActiveLayer] = useState<'visible' | 'ela' | 'gradient' | 'qr'>('ela');
  const [selectedPin, setSelectedPin] = useState<number>(0);
  const [elaSensitivity, setElaSensitivity] = useState(85);

  // Custom File Forensic Analysis State
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customPreview, setCustomPreview] = useState<string | null>(null);
  const [analyzingCustom, setAnalyzingCustom] = useState(false);
  const [customResult, setCustomResult] = useState<ForensicAnalysisResult | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  const presetPins: TamperPin[] = specimen === 'forged' ? [
    {
      id: 0,
      title: 'Digital Portrait Face-Swap (Photoshop / GAN Splicing)',
      severity: 'CRITICAL',
      layer: 'ELA & Compression Quantization',
      coords: { x: '24%', y: '42%' },
      summary: 'Error Level Analysis (ELA) reveals massive quantization error delta (39.4% vs 4.1% baseline). Spliced edges indicate paste insertion over original laminate substrate.',
      recommendation: 'REJECT: Primary biometric field spliced. Suspected identity theft.',
    },
    {
      id: 1,
      title: 'Altered Expiration & Birth Date (VIZ Manipulation)',
      severity: 'CRITICAL',
      layer: 'Typography & Kerning Grid',
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
      title: 'Authentic Photo Substrate & Single Compression',
      severity: 'PASSED',
      layer: 'Error Level Analysis (ELA)',
      coords: { x: '24%', y: '42%' },
      summary: 'Uniform 8x8 DCT compression error levels across portrait and card surface (< 3.8% variance). Zero local digital resaving detected.',
      recommendation: 'VALIDATED: Authentic digital capture matching sensor noise profile.',
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

  const currentPins = activeMode === 'custom' && customResult ? customResult.tamper_pins : presetPins;
  const activePinData = currentPins.find(p => p.id === selectedPin) || currentPins[0];

  const handleCustomFileUpload = async (file: File) => {
    setCustomFile(file);
    setCustomError(null);
    setCustomResult(null);
    setSelectedPin(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setAnalyzingCustom(true);
    const { data, error } = await inspectForensicImage(file);
    setAnalyzingCustom(false);

    if (error || !data) {
      setCustomError(error || 'Forensic analysis failed');
    } else {
      setCustomResult(data);
    }
  };

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
            Error Level Analysis (ELA), edge gradient variance, microprint line continuity, and cryptographic token verification.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-border p-1.5 shadow-sm">
          <button
            onClick={() => { setActiveMode('preset'); setSpecimen('forged'); setSelectedPin(0); }}
            className={cn(
              'px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5',
              activeMode === 'preset' && specimen === 'forged'
                ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                : 'text-muted-foreground hover:text-td-navy'
            )}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Forged Sample
          </button>
          <button
            onClick={() => { setActiveMode('preset'); setSpecimen('authentic'); setSelectedPin(0); }}
            className={cn(
              'px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5',
              activeMode === 'preset' && specimen === 'authentic'
                ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                : 'text-muted-foreground hover:text-td-navy'
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Authentic Sample
          </button>
          <button
            onClick={() => {
              setActiveMode('custom');
              if (!customFile) fileInputRef.current?.click();
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5',
              activeMode === 'custom'
                ? 'bg-td-navy text-white shadow-md'
                : 'text-muted-foreground hover:text-td-navy'
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            Inspect Your Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleCustomFileUpload(e.target.files[0])}
            className="hidden"
          />
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
            
            {/* Custom File Loading State */}
            {activeMode === 'custom' && analyzingCustom && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-td-cyan" />
                <p className="font-mono text-xs tracking-wider">COMPUTING DCT ERROR LEVEL QUANTIZATION...</p>
              </div>
            )}

            {/* Visual Screen Container */}
            <div className={cn(
              'relative rounded-xl border aspect-[1.58/1] overflow-hidden transition-all duration-300',
              activeLayer === 'visible' ? 'bg-white' : 'bg-slate-950'
            )}>

              {/* Custom Image Mode */}
              {activeMode === 'custom' && customPreview && (
                <div className="w-full h-full relative">
                  {activeLayer === 'visible' && (
                    <img src={customPreview} alt="Custom Document" className="w-full h-full object-contain" />
                  )}
                  {activeLayer === 'ela' && (
                    customResult?.ela_heatmap_b64 ? (
                      <img src={customResult.ela_heatmap_b64} alt="ELA Heatmap" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-mono text-muted-foreground">
                        Calculating ELA Heatmap...
                      </div>
                    )
                  )}
                  {activeLayer === 'gradient' && (
                    <div className="w-full h-full filter contrast-200 invert grayscale">
                      <img src={customPreview} alt="Gradient Edge" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {activeLayer === 'qr' && (
                    <div className="w-full h-full bg-slate-900 p-6 flex flex-col justify-center items-center text-center text-white font-mono">
                      <QrCode className="h-16 w-16 text-td-cyan mb-2" />
                      <p className="text-sm font-bold">2D BARCODE &amp; PKI VALIDATION</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MRZ Bands Detected: {customResult?.mrz.bands || 0} · Regularity: {Math.round((customResult?.mrz.regular || 0) * 100)}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Preset Specimen Mode */}
              {activeMode === 'preset' && (
                <>
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
                            className="absolute left-[58%] top-[38%] w-48 h-10 rounded-lg bg-radial from-purple-500 via-pink-600/60 to-transparent blur-sm animate-pulse"
                            style={{ opacity: elaSensitivity / 100 }}
                          />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-blue-950/20 flex items-center justify-center">
                          <span className="font-mono text-xs text-cyan-400">UNIFORM SINGLE COMPRESSION (PASS)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Layer 3: Gradient Edge & High-Frequency Noise */}
                  {activeLayer === 'gradient' && (
                    <div className="w-full h-full relative bg-slate-900 p-6 flex items-center justify-center font-mono text-xs text-white">
                      <span>GRADIENT LAPLACIAN EDGE RESPONSE FILTER</span>
                    </div>
                  )}

                  {/* Layer 4: Cryptographic QR Decrypt */}
                  {activeLayer === 'qr' && (
                    <div className="w-full h-full bg-slate-950 p-6 flex flex-col justify-center items-center text-center text-white font-mono">
                      <QrCode className="h-16 w-16 text-td-cyan mb-2" />
                      <p className="text-sm font-bold">2D BARCODE PKI DECRYPTION</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Public-key Signature: 0x8F92... Validated against National Trust Ledger
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Pinpoint Annotations Overlay */}
              {currentPins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => setSelectedPin(pin.id)}
                  style={{ left: pin.coords.x, top: pin.coords.y }}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all z-20 shadow-lg',
                    selectedPin === pin.id ? 'w-8 h-8 scale-110 ring-4' : 'w-6 h-6 hover:scale-105',
                    pin.severity === 'CRITICAL'
                      ? 'bg-red-600 text-white ring-red-400/50'
                      : pin.severity === 'HIGH'
                      ? 'bg-amber-500 text-white ring-amber-400/50'
                      : 'bg-green-600 text-white ring-green-400/50'
                  )}
                >
                  <span className="font-mono text-[10px] font-bold">{pin.id + 1}</span>
                </button>
              ))}

            </div>
          </div>

        </div>

        {/* Telemetry & Pinpoint Evidence Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Pinpoint Card */}
          {activePinData && (
            <div className="rounded-xl border-2 border-border/80 bg-white p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className={cn(
                  'font-mono text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase',
                  activePinData.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                  activePinData.severity === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-green-100 text-green-700 border border-green-200'
                )}>
                  {activePinData.severity} ANOMALY
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  PIN #{activePinData.id + 1}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-td-navy">
                  {activePinData.title}
                </h3>
                <p className="text-[11px] text-td-cyan font-mono mt-0.5">
                  Layer: {activePinData.layer}
                </p>
              </div>

              <div className="text-xs text-foreground/80 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/60">
                {activePinData.summary}
              </div>

              <div className="text-xs font-semibold text-red-700 bg-red-50/70 p-3 rounded-lg border border-red-100">
                {activePinData.recommendation}
              </div>
            </div>
          )}

          {/* Pinpoint Selector List */}
          <div className="rounded-xl border border-border/80 bg-white p-4 space-y-2 shadow-sm font-mono text-xs">
            <h4 className="font-bold text-td-navy uppercase tracking-wider text-[11px] mb-3">
              Tamper Evidence Ledger ({currentPins.length})
            </h4>

            {currentPins.map((pin) => (
              <button
                key={pin.id}
                onClick={() => setSelectedPin(pin.id)}
                className={cn(
                  'w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all',
                  selectedPin === pin.id
                    ? 'border-td-cyan bg-td-cyan-soft/30 font-bold text-td-navy'
                    : 'border-border/60 hover:bg-muted/20 text-muted-foreground'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white shrink-0',
                    pin.severity === 'CRITICAL' ? 'bg-red-600' : (pin.severity === 'HIGH' ? 'bg-amber-500' : 'bg-green-600')
                  )}>
                    {pin.id + 1}
                  </span>
                  <span className="truncate">{pin.title}</span>
                </div>
                <span className="text-[10px] uppercase shrink-0">{pin.severity}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
