# CheckMate

Human-in-the-loop anomaly detection for AI-generated code. A CLI tool that launches a web dashboard and scans code for security vulnerabilities, enabling human review and learning from feedback.

## How It Works
```
Terminal 1:                         Terminal 2:
$ checkmate dashboard               
   │                                
   ▼                                
[starts Next.js server]             
[opens browser]                     
[shows "Waiting for scan..."]       
                                    $ checkmate scan demo.py
                                       │
                                       ▼
                                    [runs regex detection]
                                    [saves scan_results.json]
                                    [triggers browser refresh]
   │                                   │
   ◄───────────────────────────────────┘
   ▼
[dashboard shows flags]
[human reviews, gives feedback]
[whitelist.json updated]
                                    
                                    $ checkmate scan demo.py (again)
                                       │
                                       ▼
                                    [reads whitelist, skips marked]
                                    [fewer flags!]
   │
   ▼
[dashboard shows improvement]
[precision: 62% → 84%]
```

## CLI Commands
```bash
# Start the dashboard (run this first)
checkmate dashboard

# Scan a file (run in separate terminal)
checkmate scan <file.py>

# Scan multiple files
checkmate scan file1.py file2.js

# Scan all .py and .js in current directory
checkmate scan .

# View whitelist
checkmate whitelist

# Reset all data (fresh start for demo)
checkmate reset
```

## Tech Stack

**CLI:**
- Python 3.11+
- Click (CLI framework)
- Rich (pretty terminal output)

**Dashboard:**
- Next.js 14.2.x (App Router)
- React 18.2.x
- TypeScript 5.3.x
- Tailwind CSS 3.4.x
- Shadcn/ui components
- Recharts (charts)
- react-syntax-highlighter (code display)

**Data Layer:**
- JSON files (no database)
- FastAPI minimal server (3 endpoints to read/write JSON)

## Project Structure
```
checkmate/
├── cli/
│   ├── checkmate.py              # CLI entry (click commands)
│   ├── scanner.py                # detection logic
│   ├── detectors/
│   │   ├── __init__.py
│   │   ├── base.py               # base detector class
│   │   ├── secrets.py            # API keys, passwords
│   │   ├── sql_injection.py      # SQL injection patterns
│   │   └── dangerous_functions.py # eval, exec, etc.
│   └── requirements.txt
├── server/
│   ├── main.py                   # FastAPI (3 endpoints)
│   ├── routes.py                 # API routes
│   └── requirements.txt
├── dashboard/
│   ├── app/
│   │   ├── page.tsx              # main results view
│   │   ├── metrics/page.tsx      # metrics & before/after
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                   # shadcn
│   │   ├── WaitingForScan.tsx    # empty state
│   │   ├── CodeDisplay.tsx       # syntax highlighted code
│   │   ├── FlagCard.tsx          # single flag
│   │   ├── FeedbackButtons.tsx   # Mark Safe, Copy Fix
│   │   ├── SuggestedFix.tsx      # shows fix suggestion
│   │   ├── MetricsChart.tsx      # precision over time
│   │   └── BeforeAfterCard.tsx   # improvement display
│   ├── lib/
│   │   ├── api.ts                # calls to FastAPI
│   │   └── utils.ts
│   └── package.json
├── data/
│   ├── scan_results.json
│   ├── whitelist.json
│   ├── feedback.json
│   └── metrics.json
├── samples/
│   ├── vulnerable_1.py
│   ├── vulnerable_2.py
│   └── vulnerable_3.js
├── PROGRESS.md
├── CLAUDE.md
└── README.md
```

## API Endpoints (FastAPI Server)
```
GET  /api/results    → returns scan_results.json
POST /api/feedback   → updates feedback.json, whitelist.json, metrics.json
GET  /api/metrics    → returns metrics.json
GET  /api/health     → returns {"status": "ok"} (for polling)
```

## Data Schemas

