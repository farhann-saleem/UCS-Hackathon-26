from fastapi import APIRouter, HTTPException
import uuid
import json
import os

from models import FeedbackRequest, FeedbackResponse
from database import create_feedback, get_feedback_for_flag, get_flag_by_id

router = APIRouter(prefix="/api", tags=["feedback"])

WHITELIST_PATH = os.path.join(os.path.dirname(__file__), "../data/whitelist.json")


def load_whitelist() -> dict:
    """Load whitelist from JSON file."""
    if os.path.exists(WHITELIST_PATH):
        with open(WHITELIST_PATH, "r") as f:
            return json.load(f)
    return {"patterns": []}


def save_whitelist(data: dict):
    """Save whitelist to JSON file."""
    os.makedirs(os.path.dirname(WHITELIST_PATH), exist_ok=True)
    with open(WHITELIST_PATH, "w") as f:
        json.dump(data, f, indent=2)


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest) -> FeedbackResponse:
    """Submit or update human feedback for a flagged issue. User can change their verdict anytime."""
    feedback_id = str(uuid.uuid4())
    try:
        await create_feedback(
            feedback_id=feedback_id,
            scan_id=request.scan_id,
            flag_id=request.flag_id,
            verdict=request.verdict
        )
        
        # If marked as false_positive, add/update whitelist
        if request.verdict == "false_positive":
            flag = await get_flag_by_id(request.flag_id)
            if flag:
                whitelist = load_whitelist()
                matched_text = flag.get("line_content", "")
                if matched_text and matched_text not in whitelist["patterns"]:
                    whitelist["patterns"].append(matched_text)
                    save_whitelist(whitelist)
        
        return FeedbackResponse(
            success=True,
            message=f"Feedback recorded: {request.verdict}"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to record feedback")
