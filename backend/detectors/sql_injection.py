from detectors.base import BaseDetector, registry


class SQLInjectionDetector(BaseDetector):
    """Detector for SQL injection vulnerabilities."""

    def get_rules(self) -> list[dict]:
        return [
            {
                "rule_id": "SQL001",
                "name": "Python f-string SQL",
                "pattern": r'cursor\.execute\s*\(\s*f["\']',
                "severity": "critical",
                "message": "SQL query using f-string detected - vulnerable to SQL injection",
                "suggestion": "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
                "languages": ["python"]
            },
            {
                "rule_id": "SQL002",
                "name": "Python format SQL",
                "pattern": r'cursor\.execute\s*\([^)]*\.format\s*\(',
                "severity": "critical",
                "message": "SQL query using .format() detected - vulnerable to SQL injection",
                "suggestion": "Use parameterized queries instead of string formatting",
                "languages": ["python"]
            },
            {
                "rule_id": "SQL003",
                "name": "Python % format SQL",
                "pattern": r'cursor\.execute\s*\([^)]*%\s*\(',
                "severity": "critical",
                "message": "SQL query using % formatting detected - vulnerable to SQL injection",
                "suggestion": "Use parameterized queries instead of % string formatting",
                "languages": ["python"]
            },
            {
                "rule_id": "SQL004",
                "name": "JavaScript template SQL",
                "pattern": r'(execute|query)\s*\(\s*`[^`]*\$\{',
                "severity": "critical",
                "message": "SQL query using template literal with interpolation - vulnerable to SQL injection",
                "suggestion": "Use parameterized queries: db.query('SELECT * FROM users WHERE id = $1', [userId])",
                "languages": ["javascript"]
            },
            {
                "rule_id": "SQL005",
                "name": "String concatenation in SQL",
                "pattern": r'(execute|query)\s*\([^)]*\+\s*(user|input|req\.|request\.|params)',
                "severity": "critical",
                "message": "SQL query with string concatenation of user input detected",
                "suggestion": "Never concatenate user input into SQL. Use parameterized queries",
                "languages": ["python", "javascript"],
                "case_insensitive": True
            },
            {
                "rule_id": "SQL006",
                "name": "Raw SQL with variable",
                "pattern": r'(SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\+\s*[a-zA-Z_]+',
                "severity": "high",
                "message": "SQL statement with string concatenation detected",
                "suggestion": "Use an ORM or parameterized queries to prevent SQL injection",
                "languages": ["python", "javascript"]
            },
            {
                "rule_id": "SQL007",
                "name": "SQLAlchemy text() with f-string",
                "pattern": r'text\s*\(\s*f["\']',
                "severity": "critical",
                "message": "SQLAlchemy text() with f-string - vulnerable to SQL injection",
                "suggestion": "Use bound parameters: text('SELECT * FROM users WHERE id = :id').bindparams(id=user_id)",
                "languages": ["python"]
            }
        ]


# Register the detector
sql_detector = SQLInjectionDetector()
registry.register(sql_detector)
