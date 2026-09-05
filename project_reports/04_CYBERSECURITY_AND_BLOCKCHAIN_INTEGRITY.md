# 🔐 Report 04: Cybersecurity Architecture & Blockchain Integrity Analysis

**Project**: TRUSTDOC Multi-Layer Forensic Verification Platform  
**Compliance Standards**: NIST SP 800-207 (Zero Trust), OWASP Top 10 API Security, ISO/IEC 27001, India DPDP Act 2023  

---

## 1. Zero Trust Architectural Principles (NIST SP 800-207)

TRUSTDOC operates under the foundational cybersecurity assumption that the network perimeter is breached and neither client inputs nor internal system processes are inherently trusted.

```
       [UNTRUSTED CLIENT]
              │ (TLS 1.3 Strict HTTPS)
              ▼
    ┌───────────────────┐
    │  API Gateway WAF  │ ── Rate Limiting, Input Sanitization, MIME-Type Enforcer
    └───────────────────┘
              │ (Valid Signed JWT with Claims)
              ▼
    ┌───────────────────┐
    │ RBAC Authorization│ ── Role Verification: [ADMIN, ANALYST, AUDITOR]
    └───────────────────┘
              │ (Scoped Principal Context)
              ▼
    ┌───────────────────┐
    │ Verification Core │ ── Isolated Execution Pipeline, Deterministic Seeds
    └───────────────────┘
              │ (SHA-256 Payload Digest)
              ▼
    ┌───────────────────┐
    │ Merkle Audit Log  │ ── Immutable Forward-Only Hash Chain
    └───────────────────┘
```

1. **Verify Explicitly**: Every API request mandates a signed cryptographic JSON Web Token (`JWT`) using `HS256`/`RS256`. Claims include user UUID, role permissions, and token expiration timestamps.
2. **Least Privilege Access (RBAC)**:
   - **`ADMIN`**: User management, system configuration, pipeline threshold tuning.
   - **`ANALYST`**: Document verification execution, case review, manual forensic override annotations.
   - **`AUDITOR`**: Read-only verification of forensic logs, Merkle hash trees, and compliance reports.
3. **Assume Breach**: Document binaries uploaded to the system are treated as potentially malicious payloads:
   - File extensions are ignored; binary magic numbers (e.g. `\xFF\xD8\xFF` for JPEG, `\x89PNG` for PNG) are validated.
   - SVGs and active content are strictly rejected to prevent Stored Cross-Site Scripting (XSS).

---

## 2. OWASP Top 10 API Security Mitigations

| Threat ID | Vulnerability Category | TRUSTDOC Defensive Countermeasure |
| :--- | :--- | :--- |
| **API1:2023** | Broken Object Level Authorization (BOLA) | Cases and documents use random non-sequential UUIDv4 keys. The database query enforces `case.tenant_id == current_user.tenant_id`. |
| **API2:2023** | Broken Authentication | Passwords hashed using bcrypt with salt rounds $\ge 12$. JWT expiration set to 60 minutes with secure token blacklisting. |
| **API3:2023** | Broken Object Property Level Authorization | Strict Pydantic v2 schemas reject unexpected request properties; sensitive internal database fields are excluded from JSON serialization. |
| **API4:2023** | Unrestricted Resource Consumption | FastAPI rate limiting middleware throttles client IPs; image dimension limits (max $4096 \times 4096$) prevent memory exhaustion attacks. |
| **API5:2023** | Broken Function Level Authorization | Role check dependencies (`get_current_active_admin`) guard administrative endpoints at the route decorator level. |
| **API7:2023** | Server-Side Request Forgery (SSRF) | Document ingestion is restricted to direct file upload multipart bodies; external URL fetchers are strictly disallowed. |
| **API8:2023** | Security Misconfiguration | Production headers enforce `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict Content Security Policy (`CSP`). |

---

## 3. Blockchain Merkle Tree Integrity & Anti-Tampering Mechanism

In high-stakes fraud investigations, a compromised system administrator or corrupt official might attempt to alter a database row from:
```sql
UPDATE cases SET final_decision = 'VERIFIED' WHERE case_number = 'CASE-9842';
```
In traditional architectures, such SQL manipulation succeeds silently. **TRUSTDOC completely neutralizes this threat through cryptographic Merkle Anchoring**:

### 3.1 Mathematical Chain Construction
```
                 [Merkle Root Anchor: H_ROOT]
                         /          \
              [H_12]                      [H_34]
             /      \                    /      \
          [H_1]    [H_2]              [H_3]    [H_4]
           │        │                  │        │
        Case 1   Case 2             Case 3   Case 4
```
1. Each leaf node $H_i$ is computed as:
   $$H_i = \text{SHA-256}(\text{DocHash}_i \parallel \text{ApplicantID}_i \parallel \text{Score}_i \parallel \text{Decision}_i \parallel \text{Timestamp}_i)$$
2. The root $H_{\text{ROOT}}$ is periodically published or stored with cryptographic time-stamping authorities (RFC 3161 compliant).
3. **Auditing Proof**: If an attacker edits `Score` or `Decision` in the database, re-evaluating the Merkle path to $H_{\text{ROOT}}$ yields an immediate cryptographic collision failure:
   $$\text{MerklePathVerify}(H_i, \text{Proof}_i, H_{\text{ROOT}}) = \text{FALSE}$$
   This provides mathematical proof of internal tampering admissible in forensic courts.

---

## 4. Privacy & Data Protection Compliance (India DPDP Act 2023 / GDPR)

1. **Data Minimization (Section 6, DPDP Act 2023)**:
   Only document fields strictly required for identity verification are extracted and indexed. Unrelated visual artifacts (e.g. background objects in room) are cropped out.
2. **Encryption in Transit and at Rest**:
   - In Transit: TLS 1.3 with forward secrecy cipher suites.
   - At Rest: AES-256 GCM encryption on disk storage with customer-managed cryptographic keys (KMS).
3. **Cryptographic Redaction**:
   When an applicant exercises the statutory "Right to Erasure", the source document binary is scrubbed using DoD 5220.22-M wiping, while the one-way SHA-256 hash leaf remains in the Merkle log to preserve historical audit chain integrity without leaking Personally Identifiable Information (PII).
