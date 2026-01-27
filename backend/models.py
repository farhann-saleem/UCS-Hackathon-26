from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# Request models
class ScanRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Code to scan")
    language: Literal["python", "javascript"] = Field(
        ..., description="Programming language"
    )


class FeedbackRequest(BaseModel):
    scan_id: str = Field(..., description="ID of the scan")
    flag_id: str = Field(..., description="ID of the flag")
    verdict: Literal["valid", "false_positive"] = Field(
        ..., description="Human verdict"
    )


# Response models
class Flag(BaseModel):
    flag_id: str
    rule_id: str
    severity: Literal["critical", "high", "medium", "low", "danger", "high_risk"]
    message: str
    line_number: int
    line_content: str
    suggestion: Optional[str] = None
    feedback_status: Optional[str] = None  # "valid" or "false_positive" if reviewed


class ScanResponse(BaseModel):
    scan_id: str
    flags: list[Flag]
    total_flags: int
    timestamp: str


class FeedbackResponse(BaseModel):
    success: bool
    message: str


class RuleMetric(BaseModel):
    rule_id: str
    rule_name: str
    total_flags: int
    valid_count: int
    false_positive_count: int
    precision: float = Field(..., description="Precision percentage")


class MetricsResponse(BaseModel):
    total_scans: int
    total_flags: int
    total_feedback: int
    overall_precision: float
    rules: list[RuleMetric]


# Internal models for detectors
class DetectionRule(BaseModel):
    rule_id: str
    name: str
    pattern: str
    severity: Literal["critical", "high", "medium", "low"]
    message: str
    suggestion: str
    languages: list[str] = Field(default=["python", "javascript"])


class DetectionMatch(BaseModel):
    rule_id: str
    severity: Literal["critical", "high", "medium", "low"]
    message: str
    line_number: int
    line_content: str
    suggestion: str
