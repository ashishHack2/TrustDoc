'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Camera,
  FileText,
  ScanText,
  AlignLeft,
  Search,
  ScanFace,
  Cpu,
  Layers,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { PIPELINE_STAGES } from '@/lib/trustdoc-data';

const ICONS: Record<string, LucideIcon> = {
  Camera,
  FileText,
  ScanText,
  AlignCheck: AlignLeft,
  Search,
  ScanFace,
  Cpu,
  Layers,
  ShieldCheck,
};

export default function PipelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-15" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="font-mono text-[10px] tracking-[0.15em] text-td-cyan font-medium">
              VERIFICATION PIPELINE
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-td-navy text-balance"
          >
            FROM DOCUMENT
            <br />
            TO IDENTITY TRUST
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mt-4 text-[15px] text-muted-foreground"
          >
            Every verification layer contributes evidence.
          </motion.p>
        </div>

        {/* Pipeline diagram */}
        <div className="relative">
          {/* Desktop: horizontal scroll pipeline */}
          <div className="hidden lg:block">
            <DesktopPipeline inView={inView} />
          </div>

          {/* Mobile/Tablet: vertical pipeline */}
          <div className="lg:hidden">
            <MobilePipeline inView={inView} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DesktopPipeline({ inView }: { inView: boolean }) {
  return (
    <div className="relative">
      {/* Connecting line */}
      <svg
        className="absolute top-[42px] left-0 right-0 w-full h-2 pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 2"
      >
        <line
          x1="0"
          y1="1"
          x2="100"
          y2="1"
          stroke="hsl(199 89% 48% / 0.2)"
          strokeWidth="0.5"
          strokeDasharray="1 1"
        />
      </svg>

      <div className="grid grid-cols-9 gap-1">
        {PIPELINE_STAGES.map((stage, i) => {
          const Icon = ICONS[stage.icon] || FileText;
          return (
            <motion.div
              key={stage.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative flex flex-col items-center group"
            >
              {/* Node */}
              <div className="relative z-10 mb-4">
                <div
                  className={`flex h-[84px] w-[84px] items-center justify-center rounded-xl border-2 bg-white transition-all duration-300 group-hover:border-td-cyan group-hover:shadow-lg group-hover:shadow-td-cyan/10 ${
                    i === PIPELINE_STAGES.length - 1
                      ? 'border-td-navy bg-td-navy'
                      : 'border-border'
                  }`}
                >
                  <Icon
                    className={`h-7 w-7 transition-colors ${
                      i === PIPELINE_STAGES.length - 1
                        ? 'text-td-cyan'
                        : 'text-td-navy group-hover:text-td-cyan'
                    }`}
                    strokeWidth={1.8}
                  />
                </div>
                {/* Number badge */}
                <div
                  className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                    i === PIPELINE_STAGES.length - 1
                      ? 'bg-td-cyan text-white'
                      : 'bg-td-navy text-white'
                  }`}
                >
                  {stage.num}
                </div>
                {/* Status dot */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-500/20 animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
              </div>

              {/* Title */}
              <div className="text-center px-1">
                <h4
                  className={`text-[11px] font-bold tracking-tight leading-tight ${
                    i === PIPELINE_STAGES.length - 1 ? 'text-td-navy' : 'text-td-navy'
                  }`}
                >
                  {stage.title}
                </h4>
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground hidden xl:block">
                  {stage.desc}
                </p>
              </div>

              {/* Data pulse particle */}
              {i < PIPELINE_STAGES.length - 1 && (
                <motion.div
                  className="absolute top-[42px] left-1/2 h-1.5 w-1.5 rounded-full bg-td-cyan"
                  initial={{ opacity: 0, x: 0 }}
                  animate={inView ? { opacity: [0, 1, 0], x: [0, 80, 160] } : {}}
                  transition={{
                    duration: 2,
                    delay: 0.8 + i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MobilePipeline({ inView }: { inView: boolean }) {
  return (
    <div className="relative pl-2">
      {/* Vertical line */}
      <div className="absolute left-[37px] top-2 bottom-2 w-px bg-gradient-to-b from-td-cyan/30 via-border to-td-cyan/30" />

      <div className="space-y-4">
        {PIPELINE_STAGES.map((stage, i) => {
          const Icon = ICONS[stage.icon] || FileText;
          return (
            <motion.div
              key={stage.num}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="relative flex items-start gap-4 group"
            >
              {/* Node */}
              <div className="relative z-10 shrink-0">
                <div
                  className={`flex h-[72px] w-[72px] items-center justify-center rounded-xl border-2 bg-white transition-all ${
                    i === PIPELINE_STAGES.length - 1
                      ? 'border-td-navy bg-td-navy'
                      : 'border-border'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      i === PIPELINE_STAGES.length - 1 ? 'text-td-cyan' : 'text-td-navy'
                    }`}
                    strokeWidth={1.8}
                  />
                </div>
                <div
                  className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] font-bold ${
                    i === PIPELINE_STAGES.length - 1
                      ? 'bg-td-cyan text-white'
                      : 'bg-td-navy text-white'
                  }`}
                >
                  {stage.num}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-3 pb-2">
                <h4 className="text-sm font-bold text-td-navy">{stage.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {stage.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
