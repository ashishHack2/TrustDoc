"""End-to-end API test battery for TRUSTDOC — zero-error verification pass."""
import io
import json
import random
import urllib.request
import urllib.error

BASE = "http://localhost:8000"
RESULTS = []


def call(method, path, token=None, data=None, headers=None, raw_body=None):
    url = BASE + path
    h = dict(headers or {})
    if token:
        h["Authorization"] = f"Bearer {token}"
    body = raw_body
    if data is not None:
        body = json.dumps(data).encode()
        h.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def check(name, cond, extra=""):
    RESULTS.append((name, bool(cond)))
    print(("PASS" if cond else "FAIL"), "-", name, extra)


# ---------- auth ----------
code, body = call("POST", "/api/v1/auth/login", data={"username": "admin@trustdoc.gov.in", "password": "TrustDoc2026!"})
token = json.loads(body)["access_token"]
check("login admin", code == 200)
code, body = call("POST", "/api/v1/auth/login", data={"username": "admin@trustdoc.gov.in", "password": "wrong"})
check("login rejects bad password (400)", code == 400)
code, body = call("GET", "/api/v1/cases")
check("cases require auth (401)", code == 401)

# ---------- build test images ----------
from PIL import Image, ImageDraw, ImageFilter

def make_passport(path):
    img = Image.new("RGB", (900, 570), (238, 236, 228))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 899, 70], fill=(15, 45, 90))
    d.ellipse([55, 120, 215, 310], fill=(196, 168, 150))
    d.ellipse([85, 155, 185, 265], fill=(210, 185, 168))
    for y in range(120, 320, 14):
        d.text((240, y), "SURNAME: SHARMA  GIVEN: RAJESH KUMAR", fill=(30, 30, 30))
    for y in range(330, 440, 14):
        d.text((240, y), "IND V4621885 12-04-1992 M 15-08-2031", fill=(30, 30, 30))
    d.rectangle([0, 455, 899, 505], fill=(245, 243, 238))
    for x in range(5, 895, 7):
        d.text((x, 462), "P<INDSHARMA<<RAJESH<KUMAR<<<<<<<<<<<<<<", fill=(20, 20, 20))
    d.rectangle([0, 508, 899, 558], fill=(245, 243, 238))
    for x in range(5, 895, 7):
        d.text((x, 515), "V4621885<4IND9204128M3108155<<<<<<<<<<<<04", fill=(20, 20, 20))
    img.save(path, quality=93)

def make_tampered(src_path, path):
    """Altered-name forgery: fresh-rendered text pasted over the compressed
    scan (classic ELA-detectable fraud — the new pixels have no compression
    history, so they resurface under recompression)."""
    img = Image.open(src_path)
    d = ImageDraw.Draw(img)
    d.rectangle([240, 130, 700, 185], fill=(238, 236, 228))
    for x in range(242, 698, 7):
        d.text((x, 136), "SURNAME: FAKEMAN  GIVEN: JOHN PAUL", fill=(30, 30, 30))
    img.save(path, quality=93)

def make_selfie(path):
    img = Image.new("RGB", (480, 640), (180, 200, 215))
    d = ImageDraw.Draw(img)
    d.ellipse([120, 120, 360, 430], fill=(205, 175, 155))
    d.ellipse([160, 200, 210, 260], fill=(60, 50, 45))
    d.ellipse([270, 200, 320, 260], fill=(60, 50, 45))
    d.arc([180, 260, 300, 380], 20, 160, fill=(150, 90, 80), width=6)
    d.rectangle([60, 430, 420, 640], fill=(90, 110, 130))
    img.save(path, quality=92)

make_passport("test_passport.jpg")
make_tampered("test_passport.jpg", "test_tampered.jpg")
make_selfie("test_selfie.jpg")

