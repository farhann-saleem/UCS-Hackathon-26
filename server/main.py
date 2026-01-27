"""CheckMate FastAPI Server - API endpoints for the dashboard."""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="CheckMate API",
    description="Security vulnerability scanner with human-in-the-loop feedback",
    version="1.0.0",
)

# CORS middleware for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data directory
DATA_DIR = Path(__file__).parent.parent / "data"


# Pydantic models
class FeedbackRequest(BaseModel):
    flag_id: str
    verdict: str  # "false_positive" or "valid"
    rule_id: Optional[str] = None
    matched_text: Optional[str] = None


class FeedbackResponse(BaseModel):
    success: bool
    message: str
    whitelist_updated: bool = False


class UpdateScanNameRequest(BaseModel):
    name: str


# Helper functions
def read_json(filename: str) -> dict:
    """Read a JSON file from the data directory."""
    filepath = DATA_DIR / filename
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def write_json(filename: str, data: dict) -> None:
    """Write data to a JSON file in the data directory."""
    filepath = DATA_DIR / filename
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)


# API Endpoints
@app.get("/api/health")
async def health_check():
    """Health check endpoint - returns status and whether there's a scan."""
    results = read_json("scan_results.json")
    has_scan = bool(results.get("flags", []))
    return {
        "status": "ok",
        "has_scan": has_scan,
        "total_flags": len(results.get("flags", [])),
    }


@app.get("/api/results")
async def get_results():
    """Get the current scan results."""
    results = read_json("scan_results.json")
    return results


@app.post("/api/feedback", response_model=FeedbackResponse)
async def submit_feedback(feedback: FeedbackRequest):
    """Submit feedback for a flag (mark as safe or valid)."""
    # Load current data
    feedback_data = read_json("feedback.json")
    if "entries" not in feedback_data:
        feedback_data["entries"] = []

    whitelist_data = read_json("whitelist.json")
    if "patterns" not in whitelist_data:
        whitelist_data["patterns"] = []

    results = read_json("scan_results.json")
    metrics = read_json("metrics.json")

    # Find the flag
    flag = None
    for f in results.get("flags", []):
        if f["flag_id"] == feedback.flag_id:
            flag = f
            break

    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")

    # Create feedback entry
    entry = {
        "flag_id": feedback.flag_id,
        "rule_id": flag.get("rule_id", feedback.rule_id),
        "verdict": feedback.verdict,
        "matched_text": flag.get("matched_text", feedback.matched_text),
        "timestamp": datetime.now().isoformat(),
    }
    feedback_data["entries"].append(entry)

    # If false positive, add to whitelist
    whitelist_updated = False
    if feedback.verdict == "false_positive":
        matched_text = flag.get("matched_text", "")
        if matched_text and matched_text not in whitelist_data["patterns"]:
            whitelist_data["patterns"].append(matched_text)
            whitelist_updated = True

    # Update metrics
    if "precision_history" not in metrics:
        metrics["precision_history"] = []

    total_feedback = len(feedback_data["entries"])
    valid_count = len([e for e in feedback_data["entries"] if e["verdict"] == "valid"])
    false_positive_count = len([e for e in feedback_data["entries"] if e["verdict"] == "false_positive"])

    precision = (valid_count / total_feedback * 100) if total_feedback > 0 else 0

    metrics["precision_history"].append({
        "timestamp": datetime.now().isoformat(),
        "precision": round(precision, 1),
        "total_feedback": total_feedback,
        "valid_count": valid_count,
        "false_positive_count": false_positive_count,
    })
    metrics["current_precision"] = round(precision, 1)
    metrics["total_feedback"] = total_feedback
    metrics["valid_count"] = valid_count
    metrics["false_positive_count"] = false_positive_count

    # Save all data
    write_json("feedback.json", feedback_data)
    write_json("whitelist.json", whitelist_data)
    write_json("metrics.json", metrics)

    return FeedbackResponse(
        success=True,
        message=f"Feedback recorded: {feedback.verdict}",
        whitelist_updated=whitelist_updated,
    )


