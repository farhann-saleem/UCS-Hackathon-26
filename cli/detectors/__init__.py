"""CheckMate Detection Engine - Regex-based vulnerability detection."""

from .base import DetectionRule, detect_all
from .secrets import SECRETS_RULES
from .sql_injection import SQL_INJECTION_RULES
from .dangerous_functions import DANGEROUS_FUNCTIONS_RULES

ALL_RULES = SECRETS_RULES + SQL_INJECTION_RULES + DANGEROUS_FUNCTIONS_RULES

__all__ = [
    "DetectionRule",
    "detect_all",
    "ALL_RULES",
    "SECRETS_RULES",
    "SQL_INJECTION_RULES",
    "DANGEROUS_FUNCTIONS_RULES",
]
