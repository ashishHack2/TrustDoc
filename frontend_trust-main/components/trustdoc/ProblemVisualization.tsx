'use client';

import { motion } from 'framer-motion';
import { ArrowDown, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TRADITIONAL_STEPS, TRUSTDOC_STEPS } from '@/lib/trustdoc-data';

export default function ProblemVisualization() {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Traditional check */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl border border-border/70 bg-white/60 p-6 lg:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
                  APPROACH A
                </span>
                <h3 className="mt-1 text-lg font-bold text-td-navy">TRADITIONAL CHECK</h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span className="font-mono text-[9px] tracking-wide text-amber-700">LIMITED EVIDENCE</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-0 py-4">
              {TRADITIONAL_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.12 }}
                    className={`rounded-lg border px-6 py-2.5 text-center min-w-[180px] ${
                      i === TRADITIONAL_STEPS.length - 1
                        ? 'border-green-200 bg-green-50'
                        : 'border-border bg-muted/40'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      i === TRADITIONAL_STEPS.length - 1 ? 'text-green-700' : 'text-foreground/70'
                    }`}>
                      {step}
                    </span>
                  </motion.div>
                  {i < TRADITIONAL_STEPS.length - 1 && (
                    <ArrowDown className="h-4 w-4 text-muted-foreground/40 my-0.5" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-amber-50/50 border border-amber-100 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-800 text-center">
                Single signal can be spoofed. No forensic depth. No biometric binding.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: TRUSTDOC pipeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-xl border-2 border-td-cyan/30 bg-gradient-to-b from-td-cyan-soft/20 to-white/60 p-6 lg:p-8 overflow-hidden"
          >
            {/* Accent corner */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-td-cyan/5 blur-2xl rounded-full" />

            <div className="flex items-center justify-between mb-6 relative">
              <div>
                <span className="font-mono text-[10px] tracking-[0.12em] text-td-cyan font-medium">
                  APPROACH B
                </span>
                <h3 className="mt-1 text-lg font-bold text-td-navy">TRUSTDOC</h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-td-cyan/30 bg-td-cyan-soft/40 px-3 py-1">
                <ShieldCheck className="h-3 w-3 text-td-cyan" />
                <span className="font-mono text-[9px] tracking-wide text-td-navy">EVIDENCE FUSION</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-0 py-2 relative">
              {TRUSTDOC_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: i * 0.06 }}
                    className={`rounded-lg border px-5 py-2 text-center min-w-[170px] ${
                      i === TRUSTDOC_STEPS.length - 1
                        ? 'border-td-cyan bg-td-navy text-white shadow-md shadow-td-cyan/20'
                        : 'border-td-cyan/20 bg-white/70'
                    }`}
                  >
                    <span className={`text-[13px] font-medium ${
                      i === TRUSTDOC_STEPS.length - 1 ? 'text-white' : 'text-td-navy'
                    }`}>
                      {step}
                    </span>
                  </motion.div>
                  {i < TRUSTDOC_STEPS.length - 1 && (
                    <ArrowDown className="h-3.5 w-3.5 text-td-cyan/50 my-0.5" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-td-cyan-soft/30 border border-td-cyan/15 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-td-cyan shrink-0" />
              <p className="text-xs text-td-navy text-center">
                Multiple independent evidence sources converge into a single trust decision.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
