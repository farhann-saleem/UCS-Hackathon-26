# Detectors package
# Import all detectors to register them with the registry
from detectors.base import BaseDetector, registry
from detectors import secrets
from detectors import sql_injection
from detectors import dangerous_functions

__all__ = [
    "BaseDetector",
    "registry",
]
