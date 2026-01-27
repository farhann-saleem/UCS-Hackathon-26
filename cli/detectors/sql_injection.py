"""Detection rules for SQL injection vulnerabilities."""

from .base import DetectionRule

SQL_INJECTION_RULES = [
    DetectionRule(
        rule_id="SQL001",
        pattern=r'execute\s*\(\s*f["\'].*\{.*\}.*["\']',
        severity="high_risk",
        explanation="SQL injection vulnerability: f-string used in SQL query. User input can manipulate the query.",
        suggested_fix="Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
    ),
    DetectionRule(
        rule_id="SQL002",
        pattern=r'execute\s*\(\s*["\'].*%s.*["\'].*%',
        severity="high_risk",
        explanation="SQL injection vulnerability: string formatting used in SQL query.",
        suggested_fix="Use parameterized queries instead of % formatting",
    ),
    DetectionRule(
        rule_id="SQL003",
        pattern=r'execute\s*\(\s*["\'].*\+.*["\']',
        severity="high_risk",
        explanation="SQL injection vulnerability: string concatenation used in SQL query.",
        suggested_fix="Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
    ),
    DetectionRule(
        rule_id="SQL004",
        pattern=r'(query|execute)\s*\(\s*`.*\$\{.*\}.*`',
        severity="high_risk",
        explanation="SQL injection vulnerability: template literal with variable interpolation in SQL query.",
        suggested_fix="Use parameterized queries with placeholders: db.query('SELECT * FROM users WHERE id = $1', [userId])",
    ),
    DetectionRule(
        rule_id="SQL005",
        pattern=r'\.format\s*\(.*\).*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)',
        severity="high_risk",
        explanation="SQL injection vulnerability: .format() used with SQL keywords.",
        suggested_fix="Use parameterized queries instead of string formatting",
    ),
    DetectionRule(
        rule_id="SQL006",
        pattern=r'(?:SELECT|INSERT|UPDATE|DELETE).*\+\s*(?:request|req|params|body|query)\.',
        severity="high_risk",
        explanation="SQL injection vulnerability: direct concatenation of request parameters in SQL.",
        suggested_fix="Use parameterized queries and validate/sanitize input",
    ),
    DetectionRule(
        rule_id="SQL007",
        pattern=r'raw\s*\(\s*f["\']|raw\s*\(\s*["\'].*\+',
        severity="high_risk",
        explanation="SQL injection vulnerability: raw SQL with string interpolation (Django/SQLAlchemy).",
        suggested_fix="Use ORM methods or parameterized raw queries",
    ),
]
