"""Detection rules for dangerous function calls."""

from .base import DetectionRule

DANGEROUS_FUNCTIONS_RULES = [
    DetectionRule(
        rule_id="FUNC001",
        pattern=r'\beval\s*\(',
        severity="danger",
        explanation="eval() executes arbitrary code. If user input reaches eval(), attackers can run any code.",
        suggested_fix="Use ast.literal_eval() for safe evaluation of literals, or avoid eval entirely",
    ),
    DetectionRule(
        rule_id="FUNC002",
        pattern=r'\bexec\s*\(',
        severity="danger",
        explanation="exec() executes arbitrary Python code. This is a critical security risk if user input is involved.",
        suggested_fix="Avoid exec(). Use safer alternatives like importlib or predefined function mappings",
    ),
    DetectionRule(
        rule_id="FUNC003",
        pattern=r'pickle\.loads?\s*\(',
        severity="danger",
        explanation="pickle can execute arbitrary code during deserialization. Never unpickle untrusted data.",
        suggested_fix="Use JSON for serialization, or use pickle with hmac verification for trusted sources only",
    ),
    DetectionRule(
        rule_id="FUNC004",
        pattern=r'yaml\.load\s*\([^)]*\)(?!.*Loader\s*=\s*yaml\.SafeLoader)',
        severity="danger",
        explanation="yaml.load() without SafeLoader can execute arbitrary code.",
        suggested_fix="Use yaml.safe_load() or yaml.load(data, Loader=yaml.SafeLoader)",
    ),
    DetectionRule(
        rule_id="FUNC005",
        pattern=r'os\.system\s*\(',
        severity="danger",
        explanation="os.system() can lead to command injection if user input is included.",
        suggested_fix="Use subprocess.run() with a list of arguments: subprocess.run(['cmd', 'arg1'], check=True)",
    ),
    DetectionRule(
        rule_id="FUNC006",
        pattern=r'subprocess\.(call|run|Popen).*shell\s*=\s*True',
        severity="danger",
        explanation="shell=True with subprocess can lead to command injection.",
        suggested_fix="Use shell=False and pass arguments as a list: subprocess.run(['cmd', 'arg1'])",
    ),
    DetectionRule(
        rule_id="FUNC007",
        pattern=r'\.innerHTML\s*=',
        severity="danger",
        explanation="Setting innerHTML can lead to XSS attacks if user input is included.",
        suggested_fix="Use textContent for text, or sanitize HTML with DOMPurify",
    ),
    DetectionRule(
        rule_id="FUNC008",
        pattern=r'dangerouslySetInnerHTML',
        severity="danger",
        explanation="dangerouslySetInnerHTML can lead to XSS attacks in React.",
        suggested_fix="Sanitize HTML with DOMPurify before using, or use textContent",
    ),
    DetectionRule(
        rule_id="FUNC009",
        pattern=r'document\.write\s*\(',
        severity="danger",
        explanation="document.write() can be used for XSS attacks.",
        suggested_fix="Use DOM manipulation methods like createElement and appendChild",
    ),
    DetectionRule(
        rule_id="FUNC010",
        pattern=r'__import__\s*\(',
        severity="danger",
        explanation="__import__() with user input can load arbitrary modules.",
        suggested_fix="Use importlib.import_module() with a whitelist of allowed modules",
    ),
    DetectionRule(
        rule_id="FUNC011",
        pattern=r'compile\s*\(.*["\']exec["\']',
        severity="danger",
        explanation="compile() with 'exec' mode can execute arbitrary code.",
        suggested_fix="Avoid compiling user-provided code. Use safer alternatives",
    ),
    DetectionRule(
        rule_id="FUNC012",
        pattern=r'marshal\.loads?\s*\(',
        severity="danger",
        explanation="marshal can execute code during deserialization. Never unmarshal untrusted data.",
        suggested_fix="Use JSON for serialization instead",
    ),
    DetectionRule(
        rule_id="FUNC013",
        pattern=r'shelve\.open\s*\(',
        severity="danger",
        explanation="shelve uses pickle internally and can execute arbitrary code.",
        suggested_fix="Use JSON or a database for persistent storage",
    ),
    DetectionRule(
        rule_id="FUNC014",
        pattern=r'input\s*\(\s*\).*(?:eval|exec|os\.|subprocess)',
        severity="danger",
        explanation="Direct use of input() with dangerous functions is risky.",
        suggested_fix="Validate and sanitize user input before processing",
    ),
]
