"""Multi-language scanner integration for CheckMate CLI."""

import re
from typing import Dict, List, Tuple
from dataclasses import dataclass
from pathlib import Path


@dataclass
class MultiLangFinding:
    """Represents a security finding across multiple languages"""

    file: str
    language: str
    line_number: int
    pattern_id: str
    severity: str
    message: str
    matched_text: str
    category: str


# Multi-language vulnerability rules
MULTI_LANG_RULES: Dict[str, Dict[str, List[Dict]]] = {
    "python": {
        "secrets": [
            {
                "id": "PY_SECRET_OPENAI_KEY",
                "pattern": r"sk-[a-zA-Z0-9]{20,}",
                "severity": "critical",
                "message": "OpenAI API Key detected. Never hardcode secrets in source code.",
            },
            {
                "id": "PY_SECRET_HARDCODED_PASSWORD",
                "pattern": r"(?i)(password|passwd|pwd)\s*=\s*['\"][^'\"]+['\"]",
                "severity": "critical",
                "message": "Hardcoded password detected. Use environment variables instead.",
            },
            {
                "id": "PY_SECRET_AWS_KEY",
                "pattern": r"AKIA[0-9A-Z]{16}",
                "severity": "critical",
                "message": "AWS Access Key detected. Use IAM roles instead.",
            },
            {
                "id": "PY_SECRET_GITHUB_TOKEN",
                "pattern": r"ghp_[a-zA-Z0-9]{36}",
                "severity": "critical",
                "message": "GitHub token detected. Regenerate and revoke immediately.",
            },
        ],
        "dangerous_functions": [
            {
                "id": "PY_EVAL_EXEC",
                "pattern": r"\b(eval|exec)\s*\(",
                "severity": "critical",
                "message": "eval() or exec() detected. Never execute untrusted input.",
            },
            {
                "id": "PY_PICKLE_LOADS",
                "pattern": r"pickle\.(loads?|load)\s*\(",
                "severity": "critical",
                "message": "pickle.loads() detected. Use json instead for untrusted data.",
            },
            {
                "id": "PY_SUBPROCESS_SHELL",
                "pattern": r"subprocess\.(call|run|Popen).*shell\s*=\s*True",
                "severity": "high",
                "message": "subprocess with shell=True detected. Avoid shell=True.",
            },
            {
                "id": "PY_YAML_LOAD",
                "pattern": r"yaml\.load\s*\(",
                "severity": "high",
                "message": "yaml.load() without SafeLoader detected. Use yaml.safe_load().",
            },
        ],
        "sql_injection": [
            {
                "id": "PY_SQL_FSTRING",
                "pattern": r"(?:execute|query)\s*\(\s*f['\"].*\{.*\}.*['\"]",
                "severity": "high",
                "message": "SQL query using f-string detected. Use parameterized queries.",
            },
            {
                "id": "PY_SQL_FORMAT",
                "pattern": r"(?:execute|query)\s*\(\s*['\"].*\.format\(",
                "severity": "high",
                "message": "SQL query using .format() detected. Use parameterized queries.",
            },
        ],
    },
    "javascript": {
        "secrets": [
            {
                "id": "JS_SECRET_OPENAI_KEY",
                "pattern": r"sk-[a-zA-Z0-9]{20,}",
                "severity": "critical",
                "message": "OpenAI API Key detected. Use environment variables.",
            },
            {
                "id": "JS_SECRET_HARDCODED_PASSWORD",
                "pattern": r"(?i)(password|passwd|pwd)\s*[=:]\s*['\"`][^'\"` ]+['\"`]",
                "severity": "critical",
                "message": "Hardcoded password detected. Use environment variables.",
            },
            {
                "id": "JS_SECRET_FIREBASE_KEY",
                "pattern": r"['\"]apiKey['\"]\\s*:\\s*['\"][a-zA-Z0-9_-]+['\"]",
                "severity": "high",
                "message": "Firebase API Key detected. Restrict key permissions.",
            },
        ],
        "dangerous_functions": [
            {
                "id": "JS_EVAL",
                "pattern": r"\beval\s*\(",
                "severity": "critical",
                "message": "eval() detected. Never execute untrusted code.",
            },
            {
                "id": "JS_DANGEROUSLY_SET_INNER_HTML",
                "pattern": r"dangerouslySetInnerHTML\s*=|dangerouslySetInnerHTML\s*:",
                "severity": "high",
                "message": "dangerouslySetInnerHTML detected. Sanitize HTML content.",
            },
            {
                "id": "JS_INNER_HTML_ASSIGN",
                "pattern": r"\.innerHTML\s*=\s*(?!['\"`])",
                "severity": "high",
                "message": "innerHTML assignment detected. Use textContent for plain text.",
            },
            {
                "id": "JS_FUNCTION_CONSTRUCTOR",
                "pattern": r"new\s+Function\s*\(",
                "severity": "high",
                "message": "Function constructor detected. Never execute untrusted code.",
            },
        ],
        "sql_injection": [
            {
                "id": "JS_SQL_TEMPLATE_LITERAL",
                "pattern": r"(?:query|execute)\s*\(\s*`.*\$\{.*\}.*`",
                "severity": "high",
                "message": "SQL query using template literal detected. Use parameterized queries.",
            },
            {
                "id": "JS_SQL_CONCATENATION",
                "pattern": r"query\s*\(['\"].*['\"]\\s*\+",
                "severity": "high",
                "message": "SQL concatenation detected. Use parameterized queries.",
            },
        ],
    },
    "typescript": {
        "secrets": [
            {
                "id": "TS_SECRET_OPENAI_KEY",
                "pattern": r"sk-[a-zA-Z0-9]{20,}",
                "severity": "critical",
                "message": "OpenAI API Key detected. Use environment variables.",
            },
            {
                "id": "TS_SECRET_HARDCODED_PASSWORD",
                "pattern": r"(?i)(password|passwd|pwd)\s*[=:]\s*['\"`][^'\"` ]+['\"`]",
                "severity": "critical",
                "message": "Hardcoded password detected. Use environment variables.",
            },
        ],
        "dangerous_functions": [
            {
                "id": "TS_EVAL",
                "pattern": r"\beval\s*\(",
                "severity": "critical",
                "message": "eval() detected. Never execute untrusted code.",
            },
            {
                "id": "TS_DANGEROUSLY_SET_INNER_HTML",
                "pattern": r"dangerouslySetInnerHTML\s*=|dangerouslySetInnerHTML\s*:",
                "severity": "high",
                "message": "dangerouslySetInnerHTML detected. Sanitize content.",
            },
        ],
        "sql_injection": [
            {
                "id": "TS_SQL_TEMPLATE_LITERAL",
                "pattern": r"(?:query|execute)\s*\(\s*`.*\$\{.*\}.*`",
                "severity": "high",
                "message": "SQL query using template literal detected. Use parameterized queries.",
            }
        ],
    },
    "html": {
        "secrets": [
            {
                "id": "HTML_COMMENT_SECRETS",
                "pattern": r"<!--[\s\S]*?sk-[a-zA-Z0-9_\-]+[\s\S]*?-->",
                "severity": "critical",
                "message": "API Key detected in HTML comment. Remove secrets from comments.",
            },
        ],
        "dangerous_functions": [
            {
                "id": "HTML_INSECURE_SCRIPT",
                "pattern": r'<script[^>]*src=["\']http://[^"\']*["\']',
                "severity": "high",
                "message": "Script tag using HTTP detected. Use HTTPS instead.",
            },
            {
                "id": "HTML_INSECURE_IFRAME",
                "pattern": r'<iframe[^>]*src=["\']http://[^"\']*["\']',
                "severity": "high",
                "message": "iframe using HTTP detected. Use HTTPS instead.",
            },
        ],
        "sql_injection": [],
    },
    "css": {
        "secrets": [
            {
                "id": "CSS_COMMENT_SECRETS",
                "pattern": r"/\*[\s\S]*?sk-[a-zA-Z0-9_\-]+[\s\S]*?\*/",
                "severity": "critical",
                "message": "API Key detected in CSS comment. Remove secrets from comments.",
            },
        ],
        "dangerous_functions": [
            {
                "id": "CSS_INSECURE_IMPORT",
                "pattern": r"@import\s+(?:url\s*)?\(?['\"]?http://[^'\")\]*['\"]?\)?",
                "severity": "high",
                "message": "CSS import using HTTP detected. Use HTTPS instead.",
            },
        ],
        "sql_injection": [],
    },
}


