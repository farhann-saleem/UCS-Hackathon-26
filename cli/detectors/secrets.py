"""Detection rules for hardcoded secrets."""

from .base import DetectionRule

SECRETS_RULES = [
    DetectionRule(
        rule_id="SEC001",
        pattern=r'sk-[a-zA-Z0-9]{20,}',
        severity="critical",
        explanation="Hardcoded OpenAI API key detected. API keys should never be committed to code.",
        suggested_fix="Use environment variables: import os; api_key = os.environ.get('OPENAI_API_KEY')",
    ),
    DetectionRule(
        rule_id="SEC002",
        pattern=r'AKIA[0-9A-Z]{16}',
        severity="critical",
        explanation="Hardcoded AWS Access Key ID detected. AWS credentials in code are a major security risk.",
        suggested_fix="Use AWS credentials file or environment variables: AWS_ACCESS_KEY_ID",
    ),
    DetectionRule(
        rule_id="SEC003",
        pattern=r'ghp_[a-zA-Z0-9]{36}',
        severity="critical",
        explanation="Hardcoded GitHub Personal Access Token detected.",
        suggested_fix="Use environment variables: GITHUB_TOKEN",
    ),
    DetectionRule(
        rule_id="SEC004",
        pattern=r'(?i)(password|passwd|pwd)\s*=\s*["\'][^"\']{3,}["\']',
        severity="critical",
        explanation="Hardcoded password detected. Passwords should never be in source code.",
        suggested_fix="Use environment variables or a secrets manager: os.environ.get('DB_PASSWORD')",
    ),
    DetectionRule(
        rule_id="SEC005",
        pattern=r'(?i)(api_key|apikey|api-key)\s*=\s*["\'][^"\']{8,}["\']',
        severity="critical",
        explanation="Hardcoded API key detected. API keys should be stored securely.",
        suggested_fix="Use environment variables: os.environ.get('API_KEY')",
    ),
    DetectionRule(
        rule_id="SEC006",
        pattern=r'(?i)(secret|token|auth)\s*=\s*["\'][^"\']{8,}["\']',
        severity="critical",
        explanation="Hardcoded secret/token detected. Secrets should never be in source code.",
        suggested_fix="Use environment variables or a secrets manager",
    ),
    DetectionRule(
        rule_id="SEC007",
        pattern=r'(postgres|mysql|mongodb)://[^:]+:[^@]+@',
        severity="critical",
        explanation="Database connection string with credentials detected.",
        suggested_fix="Use environment variables for database URLs: os.environ.get('DATABASE_URL')",
    ),
    DetectionRule(
        rule_id="SEC008",
        pattern=r'(?i)bearer\s+[a-zA-Z0-9\-_\.]{20,}',
        severity="critical",
        explanation="Hardcoded Bearer token detected.",
        suggested_fix="Use environment variables for authentication tokens",
    ),
    DetectionRule(
        rule_id="SEC009",
        pattern=r'(?i)(jwt_secret|jwt-secret)\s*=\s*["\'][^"\']+["\']',
        severity="critical",
        explanation="Hardcoded JWT secret detected. This compromises all token signatures.",
        suggested_fix="Use environment variables: os.environ.get('JWT_SECRET')",
    ),
    DetectionRule(
        rule_id="SEC010",
        pattern=r'-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----',
        severity="critical",
        explanation="Private key detected in source code.",
        suggested_fix="Store private keys in secure files outside the codebase, use secrets management",
    ),
]
