"""
TRUSTDOC Document Classification Service.

Heuristic computer-vision classifier that inspects the actual uploaded image
to determine the document category (passport, national ID, driving licence,
visa, selfie) with an explainable confidence score.

Detected features (all computed from real pixel data with PIL + numpy):
- aspect ratio (ID-1 cards are 85.6x54mm ~ 1.586, passport data pages ~1.42)
- MRZ text-band detection in the lower region (dark, high-contrast mono bands)
- colourfulness (Hasler-Süsstrunk metric) for guilloche/print detection
- portrait / skin-tone presence on the left side of the document
- overall sharpness (Laplacian variance)
Filename keywords provide a corroborating (weaker) signal, the same way a
production OCR pipeline bootstraps its prior.
"""

import os
import re
from typing import Any, Dict

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = 32_000_000


def _to_grayscale_array(img: Image.Image) -> np.ndarray:
    return np.asarray(img.convert("L"), dtype=np.float32)


def _colourfulness(img: Image.Image) -> float:
    """Hasler & Süsstrunk colourfulness metric (0 = grayscale, ~100+ vivid)."""
    rgb = np.asarray(img.convert("RGB"), dtype=np.float32)
    rg = rgb[:, :, 0] - rgb[:, :, 1]
    yb = 0.5 * (rgb[:, :, 0] + rgb[:, :, 1]) - rgb[:, :, 2]
    rg_std, rg_mean = float(rg.std()), float(rg.mean())
    yb_std, yb_mean = float(yb.std()), float(yb.mean())
    std_root = np.sqrt(rg_std**2 + yb_std**2)
    mean_root = np.sqrt(rg_mean**2 + yb_mean**2)
    return float(std_root + 0.3 * mean_root)


def _laplacian_variance(gray: np.ndarray) -> float:
    """Sharpness proxy: variance of the 3x3 Laplacian response."""
    lap = (
        -4.0 * gray[1:-1, 1:-1]
        + gray[:-2, 1:-1]
        + gray[2:, 1:-1]
        + gray[1:-1, :-2]
        + gray[1:-1, 2:]
    )
    return float(lap.var())


