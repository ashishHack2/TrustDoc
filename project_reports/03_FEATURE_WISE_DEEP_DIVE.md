# 🔬 Report 03: Feature-Wise Technical Deep Dive

**Project**: TRUSTDOC Multi-Layer Forensic Verification Platform  
**Scope**: In-Depth Functional & Algorithmic Specifications of All System Capabilities  

---

## Feature 1: Real-Time Live OpenCV Video Camera Scanner

- **Route**: `/dashboard/live-cam`
- **Component**: [`frontend_trust-main/app/dashboard/live-cam/page.tsx`](file:///c:/Users/Dell/Documents/sih%20trustdoc/frontend_trust-main/app/dashboard/live-cam/page.tsx)
- **Primary Technologies**: WebRTC `getUserMedia`, HTML5 Canvas API, Custom Client-Side OpenCV Matrix Operations, Web Audio API.

### 1.1 Technical Operation
The Live Scanner solves the primary cause of automated verification failure: **poor quality, out-of-focus, or glare-compromised photos uploaded by users**. Instead of uploading a static photo, the system processes a live video stream at 30 FPS directly in the client browser before the frame ever reaches the server.

### 1.2 Mathematical & Algorithmic Details
1. **Laplacian Variance Focus Metric**:
   $$\text{Sharpness} = \text{Var}(\nabla^2 I) = \frac{1}{N} \sum_{x, y} \left( \nabla^2 I(x, y) - \mu \right)^2$$
   Where $\nabla^2 I$ is the convolution of the grayscale frame with the 2nd-order differential Laplacian kernel:
   $$K = \begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix}$$
   - If $\text{Sharpness} < 100.0$: HUD alerts **"BLUR DETECTED - HOLD STILL"** (Red).
   - If $\text{Sharpness} \ge 120.0$: HUD confirms **"OPTIMAL SHARPNESS"** (Green).

2. **Specular Glint & Glare Radar**:
   Evaluates the percentage of pixels clipped at maximum saturation:
   $$\text{Glint Ratio} = \frac{\sum [I(x, y) > 248]}{\text{Total Pixels}}$$
   If $\text{Glint Ratio} > 0.08$ within the document region, HUD triggers **"GLARE DETECTED - ADJUST LIGHTING"**.

3. **Autonomous Capture Stabilization**:
   A multi-frame stabilization ring tracks whether the document remains steady within the alignment box for 3 consecutive frames with zero blur and zero glare. When satisfied, the camera auto-captures, emits an audio confirmation tone via the Web Audio API synthesizer, and transmits the frame to the backend.

---

## Feature 2: Multi-Spectral Forensic Lab & Tamper Visualizer

- **Route**: `/dashboard/forensic-lab`
- **Component**: [`frontend_trust-main/app/dashboard/forensic-lab/page.tsx`](file:///c:/Users/Dell/Documents/sih%20trustdoc/frontend_trust-main/app/dashboard/forensic-lab/page.tsx)
- **Primary Technologies**: Canvas 2D Context, JPEG Recompression Differential Engine, Sobel Gradient Matrices, QR Decoding.

### 2.1 Multi-Spectral Inspection Modes
1. **Error Level Analysis (ELA)**:
   - Compresses the original image to a standardized JPEG quality factor (90%).
   - Subtracts the compressed matrix from the original:
     $$\Delta E(x, y) = |I_{\text{original}}(x, y) - I_{\text{recompressed}}(x, y)| \times \alpha$$
   - Multiplies the difference by scale factor $\alpha$ to render a false-color heatmap:
     - **Uniform Dark Blue / Violet**: Unmodified image pixels with natural uniform compression.
     - **Bright Magenta / Cyan Glowing Edges**: Localized splices, pasted text, or altered dates introduced at a different compression level.
2. **Sobel Gradient Edge Derivative**:
   Convolves the image with horizontal ($G_x$) and vertical ($G_y$) Sobel operators:
   $$G_x = \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix}, \quad G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix}$$
   $$|G| = \sqrt{G_x^2 + G_y^2}$$
   Detects irregular boundary discontinuities around photos where an attacker attempted to paste an alternate face onto an ID card.
3. **Cryptographic 2D QR Code Analysis**:
   Decodes the embedded payload and checks whether the public digital signature of the issuer matches the plaintext information printed on the physical card.
4. **Pinpoint Visual Tamper Markers**:
   Renders precise interactive radar crosshairs over altered zones (e.g. $[X: 412, Y: 188]$ showing *"Font Inconsistency & ELA Delta High"*).

---

## Feature 3: Deterministic ICAO Doc 9303 Checksum Engine

- **Service**: [`backend/app/services/verification_engine.py`](file:///c:/Users/Dell/Documents/sih%20trustdoc/backend/app/services/verification_engine.py)
- **Standard**: ICAO Doc 9303 Part 7 (Passports & Visas)

### 3.1 Mathematical Formulation
The Machine-Readable Zone uses a repeating modulus 10 weighting system with weights $w \in \{7, 3, 1\}$ applied to alphanumeric characters:
$$\text{Checksum} = \left( \sum_{i=0}^{n-1} c(x_i) \cdot w_{i \pmod 3} \right) \pmod{10}$$
Where character values $c(x)$ are mapped as:
- Characters `0` through `9` $\rightarrow$ values $0$ to $9$.
- Characters `A` through `Z` $\rightarrow$ values $10$ to $35$ ($\text{ASCII}(x) - 55$).
- Filler character `<` $\rightarrow$ value $0$.

### 3.2 Security Guarantee
Even if an attacker possesses state-of-the-art Photoshop or generative AI tools to replace the birth year or passport number on the visual surface, modifying a single character without updating the checksum produces an instantaneous mathematical mismatch, rejecting the document with 100% confidence.

---

## Feature 4: Cryptographic Merkle Tree Audit Ledger

- **Engine**: SHA-256 Merkle Anchor Service
- **Purpose**: Zero-Trust Government Audit Integrity

### 4.1 Merkle Tree Construction
For every verified case, a unique tamper-evident leaf is constructed:
$$\text{Leaf} = \text{SHA-256}(\text{Document\_Hash} \parallel \text{Case\_UUID} \parallel \text{Unix\_Timestamp})$$
The leaf is hashed into the local verification Merkle tree. If any internal database administrator attempts to retroactively alter a suspect's risk level from `REJECTED` to `VERIFIED` in SQL, the cryptographic signature recalculation fails, alerting the Chief Information Security Officer (CISO) and generating an immutable audit alarm.

---

## Feature 5: Tactical Cyber-Defense HUD & Landing Page Lab

- **Components**: [`Navbar.tsx`](file:///c:/Users/Dell/Documents/sih%20trustdoc/frontend_trust-main/components/trustdoc/Navbar.tsx), [`LandingLab.tsx`](file:///c:/Users/Dell/Documents/sih%20trustdoc/frontend_trust-main/components/trustdoc/LandingLab.tsx)
- **Capability**:
  - **Tactical HUD Switch**: Converts the application into an ultra-high-contrast security operations center (SOC) display with ambient scanlines and vector grid overlay.
  - **Public Live Lab (`#lab`)**: Enables conference attendees, reviewers, and evaluators to interactively slide between visible light and forensic ELA heatmaps on sample identity cards directly from the homepage.
