from detectors.base import BaseDetector, registry


class DangerousFunctionsDetector(BaseDetector):
    """Detector for dangerous function calls that can lead to code execution."""

    def get_rules(self) -> list[dict]:
        return [
            # Python dangerous functions
            {
                "rule_id": "FUNC001",
                "name": "Python eval()",
                "pattern": r'\beval\s*\(',
                "severity": "critical",
                "message": "Use of eval() detected - can execute arbitrary code",
                "suggestion": "Avoid eval(). Use ast.literal_eval() for safe literal evaluation, or refactor to avoid dynamic code execution",
                "languages": ["python", "javascript"]
            },
            {
                "rule_id": "FUNC002",
                "name": "Python exec()",
                "pattern": r'\bexec\s*\(',
                "severity": "critical",
                "message": "Use of exec() detected - can execute arbitrary code",
                "suggestion": "Avoid exec(). Refactor code to avoid dynamic code execution",
                "languages": ["python"]
            },
            {
                "rule_id": "FUNC003",
                "name": "Python pickle.load()",
                "pattern": r'pickle\.loads?\s*\(',
                "severity": "critical",
                "message": "Use of pickle.load() detected - can execute arbitrary code during deserialization",
                "suggestion": "Use JSON or other safe serialization formats. Never unpickle untrusted data",
                "languages": ["python"]
            },
            {
                "rule_id": "FUNC004",
                "name": "Unsafe YAML load",
                "pattern": r'yaml\.load\s*\([^)]*\)(?!.*Loader\s*=\s*yaml\.SafeLoader)',
                "severity": "high",
                "message": "Unsafe yaml.load() without SafeLoader - can execute arbitrary code",
                "suggestion": "Use yaml.safe_load() or yaml.load(data, Loader=yaml.SafeLoader)",
                "languages": ["python"]
            },
            {
                "rule_id": "FUNC005",
                "name": "os.system()",
                "pattern": r'os\.system\s*\(',
                "severity": "high",
                "message": "Use of os.system() detected - vulnerable to command injection",
                "suggestion": "Use subprocess.run() with a list of arguments instead of shell=True",
                "languages": ["python"]
            },
            {
                "rule_id": "FUNC006",
                "name": "subprocess with shell=True",
                "pattern": r'subprocess\.(call|run|Popen)\s*\([^)]*shell\s*=\s*True',
                "severity": "high",
                "message": "subprocess with shell=True detected - vulnerable to command injection",
                "suggestion": "Use subprocess.run(['cmd', 'arg1', 'arg2']) without shell=True",
                "languages": ["python"]
            },
            {
                "rule_id": "FUNC007",
                "name": "JavaScript innerHTML",
                "pattern": r'\.innerHTML\s*=',
                "severity": "high",
                "message": "Direct innerHTML assignment detected - vulnerable to XSS",
                "suggestion": "Use textContent for text, or sanitize HTML with DOMPurify before using innerHTML",
                "languages": ["javascript"]
            },
            {
                "rule_id": "FUNC008",
                "name": "React dangerouslySetInnerHTML",
                "pattern": r'dangerouslySetInnerHTML\s*=',
                "severity": "high",
                "message": "dangerouslySetInnerHTML detected - can lead to XSS if content is not sanitized",
                "suggestion": "Sanitize HTML content with DOMPurify before using dangerouslySetInnerHTML",
                "languages": ["javascript"]
            },
            {
                "rule_id": "FUNC009",
                "name": "JavaScript Function constructor",
                "pattern": r'new\s+Function\s*\(',
                "severity": "critical",
                "message": "new Function() detected - similar to eval(), can execute arbitrary code",
                "suggestion": "Avoid dynamic function creation. Refactor to use static functions",
                "languages": ["javascript"]
            },
            {
                "rule_id": "FUNC010",
                "name": "Python input() in sensitive context",
                "pattern": r'(password|secret|key|token)\s*=\s*input\s*\(',
                "severity": "medium",
                "message": "Sensitive data collected via input() - may be visible in terminal",
                "suggestion": "Use getpass.getpass() for passwords to hide input",
                "languages": ["python"],
                "case_insensitive": True
            },
            {
                "rule_id": "FUNC011",
                "name": "Child process exec",
                "pattern": r'child_process\.(exec|execSync)\s*\(',
                "severity": "high",
                "message": "child_process.exec() detected - vulnerable to command injection",
                "suggestion": "Use child_process.spawn() or execFile() with arguments array",
                "languages": ["javascript"]
            },
            {
                "rule_id": "FUNC012",
                "name": "Python compile()",
                "pattern": r'\bcompile\s*\([^)]*["\'][^"\']*["\']\s*,\s*[^)]*,\s*["\']exec["\']\s*\)',
                "severity": "high",
                "message": "compile() with exec mode detected - can execute arbitrary code",
                "suggestion": "Avoid dynamic code compilation. Refactor to use static code",
                "languages": ["python"]
            },
            {
                "rule_id": "FUNC013",
                "name": "setTimeout/setInterval with string",
                "pattern": r'(setTimeout|setInterval)\s*\(\s*["\']',
                "severity": "high",
                "message": "setTimeout/setInterval with string argument - acts like eval()",
                "suggestion": "Pass a function reference instead of a string",
                "languages": ["javascript"]
            },
            {
                "rule_id": "FUNC014",
                "name": "Document.write",
                "pattern": r'document\.write\s*\(',
                "severity": "medium",
                "message": "document.write() detected - can overwrite page and enable XSS",
                "suggestion": "Use DOM manipulation methods like appendChild() instead",
                "languages": ["javascript"]
            }
        ]


# Register the detector
dangerous_detector = DangerousFunctionsDetector()
registry.register(dangerous_detector)