def _detect_mrz_bands(gray: np.ndarray) -> Dict[str, Any]:
    """
    Detect machine-readable-zone style text bands in the bottom 35% of the
    image. MRZ zones appear as 1-2 horizontal strips of dense dark-on-light
    monospaced characters. Candidate bands are validated for text-likeness
    (thin strip + high horizontal glyph-edge density) so that dark clothing,
    shadows or backgrounds are not mistaken for an MRZ. Returns band count,
    coverage and cleanliness.
    """
    h, w = gray.shape
    bottom = gray[int(h * 0.65):, :]
    bh, bw = bottom.shape
    if bh < 4 or bw < 20:
        return {"bands": 0, "coverage": 0.0, "regular": 0.0}

    dark = bottom < 110  # text strokes
    row_density = dark.mean(axis=1)  # fraction of dark pixels per row

    threshold = 0.08
    rows = row_density > threshold
    # group consecutive rows into bands separated by gaps
    bands = []
    in_band = False
    start = 0
    for i, r in enumerate(rows):
        if r and not in_band:
            in_band, start = True, i
        elif not r and in_band:
            in_band = False
            if i - start >= max(3, bh // 30):  # minimum band thickness
                bands.append((start, i))
    if in_band and bh - start >= max(3, bh // 30):
        bands.append((start, bh))

    # merge bands separated by tiny gaps (antialiasing) 
    merged = []
    for b in bands:
        if merged and b[0] - merged[-1][1] < max(2, bh // 40):
            merged[-1] = (merged[-1][0], b[1])
        else:
            merged.append(list(b))

    # text-likeness validation: a glyph band is thin relative to the strip and
    # has strong horizontal edge energy; flat blobs (clothing/shadow) fail this
    text_bands = []
    for a, b in merged:
        thickness = (b - a) / bh
        strip = bottom[a:b, :]
        edge_density = float(np.abs(np.diff(strip, axis=1)).mean())
        if 0.02 <= thickness <= 0.45 and edge_density >= 1.2:
            text_bands.append((a, b))

    band_heights = [b[1] - b[0] for b in text_bands]
    coverage = float(sum(band_heights)) / bh
    regular = 0.0
    if len(band_heights) >= 2:
        heights = np.array(band_heights, dtype=np.float32)
        regular = float(1.0 - min(1.0, float(heights.std()) / max(float(heights.mean()), 1e-6)))

    return {
        "bands": len(text_bands),
        "coverage": round(coverage, 4),
        "regular": round(regular, 4),
    }


def _skin_tone_ratio(img: Image.Image, box: tuple) -> float:
    """Fraction of skin-tone-like pixels inside a relative (l,t,r,b) box."""
    rgb = np.asarray(img.convert("RGB"), dtype=np.float32)
    h, w, _ = rgb.shape
    l, t, r, b = box
    region = rgb[int(t * h):int(b * h), int(l * w):int(r * w)]
    if region.size == 0:
        return 0.0
    R, G, B = region[:, :, 0], region[:, :, 1], region[:, :, 2]
    mask = (R > 95) & (G > 40) & (B > 20) & (R > G) & (R > B) & (np.abs(R - G) > 15)
    return float(mask.mean())


FILENAME_HINTS = [
    (re.compile(r"passpa|pass_?port|pp\b|data[-_ ]?page", re.I), "passport"),
    (re.compile(r"licen[cs]|dl\b|driving", re.I), "driving_licence"),
    (re.compile(r"aadhaar|aadhar|pan\b|voter|nid|national[-_ ]?id|identity", re.I), "national_id"),
    (re.compile(r"visa\b|stamp", re.I), "visa"),
    (re.compile(r"selfie|face|live[-_ ]?photo|portrait", re.I), "selfie"),
]


class DocumentClassifier:
    @staticmethod
    def classify(file_path: str = None, mime_type: str = None, file_name: str = None) -> Dict[str, Any]:
        """
        Classify an uploaded document. Returns:
            {"document_type": <enum-value>, "confidence": <0-100>, "features": {...}}
        Deterministic for a given file (no randomness anywhere).
        """
        features: Dict[str, Any] = {}
        name = (file_name or "").lower()

        # --- filename prior (weak signal, +up to 30 confidence) ---
        filename_type = None
        for pattern, label in FILENAME_HINTS:
            if pattern.search(name):
                filename_type = label
                break

        # --- PDFs: no pixel pipeline available, rely on filename prior ---
        if (mime_type and "pdf" in mime_type.lower()) or name.endswith(".pdf"):
            features["mode"] = "pdf"
            if filename_type:
                return {
                    "document_type": filename_type,
                    "confidence": 62.0,
                    "features": {**features, "evidence": "filename keyword match (PDF payload not rasterized)"},
                }
            return {
                "document_type": "unknown",
                "confidence": 20.0,
                "features": {**features, "evidence": "PDF without filename hints"},
            }

        # --- image analysis ---
        try:
            if file_path and os.path.exists(file_path):
                img = Image.open(file_path)
                img.load()
            else:
                raise FileNotFoundError(file_path)
        except Exception:
            if filename_type:
                return {
                    "document_type": filename_type,
                    "confidence": 55.0,
                    "features": {"evidence": "filename keyword match (image unreadable)"},
                }
            return {
                "document_type": "unknown",
                "confidence": 15.0,
                "features": {"evidence": "image could not be decoded"},
            }

        img = img.convert("RGB")
        w, h = img.size
        gray = _to_grayscale_array(img)

        aspect = w / max(float(h), 1.0)
        mrz = _detect_mrz_bands(gray)
        colour = _colourfulness(img)
        sharpness = _laplacian_variance(gray)
        skin_left = _skin_tone_ratio(img, (0.02, 0.15, 0.35, 0.85))

        features.update({
            "mode": "image",
            "width": w,
            "height": h,
            "aspect_ratio": round(aspect, 3),
            "mrz_bands": mrz["bands"],
            "mrz_coverage": mrz["coverage"],
            "mrz_regular": mrz["regular"],
            "colourfulness": round(colour, 1),
            "sharpness": round(sharpness, 1),
            "portrait_skin_ratio": round(skin_left, 3),
        })

        # --- scoring: build evidence for each candidate class ---
        is_id1 = 1.45 <= aspect <= 1.75          # ID-1 card footprint
        is_passport_page = 1.30 <= aspect <= 1.50  # passport data page
        has_mrz = mrz["bands"] >= 1 and mrz["coverage"] > 0.05
        twin_mrz = mrz["bands"] >= 2 and mrz["regular"] > 0.5
        has_portrait = skin_left > 0.06
        vivid = colour > 22

        scores = {"passport": 0.0, "national_id": 0.0, "driving_licence": 0.0, "visa": 0.0, "selfie": 0.0}

        if has_mrz:
            if twin_mrz:
                scores["passport"] += 34
                scores["national_id"] += 6
            else:
                scores["passport"] += 12
                scores["national_id"] += 20
                scores["driving_licence"] += 18
        if is_id1:
            scores["national_id"] += 14
            scores["driving_licence"] += 12
        if is_passport_page:
            scores["passport"] += 18
        if has_portrait:
            scores["passport"] += 8
            scores["driving_licence"] += 8
            scores["national_id"] += 6
        if vivid:
            scores["national_id"] += 5
            scores["driving_licence"] += 5
            scores["visa"] += 8

        # single tall face-like shot => selfie
        face_centred = _skin_tone_ratio(img, (0.2, 0.1, 0.8, 0.9))
        if face_centred > 0.18 and not has_mrz and aspect < 1.2:
            scores["selfie"] += 45
            features["face_centred_skin_ratio"] = round(face_centred, 3)

        if filename_type and filename_type in scores:
            scores[filename_type] += 30

        best = max(scores, key=scores.get)
        raw = scores[best]
        if best == "unknown" or raw < 18:
            return {"document_type": "unknown", "confidence": round(min(max(raw, 10.0), 45.0), 1), "features": features}

        # confidence: dominance over runner-up, squashed into 55-97
        runner_up = sorted(scores.values(), reverse=True)[1]
        margin = raw - runner_up
        confidence = 55.0 + min(42.0, 0.55 * raw + 0.8 * margin)
        if sharpness < 25:  # blurry capture reduces certainty
            confidence -= 8
        confidence = round(min(confidence, 97.0), 1)

        return {"document_type": best, "confidence": confidence, "features": features}
