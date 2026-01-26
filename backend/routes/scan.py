from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

from models import ScanRequest, ScanResponse, Flag
from database import create_scan, create_flag, get_scan, get_flags_by_scan
from detectors import registry

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
            suggestion=match.suggestion
        )
        flags.append(Flag(
            flag_id=flag_id,
            rule_id=match.rule_id,
            severity=match.severity,
            message=match.message,
            line_number=match.line_number,
            line_content=match.line_content,
            suggestion=match.suggestion
        ))

    return ScanResponse(
        scan_id=scan_id,
        flags=flags,
        total_flags=len(flags),
        timestamp=timestamp
    )


@router.get("/scan/{scan_id}", response_model=ScanResponse)
async def get_scan_results(scan_id: str) -> ScanResponse:
    """Get scan results by scan ID."""
    scan = await get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    flags_data = await get_flags_by_scan(scan_id)
    flags = [
        Flag(
            flag_id=f["flag_id"],
            rule_id=f["rule_id"],
            severity=f["severity"],
            message=f["message"],
            line_number=f["line_number"],
            line_content=f["line_content"],
            suggestion=f["suggestion"]
        )
        for f in flags_data
    ]

    return ScanResponse(
        scan_id=scan_id,
        flags=flags,
        total_flags=len(flags),
        timestamp=scan["created_at"]
    )
