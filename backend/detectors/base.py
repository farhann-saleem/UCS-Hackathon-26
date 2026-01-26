import re
from abc import ABC, abstractmethod
from typing import Literal
from models import DetectionMatch


class BaseDetector(ABC):
    """Base class for all security detectors."""

    def __init__(self):
        self.rules: list[dict] = []

    @abstractmethod
    def get_rules(self) -> list[dict]:
        """Return list of detection rules for this detector."""
        pass

    def scan(self, code: str, language: str) -> list[DetectionMatch]:
        """Scan code for security issues using regex patterns."""
        matches = []
        lines = code.split("\n")

        for rule in self.get_rules():
            # Skip if rule doesn't apply to this language
            if language not in rule.get("languages", ["python", "javascript"]):
                continue

            pattern = re.compile(rule["pattern"], re.IGNORECASE if rule.get("case_insensitive") else 0)

            for line_num, line in enumerate(lines, start=1):
                if pattern.search(line):
                    matches.append(DetectionMatch(
                        rule_id=rule["rule_id"],
                        severity=rule["severity"],
                        message=rule["message"],
                        line_number=line_num,
                        line_content=line.strip(),
                        suggestion=rule["suggestion"]
                    ))

        return matches


class DetectorRegistry:
    """Registry for all detectors."""

    def __init__(self):
        self.detectors: list[BaseDetector] = []

    def register(self, detector: BaseDetector) -> None:
        """Register a detector."""
        self.detectors.append(detector)

    def scan_all(self, code: str, language: str) -> list[DetectionMatch]:
        """Run all registered detectors on the code."""
        all_matches = []
        for detector in self.detectors:
            matches = detector.scan(code, language)
            all_matches.extend(matches)
        return all_matches


# Global registry instance
registry = DetectorRegistry()
