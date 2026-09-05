export const NAV_LINKS = [
  { label: 'Platform', href: '#hero' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'Live Lab', href: '#lab' },
];

export const HERO_METRICS = [
  { value: '09', label: 'VERIFICATION LAYERS' },
  { value: '< 10s', label: 'TARGET ANALYSIS' },
  { value: '08+', label: 'EVIDENCE SIGNALS' },
  { value: '01', label: 'TRUST DECISION' },
];

export const TRUST_INDICATORS = [
  'DOCUMENT INTELLIGENCE',
  'FORENSIC ANALYSIS',
  'BIOMETRIC VERIFICATION',
];

export const CALLOUTS = [
  { label: 'OCR', value: '98.7%', side: 'left', position: 'top' },
  { label: 'MRZ', value: 'VALID', side: 'right', position: 'top' },
  { label: 'MICROTEXT', value: 'DETECTED', side: 'left', position: 'middle' },
  { label: 'CHIP', value: 'READY', side: 'right', position: 'middle' },
  { label: 'FACE', value: 'MATCH', side: 'left', position: 'bottom' },
  { label: 'FORENSICS', value: 'ACTIVE', side: 'right', position: 'bottom' },
] as const;

export const STATUS_PANEL_ITEMS = [
  { label: 'Document Engine', status: 'READY' },
  { label: 'Forensic Engine', status: 'READY' },
  { label: 'Biometric Engine', status: 'READY' },
  { label: 'Evidence Engine', status: 'READY' },
];

export const TRADITIONAL_STEPS = [
  'Document',
  'OCR',
  'Basic Match',
  'PASS',
];

export const TRUSTDOC_STEPS = [
  'Document',
  'Classification',
  'OCR + MRZ',
  'Field Consistency',
  'Forensics',
  'Face + Liveness',
  'Chip / Database',
  'Evidence Fusion',
  'TRUST DECISION',
];

export const PIPELINE_STAGES = [
  {
    num: '01',
    title: 'CAPTURE',
    icon: 'Camera',
    desc: 'High-resolution document imaging with controlled lighting and edge detection.',
  },
  {
    num: '02',
    title: 'DOCUMENT TYPE + VERSION',
    icon: 'FileText',
    desc: 'Classify document type, issuing authority, and template version.',
  },
  {
    num: '03',
    title: 'OCR + MRZ',
    icon: 'ScanText',
    desc: 'Extract structured identity data and validate machine-readable fields.',
  },
  {
    num: '04',
    title: 'FIELD CONSISTENCY',
    icon: 'AlignCheck',
    desc: 'Cross-check visual, OCR, and MRZ fields for internal consistency.',
  },
  {
    num: '05',
    title: 'FORENSIC ANALYSIS',
    icon: 'Search',
    desc: 'Detect tampering, microtext anomalies, and security feature integrity.',
  },
  {
    num: '06',
    title: 'FACE + LIVENESS',
    icon: 'ScanFace',
    desc: 'Biometric face match with liveness and presentation-attack detection.',
  },
  {
    num: '07',
    title: 'CHIP / AUTHORIZED DATABASE',
    icon: 'Cpu',
    desc: 'Validate embedded chip data and query authorized identity databases.',
  },
  {
    num: '08',
    title: 'EVIDENCE FUSION',
    icon: 'Layers',
    desc: 'Combine all evidence signals into a weighted confidence model.',
  },
  {
    num: '09',
    title: 'TRUST DECISION',
    icon: 'ShieldCheck',
    desc: 'Produce a final trust decision with full evidence audit trail.',
  },
];

export const EVIDENCE_NODES = [
  { id: 'document', label: 'DOCUMENT', x: 10, y: 50 },
  { id: 'ocr', label: 'OCR', x: 28, y: 22 },
  { id: 'mrz', label: 'MRZ', x: 28, y: 78 },
  { id: 'forensics', label: 'FORENSICS', x: 48, y: 15 },
  { id: 'face', label: 'FACE', x: 48, y: 85 },
  { id: 'liveness', label: 'LIVENESS', x: 68, y: 22 },
  { id: 'chip', label: 'CHIP', x: 68, y: 78 },
  { id: 'database', label: 'DATABASE', x: 85, y: 50 },
] as const;

export const EVIDENCE_LINKS = [
  ['document', 'ocr'],
  ['document', 'mrz'],
  ['ocr', 'forensics'],
  ['mrz', 'face'],
  ['forensics', 'liveness'],
  ['face', 'chip'],
  ['liveness', 'database'],
  ['chip', 'database'],
  ['ocr', 'forensics'],
  ['forensics', 'liveness'],
  ['face', 'liveness'],
  ['chip', 'database'],
] as const;
