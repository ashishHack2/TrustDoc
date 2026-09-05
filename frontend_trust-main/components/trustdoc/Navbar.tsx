'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { NAV_LINKS } from '@/lib/trustdoc-data';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-border/60'
            : 'bg-background/40 backdrop-blur-sm border-b border-transparent',
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Logo */}
            <a href="#hero" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-td-navy">
                <ShieldCheck className="h-4.5 w-4.5 text-td-cyan" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-tight text-td-navy">
                  TRUSTDOC
                </span>
                <span className="font-mono text-[8px] tracking-[0.15em] text-muted-foreground mt-0.5 hidden sm:block">
                  DOCUMENT &amp; IDENTITY INTELLIGENCE
                </span>
              </div>
            </a>

            {/* Center: Nav links */}
            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13px] font-medium text-foreground/70 hover:text-td-navy transition-colors relative group flex items-center gap-1.5"
                >
                  {link.label}
                  {link.label === 'Live Lab' && (
                    <span className="rounded-full bg-td-cyan/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-td-navy border border-td-cyan/40">
                      CV/AI
                    </span>
                  )}
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-td-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                </a>
              ))}
            </div>

            {/* Right: Toggle Button & CTAs */}
            <div className="hidden md:flex items-center gap-3">
              {/* Tactical HUD Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  document.documentElement.classList.toggle('tactical-hud-mode');
                  const isHud = document.documentElement.classList.contains('tactical-hud-mode');
                  const btn = document.getElementById('hud-toggle-label');
                  if (btn) btn.innerText = isHud ? 'HUD ACTIVE' : 'TACTICAL HUD';
                }}
                className="group flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1.5 text-xs font-mono text-td-navy hover:border-td-cyan/60 hover:bg-td-cyan-soft/20 transition-all shadow-sm"
                title="Toggle Tactical Forensic Scanner Overlay"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-td-cyan opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-td-cyan" />
                </span>
                <span id="hud-toggle-label" className="text-[10px] font-semibold tracking-wider">TACTICAL HUD</span>
              </button>

              <a
                href="/auth"
                className="text-[13px] font-medium text-foreground/70 hover:text-td-navy transition-colors px-2 py-1.5"
              >
                Sign In
              </a>
              <a
                href="/auth"
                className="group inline-flex items-center gap-1.5 rounded-lg bg-td-navy px-4 py-2 text-[13px] font-semibold text-white hover:bg-td-navy/90 transition-all shadow-sm shadow-td-navy/20"
              >
                Launch Verification
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-md border border-border"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-b border-border"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted rounded-md"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-border space-y-2">
                <a href="/auth" className="block px-3 py-2 text-sm font-medium text-foreground/80">
                  Sign In
                </a>
                <a
                  href="/auth"
                  className="flex items-center justify-center gap-1.5 rounded-md bg-td-navy px-4 py-2.5 text-sm font-medium text-white"
                >
                  Launch Verification
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
