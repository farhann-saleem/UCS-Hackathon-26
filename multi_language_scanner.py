import re
from typing import Dict, List, Tuple
from dataclasses import dataclass


@dataclass
class Finding:
    """Represents a security finding"""

    file: str
    language: str
    line_number: int
    pattern: str
    severity: str
    message: str
    matched_text: str


# Multi-language vulnerability rules
RULES: Dict[str, Dict[str, Dict]] = {
    "python": {
        "secrets": [
            {
                "id": "PY_SECRET_OPENAI_KEY",
                "pattern": r"sk-[a-zA-Z0-9]{20,}",
                "severity": "critical",
                "message": "OpenAI API Key detected. Never hardcode secrets in source code.",
                "description": "Hardcoded OpenAI API keys expose authentication credentials.",
            },
            {
                "id": "PY_SECRET_HARDCODED_PASSWORD",
                "pattern": r"(?i)(password|passwd|pwd)\s*=\s*['\"][^'\"]+['\"]",
                "severity": "critical",
                "message": "Hardcoded password detected. Use environment variables instead.",
                "description": "Passwords in source code can be exposed through git history.",
            },
            {
                "id": "PY_SECRET_AWS_KEY",
                "pattern": r"AKIA[0-9A-Z]{16}",
                "severity": "critical",
                "message": "AWS Access Key detected. Use IAM roles instead.",
                "description": "AWS keys in code can lead to unauthorized cloud resource access.",
            },
        ],
        "dangerous_functions": [
            {
                "id": "PY_EVAL_EXEC",
                "pattern": r"\b(eval|exec)\s*\(",
                "severity": "critical",
                "message": "eval() or exec() detected. Never execute untrusted input.",
                "description": "These functions can execute arbitrary Python code, leading to RCE.",
            },
            {
                "id": "PY_PICKLE_LOADS",
                "pattern": r"pickle\.(loads?|load)\s*\(",
                "severity": "critical",
                "message": "pickle.loads() detected. Use json instead for untrusted data.",
                "description": "Pickle deserialization can execute arbitrary code.",
            },
            {
                "id": "PY_SUBPROCESS_SHELL",
                "pattern": r"subprocess\.(call|run|Popen).*shell\s*=\s*True",
                "severity": "high",
                "message": "subprocess with shell=True detected. Avoid shell=True.",
                "description": "Shell=True enables command injection vulnerabilities.",
            },
        ],
        "sql_injection": [
            {
                "id": "PY_SQL_FSTRING",
                "pattern": r"(?:execute|query)\s*\(\s*f['\"].*\{.*\}.*['\"]",
                "severity": "high",
                "message": "SQL query using f-string detected. Use parameterized queries.",
                "description": "f-strings in SQL queries allow SQL injection attacks.",
            },
            {
                "id": "PY_SQL_CONCAT",
                "pattern": r"(?:execute|query)\s*\(\s*['\"][^'\"]*['\"]\\s*\+",
                "severity": "high",
                "message": "SQL query using string concatenation detected.",
                "description": "String concatenation in queries enables SQL injection.",
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
                "description": "API keys hardcoded in JS are exposed in client-side or source.",
            },
            {
                "id": "JS_SECRET_HARDCODED_PASSWORD",
                "pattern": r"(?i)(password|passwd|pwd)\s*[=:]\s*['\"`][^'\"` ]+['\"`]",
                "severity": "critical",
                "message": "Hardcoded password detected. Use environment variables.",
                "description": "Passwords in source code are easily discovered.",
            },
            {
                "id": "JS_SECRET_FIREBASE_KEY",
                "pattern": r"['\"]apiKey['\"]\\s*:\\s*['\"][a-zA-Z0-9_-]+['\"]",
                "severity": "high",
                "message": "Firebase API Key detected. Restrict key permissions.",
                "description": "Exposed Firebase keys can allow unauthorized access.",
            },
        ],
        "dangerous_functions": [
            {
                "id": "JS_EVAL",
                "pattern": r"\beval\s*\(",
                "severity": "critical",
                "message": "eval() detected. Never execute untrusted code.",
                "description": "eval() in JavaScript enables arbitrary code execution.",
            },
            {
                "id": "JS_DANGEROUSLY_SET_INNER_HTML",
                "pattern": r"dangerouslySetInnerHTML\s*=|dangerouslySetInnerHTML\s*:",
                "severity": "high",
                "message": "dangerouslySetInnerHTML detected. Sanitize HTML content.",
                "description": "Using dangerouslySetInnerHTML with unsanitized input causes XSS.",
            },
            {
                "id": "JS_INNER_HTML_ASSIGN",
                "pattern": r"\.innerHTML\s*=\s*(?!['\"])",
                "severity": "high",
                "message": "innerHTML assignment detected. Use textContent for plain text.",
                "description": "Direct innerHTML assignment can lead to XSS vulnerabilities.",
            },
        ],
        "sql_injection": [
            {
                "id": "JS_SQL_TEMPLATE_LITERAL",
                "pattern": r"(?:query|execute)\s*\(\s*`.*\$\{.*\}.*`",
                "severity": "high",
                "message": "SQL query using template literal detected.",
                "description": "Template literals in SQL queries enable SQL injection.",
            },
            {
                "id": "JS_SQL_CONCATENATION",
                "pattern": r"['\"].*['\"]\\s*\+",
                "severity": "high",
                "message": "Potential SQL concatenation detected.",
                "description": "String concatenation in queries can enable SQL injection.",
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
                "description": "Hardcoded API keys are exposed in compiled JavaScript.",
            },
            {
                "id": "TS_SECRET_HARDCODED_PASSWORD",
                "pattern": r"(?i)(password|passwd|pwd)\s*[=:]\s*['\"`][^'\"` ]+['\"`]",
                "severity": "critical",
                "message": "Hardcoded password detected. Use environment variables.",
                "description": "Passwords in source are visible in transpiled code.",
            },
        ],
        "dangerous_functions": [
            {
                "id": "TS_EVAL",
                "pattern": r"\beval\s*\(",
                "severity": "critical",
                "message": "eval() detected. Never execute untrusted code.",
                "description": "eval() enables arbitrary code execution.",
            },
            {
                "id": "TS_DANGEROUSLY_SET_INNER_HTML",
                "pattern": r"dangerouslySetInnerHTML\s*=|dangerouslySetInnerHTML\s*:",
                "severity": "high",
                "message": "dangerouslySetInnerHTML detected. Sanitize content.",
                "description": "Unsanitized HTML in dangerouslySetInnerHTML causes XSS.",
            },
        ],
        "sql_injection": [
            {
                "id": "TS_SQL_TEMPLATE_LITERAL",
                "pattern": r"(?:query|execute)\s*\(\s*`.*\$\{.*\}.*`",
                "severity": "high",
                "message": "SQL query using template literal detected.",
                "description": "Template literals in SQL queries enable SQL injection.",
            }
        ],
    },
}


