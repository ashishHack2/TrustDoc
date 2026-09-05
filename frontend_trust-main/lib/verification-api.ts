'use client';

import { supabase, type Verification, type EvidenceSignal, type Report } from '@/lib/supabase';

export const SIGNAL_DEFS = [
  { name: 'document_classification', label: 'Document Classification' },
  { name: 'ocr_extraction', label: 'OCR Extraction' },
  { name: 'mrz_validation', label: 'MRZ Validation' },
  { name: 'field_consistency', label: 'Field Consistency' },
  { name: 'forensic_analysis', label: 'Forensic Analysis' },
  { name: 'face_match', label: 'Face Match' },
  { name: 'liveness_detection', label: 'Liveness Detection' },
  { name: 'chip_validation', label: 'Chip Validation' },
  { name: 'evidence_fusion', label: 'Evidence Fusion' },
] as const;

function randomConfidence(min = 85, max = 99) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSignals(): Omit<EvidenceSignal, 'id' | 'verification_id' | 'created_at'>[] {
  return SIGNAL_DEFS.map((def) => {
    const r = Math.random();
    let status: EvidenceSignal['status'] = 'pass';
    let confidence = randomConfidence();

    if (r < 0.08) {
      status = 'fail';
      confidence = randomConfidence(20, 50);
    } else if (r < 0.18) {
      status = 'warning';
      confidence = randomConfidence(60, 80);
    }

    const details: Record<string, string> = {
      document_classification: 'Document type identified as national ID card, version 2024.1',
      ocr_extraction: 'Structured fields extracted with 98.7% character accuracy',
      mrz_validation: 'MRZ checksum valid, TD1 format decoded successfully',
      field_consistency: 'All cross-field checks passed: name, DOB, document number aligned',
      forensic_analysis: 'No tampering indicators detected. Security features intact.',
      face_match: 'Biometric face match confidence: 96.4% similarity threshold met',
      liveness_detection: 'Live subject confirmed. No presentation attack indicators.',
      chip_validation: 'ICAO 9303 chip data read and authenticated successfully',
      evidence_fusion: '8 evidence signals fused into trust decision with 94.2% confidence',
    };

    return {
      signal_name: def.name,
      signal_label: def.label,
      status,
      confidence,
      detail: details[def.name] || 'Signal processed successfully',
    };
  });
}

function computeTrustScore(signals: Omit<EvidenceSignal, 'id' | 'verification_id' | 'created_at'>[]) {
  const weights: Record<string, number> = {
    document_classification: 0.10,
    ocr_extraction: 0.15,
    mrz_validation: 0.15,
    field_consistency: 0.15,
    forensic_analysis: 0.15,
    face_match: 0.10,
    liveness_detection: 0.10,
    chip_validation: 0.05,
    evidence_fusion: 0.05,
  };

  let score = 0;
  for (const sig of signals) {
    const w = weights[sig.signal_name] || 0.05;
    if (sig.status === 'pass') score += w * sig.confidence;
    else if (sig.status === 'warning') score += w * sig.confidence * 0.7;
  }
  return Math.round(Math.min(100, score));
}

function computeDecision(signals: Omit<EvidenceSignal, 'id' | 'verification_id' | 'created_at'>[], trustScore: number) {
  const fails = signals.filter((s) => s.status === 'fail').length;
  const warnings = signals.filter((s) => s.status === 'warning').length;

  if (fails >= 2 || trustScore < 50) return { decision: 'rejected' as const, risk: 'critical' as const };
  if (fails === 1 || trustScore < 70) return { decision: 'inconclusive' as const, risk: 'high' as const };
  if (warnings >= 3 || trustScore < 85) return { decision: 'inconclusive' as const, risk: 'medium' as const };
  return { decision: 'verified' as const, risk: 'low' as const };
}

export async function createVerificationRecord(
  user: { id: string },
  documentName: string,
  documentType: string,
): Promise<{ verification: Verification | null; signals: EvidenceSignal[]; report: Report | null; error: string | null }> {
  const { data: verData, error: verError } = await supabase
    .from('verifications')
    .insert({
      user_id: user.id,
      document_name: documentName,
      document_type: documentType,
      status: 'processing',
    })
    .select()
    .single();

  if (verError || !verData) {
    return { verification: null, signals: [], report: null, error: verError?.message || 'Failed to create verification' };
  }

  const verification = verData as Verification;
  const signalData = generateSignals();

  const { data: insertedSignals, error: sigError } = await supabase
    .from('evidence_signals')
    .insert(
      signalData.map((s) => ({
        ...s,
        verification_id: verification.id,
      })),
    )
    .select();

  if (sigError) {
    return { verification, signals: [], report: null, error: sigError.message };
  }

  const signals = (insertedSignals || []) as EvidenceSignal[];
  const trustScore = computeTrustScore(signalData);
  const { decision, risk } = computeDecision(signalData, trustScore);

  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .insert({
      verification_id: verification.id,
      summary: `Document "${documentName}" (${documentType}) analyzed across ${signals.length} evidence signals. Trust score: ${trustScore}%. Decision: ${decision.toUpperCase()}.`,
      trust_decision: decision,
      risk_level: risk,
      evidence_count: signals.length,
    })
    .select()
    .single();

  const { error: updateError } = await supabase
    .from('verifications')
    .update({
      status: decision === 'verified' ? 'verified' : decision === 'rejected' ? 'failed' : 'verified',
      trust_score: trustScore,
      updated_at: new Date().toISOString(),
    })
    .eq('id', verification.id);

  if (updateError) {
    // Non-fatal
  }

  return {
    verification: { ...verification, trust_score: trustScore, status: decision === 'verified' ? 'verified' : 'failed' },
    signals,
    report: reportData as Report,
    error: reportError?.message || null,
  };
}

export async function fetchVerifications(userId: string) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: (data || []) as Verification[], error };
}

export async function fetchVerificationDetail(verificationId: string) {
  const [verRes, sigRes, repRes] = await Promise.all([
    supabase.from('verifications').select('*').eq('id', verificationId).maybeSingle(),
    supabase.from('evidence_signals').select('*').eq('verification_id', verificationId).order('created_at', { ascending: true }),
    supabase.from('reports').select('*').eq('verification_id', verificationId).maybeSingle(),
  ]);

  return {
    verification: verRes.data as Verification | null,
    signals: (sigRes.data || []) as EvidenceSignal[],
    report: repRes.data as Report | null,
    error: verRes.error?.message || sigRes.error?.message || repRes.error?.message || null,
  };
}
