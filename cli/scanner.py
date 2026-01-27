"""CheckMate scanner - scans files for vulnerabilities."""

import json
import os
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

try:
    from .detectors import ALL_RULES, detect_all
    from .detectors.base import Flag
    from .multi_lang_scanner import (
        scan_file_multi_lang,
        scan_files_multi_lang,
        get_file_type,
    )
except ImportError:
    from detectors import ALL_RULES, detect_all
    from detectors.base import Flag
    from multi_lang_scanner import (
        scan_file_multi_lang,
        scan_files_multi_lang,
        get_file_type,
    )

# Data directory path
DATA_DIR = Path(__file__).parent.parent / "data"


def load_whitelist() -> List[str]:
    """Load whitelist patterns from whitelist.json."""
    whitelist_path = DATA_DIR / "whitelist.json"
    try:
        with open(whitelist_path, "r") as f:
            data = json.load(f)
            return data.get("patterns", [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def scan_file(filepath: str, use_multi_lang: bool = True) -> List[Flag]:
    """
    Scan a single file for vulnerabilities.

    Args:
        filepath: Path to the file to scan
        use_multi_lang: Whether to use multi-language scanner (Python, JS, TS)

    Returns:
        List of Flag objects for detected vulnerabilities
    """
    filepath = Path(filepath)
    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    # Read file content
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        code = f.read()

    # Load whitelist
    whitelist = load_whitelist()

    # Use multi-language scanner for supported file types
    if use_multi_lang:
        file_type = get_file_type(str(filepath))
        if file_type in ["python", "javascript", "typescript", "html", "css"]:
            findings = scan_file_multi_lang(str(filepath), code)
            # Convert multi-lang findings to Flag objects
            flags = []
            for finding in findings:
                # Check against whitelist
                if any(pattern in finding.matched_text for pattern in whitelist):
                    continue

                flag = Flag(
                    flag_id=f"{finding.pattern_id}_{finding.line_number}",
                    rule_id=finding.pattern_id,
                    severity=finding.severity,
                    line_number=finding.line_number,
                    line_content=(
                        code.split("\n")[finding.line_number - 1]
                        if finding.line_number <= len(code.split("\n"))
                        else ""
                    ),
                    matched_text=finding.matched_text,
                    explanation=finding.message,
                    suggested_fix=f"Review {finding.category} vulnerability at line {finding.line_number}",
                    file_path=str(filepath),
                )
                flags.append(flag)
            return flags

    # Fallback to original Python-only detector
    flags = detect_all(code, ALL_RULES, str(filepath), whitelist)

    return flags


def scan_directory(dirpath: str, extensions: List[str] = None) -> List[Flag]:
    """
    Scan all files in a directory for vulnerabilities.

    Args:
        dirpath: Path to the directory to scan
        extensions: List of file extensions to scan (e.g., ['.py', '.js'])

    Returns:
        List of Flag objects for all detected vulnerabilities
    """
    extensions = extensions or [
        ".py",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".html",
        ".htm",
        ".css",
    ]
    dirpath = Path(dirpath)
    all_flags = []

    for filepath in dirpath.rglob("*"):
        if filepath.is_file() and filepath.suffix in extensions:
            # Skip node_modules, venv, __pycache__
            if any(
                skip in str(filepath)
                for skip in ["node_modules", "venv", "__pycache__", ".git"]
            ):
                continue
            try:
                flags = scan_file(str(filepath))
                all_flags.extend(flags)
            except Exception as e:
                print(f"Error scanning {filepath}: {e}")

    return all_flags


def save_results(flags: List[Flag], filepath: str = None) -> Dict[str, Any]:
    """
    Save scan results to scan_results.json and append to scan_history.json.

    Args:
        flags: List of Flag objects
        filepath: Original file path that was scanned

    Returns:
        The results dictionary that was saved
    """
    import uuid

    scan_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().isoformat()

    # Generate default name from filepath
    default_name = Path(filepath).name if filepath else f"Scan {scan_id}"

    results = {
        "scan_id": scan_id,
        "name": default_name,  # Editable name
        "timestamp": timestamp,
        "file_scanned": filepath,
        "total_flags": len(flags),
        "flags": [flag.to_dict() for flag in flags],
        "summary": {
            "critical": len([f for f in flags if f.severity == "critical"]),
            "danger": len([f for f in flags if f.severity == "danger"]),
            "high_risk": len([f for f in flags if f.severity == "high_risk"]),
        },
    }

    # Save to scan_results.json (latest scan)
    results_path = DATA_DIR / "scan_results.json"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)

    # Append to scan_history.json (append-only)
    append_to_history(results)

    # Update metrics
    update_metrics(flags)

    return results


def append_to_history(scan_result: Dict[str, Any]) -> None:
    """Append a scan result to the history file (append-only)."""
    history_path = DATA_DIR / "scan_history.json"

    # Load existing history
    try:
        with open(history_path, "r") as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        history = {"scans": []}

    # Append new scan
    history["scans"].append(scan_result)

    # Save updated history
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)


