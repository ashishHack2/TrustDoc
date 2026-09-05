'use client';

import { ShieldCheck, ExternalLink, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/80 bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-td-navy">
                <ShieldCheck className="h-4.5 w-4.5 text-td-cyan" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight text-td-navy">
                  TRUSTDOC
                </span>
                <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground mt-0.5">
                  IDENTITY VERIFICATION &amp; FORENSIC PLATFORM
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              High-assurance document intelligence platform combining physical credential forensics, 
              ICAO 9303 MRZ validation, biometric liveness, and cryptographic provenance for border control 
              and government verification.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>CORE API STATUS: ONLINE (v1.0.0)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-td-navy mb-4">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a href="#how-it-works" className="hover:text-td-navy transition-colors">9-Stage Pipeline</a>
              </li>
              <li>
                <a href="#security" className="hover:text-td-navy transition-colors">Cybersecurity &amp; Blockchain</a>
              </li>
              <li>
                <a href="/auth" className="hover:text-td-navy transition-colors">Operator Dashboard</a>
              </li>
              <li>
                <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-td-navy transition-colors inline-flex items-center gap-1">
                  API Swagger Docs <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-td-navy mb-4">Standards</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-td-cyan" />
                ICAO Doc 9303 (e-Passport)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-td-cyan" />
                ISO/IEC 30107-3 (Biometric PAD)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-td-cyan" />
                W3C Verifiable Credentials
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-td-cyan" />
                FIPS 180-4 SHA-256 Provenance
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TRUSTDOC. All rights reserved. Built for National Security &amp; Border Defense.</p>
          <div className="flex items-center gap-6">
            <a href="/auth" className="hover:text-td-navy transition-colors">Operator Portal</a>
            <a href="http://127.0.0.1:8000/health" target="_blank" rel="noopener noreferrer" className="hover:text-td-navy transition-colors">System Health</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
