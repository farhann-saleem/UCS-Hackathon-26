from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
import json
from pathlib import Path
from pydantic import BaseModel

from models import ScanRequest, ScanResponse, Flag
from database import (
    create_scan,
    create_flag,
    get_scan,
    get_flags_by_scan,
    get_all_scans,
    update_scan_name,
    get_feedback_verdict,
)
from detectors import registry

# Path to CLI data directory
DATA_DIR = Path(__file__).parent.parent.parent / "data"


class UpdateScanNameRequest(BaseModel):
    name: str


router = APIRouter(prefix="/api", tags=["scan"])


@router.post("/scan", response_model=ScanResponse)
async def scan_code(request: ScanRequest) -> ScanResponse:
    """Scan code for security vulnerabilities."""
    scan_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()

    # Save the scan to database
    await create_scan(scan_id, request.code, request.language)

    # Run all detectors
    matches = registry.scan_all(request.code, request.language)

    # Convert matches to flags and save to database
    flags = []
    for match in matches:
        flag_id = str(uuid.uuid4())
        await create_flag(
            flag_id=flag_id,
            scan_id=scan_id,
            rule_id=match.rule_id,
            severity=match.severity,
            message=match.message,
            line_number=match.line_number,
            line_content=match.line_content,
            suggestion=match.suggestion,
        )
        # Get feedback status if exists
        feedback_status = await get_feedback_verdict(flag_id)
        flags.append(
            Flag(
                flag_id=flag_id,
                rule_id=match.rule_id,
                severity=match.severity,
                message=match.message,
                line_number=match.line_number,
                line_content=match.line_content,
                suggestion=match.suggestion,
                feedback_status=feedback_status,
            )
        )

    return ScanResponse(
        scan_id=scan_id, flags=flags, total_flags=len(flags), timestamp=timestamp
    )


@router.get("/scan/{scan_id}", response_model=ScanResponse)
async def get_scan_results(scan_id: str) -> ScanResponse:
    """Get scan results by scan ID (from database or CLI JSON files)."""
    # Try database first
    scan = await get_scan(scan_id)
    if scan:
        flags_data = await get_flags_by_scan(scan_id)
        flags = []
        for f in flags_data:
            feedback_status = await get_feedback_verdict(f["flag_id"])
            flags.append(
                Flag(
                    flag_id=f["flag_id"],
                    rule_id=f["rule_id"],
                    severity=f["severity"],
                    message=f["message"],
                    line_number=f["line_number"],
                    line_content=f["line_content"],
                    suggestion=f["suggestion"],
                    feedback_status=feedback_status,
                )
            )

        return ScanResponse(
            scan_id=scan_id,
            flags=flags,
            total_flags=len(flags),
            timestamp=scan["created_at"],
        )

    # Try CLI JSON files if not in database
    history_path = DATA_DIR / "scan_history.json"
    if history_path.exists():
        try:
            with open(history_path, "r") as f:
                history_data = json.load(f)
                for scan_data in history_data.get("scans", []):
                    if scan_data.get("scan_id") == scan_id:
                        # Convert CLI flags to Flag objects
                        flags = []
                        for flag in scan_data.get("flags", []):
                            feedback_status = await get_feedback_verdict(flag.get("flag_id", ""))
                            flags.append(
                                Flag(
                                    flag_id=flag.get("flag_id", ""),
                                    rule_id=flag.get("rule_id", ""),
                                    severity=flag.get("severity", "low"),
                                    message=flag.get("explanation", ""),
                                    line_number=flag.get("line_number", 0),
                                    line_content=flag.get("line_content", ""),
                                    suggestion=flag.get("suggested_fix", ""),
                                    feedback_status=feedback_status,
                                )
                            )
                        return ScanResponse(
                            scan_id=scan_id,
                            flags=flags,
                            total_flags=len(flags),
                            timestamp=scan_data.get("timestamp", ""),
                        )
        except (json.JSONDecodeError, IOError):
            pass

    raise HTTPException(status_code=404, detail="Scan not found")


@router.get("/scans")
async def get_scans_history():
    """Get history of all scans from both database and CLI JSON files."""
    # Get scans from database
    db_scans = await get_all_scans()

    # Get scans from CLI JSON files
    cli_scans = []
    history_path = DATA_DIR / "scan_history.json"

    if history_path.exists():
        try:
            with open(history_path, "r") as f:
                history_data = json.load(f)
                cli_scans = history_data.get("scans", [])
        except (json.JSONDecodeError, IOError):
            cli_scans = []

    # Merge and deduplicate by scan_id (prefer database version if exists)
    scan_dict = {}

    # Add CLI scans first with proper field mapping
    for scan in cli_scans:
        scan_id = scan.get("scan_id")
        if scan_id:
            # Detect language from file extension
            file_scanned = scan.get("file_scanned", "")
            language = "python"  # default
            if file_scanned:
                if file_scanned.endswith(".js"):
                    language = "javascript"
                elif file_scanned.endswith(".ts"):
                    language = "typescript"
                elif file_scanned.endswith(".html"):
                    language = "html"
                elif file_scanned.endswith(".css"):
                    language = "css"

            # Transform CLI format to API format
            transformed_scan = {
                "scan_id": scan.get("scan_id"),
                "name": scan.get("name", "Scan"),
                "language": language,
                "code_preview": file_scanned[:100] if file_scanned else "",
                "flag_count": scan.get("total_flags", 0),
                "created_at": scan.get("timestamp", ""),
                "timestamp": scan.get("timestamp", ""),
                # Keep original fields for backward compatibility
                "file_scanned": file_scanned,
                "total_flags": scan.get("total_flags", 0),
                "flags": scan.get("flags", []),
                "summary": scan.get("summary", {}),
            }
            scan_dict[scan_id] = transformed_scan

    # Override with database scans (they're more up-to-date)
    for scan in db_scans:
        scan_id = scan.get("scan_id")
        if scan_id:
            # Transform DB format to API format
            transformed_scan = {
                "scan_id": scan.get("scan_id"),
                "name": scan.get("name", "Scan"),
                "language": scan.get("language", "python"),
                "code_preview": scan.get("code", "")[:100],  # First 100 chars of code
                "flag_count": 0,  # Will be updated below
                "created_at": scan.get("created_at", ""),
                "timestamp": scan.get("created_at", ""),
                # Keep original fields
                **scan,
            }
            scan_dict[scan_id] = transformed_scan

    # Convert to list and sort by timestamp (newest first)
    all_scans = list(scan_dict.values())
    all_scans.sort(
        key=lambda x: x.get("created_at") or x.get("timestamp", ""), reverse=True
    )

    return {"scans": all_scans, "total": len(all_scans)}


@router.put("/scan/{scan_id}/name")
async def update_scan_name_endpoint(scan_id: str, request: UpdateScanNameRequest):
    """Update the name of a scan."""
    scan = await get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    await update_scan_name(scan_id, request.name)
    return {"success": True, "scan_id": scan_id, "name": request.name}
