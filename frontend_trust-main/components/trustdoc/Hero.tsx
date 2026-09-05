'use client';

import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, ScanLine, CheckCircle2, Activity } from 'lucide-react';
import {
  HERO_METRICS,
  TRUST_INDICATORS,
  CALLOUTS,
  STATUS_PANEL_ITEMS,
} from '@/lib/trustdoc-data';
import { cn } from '@/lib/utils';

const Hero3D = lazy(() => import('./Hero3D'));

const SCAN_STATES = ['CAPTURE', 'ANALYZING', 'VERIFYING'] as const;

export default function Hero() {
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const handleStart = () => {
    if (scanning) return;
    setScanning(true);
    setScanStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < SCAN_STATES.length) {
        setScanStep(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setScanning(false);
          setScanStep(0);
        }, 1200);
      }
    }, 1100);
  };

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden pt-14">
      {/* Background: subtle grid + dots */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 dot-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Subtle accent glow */}
      <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-td-cyan/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)]">
          {/* LEFT: 45% */}
          <div className="flex flex-col justify-center py-12 lg:py-0 lg:w-[45%] lg:pr-8">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-td-cyan/30 bg-td-cyan-soft/40 px-3 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-td-cyan opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-td-cyan" />
                </span>
                <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-td-navy">
                  GOVERNMENT &amp; BORDER DEFENSE INFRASTRUCTURE
                </span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight text-td-navy text-balance"
            >
              VERIFY THE DOCUMENT.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">PROVE THE IDENTITY.</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-td-cyan/15 -z-0" />
              </span>
            </motion.h1>

            {/* Supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground"
            >
              TRUSTDOC combines document intelligence, forensic analysis,
              biometric verification and authorized validation into one
              evidence-driven identity verification platform.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={handleStart}
                disabled={scanning}
                className={cn(
                  'group inline-flex items-center justify-center gap-2 rounded-lg bg-td-navy px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-td-navy/20 disabled:opacity-80',
                )}
              >
                {scanning ? (
                  <>
                    <ScanLine className="h-4 w-4 animate-pulse" />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={scanStep}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="font-mono tracking-wide"
                      >
                        {SCAN_STATES[scanStep]}…
                      </motion.span>
                    </AnimatePresence>
                  </>
                ) : (
                  <>
                    START VERIFICATION
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              <a
                href="#how-it-works"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-td-navy transition-all hover:border-td-navy/30 hover:bg-muted/50"
              >
                <Play className="h-3.5 w-3.5" />
                EXPLORE HOW IT WORKS
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {TRUST_INDICATORS.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-td-cyan" />
                  <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: 55% — 3D visual */}
          <div className="relative flex-1 lg:w-[55%] min-h-[420px] lg:min-h-0">
            <Suspense fallback={<Hero3DFallback />}>
              <Hero3D scanning={scanning} />
            </Suspense>

            {/* Callout labels around the document */}
            <Callouts />

            {/* Status panel */}
            <StatusPanel scanning={scanning} />
          </div>
        </div>

        {/* Bottom metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="border-t border-border/60 py-5 mt-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 rounded-lg overflow-hidden">
            {HERO_METRICS.map((m) => (
              <div key={m.label} className="bg-background/60 px-4 py-3 text-center md:text-left">
                <div className="font-mono text-xl font-bold text-td-navy">{m.value}</div>
                <div className="font-mono text-[9px] tracking-[0.12em] text-muted-foreground mt-1">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Callouts() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      {CALLOUTS.map((c, i) => {
        const isLeft = c.side === 'left';
        const posStyles: Record<string, string> = {
          top: 'top-[18%]',
          middle: 'top-[42%]',
          bottom: 'top-[68%]',
        };
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
            className={cn(
              'absolute flex items-center gap-2',
              posStyles[c.position],
              isLeft ? 'left-2 lg:left-4' : 'right-2 lg:right-4',
              isLeft ? 'flex-row' : 'flex-row-reverse',
            )}
          >
            {/* Label */}
            <div
              className={cn(
                'flex flex-col rounded-md border border-border/70 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 shadow-sm',
                isLeft ? 'items-start' : 'items-end',
              )}
            >
              <span className="font-mono text-[8px] tracking-[0.1em] text-muted-foreground">
                {c.label}
              </span>
              <span className="font-mono text-[11px] font-semibold text-td-navy">
                {c.value}
              </span>
            </div>
            {/* Connector line */}
            <div className="h-px w-8 bg-gradient-to-r from-td-cyan/40 to-transparent" />
            {/* Dot */}
            <div className="h-1.5 w-1.5 rounded-full bg-td-cyan ring-2 ring-td-cyan/20" />
          </motion.div>
        );
      })}
    </div>
  );
}

function StatusPanel({ scanning }: { scanning: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="absolute bottom-4 right-2 lg:right-6 w-52 rounded-lg border border-border/70 bg-white/90 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-td-navy">
          TRUSTDOC ENGINE
        </span>
        <div className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full', scanning ? 'bg-amber-400 animate-pulse-dot' : 'bg-green-500')} />
          <span className="font-mono text-[8px] tracking-wide text-muted-foreground">
            {scanning ? 'SCANNING' : 'SYSTEM ONLINE'}
          </span>
        </div>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {STATUS_PANEL_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[11px] text-foreground/70">{item.label}</span>
            <div className="flex items-center gap-1">
              <Activity className="h-2.5 w-2.5 text-green-500" />
              <span className="font-mono text-[9px] tracking-wide text-green-600">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Hero3DFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-24 w-24 rounded-full border-2 border-td-cyan/20 border-t-td-cyan animate-spin" />
    </div>
  );
}
