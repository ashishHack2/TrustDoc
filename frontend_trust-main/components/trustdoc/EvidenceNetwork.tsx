'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { EVIDENCE_NODES, EVIDENCE_LINKS } from '@/lib/trustdoc-data';

export default function EvidenceNetwork() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });

  const nodeMap = Object.fromEntries(EVIDENCE_NODES.map((n) => [n.id, n]));

  return (
    <section ref={ref} className="relative bg-td-navy overflow-hidden py-20 lg:py-32">
      {/* Dark grid background */}
      <div className="absolute inset-0 dark-grid-bg opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-td-navy via-[hsl(222_47%_8%)] to-black" />

      {/* Subtle accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-td-cyan/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* LEFT: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="font-mono text-[10px] tracking-[0.15em] text-td-cyan font-medium">
                EVIDENCE FUSION
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white text-balance"
            >
              VERIFY WITH
              <br />
              <span className="text-td-cyan">EVIDENCE.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-6 space-y-1"
            >
              <p className="text-lg text-white/80">Not one signal.</p>
              <p className="text-lg text-white/80">Not one algorithm.</p>
              <p className="text-xl font-semibold text-td-cyan">A chain of evidence.</p>
            </motion.div>

            {/* Status indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              {['FUSION READY', 'CHAIN VERIFIED', 'TRUST SECURED'].map((label, i) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-td-cyan animate-pulse-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                  <span className="font-mono text-[9px] tracking-[0.1em] text-white/70">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Evidence network diagram */}
          <div className="relative h-[400px] lg:h-[480px]">
            <EvidenceNetworkSVG inView={inView} nodeMap={nodeMap} />
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidenceNetworkSVG({
  inView,
  nodeMap,
}: {
  inView: boolean;
  nodeMap: Record<string, (typeof EVIDENCE_NODES)[number]>;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Links */}
      {EVIDENCE_LINKS.map(([from, to], i) => {
        const f = nodeMap[from];
        const t = nodeMap[to];
        return (
          <motion.line
            key={`${from}-${to}-${i}`}
            x1={f.x}
            y1={f.y}
            x2={t.x}
            y2={t.y}
            stroke="hsl(199 89% 48% / 0.3)"
            strokeWidth={0.3}
            strokeDasharray="1 1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
          />
        );
      })}

      {/* Links to TRUST CORE (center at 50,50) */}
      {EVIDENCE_NODES.map((node, i) => (
        <motion.line
          key={`core-${node.id}`}
          x1={node.x}
          y1={node.y}
          x2={50}
          y2={50}
          stroke="hsl(199 89% 48% / 0.15)"
          strokeWidth={0.2}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 + i * 0.04 }}
        />
      ))}

      {/* Data pulse particles traveling to center */}
      {EVIDENCE_NODES.map((node, i) => (
        <motion.circle
          key={`particle-${node.id}`}
          r={0.5}
          fill="hsl(199 89% 60%)"
          initial={{ cx: node.x, cy: node.y, opacity: 0 }}
          animate={
            inView
              ? {
                  cx: [node.x, 50],
                  cy: [node.y, 50],
                  opacity: [0, 1, 0],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            delay: 1.2 + i * 0.1,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}

      {/* Nodes */}
      {EVIDENCE_NODES.map((node, i) => (
        <motion.g
          key={node.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r={3.5}
            fill="hsl(222 47% 14%)"
            stroke="hsl(199 89% 48% / 0.4)"
            strokeWidth={0.4}
          />
          <circle cx={node.x} cy={node.y} r={1} fill="hsl(199 89% 60%)" />
          <text
            x={node.x}
            y={node.y + 7}
            textAnchor="middle"
            fontSize="2.2"
            fill="hsl(0 0% 70%)"
            fontFamily="ui-monospace, monospace"
            fontWeight={600}
          >
            {node.label}
          </text>
        </motion.g>
      ))}

      {/* TRUST CORE center node */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <motion.circle
          cx={50}
          cy={50}
          r={6}
          fill="hsl(222 47% 11%)"
          stroke="hsl(199 89% 48%)"
          strokeWidth={0.6}
          animate={inView ? { r: [6, 6.8, 6] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <circle cx={50} cy={50} r={3} fill="hsl(199 89% 48%)" opacity={0.3} />
        <circle cx={50} cy={50} r={1.5} fill="hsl(199 89% 60%)" />
        <text
          x={50}
          y={50.5}
          textAnchor="middle"
          fontSize="2"
          fill="white"
          fontFamily="ui-monospace, monospace"
          fontWeight={700}
        >
          TRUST
        </text>
        <text
          x={50}
          y={53}
          textAnchor="middle"
          fontSize="2"
          fill="hsl(199 89% 70%)"
          fontFamily="ui-monospace, monospace"
          fontWeight={700}
        >
          CORE
        </text>
      </motion.g>

      {/* VERIFIED badge */}
      <motion.g
        initial={{ opacity: 0, y: 5 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 1.5 }}
      >
        <rect
          x={44}
          y={62}
          width={12}
          height={5}
          rx={1}
          fill="hsl(152 69% 40%)"
          opacity={0.9}
        />
        <text
          x={50}
          y={65.5}
          textAnchor="middle"
          fontSize="2.5"
          fill="white"
          fontFamily="ui-monospace, monospace"
          fontWeight={700}
        >
          VERIFIED
        </text>
      </motion.g>
    </svg>
  );
}
