'use client';

import Navbar from '@/components/trustdoc/Navbar';
import Hero from '@/components/trustdoc/Hero';
import ProblemVisualization from '@/components/trustdoc/ProblemVisualization';
import PipelineSection from '@/components/trustdoc/PipelineSection';
import EvidenceNetwork from '@/components/trustdoc/EvidenceNetwork';
import LandingLab from '@/components/trustdoc/LandingLab';
import CyberSecurityBlockchain from '@/components/trustdoc/CyberSecurityBlockchain';
import WhyTrustDoc from '@/components/trustdoc/WhyTrustDoc';
import Footer from '@/components/trustdoc/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-td-cyan selection:text-td-navy">
      <Navbar />
      <Hero />
      <ProblemVisualization />
      <PipelineSection />
      <EvidenceNetwork />
      <LandingLab />
      <CyberSecurityBlockchain />
      <WhyTrustDoc />
      <Footer />
    </main>
  );
}
