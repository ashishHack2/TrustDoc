'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Cpu, Database, Key, CheckCircle2, FileCheck, Layers, GitBranch, ArrowRight } from 'lucide-react';

export default function CyberSecurityBlockchain() {
  return (
    <section id="security" className="relative py-20 lg:py-28 bg-muted/30 border-y border-border/70 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="font-mono text-[10px] tracking-[0.18em] text-td-cyan font-bold uppercase">
              ARCHITECTURAL INTEGRITY
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-td-navy"
          >
            CYBERSECURITY &amp; BLOCKCHAIN
            <br />
            <span className="text-td-cyan">DEFENSE-IN-DEPTH</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mt-4 text-[15px] text-muted-foreground leading-relaxed"
          >
            Engineered for high-stakes government and enterprise borders. Combining non-repudiable 
            cryptographic provenance with privacy-preserving on-chain proof of existence.
          </motion.p>
        </div>

        {/* Dual Pillar Grid: Cybersecurity vs Blockchain */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Pillar 1: Cybersecurity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border/80 bg-white p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-td-navy text-td-cyan shadow-md">
                  <Shield className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-td-navy">Zero-Trust Cybersecurity</h3>
                  <p className="font-mono text-[10px] tracking-wider text-muted-foreground">DEFENSIVE FORENSICS &amp; IAM</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-td-cyan" />
                    <span className="text-xs font-bold text-td-navy">SHA-256 Digital Fingerprinting</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Raw document binaries are digested upon ingestion. Strict chain of custody ensures zero-byte alteration from capture to final audit.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-td-cyan" />
                    <span className="text-xs font-bold text-td-navy">Error Level Analysis (ELA) Forensics</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evaluates compression quantization anomalies across 8x8 DCT blocks to uncover spliced faces, altered birthdates, and cloned text.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="h-4 w-4 text-td-cyan" />
                    <span className="text-xs font-bold text-td-navy">Granular Role-Based Access (RBAC)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cryptographically signed JWT sessions enforcing least-privilege boundaries between Admin, Operator, Reviewer, and Auditor roles.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">ISO/IEC 30107-3 PAD COMPLIANT</span>
              <span className="font-mono text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                ACTIVE DEFENSE
              </span>
            </div>
          </motion.div>

          {/* Pillar 2: Blockchain */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border/80 bg-white p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-td-navy text-td-cyan shadow-md">
                  <Database className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-td-navy">Privacy-Preserving Blockchain</h3>
                  <p className="font-mono text-[10px] tracking-wider text-muted-foreground">IMMUTABLE MERKLE ANCHORS &amp; DIDS</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-td-cyan-soft/30 border border-td-cyan/20">
                  <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="h-4 w-4 text-td-cyan" />
                    <span className="text-xs font-bold text-td-navy">Zero-PII Merkle Root Anchoring</span>
                  </div>
                  <p className="text-xs text-td-navy/80 leading-relaxed">
                    Zero personal data touches the chain. Only 32-byte cryptographic Merkle roots are committed, maintaining 100% GDPR and DPDP Act compliance.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCheck className="h-4 w-4 text-td-cyan" />
                    <span className="text-xs font-bold text-td-navy">W3C Verifiable Credentials (VC)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Emits tamper-evident, cryptographically verifiable credentials with Decentralized Identifiers (DIDs) verifiable across borders.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="h-4 w-4 text-td-cyan" />
                    <span className="text-xs font-bold text-td-navy">Smart Contract Revocation Registry</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enables instant global credential revocation via decentralized smart contracts without single-point-of-failure bottlenecks.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">POLYGON / ETHEREUM / HYPERLEDGER READY</span>
              <span className="font-mono text-[10px] font-bold text-td-cyan bg-td-cyan-soft/40 px-2 py-0.5 rounded border border-td-cyan/20">
                PROVABLY IMMUTABLE
              </span>
            </div>
          </motion.div>

        </div>

        {/* Live Security Architecture Callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-border/70 bg-td-navy p-6 lg:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-xs tracking-wider text-td-cyan font-semibold">PRODUCTION RUNTIME READY</span>
            </div>
            <h4 className="text-lg font-bold">FastAPI + Next.js 14 Integrated Verification Suite</h4>
            <p className="text-xs text-white/70 max-w-2xl">
              Connected via secure REST endpoints with explainable reason codes, ICAO 9303 MRZ modulus checksums, and biometric liveness scores.
            </p>
          </div>
          <a
            href="/auth"
            className="group shrink-0 inline-flex items-center gap-2 rounded-lg bg-td-cyan px-5 py-3 text-xs font-bold text-td-navy hover:bg-td-cyan/90 transition-all shadow-md shadow-td-cyan/20"
          >
            Access Security Console
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