def upload(case_id, file_path):
    boundary = "----tdbattery"
    with open(file_path, "rb") as f:
        payload = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{file_path}\"\r\n"
                   f"Content-Type: image/jpeg\r\n\r\n").encode() + f.read() + f"\r\n--{boundary}--\r\n".encode()
    code, body = call("POST", f"/api/v1/cases/{case_id}/documents", token=token, raw_body=payload,
                      headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    return code, json.loads(body) if body else {}

# ---------- clean passport: should VERIFY ----------
code, body = call("POST", "/api/v1/cases", token=token, data={"applicant_name": "Rajesh Sharma", "expected_document_type": "Passport"})
case_ok = json.loads(body)["id"]
code, doc = upload(case_ok, "test_passport.jpg")
check("clean passport classified as passport", doc.get("document_type") == "passport", f"(conf={doc.get('confidence')})")
check("classification confidence >= 80", (doc.get("confidence") or 0) >= 80, f"(conf={doc.get('confidence')})")
code, body = call("GET", f"/api/v1/cases/{case_ok}/verification", token=token)
v = json.loads(body)
ela = next(s for s in v["signals"] if s["signal_name"] == "ela_tampering")
mrz = next(s for s in v["signals"] if s["signal_name"] == "mrz_checksum")
check("clean passport ELA passes", ela["status"] == "PASS", f"(conf={ela['confidence']})")
check("MRZ two bands detected", mrz["status"] == "PASS" and "Two" in mrz["detail"])
check("clean passport verdict VERIFIED", v["final_decision"] == "VERIFIED", f"(score={v['trust_score']})")
code, body = call("GET", f"/api/v1/cases/{case_ok}", token=token)
check("case status COMPLETED", json.loads(body)["status"] == "COMPLETED")

# determinism: re-fetch verification, same score
code, body2 = call("GET", f"/api/v1/cases/{case_ok}/verification", token=token)
check("verification deterministic", json.loads(body2)["trust_score"] == v["trust_score"])

# ---------- tampered document: should be flagged ----------
code, body = call("POST", "/api/v1/cases", token=token, data={"applicant_name": "Fake Doc", "expected_document_type": "Passport"})
case_bad = json.loads(body)["id"]
code, doc = upload(case_bad, "test_tampered.jpg")
check("tampered upload succeeded", code == 201)
code, body = call("GET", f"/api/v1/cases/{case_bad}/verification", token=token)
vb = json.loads(body)
ela_b = next(s for s in vb["signals"] if s["signal_name"] == "ela_tampering")
check("tampered ELA flagged (WARNING)", ela_b["status"] == "WARNING", f"(conf={ela_b['confidence']})")
check("tampered scores below clean", vb["trust_score"] < v["trust_score"], f"({vb['trust_score']} < {v['trust_score']})")

# ---------- selfie classification ----------
code, body = call("POST", "/api/v1/cases", token=token, data={"applicant_name": "Selfie Test", "expected_document_type": "Passport"})
case_s = json.loads(body)["id"]
code, doc = upload(case_s, "test_selfie.jpg")
check("selfie classified as selfie", doc.get("document_type") == "selfie", f"(got {doc.get('document_type')}, conf={doc.get('confidence')})")

# ---------- document + selfie combo ----------
code, body = call("POST", "/api/v1/cases", token=token, data={"applicant_name": "Combo Test", "expected_document_type": "Passport"})
case_c = json.loads(body)["id"]
code, d1 = upload(case_c, "test_passport.jpg")
code, d2 = upload(case_c, "test_selfie.jpg")
code, body = call("GET", f"/api/v1/cases/{case_c}/verification", token=token)
vc = json.loads(body)
bio = next(s for s in vc["signals"] if s["signal_name"] == "face_biometric_match")
check("combo: selfie noted in biometric signal", "selfie" in (bio["detail"] or "").lower())
check("combo: verdict still VERIFIED", vc["final_decision"] == "VERIFIED", f"(score={vc['trust_score']})")

# ---------- PDF with filename hint ----------
boundary = "----tdbattery"
pdf_bytes = b"%PDF-1.4 fake minimal pdf payload"
payload = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"scanned_passport.pdf\"\r\n"
           f"Content-Type: application/pdf\r\n\r\n").encode() + pdf_bytes + f"\r\n--{boundary}--\r\n".encode()
code, body = call("POST", "/api/v1/cases", token=token, data={"applicant_name": "PDF Test", "expected_document_type": "Passport"})
case_p = json.loads(body)["id"]
code, doc = call("POST", f"/api/v1/cases/{case_p}/documents", token=token, raw_body=payload,
                 headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
doc = json.loads(doc)
check("PDF classified via filename hint", doc.get("document_type") == "passport", f"(got {doc.get('document_type')}, conf={doc.get('confidence')})")

# ---------- validation errors ----------
code, body = call("POST", "/api/v1/cases", token=token, data={"applicant_name": ""})
check("empty applicant rejected (422)", code == 422)
code, body = call("GET", f"/api/v1/cases/nonexistent-id", token=token)
check("unknown case 404", code == 404)

# ---------- analytics + processing status ----------
code, body = call("GET", "/api/v1/analytics/overview", token=token)
ov = json.loads(body)
check("analytics overview ok", code == 200 and ov["total_cases"] >= 5)
code, body = call("GET", f"/api/v1/cases/{case_ok}/processing-status", token=token)
check("processing status COMPLETED", json.loads(body)["status"] == "COMPLETED")

# ---------- report download ----------
code, body = call("GET", f"/api/v1/cases/{case_ok}/report/download", token=token)
check("evidence package downloads (200)", code == 200, f"(bytes={len(body)})")
ep = json.loads(body)
check("evidence package has case+documents+verification", all(k in ep for k in ("case", "documents", "verification")))
check("evidence package includes classification", ep["documents"][0]["document_type"] == "passport")

# ---------- report POST/GET ----------
code, body = call("POST", f"/api/v1/cases/{case_ok}/report", token=token)
check("report POST ok", code == 200)
code, body = call("GET", f"/api/v1/cases/{case_ok}/report", token=token)
check("report GET ok", code == 200)

# ---------- tamper evidence: invalid extension ----------
payload = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"evil.exe\"\r\n"
           f"Content-Type: application/octet-stream\r\n\r\n").encode() + b"MZ..." + f"\r\n--{boundary}--\r\n".encode()
code, body = call("POST", f"/api/v1/cases/{case_ok}/documents", token=token, raw_body=payload,
                  headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
check("exe upload rejected (400)", code == 400)

print()
passed = sum(1 for _, ok in RESULTS if ok)
print(f"==== {passed}/{len(RESULTS)} checks passed ====")
if passed != len(RESULTS):
    raise SystemExit(1)
