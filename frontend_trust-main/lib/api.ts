// Central API client for the TRUSTDOC FastAPI backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// -- Types aligned with the FastAPI backend --

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: 'ADMIN' | 'OPERATOR' | 'REVIEWER' | 'AUDITOR';
};

export type UserResponse = {
  id: string;
  email: string;
  full_name: string;
  role: TokenResponse['role'];
  is_active: boolean;
  created_at: string;
};

export type Case = {
  id: string;
  applicant_name: string;
  operator_id: string;
  reference_number: string | null;
  expected_document_type: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  trust_score: number | null;
  risk_level: string | null;
  final_decision: 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED' | 'MANUAL_REVIEW' | null;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  case_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  file_hash: string;
  document_type: string;
  country: string | null;
  confidence: number | null;
  created_at: string;
};

// Signal / evidence types (matches backend verification signals)
export type VerificationSignal = {
  signal_name: string;
  signal_label: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_AVAILABLE';
  confidence: number;
  detail: string | null;
  score_impact: number;
};

export type VerificationResult = {
  id: string;
  case_id: string;
  trust_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  final_decision: 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED' | 'MANUAL_REVIEW';
  confidence: number;
  signals: VerificationSignal[];
  reasons: { code: string; severity: string; message: string }[];
  processing_time_ms: number;
  created_at: string;
};

export type AnalyticsOverview = {
  total_cases: number;
  verified: number;
  suspicious: number;
  rejected: number;
  manual_review: number;
  average_trust_score: number;
  average_processing_time: number;
  recent_cases: Case[];
};

// -- Token storage --

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('trustdoc_access_token');
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('trustdoc_access_token', access);
  localStorage.setItem('trustdoc_refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('trustdoc_access_token');
  localStorage.removeItem('trustdoc_refresh_token');
}

// -- Base fetch helper --

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<{ data: T | null; error: string | null }> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to application/json if not already provided and body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      if (typeof json?.detail === 'string') {
        msg = json.detail;
      } else if (Array.isArray(json?.detail)) {
        msg = json.detail.map((e: any) => e.msg || e.message || (e.loc ? `${e.loc.join('.')}: ${e.msg}` : JSON.stringify(e))).join('; ');
      } else if (json?.error?.message) {
        msg = json.error.message;
      } else if (json?.detail) {
        msg = typeof json.detail === 'object' ? JSON.stringify(json.detail) : String(json.detail);
      }
      return { data: null, error: msg };
    }

    return { data: json as T, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Network error' };
  }
}

// -- Auth API --

export async function login(email: string, password: string): Promise<{ token: TokenResponse | null; error: string | null }> {
  // Send as JSON payload (backend supports both JSON and form data)
  const { data, error } = await apiFetch<TokenResponse>(
    '/api/v1/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ username: email, password, email }),
      headers: { 'Content-Type': 'application/json' },
    },
    false,
  );

  if (data) {
    setTokens(data.access_token, data.refresh_token);
  }

  return { token: data, error };
}

export async function setupAdmin(email: string, password: string, full_name: string): Promise<{ data: UserResponse | null; error: string | null }> {
  return apiFetch<UserResponse>(
    '/api/v1/auth/setup-admin',
    { method: 'POST', body: JSON.stringify({ email, password, full_name }) },
    false,
  );
}

export function logout() {
  clearTokens();
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// -- Cases API --

export async function getCases(): Promise<{ data: Case[]; error: string | null }> {
  const { data, error } = await apiFetch<Case[]>('/api/v1/cases');
  return { data: data || [], error };
}

export async function createCase(payload: { applicant_name: string; reference_number?: string; expected_document_type?: string }): Promise<{ data: Case | null; error: string | null }> {
  return apiFetch<Case>('/api/v1/cases', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getCase(id: string): Promise<{ data: Case | null; error: string | null }> {
  return apiFetch<Case>(`/api/v1/cases/${id}`);
}

// -- Documents API --

export async function uploadDocument(caseId: string, file: File): Promise<{ data: Document | null; error: string | null }> {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<Document>(`/api/v1/cases/${caseId}/documents`, { method: 'POST', body: form });
}

export async function getCaseDocuments(caseId: string): Promise<{ data: Document[]; error: string | null }> {
  const { data, error } = await apiFetch<Document[]>(`/api/v1/cases/${caseId}/documents`);
  return { data: data || [], error };
}

// -- Processing status API (polled) --

export type ProcessingStatus = {
  overall_progress: number;
  current_stage: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  stages: { name: string; status: string; duration_ms?: number }[];
};

export async function getProcessingStatus(caseId: string): Promise<{ data: ProcessingStatus | null; error: string | null }> {
  return apiFetch<ProcessingStatus>(`/api/v1/cases/${caseId}/processing-status`);
}

// -- Verification API --

export async function triggerVerification(caseId: string): Promise<{ data: { job_id: string } | null; error: string | null }> {
  return apiFetch(`/api/v1/cases/${caseId}/process`, { method: 'POST' });
}

export async function getVerificationResult(caseId: string): Promise<{ data: VerificationResult | null; error: string | null }> {
  return apiFetch<VerificationResult>(`/api/v1/cases/${caseId}/verification`);
}

export async function getVerificationSignals(caseId: string): Promise<{ data: VerificationSignal[]; error: string | null }> {
  const { data, error } = await apiFetch<VerificationSignal[]>(`/api/v1/cases/${caseId}/signals`);
  return { data: data || [], error };
}

// -- Analytics API --

export async function getAnalyticsOverview(): Promise<{ data: AnalyticsOverview | null; error: string | null }> {
  return apiFetch<AnalyticsOverview>('/api/v1/analytics/overview');
}

// -- Report API --

export async function generateReport(caseId: string): Promise<{ data: { report_id: string; url: string } | null; error: string | null }> {
  return apiFetch(`/api/v1/cases/${caseId}/report`, { method: 'POST' });
}

export async function getReport(caseId: string): Promise<{ data: { report_id: string; summary: string; created_at: string } | null; error: string | null }> {
  return apiFetch(`/api/v1/cases/${caseId}/report`);
}
