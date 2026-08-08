"""
provenance/c2pa_check.py
------------------------
Phase 4: Tier-1 C2PA Cryptographic Provenance Fast-Fail.

Uses the `c2pa-python` binding to the `c2pa-rs` Rust library.
If the file contains a valid C2PA Content Credentials manifest signed by a
generative AI tool (e.g. Midjourney, ElevenLabs, Adobe Firefly), processing
stops immediately and AES is set to 99/100 (CONFIRMED_SYNTHETIC).

Fallback: if c2pa-python is not installed or the library is unavailable,
the check returns {"present": False, "error": "c2pa not available"}.
"""

from __future__ import annotations

import io
import json
from typing import Any, Dict


def check_c2pa_manifest(file_bytes: bytes) -> Dict[str, Any]:
    """
    Parse C2PA manifest from raw file bytes.

    Returns:
        {
            "present":   bool,   # True if a valid C2PA manifest was found
            "manifest":  dict,   # Parsed manifest data (if present)
            "generator": str,    # e.g. "Midjourney" (if identifiable)
            "error":     str,    # Non-empty if the check failed
        }
    """
    result: Dict[str, Any] = {
        "present":   False,
        "manifest":  {},
        "generator": "",
        "error":     "",
    }

    try:
        import c2pa  # type: ignore  # pip install c2pa-python
    except ImportError:
        result["error"] = (
            "c2pa-python not installed. "
            "Run: pip install c2pa-python  (requires the c2pa-rs Rust toolchain)"
        )
        return result

    try:
        # c2pa-python API: c2pa.read_file() accepts a path or bytes
        # We write bytes to a temp buffer and read back
        import tempfile, os
        with tempfile.NamedTemporaryFile(delete=False, suffix=".bin") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            manifest_store_json = c2pa.read_file(tmp_path, None)
            if manifest_store_json:
                manifest = json.loads(manifest_store_json)
                result["present"] = True
                result["manifest"] = manifest

                # Try to extract the generator / tool name
                for claim in manifest.get("manifests", {}).values():
                    for assertion in claim.get("assertions", []):
                        if assertion.get("label") == "c2pa.training-mining":
                            continue  # skip non-identifying assertions
                        if "softwareAgent" in str(assertion):
                            result["generator"] = str(assertion)[:80]
                            break
        finally:
            os.unlink(tmp_path)

    except Exception as exc:
        result["error"] = str(exc)

    return result