### scan_results.json
```json
{
  "scan_id": "scan_20260127_093045",
  "timestamp": "2026-01-27T09:30:45Z",
  "file_scanned": "demo.py",
  "language": "python",
  "flags": [
    {
      "flag_id": "flag_001",
      "line_number": 15,
      "code_snippet": "api_key = 'sk-1234567890abcdef'",
      "rule_id": "secrets-openai",
      "rule_name": "OpenAI API Key",
      "severity": "critical",
      "category": "secrets",
      "explanation": "Hardcoded OpenAI API key detected.",
      "suggested_fix": "api_key = os.environ.get('OPENAI_API_KEY')",
      "feedback": null
    }
  ],
  "summary": {
    "total_flags": 3,
    "critical": 1,
    "danger": 1,
    "high_risk": 1
  }
}
```

### whitelist.json
```json
{
  "patterns": [
    {
      "rule_id": "secrets-openai",
      "code_pattern": "sk-example-not-real",
      "reason": "Test key for demo",
      "added_at": "2026-01-27T10:00:00Z"
    }
  ]
}
```

### feedback.json
```json
{
  "entries": [
    {
      "id": 1,
      "scan_id": "scan_20260127_093045",
      "flag_id": "flag_001",
      "rule_id": "secrets-openai",
      "verdict": "valid",
      "timestamp": "2026-01-27T09:35:00Z"
    }
  ]
}
```

### metrics.json
```json
{
  "total_scans": 10,
  "total_flags": 35,
  "confirmed_valid": 25,
  "false_positives": 10,
  "precision": 0.71,
  "precision_history": [
    {"timestamp": "2026-01-27T09:00:00Z", "precision": 0.62},
    {"timestamp": "2026-01-27T10:00:00Z", "precision": 0.71}
  ],
  "by_rule": {
    "secrets-openai": {"flags": 10, "valid": 9, "fp": 1, "confidence": 0.9},
    "dangerous-eval": {"flags": 8, "valid": 5, "fp": 3, "confidence": 0.625}
  }
}
```

## Detection Rules

### Category 1: Critical (Secrets)
```python
RULES = {
    "secrets-openai": {
        "pattern": r'sk-[a-zA-Z0-9]{20,60}',
        "severity": "critical",
        "explanation": "Hardcoded OpenAI API key detected.",
        "suggested_fix": "Use environment variable: os.environ.get('OPENAI_API_KEY')"
    },
    "secrets-aws": {
        "pattern": r'AKIA[0-9A-Z]{16}',
        "severity": "critical", 
        "explanation": "AWS Access Key exposed.",
        "suggested_fix": "Use AWS credentials file or environment variables"
    },
    "secrets-password": {
        "pattern": r'(?i)(password|passwd|pwd)\s*=\s*["\'][^"\']+["\']',
        "severity": "critical",
        "explanation": "Hardcoded password detected.",
        "suggested_fix": "Use environment variable or secrets manager"
    }
}
```

### Category 2: Danger (Code Execution)
```python
RULES = {
    "dangerous-eval": {
        "pattern": r'\beval\s*\(',
        "severity": "danger",
        "explanation": "eval() can execute arbitrary code - major security risk.",
        "suggested_fix": "Use ast.literal_eval() for safe evaluation, or avoid eval entirely"
    },
    "dangerous-exec": {
        "pattern": r'\bexec\s*\(',
        "severity": "danger",
        "explanation": "exec() executes arbitrary code - potential RCE vulnerability.",
        "suggested_fix": "Avoid exec(), use safer alternatives"
    },
    "dangerous-pickle": {
        "pattern": r'pickle\.loads?\s*\(',
        "severity": "danger",
        "explanation": "pickle can execute arbitrary code during deserialization.",
        "suggested_fix": "Use json for data serialization instead"
    }
}
```

### Category 3: High Risk (SQL Injection)
```python
RULES = {
    "sql-fstring": {
        "pattern": r'f["\'].*SELECT.*\{.*\}',
        "severity": "high_risk",
        "explanation": "SQL query with f-string interpolation - SQL injection risk.",
        "suggested_fix": "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))"
    },
    "sql-concat": {
        "pattern": r'["\'].*SELECT.*["\']\s*\+',
        "severity": "high_risk",
        "explanation": "SQL query built with string concatenation - SQL injection risk.",
        "suggested_fix": "Use parameterized queries instead of string concatenation"
    }
}
```

