from fastapi import APIRouter

from models import MetricsResponse, RuleMetric
from database import get_metrics

router = APIRouter(prefix="/api", tags=["metrics"])


@router.get("/metrics", response_model=MetricsResponse)
async def get_dashboard_metrics() -> MetricsResponse:
    """Get aggregated metrics for the dashboard."""
    data = await get_metrics()

    
    rules = [
        RuleMetric(
            rule_id=r["rule_id"],
            rule_name=r["rule_name"],
            total_flags=r["total_flags"],
            valid_count=r["valid_count"],
            false_positive_count=r["false_positive_count"],
            precision=(r["valid_count"] / r["total_flags"] * 100) if r["total_flags"] > 0 else 0
        )
        for r in data["rules"]
    ]

    return MetricsResponse(
        total_scans=data["total_scans"],
        total_flags=data["total_flags"],
        total_feedback=data["total_feedback"],
        overall_precision=data["overall_precision"],
        rules=rules
    )
