'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  LayoutDashboard,
  Upload,
  FileText,
  BrainCircuit,
  LogOut,
  ChevronRight,
  Loader2,
  FolderOpen,
  BarChart3,
  Video,
  Microscope,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Cases', href: '/dashboard/cases', icon: FolderOpen },
  { label: 'New Verification', href: '/dashboard/upload', icon: Upload },
  { label: 'Live Cam Scanner', href: '/dashboard/live-cam', icon: Video, badge: 'CV' },
  { label: 'Forensic Lab', href: '/dashboard/forensic-lab', icon: Microscope, badge: 'ELA' },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'AI Analysis', href: '/dashboard/ai', icon: BrainCircuit },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-td-cyan" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    signOut();
    router.replace('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-30 hidden w-60 border-r border-border/60 bg-white/50 backdrop-blur-sm lg:flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-td-navy">
            <ShieldCheck className="h-4 w-4 text-td-cyan" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-td-navy">TRUSTDOC</span>
            <span className="font-mono text-[7px] tracking-[0.12em] text-muted-foreground mt-0.5">
              IDENTITY INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-td-navy text-white shadow-sm'
                    : 'text-foreground/70 hover:bg-muted/50 hover:text-td-navy',
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                    active ? "bg-td-cyan text-td-navy" : "bg-td-cyan/15 text-td-navy border border-td-cyan/30"
                  )}>
                    {item.badge}
                  </span>
                )}
                {active && !item.badge && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Sign out */}
        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-td-cyan/10 text-xs font-bold text-td-cyan">
              {(user.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-td-navy truncate">{user.email}</p>
              <p className="font-mono text-[8px] tracking-wide text-muted-foreground">
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 border-b border-border/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-td-navy">
            <ShieldCheck className="h-4 w-4 text-td-cyan" strokeWidth={2.2} />
          </div>
          <span className="text-sm font-bold tracking-tight text-td-navy">TRUSTDOC</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-border/60 bg-white/90 backdrop-blur-md flex items-center justify-around px-2">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-medium transition-colors',
                active ? 'text-td-cyan' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              {item.label.split(' ')[0]}
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="lg:pl-60 pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