@app.get("/api/metrics")
async def get_metrics():
    """Get metrics data including precision history."""
    metrics = read_json("metrics.json")
    feedback = read_json("feedback.json")
    whitelist = read_json("whitelist.json")

    # Calculate current stats
    entries = feedback.get("entries", [])
    total_feedback = len(entries)
    valid_count = len([e for e in entries if e["verdict"] == "valid"])
    false_positive_count = len([e for e in entries if e["verdict"] == "false_positive"])

    # Baseline precision (before any feedback)
    baseline_precision = 60.0  # Assumed baseline

    # Current precision
    current_precision = (valid_count / total_feedback * 100) if total_feedback > 0 else baseline_precision

    return {
        "total_scans": metrics.get("total_scans", 0),
        "total_feedback": total_feedback,
        "valid_count": valid_count,
        "false_positive_count": false_positive_count,
        "baseline_precision": baseline_precision,
        "current_precision": round(current_precision, 1),
        "improvement": round(current_precision - baseline_precision, 1),
        "whitelist_count": len(whitelist.get("patterns", [])),
        "precision_history": metrics.get("precision_history", []),
    }


@app.get("/api/whitelist")
async def get_whitelist():
    """Get current whitelist patterns."""
    whitelist = read_json("whitelist.json")
    return whitelist


@app.delete("/api/whitelist/{pattern}")
async def remove_from_whitelist(pattern: str):
    """Remove a pattern from the whitelist."""
    whitelist = read_json("whitelist.json")
    if pattern in whitelist.get("patterns", []):
        whitelist["patterns"].remove(pattern)
        write_json("whitelist.json", whitelist)
        return {"success": True, "message": "Pattern removed from whitelist"}
    raise HTTPException(status_code=404, detail="Pattern not found in whitelist")


# ============ Scan History Endpoints ============

@app.get("/api/history")
async def get_scan_history():
    """Get all scan history sorted by newest first."""
    history = read_json("scan_history.json")
    scans = history.get("scans", [])
    # Sort by timestamp descending (newest first)
    scans.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return {"scans": scans, "total": len(scans)}


@app.get("/api/history/{scan_id}")
async def get_scan_by_id(scan_id: str):
    """Get a specific scan by ID."""
    history = read_json("scan_history.json")
    for scan in history.get("scans", []):
        if scan.get("scan_id") == scan_id:
            return scan
    raise HTTPException(status_code=404, detail="Scan not found")


@app.put("/api/history/{scan_id}/name")
async def update_scan_name(scan_id: str, request: UpdateScanNameRequest):
    """Update the name of a scan."""
    history = read_json("scan_history.json")

    for scan in history.get("scans", []):
        if scan.get("scan_id") == scan_id:
            scan["name"] = request.name
            write_json("scan_history.json", history)
            return {"success": True, "message": "Scan name updated", "name": request.name}

    raise HTTPException(status_code=404, detail="Scan not found")


@app.delete("/api/history/{scan_id}")
async def delete_scan(scan_id: str):
    """Delete a scan from history."""
    history = read_json("scan_history.json")
    original_count = len(history.get("scans", []))

    history["scans"] = [s for s in history.get("scans", []) if s.get("scan_id") != scan_id]

    if len(history["scans"]) < original_count:
        write_json("scan_history.json", history)
        return {"success": True, "message": "Scan deleted"}

    raise HTTPException(status_code=404, detail="Scan not found")


@app.post("/api/history/{scan_id}/load")
async def load_scan_to_current(scan_id: str):
    """Load a historical scan as the current scan."""
    history = read_json("scan_history.json")

    for scan in history.get("scans", []):
        if scan.get("scan_id") == scan_id:
            write_json("scan_results.json", scan)
            return {"success": True, "message": "Scan loaded as current"}

    raise HTTPException(status_code=404, detail="Scan not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
