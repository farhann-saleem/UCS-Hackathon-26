# CheckMate: Product Requirements Document (PRD)

**Open-Source CLI for Detecting Security Vulnerabilities in AI-Generated Code**

*Team: UCS Hackathon 26*
*Hackathon Theme: Human-in-the-Loop Anomaly Detection*
*Architecture: Local CLI + FastAPI Backend + Next.js Dashboard*
*Installation: `pip install checkmate` (Open Source)*
*Date: January 27, 2026*

---

## 1. Executive Summary

**CheckMate** is an open-source, human-in-the-loop security scanner that detects vulnerabilities in AI-generated code (from GitHub Copilot, ChatGPT, Claude). It's designed as a professional CLI tool that developers can install and run locally with zero external dependencies.

Unlike cloud-based scanners (Snyk, SonarCloud), CheckMate:
- **Runs 100% locally** on the developer's machine
- **Installs in seconds** via `pip install checkmate`
- **Learns from human feedback** - users mark false positives and the system improves
- **Provides a professional dashboard** for reviewing and managing vulnerabilities
- **Works offline** - no network calls, no data sent to servers

**Core Value Proposition:**

1. **Zero-Trust Privacy:** Code never leaves your machine. No cloud uploads, no third-party servers.
2. **One-Command Installation:** `pip install checkmate` makes it available globally.
3. **Human-in-the-Loop Learning:** Users provide feedback → system whitelist updates → next scan is smarter.
4. **Professional UX:** CLI for power users + modern Next.js dashboard for managers.

---

## 2. Problem Statement

AI coding assistants (GitHub Copilot, ChatGPT, Claude) generate code faster than humans can review it. This leads to **silent security vulnerabilities**: code that functions correctly but contains hardcoded secrets, SQL injection risks, and dangerous function calls that traditional linters miss.

**The Gaps CheckMate Fills:**

1. **The Privacy Gap:** Developers and enterprises refuse to upload proprietary code to cloud scanners. CheckMate scans everything locally, no servers involved.
2. **The Accuracy Gap:** Static scanners produce false positives. CheckMate uses human feedback to learn what's actually safe in your codebase.
3. **The Integration Gap:** Security tools feel separate from the development workflow. CheckMate integrates into the terminal (where developers live) AND provides a dashboard for code reviewers.

---

## 3. Technical Architecture: "Local-First, Full-Stack"

CheckMate combines three components that communicate via local JSON files and a local FastAPI server:

```
Terminal (Developer)          Browser (Code Reviewer)
       ↓                              ↓
   CLI Scanner ←────────────→ FastAPI Backend ←────────→ Next.js Dashboard
    (Click)                  (Async Detection)         (React + TypeScript)
       ↓                              ↓
       └──────→ scan_results.json ←──┘
       └──────→ whitelist.json ←──────┘
       └──────→ feedback.json ←───────┘
       └──────→ metrics.json ←────────┘
```

### Core Components

1. **The Scanner (CLI):** 
   - Built with Python `Click` framework + `Rich` for beautiful terminal output
   - Scans files recursively, applies 31+ regex-based detection rules
   - Reads `whitelist.json` to skip false positives from previous runs
   - Saves results to `scan_results.json`

2. **The Backend (API):**
   - Built with FastAPI for async performance
   - Provides REST endpoints for scanning, feedback, and metrics
   - SQLite database stores all scans, flags, feedback, and metrics
   - Runs on `localhost:8001`

3. **The Dashboard (Web UI):**
   - Built with Next.js 14 + React + TypeScript
   - Modern UI with Tailwind CSS + Shadcn components
   - Real-time polling for scan updates
   - Users click "Mark as False Positive" → whitelist updates → CLI learns
   - Metrics page shows precision improvement over time
   - Runs on `localhost:3000`

---

---

## 4. Feature Specifications

### Feature 1: Multi-Language Detection Engine (31 Rules)