def get_scan_history() -> List[Dict[str, Any]]:
    """Get all scan history sorted by newest first."""
    history_path = DATA_DIR / "scan_history.json"

    try:
        with open(history_path, "r") as f:
            history = json.load(f)
            scans = history.get("scans", [])
            # Sort by timestamp descending (newest first)
            scans.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return scans
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def update_scan_name(scan_id: str, new_name: str) -> bool:
    """Update the name of a scan in history."""
    history_path = DATA_DIR / "scan_history.json"

    try:
        with open(history_path, "r") as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return False

    # Find and update the scan
    for scan in history.get("scans", []):
        if scan.get("scan_id") == scan_id:
            scan["name"] = new_name
            with open(history_path, "w") as f:
                json.dump(history, f, indent=2)
            return True

    return False


def delete_scan(scan_id: str) -> bool:
    """Delete a scan from history."""
    history_path = DATA_DIR / "scan_history.json"

    try:
        with open(history_path, "r") as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return False

    # Filter out the scan to delete
    original_count = len(history.get("scans", []))
    history["scans"] = [
        s for s in history.get("scans", []) if s.get("scan_id") != scan_id
    ]

    if len(history["scans"]) < original_count:
        with open(history_path, "w") as f:
            json.dump(history, f, indent=2)
        return True

    return False


def get_scan_by_id(scan_id: str) -> Dict[str, Any] | None:
    """Get a specific scan by ID."""
    history_path = DATA_DIR / "scan_history.json"

    try:
        with open(history_path, "r") as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

    for scan in history.get("scans", []):
        if scan.get("scan_id") == scan_id:
            return scan

    return None


def update_metrics(flags: List[Flag]) -> None:
    """Update metrics.json with new scan data."""
    metrics_path = DATA_DIR / "metrics.json"

    try:
        with open(metrics_path, "r") as f:
            metrics = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        metrics = {"total_scans": 0, "precision_history": []}

    metrics["total_scans"] = metrics.get("total_scans", 0) + 1
    metrics["last_scan"] = datetime.now().isoformat()
    metrics["last_flag_count"] = len(flags)

    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)


def reset_data() -> None:
    """Reset all data files to initial state."""
    # Reset scan_results.json
    with open(DATA_DIR / "scan_results.json", "w") as f:
        json.dump({"flags": []}, f)

    # Reset scan_history.json
    with open(DATA_DIR / "scan_history.json", "w") as f:
        json.dump({"scans": []}, f)

    # Reset whitelist.json
    with open(DATA_DIR / "whitelist.json", "w") as f:
        json.dump({"patterns": []}, f)

    # Reset feedback.json
    with open(DATA_DIR / "feedback.json", "w") as f:
        json.dump({"entries": []}, f)

    # Reset metrics.json
    with open(DATA_DIR / "metrics.json", "w") as f:
        json.dump({"total_scans": 0, "precision_history": []}, f)


def get_whitelist() -> List[str]:
    """Get current whitelist patterns."""
    return load_whitelist()
