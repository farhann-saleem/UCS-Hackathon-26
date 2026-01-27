"""Base detection rule class and utilities."""

import re
from dataclasses import dataclass, field
from typing import List, Optional
import uuid


@dataclass
class DetectionRule:
    """A single detection rule with regex pattern and metadata."""
    rule_id: str
    pattern: str  # regex pattern
    severity: str  # critical, danger, high_risk
    explanation: str
    suggested_fix: str
    _compiled: Optional[re.Pattern] = field(default=None, repr=False)

    def __post_init__(self):
        """Compile the regex pattern."""
        self._compiled = re.compile(self.pattern, re.IGNORECASE | re.MULTILINE)

    def match(self, line: str) -> bool:
        """Check if the line matches this rule's pattern."""
        return bool(self._compiled.search(line))

    def find_match(self, line: str) -> Optional[str]:
        """Return the matched text, or None if no match."""
        match = self._compiled.search(line)
        return match.group(0) if match else None


@dataclass
class Flag:
    """A detected vulnerability flag."""
    flag_id: str
    rule_id: str
    severity: str
    line_number: int
    line_content: str
    matched_text: str
    explanation: str
    suggested_fix: str
    file_path: str

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "flag_id": self.flag_id,
            "rule_id": self.rule_id,
            "severity": self.severity,
            "line_number": self.line_number,
            "line_content": self.line_content,
            "matched_text": self.matched_text,
            "explanation": self.explanation,
            "suggested_fix": self.suggested_fix,
            "file_path": self.file_path,
        }


def detect_all(code: str, rules: List[DetectionRule], file_path: str, whitelist: List[str] = None) -> List[Flag]:
    """
    Run all detection rules against the code.

    Args:
        code: The source code to scan
        rules: List of DetectionRule objects
        file_path: Path to the file being scanned
        whitelist: List of pattern strings to skip

    Returns:
        List of Flag objects for detected vulnerabilities
    """
    whitelist = whitelist or []
    flags = []
    lines = code.split('\n')

    for line_num, line in enumerate(lines, start=1):
        # Skip empty lines and comments
        stripped = line.strip()
        if not stripped or stripped.startswith('#') or stripped.startswith('//'):
            continue

        for rule in rules:
            if rule.match(line):
                matched_text = rule.find_match(line) or ""

                # Check whitelist - skip if matched text is whitelisted
                is_whitelisted = any(
                    wl_pattern in matched_text or wl_pattern in line
                    for wl_pattern in whitelist
                )
                if is_whitelisted:
                    continue

                flag = Flag(
                    flag_id=str(uuid.uuid4()),
                    rule_id=rule.rule_id,
                    severity=rule.severity,
                    line_number=line_num,
                    line_content=line,
                    matched_text=matched_text,
                    explanation=rule.explanation,
                    suggested_fix=rule.suggested_fix,
                    file_path=file_path,
                )
                flags.append(flag)

    return flags