**Hackathon Scoring:** Anomaly Detection (20 Marks)

The CLI engine runs regex-based detectors that identify three categories of vulnerabilities:

| Category | Rule IDs | Examples |
|----------|----------|----------|
| **Secrets** | SEC001-SEC010 | OpenAI API keys, AWS access keys, hardcoded passwords |
| **Dangerous Functions** | FUNC001-FUNC014 | `eval()`, `exec()`, `pickle.loads()`, `dangerouslySetInnerHTML` |
| **SQL Injection** | SQL001-SQL007 | f-string SQL, `.format()` SQL, string concatenation in queries |

**Supported Languages:**
- ✅ Python (`.py`)
- ✅ JavaScript/TypeScript (`.js`, `.ts`, `.tsx`)

**Example Detection:**
```python
# CLI detects this:
api_key = 'sk-1234567890abcdef'  # SEC005: OpenAI API Key
result = eval(user_input)         # FUNC001: eval() is dangerous
query = f"SELECT * FROM users WHERE id = {user_id}"  # SQL001: SQL Injection
```

---

### Feature 2: One-Command Workflow

**Hackathon Scoring:** Presentation Clarity (10 Marks)

**Installation:**
```bash
pip install checkmate
```

**Usage:**
```bash
# Start the dashboard (opens browser automatically)
checkmate dashboard

# In another terminal, scan your code
checkmate scan ./src

# View results in dashboard at localhost:3000
# Manage whitelisted patterns at /dashboard
```

**What Happens:**
1. User runs `checkmate scan ./src` in terminal
2. CLI scans all Python/JS files recursively
3. Detection results saved to SQLite database
4. Dashboard at `localhost:3000` auto-refreshes with new flags
5. Terminal shows rich, colored output with severity badges

---

### Feature 3: Human-in-the-Loop Feedback (The Learning Engine)

**Hackathon Scoring:** Human-in-the-Loop Integration (25 Marks)

The entire system is built around human feedback improving detection:

**The Flow:**
1. **Dashboard shows flag:** "SEC005 - OpenAI API Key on line 15"
2. **User clicks:** "Mark as Safe (False Positive)"
3. **Backend action:** 
   - Flag marked in database
   - Whitelist updated with matched pattern
   - Metrics recalculated (precision improved)
4. **Next scan:**
   - CLI loads whitelist
   - Same pattern skipped automatically
   - Fewer false positives reported

**Key Capability (Just Fixed):**
- Users can **change their verdict anytime**
- Mark as "Valid" → later change to "False Positive" → metrics stay accurate
- No blocking errors, full flexibility

---

### Feature 4: Before/After Improvement Metrics

**Hackathon Scoring:** Before vs After Improvement (20 Marks)

**Metrics Dashboard shows:**

```
Scan Statistics:
├─ Total Scans: 5
├─ Total Flags Found: 45
├─ Confirmed Valid: 32
├─ False Positives: 13
└─ Precision: 71% → 85% (+14%)

Per-Rule Breakdown:
├─ SEC005 (OpenAI Keys): 9 flags, 8 valid (89% precision)
├─ FUNC001 (eval): 12 flags, 10 valid (83% precision)
└─ SQL001 (f-string SQL): 24 flags, 14 valid (58% precision)

Precision History (Graph):
└─ Jan 27 10:00 - 60%
└─ Jan 27 11:00 - 68%
└─ Jan 27 12:00 - 75%
└─ Jan 27 13:00 - 85%
```

**How It Works:**
- Each feedback submission updates `rule_metrics`
- Whitelist prevents flagging same patterns again
- Precision calculated as: `valid_count / total_flags * 100`
- Dashboard shows trend lines and improvement percentage

---

## 5. Data Models

CheckMate uses **SQLite for persistence** with a modern schema:

### Database Tables

**`scans`** - Each code scan
```
scan_id (PK)     | code            | language  | created_at
uuid-123         | "api_key = ..." | "python"  | 2026-01-27 10:00:00
```

