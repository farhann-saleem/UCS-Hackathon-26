from fastapi import APIRouter, HTTPException
import uuid

from models import FeedbackRequest, FeedbackResponse
from database import create_feedback, get_feedback_for_flag

router = APIRouter(prefix="/api", tags=["feedback"])


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest) -> FeedbackResponse:
    """Submit human feedback for a flagged issue."""
    # Check if feedback already exists for this flag
    existing = await get_feedback_for_flag(request.flag_id)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Feedback already submitted for this flag"
        )

    feedback_id = str(uuid.uuid4())
    try:
        await create_feedback(
            feedback_id=feedback_id,
            scan_id=request.scan_id,
            flag_id=request.flag_id,
            verdict=request.verdict
        )
        return FeedbackResponse(
            success=True,
            message=f"Feedback recorded: {request.verdict}"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to record feedback")