def get_file_type(filename: str) -> str:
    """
    Determine the file type based on extension.

    Args:
        filename: The filename to check

    Returns:
        'python', 'javascript', 'typescript', 'html', 'css', or 'unknown'
    """
    extensions = {
        ".py": "python",
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".html": "html",
        ".htm": "html",
        ".css": "css",
    }

    for ext, file_type in extensions.items():
        if filename.endswith(ext):
            return file_type

    return "unknown"


def scan_file_multi_lang(filepath: str, file_content: str) -> List[MultiLangFinding]:
    """
    Scan a single file for security vulnerabilities using multi-language rules.

    Args:
        filepath: Path to the file being scanned
        file_content: The content of the file as string

    Returns:
        List of MultiLangFinding objects representing detected vulnerabilities
    """
    findings = []
    language = get_file_type(filepath)

    # Skip unknown file types
    if language == "unknown":
        return findings

    # Get rules for this language
    language_rules = MULTI_LANG_RULES.get(language, {})

    lines = file_content.split("\n")

    # Iterate through all rule categories
    for category, rules_list in language_rules.items():
        for rule in rules_list:
            pattern = rule["pattern"]
            pattern_id = rule["id"]

            # Check if pattern needs multiline search (HTML/CSS comments)
            if "COMMENT" in pattern_id:
                # Search in full content for multi-line patterns
                try:
                    matches = re.finditer(
                        pattern, file_content, re.IGNORECASE | re.DOTALL
                    )
                    for match in matches:
                        # Find the line number by counting newlines before the match
                        line_num = file_content[: match.start()].count("\n") + 1
                        finding = MultiLangFinding(
                            file=filepath,
                            language=language,
                            line_number=line_num,
                            pattern_id=pattern_id,
                            severity=rule["severity"],
                            message=rule["message"],
                            matched_text=match.group(0)[:60],
                            category=category,
                        )
                        findings.append(finding)
                except re.error:
                    continue
            else:
                # Search each line for single-line patterns
                for line_num, line_content in enumerate(lines, start=1):
                    try:
                        matches = re.finditer(
                            pattern, line_content, re.IGNORECASE | re.MULTILINE
                        )

                        for match in matches:
                            finding = MultiLangFinding(
                                file=filepath,
                                language=language,
                                line_number=line_num,
                                pattern_id=pattern_id,
                                severity=rule["severity"],
                                message=rule["message"],
                                matched_text=match.group(0)[:60],
                                category=category,
                            )
                            findings.append(finding)
                    except re.error:
                        # Skip regex errors
                        continue

    return findings


def scan_files_multi_lang(file_paths: List[str]) -> List[MultiLangFinding]:
    """
    Scan multiple files for vulnerabilities using multi-language support.

    Args:
        file_paths: List of file paths to scan

    Returns:
        Combined list of all findings across all files
    """
    all_findings = []

    for filepath in file_paths:
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            findings = scan_file_multi_lang(filepath, content)
            all_findings.extend(findings)

        except Exception as e:
            print(f"Error scanning {filepath}: {e}")
            continue

    return all_findings


def convert_to_flag_format(finding: MultiLangFinding) -> Dict:
    """Convert MultiLangFinding to flag dictionary format for compatibility."""
    return {
        "file": finding.file,
        "language": finding.language,
        "line_number": finding.line_number,
        "pattern_id": finding.pattern_id,
        "severity": finding.severity,
        "message": finding.message,
        "matched_text": finding.matched_text,
        "category": finding.category,
    }
