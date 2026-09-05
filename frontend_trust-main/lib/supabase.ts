import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Verification = {
  id: string;
  user_id: string;
  document_name: string;
  document_type: string;
  status: 'pending' | 'processing' | 'verified' | 'failed';
  trust_score: number;
  created_at: string;
  updated_at: string;
};

export type EvidenceSignal = {
  id: string;
  verification_id: string;
  signal_name: string;
  signal_label: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  confidence: number;
  detail: string | null;
  created_at: string;
};

export type Report = {
  id: string;
  verification_id: string;
  summary: string;
  trust_decision: 'verified' | 'rejected' | 'inconclusive';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  evidence_count: number;
  created_at: string;
};
