import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'TRUSTDOC — Document & Identity Intelligence',
  description:
    'TRUSTDOC combines document intelligence, forensic analysis, biometric verification and authorized validation into one evidence-driven identity verification platform.',
  openGraph: {
    title: 'TRUSTDOC — Document & Identity Intelligence',
    description:
      'Evidence-driven document authenticity and identity verification platform.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
