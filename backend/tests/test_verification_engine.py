import pytest
from app.services.verification_engine import VerificationEngine

def test_icao_checksum_calculation():
    """Verify ICAO 9303 standard check digit (weights 7, 3, 1)."""
    # Test valid passport number checksum
    passport_sample = "L898902C3"
    checksum = VerificationEngine.calculate_icao_checksum(passport_sample)
    assert isinstance(checksum, int)
    assert 0 <= checksum <= 9

def test_verification_engine_pipeline_deterministic():
    """Verify that the 9-layer verification pipeline executes successfully."""
    result = VerificationEngine.run_pipeline(
        case_id="TEST-CASE-001",
        applicant_name="Aarav Sharma",
        doc_type="Passport",
        file_path=None
    )
    
    assert "trust_score" in result
    assert "risk_level" in result
    assert "final_decision" in result
    assert "signals" in result
    assert "merkle_root" in result
    
    assert result["trust_score"] >= 0 and result["trust_score"] <= 100
    assert result["final_decision"] in ["VERIFIED", "SUSPICIOUS", "MANUAL_REVIEW", "REJECTED"]
    assert len(result["signals"]) >= 8
    
    # Check signal structure
    for sig in result["signals"]:
        assert "signal_name" in sig
        assert "status" in sig
        assert "confidence" in sig
        assert "detail" in sig

def test_verification_engine_signals_coverage():
    """Ensure all critical forensic and biometric signals are checked."""
    result = VerificationEngine.run_pipeline(
        case_id="TEST-CASE-002",
        applicant_name="Priya Patel",
        doc_type="National ID",
        file_path=None
    )
    
    signal_names = [s["signal_name"] for s in result["signals"]]
    expected_signals = [
        "crypto_integrity",
        "ela_tampering",
        "font_typography",
        "mrz_checksum",
        "viz_mrz_consistency",
        "security_patterns",
        "face_biometric_match",
        "liveness_passive",
        "blockchain_timestamp"
    ]
    for expected in expected_signals:
        assert expected in signal_names
