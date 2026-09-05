# 🏗️ Report 02: System Architecture & Data Flow Specifications

**Project**: TRUSTDOC Multi-Layer Forensic Verification Platform  
**System Type**: Distributed Client-Server with High-Throughput Edge Computer Vision & Asynchronous Verification Engine  

---

## 1. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer ["Client & Edge Ingestion Layer"]
        BrowserUI["Next.js 14 Web Application<br>(TypeScript, TailwindCSS, React 18)"]
        LiveCam["Live OpenCV Camera Scanner<br>(HTML5 Canvas, WebRTC, Laplacian HUD)"]
        ForensicLab["Forensic Lab Visualizer<br>(ELA Heatmap, Sobel Gradients, QR Decoder)"]
    end

    subgraph APIGateway ["API & Application Gateway (FastAPI)"]
        AuthRouter["/api/v1/auth<br>(JWT Bearer, Multi-Role RBAC)"]
        DocRouter["/api/v1/documents<br>(Upload, SHA-256 Digest, Metadata)"]
        VerifRouter["/api/v1/verification<br>(9-Layer Engine, Polling, Overrides)"]
        CaseRouter["/api/v1/cases<br>(Query, Filter, Audit Logs)"]
        AnalyticsRouter["/api/v1/analytics<br>(Fraud Heatmaps, Decision Rates)"]
    end

    subgraph VerificationCore ["TRUSTDOC Multi-Layer Verification Core"]
        Engine["VerificationEngine (Orchestrator)"]
        
        subgraph LayerCV ["Computer Vision & Forensics"]
            ELA["Error Level Analysis (PIL/NumPy)"]
            EdgeFilter["Sobel & High-Pass Spatial Filters"]
            SecurityPatterns["Guilloche & Microprint Continuity"]
        end

        subgraph LayerML ["Deep Learning & Biometrics"]
            OCR["OCR Engine (TrOCR / Tesseract)"]
            FaceEmbed["Face Feature Extractor (ArcFace 128D)"]
            Liveness["Passive Presentation Attack Detection"]
        end

        subgraph LayerCrypto ["Deterministic Cryptography"]
            ICAO["ICAO 9303 Modulus 7-3-1 Checksums"]
            CrossCheck["VIZ vs MRZ Consistency Matcher"]
            Merkle["SHA-256 Merkle Tree Hash Root Anchor"]
        end
    end

    subgraph StorageLayer ["Persistence & Ledger Layer"]
        DB[("PostgreSQL / SQLite Database<br>(SQLAlchemy 2.0 ORM)")]
        FileStore["Encrypted Document Storage<br>(Local Secure FS / AWS S3)"]
        MerkleLedger["Immutable Cryptographic Audit Ledger"]
    end

    BrowserUI -->|HTTPS / REST| APIGateway
    LiveCam -->|Zero-Latency Canvas Analysis| LiveCam
    LiveCam -->|High-Res Frame| DocRouter
    ForensicLab -->|Forensic Queries| VerifRouter

    APIGateway --> Engine
    Engine --> LayerCV
    Engine --> LayerML
    Engine --> LayerCrypto

    Engine --> DB
    Engine --> FileStore
    Engine --> MerkleLedger
```

---

## 2. End-to-End Data Flow Pipeline

The document verification lifecycle proceeds through six deterministic phases:

```
[1. INGESTION]
  ├─ User uploads file OR Live Camera auto-captures frame.
  ├─ Client calculates local Laplacian sharpness (>120.0) & glint threshold.
  └─ Binary payload transmitted to /api/v1/documents/upload via multipart/form-data.

[2. CRYPTOGRAPHIC PROVENANCE]
  ├─ Backend computes SHA-256 digest of original binary.
  ├─ File is persisted to isolated secure storage with UUID filename.
  └─ Initial Case entity is generated with status: PROCESSING.

[3. FORENSIC SIGNAL PROCESSING]
  ├─ ELA Analysis: Image is recompressed to 90% JPEG; delta error array calculated.
  ├─ Font Kerning & Line Variance: Checked against document standard profiles.
  └─ Guilloche & Fine-Line vectors inspected for digital raster splices.

[4. OCR, MRZ & BIOMETRIC RECOGNITION]
  ├─ Optical Character Recognition extracts Visual Inspection Zone (VIZ).
  ├─ Machine-Readable Zone (MRZ) parsed:
  │    └─ Document Number Checksum = Modulus 10 (Weights: 7, 3, 1)
  │    └─ Date of Birth Checksum = Modulus 10 (Weights: 7, 3, 1)
  │    └─ Expiration Date Checksum = Modulus 10 (Weights: 7, 3, 1)
  ├─ VIZ data cross-referenced with MRZ decrypted fields.
  ├─ Facial portrait cropped and 128-dimensional embedding vector extracted.
  └─ Cosine similarity calculated against applicant live selfie.

[5. SCORING & EXPLAINABLE DECISION]
  ├─ 9 signal scores are weighted into a composite 0–100 Trust Score.
  ├─ Decision thresholds mapped:
  │    ├─ Score >= 85: VERIFIED (Risk: LOW)
  │    ├─ Score 65-84: SUSPICIOUS (Risk: MEDIUM)
  │    ├─ Score 45-64: MANUAL_REVIEW (Risk: HIGH)
  │    └─ Score < 45:  REJECTED (Risk: CRITICAL)
  └─ Explainable reason codes (e.g. MRZ_CHECKSUM_VERIFIED, FORENSIC_ELA_AUTHENTIC) assigned.

[6. BLOCKCHAIN MERKLE ANCHORING & CERTIFICATE]
  ├─ Merkle root generated: SHA-256(Doc_Hash + Case_ID + Timestamp).
  ├─ Audit entry written with immutable status: COMPLETED.
  └─ Forensic Dossier rendered on Dashboard with PDF & JSON export readiness.
```

---

## 3. Database Schema Overview

```mermaid
erDiagram
    USERS ||--o{ CASES : manages
    CASES ||--o{ DOCUMENTS : contains
    CASES ||--|| VERIFICATIONS : yields
    VERIFICATIONS ||--o{ AUDIT_LOGS : records

    USERS {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        string role "ADMIN | ANALYST | AUDITOR"
        boolean is_active
        datetime created_at
    }

    CASES {
        uuid id PK
        string case_number UK
        uuid applicant_id FK
        string status "PENDING | PROCESSING | COMPLETED | FAILED"
        string priority "LOW | NORMAL | URGENT"
        float trust_score
        string risk_level "LOW | MEDIUM | HIGH | CRITICAL"
        string final_decision "VERIFIED | SUSPICIOUS | MANUAL_REVIEW | REJECTED"
        datetime created_at
    }

    DOCUMENTS {
        uuid id PK
        uuid case_id FK
        string document_type "PASSPORT | NATIONAL_ID | DRIVING_LICENSE"
        string file_path
        string file_hash_sha256
        int file_size_bytes
        string mime_type
        json document_metadata
    }

    VERIFICATIONS {
        uuid id PK
        uuid case_id FK
        float trust_score
        string decision
        json verification_signals
        json reason_codes
        string merkle_root
        int processing_time_ms
        datetime completed_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid case_id FK
        uuid user_id FK
        string action
        string ip_address
        json previous_state
        json new_state
        datetime timestamp
    }
```