## Implementation Order

### Phase 1: CLI Foundation (Hours 0-5)
1. Create folder structure
2. Create cli/detectors/ with all regex patterns
3. Create cli/scanner.py - detection logic
4. Create cli/checkmate.py with Click commands
5. Test: `checkmate scan sample.py` outputs to terminal

### Phase 2: Data Layer (Hours 5-7)
6. Create data/ folder with empty JSON files
7. Modify scanner to save scan_results.json
8. Create server/main.py with FastAPI (3 endpoints)
9. Test: API returns JSON data correctly

### Phase 3: Dashboard Foundation (Hours 7-12)
10. Initialize Next.js dashboard
11. Install shadcn, recharts, syntax-highlighter
12. Create lib/api.ts to fetch from FastAPI
13. Create WaitingForScan component (empty state)
14. Create main page that polls for results
15. Test: dashboard shows "waiting" then updates when scan runs

### Phase 4: Flags Display (Hours 12-15)
16. Create CodeDisplay component
17. Create FlagCard component with severity badges
18. Create SuggestedFix component
19. Display all flags from scan_results.json
20. Test: flags show correctly with highlighting

### Phase 5: Feedback Loop (Hours 15-19)
21. Create FeedbackButtons (Mark as Safe / Copy Fix)
22. POST /api/feedback updates whitelist.json
23. Modify CLI scanner to read whitelist and skip patterns
24. Update metrics.json on each feedback
25. Test: mark safe → rescan → pattern skipped

### Phase 6: Metrics Dashboard (Hours 19-22)
26. Create metrics/page.tsx
27. Create MetricsChart (precision over time)
28. Create BeforeAfterCard (improvement %)
29. Add navigation between Results and Metrics
30. Test: dashboard shows real improvement

### Phase 7: Polish & Demo (Hours 22-24)
31. Chess theme: dark bg, knight logo, green/red accents
32. Create sample vulnerable files for demo
33. Full demo run: scan → feedback → rescan → improvement
34. Bug fixes only, no new features

## Dashboard Features

### Main Page (/)
- If no scan yet: show "Waiting for scan..." with instructions
- If scan exists: show results with flags
- Each flag shows:
  - Severity badge (Critical=red, Danger=orange, High Risk=yellow)
  - Line number and code snippet (syntax highlighted)
  - Explanation of why it's dangerous
  - Suggested fix (collapsible)
  - Buttons: [Mark as Safe] [Copy Fix]
- Auto-refresh every 2 seconds (poll /api/health then /api/results)

### Metrics Page (/metrics)
- Stat cards: Total Scans, Total Flags, Precision, Improvement %
- Line chart: Precision over time
- Before/After comparison card
- Per-rule breakdown table

## Code Style

### Python
- Click for CLI
- Rich for terminal colors
- Type hints
- Raw strings for regex: `r"pattern"`

### TypeScript
- "use client" for interactive components
- Named exports
- Interfaces for all props
- Shadcn components

## Commands Reference
```bash
# CLI
cd cli
pip install -r requirements.txt
python checkmate.py dashboard  # starts server + opens browser
python checkmate.py scan file.py

# Server (usually auto-started by dashboard command)
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Dashboard (usually auto-started by dashboard command)
cd dashboard
npm install
npm run dev
```

## Important Constraints

- 24-hour hackathon
- NO machine learning - regex only
- JSON files as data store
- Human feedback loop is KEY (25 marks)
- Must show before/after improvement (20 marks)
- `checkmate dashboard` starts everything
- `checkmate scan` runs detection and triggers refresh

## Demo Checklist

- [ ] `checkmate dashboard` opens browser with waiting state
- [ ] `checkmate scan sample.py` shows results in dashboard
- [ ] Flags display with correct severity colors
- [ ] Suggested fixes show for each flag
- [ ] "Mark as Safe" adds to whitelist
- [ ] Rescan skips whitelisted patterns
- [ ] Metrics page shows precision improvement
- [ ] Before/After card shows measurable gain