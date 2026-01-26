from detectors.base import BaseDetector, registry


class SecretsDetector(BaseDetector):
    """Detector for hardcoded secrets and API keys."""

    def get_rules(self) -> list[dict]:
        return [
            {
                "rule_id": "SEC001",
                "name": "OpenAI API Key",
                "pattern": r'sk-[a-zA-Z0-9]{20,60}',
                "severity": "critical",
                "message": "Hardcoded OpenAI API key detected",
                "suggestion": "Use environment variables to store API keys. Example: os.getenv('OPENAI_API_KEY')",
                "languages": ["python", "javascript"]
            },
            {
                "rule_id": "SEC002",
                "name": "AWS Access Key",
                "pattern": r'AKIA[0-9A-Z]{16}',
                "severity": "critical",
                "message": "Hardcoded AWS Access Key ID detected",
                "suggestion": "Use AWS credentials file or environment variables instead of hardcoding keys",
                "languages": ["python", "javascript"]
            },
            {
                "rule_id": "SEC003",
                "name": "GitHub Token",
                "pattern": r'ghp_[a-zA-Z0-9]{36}',
                "severity": "critical",
                "message": "Hardcoded GitHub Personal Access Token detected",
                "suggestion": "Use environment variables or GitHub Actions secrets for tokens",
                "languages": ["python", "javascript"]
            },
            {
                "rule_id": "SEC004",
                "name": "Hardcoded Password",
                "pattern": r'(?i)(password|passwd|pwd)\s*=\s*["\'][^"\']+["\']',
                "severity": "high",
                "message": "Hardcoded password detected",
                "suggestion": "Never hardcode passwords. Use environment variables or a secrets manager",
                "languages": ["python", "javascript"],
                "case_insensitive": True
            },
            {
                "rule_id": "SEC005",
                "name": "Database Connection String",
                "pattern": r'(postgres|mysql|mongodb)://[^:]+:[^@]+@',
                "severity": "critical",
                "message": "Database connection string with credentials detected",
                "suggestion": "Store database credentials in environment variables, not in code",
                "languages": ["python", "javascript"]
            },
            {
                "rule_id": "SEC006",
                "name": "Generic API Key Assignment",
                "pattern": r'(?i)(api[_-]?key|apikey|secret[_-]?key)\s*=\s*["\'][a-zA-Z0-9]{16,}["\']',
                "severity": "high",
                "message": "Potential hardcoded API key or secret detected",
                "suggestion": "Use environment variables for API keys: os.getenv('API_KEY')",
                "languages": ["python", "javascript"],
                "case_insensitive": True
            },
            {
                "rule_id": "SEC007",
                "name": "Private Key",
                "pattern": r'-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----',
                "severity": "critical",
                "message": "Private key detected in code",
                "suggestion": "Never commit private keys to code. Use secure key management",
                "languages": ["python", "javascript"]
            },
            {
                "rule_id": "SEC008",
                "name": "Slack Token",
                "pattern": r'xox[baprs]-[0-9a-zA-Z]{10,48}',
                "severity": "critical",
                "message": "Slack token detected",
                "suggestion": "Use environment variables for Slack tokens",
                "languages": ["python", "javascript"]
            },
            {
                "rule_id": "SEC009",
                "name": "JWT Secret",
                "pattern": r'(?i)(jwt[_-]?secret|jwt[_-]?key)\s*=\s*["\'][^"\']+["\']',
                "severity": "high",
                "message": "Hardcoded JWT secret detected",
                "suggestion": "Store JWT secrets in environment variables",
                "languages": ["python", "javascript"],
                "case_insensitive": True
            },
            {
                "rule_id": "SEC010",
                "name": "Anthropic API Key",
                "pattern": r'sk-ant-[a-zA-Z0-9]{20,100}',
                "severity": "critical",
                "message": "Hardcoded Anthropic API key detected",
                "suggestion": "Use environment variables: os.getenv('ANTHROPIC_API_KEY')",
                "languages": ["python", "javascript"]
            }
        ]


# Register the detector
secrets_detector = SecretsDetector()
registry.register(secrets_detector)
