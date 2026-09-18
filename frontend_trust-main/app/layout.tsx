import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TRUSTDOC — Document & Identity Intelligence Platform',
  description:
    'TRUSTDOC combines document intelligence, forensic tampering detection, biometric liveness verification and cryptographic evidence validation into one institutional-grade identity verification platform.',
  openGraph: {
    title: 'TRUSTDOC — Document & Identity Intelligence Platform',
    description:
      'Zero-trust AI forensics, ICAO 9303 MRZ verification, and biometric defense infrastructure.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-td-cyan selection:text-td-navy min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
