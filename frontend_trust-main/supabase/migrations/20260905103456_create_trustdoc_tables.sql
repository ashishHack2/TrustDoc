/*
# TRUSTDOC — Core Application Tables

## Overview
Creates the database schema for the TRUSTDOC document verification platform.
This is a multi-user application with authentication — each user sees only
their own verification records.

## New Tables

1. **verifications**
   - Stores each document verification session initiated by a user.
   - Columns: id, user_id (owner), document_name, document_type, status
     (pending/processing/verified/failed), trust_score (0-100),
     created_at, updated_at.

2. **evidence_signals**
   - Stores individual evidence signals for each verification
     (OCR, MRZ, forensics, face match, chip, etc.).
   - Columns: id, verification_id (FK → verifications), signal_name,
     signal_label, status (pass/fail/warning/pending), confidence (0-100),
     detail, created_at.

3. **reports**
   - Stores generated verification reports with full evidence summary.
   - Columns: id, verification_id (FK → verifications), summary,
     trust_decision (verified/rejected/inconclusive), risk_level
     (low/medium/high/critical), evidence_count, created_at.

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- user_id defaults to auth.uid() so inserts work without explicitly passing it.
- Child tables (evidence_signals, reports) are scoped through their parent
  verification's ownership.
*/

-- ============================================================
-- 1. VERIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  document_type text NOT NULL DEFAULT 'Unknown',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'failed')),
  trust_score integer DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON verifications(created_at DESC);

DROP POLICY IF EXISTS "select_own_verifications" ON verifications;
CREATE POLICY "select_own_verifications" ON verifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_verifications" ON verifications;
CREATE POLICY "insert_own_verifications" ON verifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_verifications" ON verifications;
CREATE POLICY "update_own_verifications" ON verifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_verifications" ON verifications;
CREATE POLICY "delete_own_verifications" ON verifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. EVIDENCE_SIGNALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  signal_name text NOT NULL,
  signal_label text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pass', 'fail', 'warning', 'pending')),
  confidence integer DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  detail text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evidence_signals ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_evidence_verification_id ON evidence_signals(verification_id);

DROP POLICY IF EXISTS "select_own_evidence" ON evidence_signals;
CREATE POLICY "select_own_evidence" ON evidence_signals FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = evidence_signals.verification_id AND verifications.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_evidence" ON evidence_signals;
CREATE POLICY "insert_own_evidence" ON evidence_signals FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = evidence_signals.verification_id AND verifications.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_evidence" ON evidence_signals;
CREATE POLICY "update_own_evidence" ON evidence_signals FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = evidence_signals.verification_id AND verifications.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = evidence_signals.verification_id AND verifications.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_evidence" ON evidence_signals;
CREATE POLICY "delete_own_evidence" ON evidence_signals FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = evidence_signals.verification_id AND verifications.user_id = auth.uid())
  );

-- ============================================================
-- 3. REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  summary text NOT NULL DEFAULT '',
  trust_decision text NOT NULL DEFAULT 'inconclusive' CHECK (trust_decision IN ('verified', 'rejected', 'inconclusive')),
  risk_level text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  evidence_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reports_verification_id ON reports(verification_id);

DROP POLICY IF EXISTS "select_own_reports" ON reports;
CREATE POLICY "select_own_reports" ON reports FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = reports.verification_id AND verifications.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_reports" ON reports;
CREATE POLICY "insert_own_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = reports.verification_id AND verifications.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_reports" ON reports;
CREATE POLICY "update_own_reports" ON reports FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = reports.verification_id AND verifications.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = reports.verification_id AND verifications.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_reports" ON reports;
CREATE POLICY "delete_own_reports" ON reports FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM verifications WHERE verifications.id = reports.verification_id AND verifications.user_id = auth.uid())
  );