**`flags`** - Individual vulnerabilities detected
```
flag_id (PK) | scan_id | rule_id | severity | message | line_number | line_content | suggestion
uuid-456     | uuid-123| SEC005  | critical | OpenAI Key | 15 | api_key='sk-...' | Use os.environ
```

**`feedback`** - Human verdicts (valid / false_positive)
```
feedback_id | scan_id | flag_id | verdict
uuid-789    | uuid-123| uuid-456| false_positive
```

**`rule_metrics`** - Aggregated statistics per rule
```
rule_id | rule_name | total_flags | valid_count | false_positive_count | precision
SEC005  | OpenAI Key| 10          | 8           | 2                    | 80%
```

### Whitelist Storage

**`/data/whitelist.json`** - Patterns to skip
```json
{
  "patterns": [
    "api_key = 'sk-example-demo-key'",
    "SELECT * FROM test_table",
    "eval(test_code)"
  ]
}
```

---

## 6. Installation & Distribution

CheckMate is packaged as a professional, installable Python package.

**Current Status:**
- ✅ Source code on GitHub (open source)
- ✅ Can install locally: `pip install .` (from repo root)
- ✅ Python 3.9+ required
- ✅ Dependencies: FastAPI, Click, Rich, Next.js (frontend build)

**Future (Post-Hackathon):**
- Publish to PyPI: `pip install checkmate`
- Docker support for containerized deployments
- GitHub Action integration for CI/CD

---

## 7. Quick Start Demo

### Installation
```bash
# Clone and install
git clone https://github.com/yourusername/checkmate.git
cd checkmate
pip install -r backend/requirements.txt
cd dashboard && npm install && npm run build
```

### Run It
```bash
# Terminal 1: Start dashboard + backend
checkmate dashboard

# Terminal 2: Scan your code
checkmate scan ./vulnerable_samples/demo.py
```

### See the Magic
1. Terminal shows `⚠️ CRITICAL: SEC005 - OpenAI API Key` (red)
2. Browser opens dashboard automatically (localhost:3000)
3. Click "Mark as False Positive"
4. Check `/data/whitelist.json` - pattern added ✅
5. Run `checkmate scan` again - flag skipped ✅
6. Metrics improved from 60% → 100% precision ✅

---

## 8. Hackathon Alignment: 100-Point Rubric

| Criteria | Marks | CheckMate Implementation |
|----------|-------|--------------------------|
| **Problem Definition** | 10 | Clear: AI code security + privacy gap ✅ |
| **Anomaly Detection** | 20 | 31 rules across 3 categories, multi-language ✅ |
| **Human-in-Loop** | 25 | Feedback → whitelist → rescan loop works ✅ |
| **Before/After Demo** | 20 | Precision metrics, trend tracking, improvement ✅ |
| **Explainability** | 15 | Rule explanations, severity levels, suggestions ✅ |
| **Presentation** | 10 | Professional CLI + modern web dashboard ✅ |
| **TOTAL** | **100** | **~97/100** |

---

## 9. Why CheckMate Matters

1. **Real-World Problem:** AI coding assistants are everywhere, security gaps are real
2. **Privacy First:** Enterprises NEED offline tools; CheckMate solves this
3. **Human-Centered:** System improves from user feedback, not black-box ML
4. **Developer-Friendly:** Installs in seconds, integrates with workflow
5. **Open Source:** Community can add more rules, support more languages

---

## 10. Success Metrics (Hackathon Demo)

We will demonstrate:
- ✅ `pip install .` works (installable)
- ✅ `checkmate scan` detects real vulnerabilities
- ✅ Dashboard shows flags with explanations
- ✅ User marks false positive → system learns
- ✅ Rescan shows improved precision
- ✅ Metrics page shows before/after improvement

**One-Line Pitch:** "CheckMate - Detect AI code security flaws locally, learn from human feedback, improve precision with every correction."