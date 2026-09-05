'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function WhyTrustDoc() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
        >
          <span className="font-mono text-[10px] tracking-[0.15em] text-td-cyan font-medium">
            WHY TRUSTDOC
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-td-navy text-balance"
        >
          A DOCUMENT CAN LOOK REAL.
          <br />
          <span className="text-muted-foreground">THAT DOESN&apos;T MAKE IT AUTHENTIC.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 mx-auto max-w-2xl text-[15px] leading-relaxed text-muted-foreground"
        >
          Traditional verification often checks isolated signals. TRUSTDOC
          evaluates multiple independent evidence sources before producing a
          trust decision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          <span className="font-mono text-[10px] tracking-[0.08em] text-amber-700">
            LIMITED EVIDENCE IS NOT ENOUGH
          </span>
        </motion.div>
      </div>
    </section>
  );
}