def get_file_type(filename: str) -> str:
    """
    Determine the file type based on extension.

    Args:
        filename: The filename to check

    Returns:
        'python', 'javascript', 'typescript', or 'unknown'
    """
    extensions = {
        ".py": "python",
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
    }

    # Get file extension
    for ext, file_type in extensions.items():
        if filename.endswith(ext):
            return file_type

    return "unknown"


def scan_file(filepath: str, file_content: str) -> List[Finding]:
    """
    Scan a single file for security vulnerabilities.

    Args:
        filepath: Path to the file being scanned
        file_content: The content of the file as string

    Returns:
        List of Finding objects representing detected vulnerabilities
    """
    findings = []
    language = get_file_type(filepath)

    # Skip unknown file types
    if language == "unknown":
        return findings

    # Get rules for this language
    language_rules = RULES.get(language, {})

    lines = file_content.split("\n")

    # Iterate through all rule categories (secrets, dangerous_functions, sql_injection)
    for category, rules_list in language_rules.items():
        for rule in rules_list:
            pattern = rule["pattern"]

            # Search each line for matches
            for line_num, line_content in enumerate(lines, start=1):
                matches = re.finditer(pattern, line_content, re.IGNORECASE)

                for match in matches:
                    finding = Finding(
                        file=filepath,
                        language=language,
                        line_number=line_num,
                        pattern=rule["id"],
                        severity=rule["severity"],
                        message=rule["message"],
                        matched_text=match.group(0),
                    )
                    findings.append(finding)

    return findings


def scan_files(file_paths: List[str]) -> List[Finding]:
    """
    Scan multiple files for vulnerabilities.

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

            findings = scan_file(filepath, content)
            all_findings.extend(findings)

        except Exception as e:
            print(f"Error scanning {filepath}: {e}")
            continue

    return all_findings


def print_findings(findings: List[Finding]) -> None:
    """
    Pretty print security findings.

    Args:
        findings: List of Finding objects to display
    """
    if not findings:
        print("✅ No vulnerabilities detected!")
        return

    print(f"\n⚠️  Found {len(findings)} potential vulnerabilities:\n")

    for finding in findings:
        severity_icon = {
            "critical": "🔴",
            "high": "🟠",
            "medium": "🟡",
            "low": "🔵",
        }.get(finding.severity, "⚪")

        print(f"{severity_icon} [{finding.severity.upper()}] {finding.pattern}")
        print(f"   File: {finding.file}:{finding.line_number}")
        print(f"   Message: {finding.message}")
        print(f"   Matched: {finding.matched_text[:60]}...")
        print()


# Example usage
if __name__ == "__main__":
    # Test with sample files
    test_files = ["sample.py", "sample.js", "sample.ts"]

    # Create sample vulnerable code
    sample_python = """
api_key = "sk-1234567890abcdefghijklmnopqrstuvwxyz"
eval(user_input)
query = f"SELECT * FROM users WHERE id = {user_id}"
"""

    sample_js = """
const apiKey = "sk-1234567890abcdefghijklmnopqrstuvwxyz";
eval(userCode);
return <div dangerouslySetInnerHTML={{__html: userInput}} />;
"""

    sample_ts = """
const password: string = "secretpassword123";
eval(code);
const html = dangerouslySetInnerHTML;
"""

    # Write samples
    with open("sample.py", "w") as f:
        f.write(sample_python)
    with open("sample.js", "w") as f:
        f.write(sample_js)
    with open("sample.ts", "w") as f:
        f.write(sample_ts)

    # Scan files
    findings = scan_files(test_files)
    print_findings(findings)
