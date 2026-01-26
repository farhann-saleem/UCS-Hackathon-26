# CheckMate: Hackathon Documentation Package

## Document 1: Product Requirements Document (PRD)

---

# CheckMate PRD
**Human-in-the-Loop Anomaly Detection for AI-Generated Code**

*Team: [Your Team Name]*  
*Hackathon: Human-in-the-Loop Anomaly Detection*  
*Date: January 26, 2026*

---

## Executive Summary

CheckMate is a web application that scans AI-generated code for security vulnerabilities and anomalies, enables human developers to review flagged issues, and demonstrably improves detection accuracy through feedback. The core innovation lies in closing the feedback loop—transforming static rule-based detection into an adaptive system that learns from human judgment.

**Target Users**: Developers using AI coding assistants (GitHub Copilot, ChatGPT, Claude)

**Key Value Proposition**: AI coding assistants generate code faster than humans can review it safely. CheckMate provides the "second pair of eyes" that catches security vulnerabilities, hardcoded secrets, and dangerous patterns—with measurable improvement from human feedback that proves the human-in-the-loop approach works.

---

## Problem Statement

AI code generation tools are now ubiquitous, with **92% of developers using AI assistants** in their workflow. However, AI-generated code frequently contains security vulnerabilities, hardcoded credentials, and dangerous function calls that bypass traditional code review processes.

**The specific problems CheckMate addresses:**

1. **Blind trust in AI output** — Developers often accept AI suggestions without scrutiny, especially under time pressure
2. **Security pattern blindness** — AI assistants don't consistently warn about security anti-patterns they generate
3. **False positive fatigue** — Existing static analysis tools flag too many non-issues, leading developers to ignore alerts
4. **No feedback mechanism** — Traditional scanners don't improve based on which alerts were actually helpful

**Why Human-in-the-Loop matters**: Pure automation cannot reliably distinguish between a genuine security vulnerability and legitimate code. Human judgment is essential for context-dependent decisions—and that judgment should feed back into the system to improve future detection.

---

## User Persona

### Primary Persona: Alex, the AI-Augmented Developer

**Background**: Full-stack developer, 4 years experience, uses GitHub Copilot daily for boilerplate code and ChatGPT for complex functions.

**Pain Points**:
- Has accidentally committed API keys to repositories twice
- Doesn't have time to manually review every AI suggestion
- Frustrated by security scanners that flag obvious false positives
- Wants to trust AI code but knows it needs verification

**Goals**:
- Catch security issues before code reaches production
- Spend minimal time on review without sacrificing safety
- Have confidence that the scanner learns from their feedback

**Quote**: "I love how fast AI helps me code, but I need a safety net I can trust."

---

## Feature Specifications

### Feature 1: Code Input System

**Hackathon Scoring**: Supports criteria 1 (Problem Definition) and 6 (Presentation)

**Description**: Simple interface for submitting AI-generated code for analysis.

| Requirement | Priority | Implementation |
|-------------|----------|----------------|
| Text area for pasting code snippets | Must-have | `CodeInput.tsx` component |
| Language selection (Python, JavaScript) | Must-have | Dropdown with 2 options |
| Syntax highlighting in input | Nice-to-have | `react-syntax-highlighter` |
| File upload support (.py, .js files) | Nice-to-have | File input with validation |

**User Flow**:
1. User navigates to landing page
2. Pastes code into text area
3. Selects language from dropdown
4. Clicks "Scan for Issues" button
5. System redirects to results page with flagged issues

---

### Feature 2: Anomaly Detection Engine (Pattern-Based)

**Hackathon Scoring**: Criteria 1 (10 marks) + Criteria 2 (20 marks) = **30 marks total**

**Description**: Regex-based detection engine that scans code for three categories of vulnerabilities.

#### Category A: Secrets Detection

| Pattern | Regex | Severity | False Positive Notes |
|---------|-------|----------|---------------------|
| OpenAI API Key | `sk-[a-zA-Z0-9]{20,60}` | Critical | Very low FP rate |
| AWS Access Key | `AKIA[0-9A-Z]{16}` | Critical | Allowlist `AKIAIOSFODNN7EXAMPLE` |
| AWS Secret Key | `(?i)aws(.{0,20})?['\"][0-9a-zA-Z/+]{40}['\"]` | Critical | Requires context |
| GitHub Token | `ghp_[a-zA-Z0-9]{36}` | High | Distinctive prefix |
| Hardcoded Password | `(?i)(password\|passwd\|pwd)\s*=\s*['\"][^'\"]+['\"]` | High | Check for env var references |
| Database URL | `(postgres\|mysql\|mongodb)://[^:]+:[^@]+@` | Critical | Contains credentials |

#### Category B: SQL Injection Vulnerabilities

| Pattern | Regex | Severity |
|---------|-------|----------|
| Python f-string SQL | `cursor\.execute\s*\(\s*f[\"'].*\{.*\}.*[\"']` | High |
| String concatenation (PY) | `cursor\.execute\s*\(\s*[\"'].*[\"']\s*\+\s*` | High |
| JS template literal SQL | `(execute\|query)\s*\(\s*\`.*\$\{.*\}.*\`` | High |

#### Category C: Dangerous Function Calls

**Python:**
| Function | Regex | Severity | Why Dangerous |
|----------|-------|----------|---------------|
| `eval()` | `\beval\s*\(` | Critical | Remote code execution |
| `exec()` | `\bexec\s*\(` | Critical | Remote code execution |
| `pickle.loads()` | `pickle\.loads?\s*\(` | Critical | Deserialization RCE |
| `yaml.load()` | `yaml\.load\s*\([^)]*\)(?!.*SafeLoader)` | High | Arbitrary object instantiation |
| `subprocess` with shell | `subprocess\.(call\|run\|Popen).*shell\s*=\s*True` | High | Command injection |

**JavaScript:**
| Function | Regex | Severity | Why Dangerous |
|----------|-------|----------|---------------|
| `eval()` | `\beval\s*\(` | Critical | Code execution |
| `innerHTML` | `\.innerHTML\s*=\s*[^\"'\`]` | High | XSS vulnerability |
| `dangerouslySetInnerHTML` | `dangerouslySetInnerHTML\s*=` | High | React XSS |

**Implementation Notes**:
- Each rule has a unique `rule_id` for tracking feedback
- Each rule starts with baseline confidence score of 0.5
- Confidence adjusts based on human feedback

---

### Feature 3: Results Dashboard

**Hackathon Scoring**: Criteria 5 (Explainability) + Criteria 6 (Presentation) = **15 marks**

**Description**: Display scan results with visual highlighting and explanations.

| Component | Requirement | Implementation |
|-----------|-------------|----------------|
| Code display | Show original code with highlighted flagged lines | `react-syntax-highlighter` + line marking |
| Severity badges | Color-coded: Critical (red), Warning (yellow), Info (blue) | Shadcn Badge component |
| Rule identification | Display which rule triggered each flag | Text label per flag |
| Explanation panel | Plain-English description of why pattern is dangerous | Expandable section |
| Line navigation | Click flag to jump to line | Anchor links |

**Visual Design**:
- Chess theme: Black/white primary colors
- Green highlights for "safe" confirmations
- Red highlights for flagged issues
- Card-based layout for each flag

---

### Feature 4: Human-in-the-Loop Feedback System

**Hackathon Scoring**: Criteria 3 (25 marks) — **MOST IMPORTANT FEATURE**

**Description**: Core feedback mechanism that allows humans to validate or reject flagged issues.

| Requirement | Priority | Implementation |
|-------------|----------|----------------|
| "Valid Issue" button per flag | Must-have | Stores `is_valid=true` |
| "False Positive" button per flag | Must-have | Stores `is_valid=false` |
| Optional notes/comments field | Must-have | Text input, max 500 chars |
| Visual feedback on submission | Must-have | Toast notification |
| Prevent duplicate feedback | Must-have | Disable buttons after submission |

**Feedback Data Model**:
```
feedback {
    id: integer (auto)
    scan_id: string (FK)
    flag_id: string (FK)
    rule_id: string
    verdict: "valid" | "false_positive"
    notes: string (optional)
    created_at: timestamp
}
```

**How Feedback Improves Detection**:
1. Each rule maintains a confidence score: `confirmed_valid / (confirmed_valid + false_positives)`
2. When confidence drops below 0.3, rule is flagged for review
3. Future scans weight rule severity by confidence score
4. Dashboard shows per-rule accuracy metrics

---

### Feature 5: Before/After Metrics Dashboard

**Hackathon Scoring**: Criteria 4 (20 marks) — **Demonstrate measurable improvement**

**Description**: Visualize how human feedback improves detection accuracy over time.

| Metric | Calculation | Visualization |
|--------|-------------|---------------|
| Total scans | COUNT(scans) | Number card |
| Total flags | COUNT(flags) | Number card |
| Confirmations | COUNT(feedback WHERE verdict='valid') | Number card |
| False positives | COUNT(feedback WHERE verdict='false_positive') | Number card |
| Precision | confirmations / (confirmations + false_positives) | Percentage + trend |
| Precision over time | Precision calculated per time window | Line chart |

**Before/After Demo Strategy**:

| Phase | Action | Expected Metrics |
|-------|--------|------------------|
| Round 1 (Before) | Scan 5 code samples with baseline rules | ~60-65% precision (intentional FPs) |
| Feedback Session | Human reviews 20-30 flags, marks FPs | Data collected |
| System Adapts | Recalculate rule confidence scores | Rules with FPs downweighted |
| Round 2 (After) | Rescan or scan new samples | ~80-87% precision improvement |

**Key Visualization**: Side-by-side comparison card showing:
```
BEFORE FEEDBACK          AFTER FEEDBACK
────────────────         ────────────────
Precision: 62%     →     Precision: 84% (+22%)
False Positives: 15      False Positives: 6  (-60%)
```

---

### Feature 6: LLM Explanations (Optional/Stretch)

**Hackathon Scoring**: Criteria 5 (Explainability) — **Bonus differentiation**

**Description**: Use Claude API to generate natural-language explanations for flagged vulnerabilities.

| Requirement | Implementation |
|-------------|----------------|
| Generate explanation on demand | Button: "Explain this vulnerability" |
| API call to Claude | `anthropic` Python package |
| Display explanation | Collapsible panel below flag |

**Prompt Template**:
```
You are a security expert. Explain why the following code pattern is dangerous:

Code: {flagged_code_snippet}
Rule: {rule_name}
Category: {category}

Provide a 2-3 sentence explanation suitable for a developer who may not be a security expert.
Include what could go wrong and how to fix it.
```

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                      (Next.js 14 + React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Code Input  │  │   Results    │  │  Dashboard   │          │
│  │    Page      │  │    Page      │  │    Page      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP (JSON)
┌─────────────────────────────▼───────────────────────────────────┐
│                         BACKEND                                  │
│                    (Python FastAPI)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  /api/scan   │  │ /api/feedback│  │ /api/metrics │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────▼───────┐        │                 │                   │
│  │  Detection   │        │                 │                   │
│  │   Engine     │        │                 │                   │
│  │ (Regex Rules)│        │                 │                   │
│  └──────────────┘        │                 │                   │
│                          │                 │                   │
└──────────────────────────┼─────────────────┼───────────────────┘
                           │                 │
                    ┌──────▼─────────────────▼──────┐
                    │         SQLite Database       │
                    │  ┌─────────┐ ┌─────────────┐  │
                    │  │  scans  │ │  feedback   │  │
                    │  ├─────────┤ ├─────────────┤  │
                    │  │  flags  │ │rule_metrics │  │
                    │  └─────────┘ └─────────────┘  │
                    └───────────────────────────────┘
```

### Data Flow

1. **Scan Flow**: User submits code → FastAPI `/scan` endpoint → Detection engine applies regex rules → Flags stored in DB → Results returned to frontend
2. **Feedback Flow**: User marks flag valid/FP → FastAPI `/feedback` endpoint → Feedback stored → Rule confidence recalculated
3. **Metrics Flow**: Dashboard requests `/metrics` → Aggregated from feedback table → Charts rendered

---

## Database Schema

```sql
-- Core tables
CREATE TABLE scans (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    language TEXT NOT NULL CHECK(language IN ('python', 'javascript')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE flags (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    line_number INTEGER NOT NULL,
    code_snippet TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'warning', 'info')),
    explanation TEXT NOT NULL,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id TEXT NOT NULL,
    flag_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    verdict TEXT NOT NULL CHECK(verdict IN ('valid', 'false_positive')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (scan_id) REFERENCES scans(id),
    FOREIGN KEY (flag_id) REFERENCES flags(id)
);

CREATE TABLE rule_metrics (
    rule_id TEXT PRIMARY KEY,
    total_flags INTEGER DEFAULT 0,
    confirmed_valid INTEGER DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    confidence_score REAL DEFAULT 0.5
);

-- Indexes for performance
CREATE INDEX idx_flags_scan ON flags(scan_id);
CREATE INDEX idx_feedback_rule ON feedback(rule_id);
CREATE INDEX idx_feedback_created ON feedback(created_at);
```

---

## API Specifications

### POST /api/scan

**Purpose**: Scan code for security vulnerabilities

**Request**:
```json
{
    "code": "import os\napi_key = 'sk-1234567890abcdef'\nos.system(user_input)",
    "language": "python"
}
```

**Response**:
```json
{
    "scan_id": "scan_abc123",
    "flags": [
        {
            "flag_id": "flag_001",
            "line_number": 2,
            "code_snippet": "api_key = 'sk-1234567890abcdef'",
            "rule_id": "secrets-openai",
            "rule_name": "OpenAI API Key",
            "severity": "critical",
            "explanation": "Hardcoded OpenAI API key detected. This should be stored in environment variables.",
            "category": "secrets"
        },
        {
            "flag_id": "flag_002",
            "line_number": 3,
            "code_snippet": "os.system(user_input)",
            "rule_id": "dangerous-os-system",
            "rule_name": "os.system() Call",
            "severity": "critical",
            "explanation": "os.system() with variable input can lead to command injection attacks.",
            "category": "dangerous_functions"
        }
    ],
    "summary": {
        "total_flags": 2,
        "by_severity": {"critical": 2, "warning": 0, "info": 0}
    }
}
```

### POST /api/feedback

**Purpose**: Record human judgment on flagged issues

**Request**:
```json
{
    "scan_id": "scan_abc123",
    "flag_id": "flag_001",
    "verdict": "valid",
    "notes": "Confirmed - this is a real API key"
}
```

**Response**:
```json
{
    "success": true,
    "rule_id": "secrets-openai",
    "new_confidence": 0.78,
    "message": "Feedback recorded. Rule confidence updated."
}
```

### GET /api/metrics

**Purpose**: Retrieve aggregated metrics for dashboard

**Response**:
```json
{
    "overall": {
        "total_scans": 47,
        "total_flags": 156,
        "confirmed_valid": 89,
        "false_positives": 31,
        "pending_review": 36,
        "precision": 0.742
    },
    "by_rule": [
        {
            "rule_id": "secrets-openai",
            "rule_name": "OpenAI API Key",
            "total_flags": 23,
            "confirmed": 21,
            "false_positives": 2,
            "confidence": 0.91
        },
        {
            "rule_id": "dangerous-eval",
            "rule_name": "eval() Call",
            "total_flags": 45,
            "confirmed": 28,
            "false_positives": 12,
            "confidence": 0.70
        }
    ],
    "trend": [
        {"date": "2026-01-26T10:00:00Z", "precision": 0.62},
        {"date": "2026-01-26T14:00:00Z", "precision": 0.74},
        {"date": "2026-01-26T18:00:00Z", "precision": 0.84}
    ]
}
```

---

## UI/UX Requirements

### Page 1: Landing / Code Input (`/`)

**Layout**:
- Header with CheckMate logo (chess knight icon)
- Tagline: "Trust, but verify your AI-generated code"
- Large code input text area (80% width, 400px min-height)
- Language dropdown (Python | JavaScript)
- "Scan for Issues" primary button
- Footer with brief feature description

**Interactions**:
- Syntax highlighting as user types (optional)
- Language auto-detection from code patterns (optional)
- Loading state with spinner when scanning
- Error toast if scan fails

### Page 2: Results (`/results/[scan_id]`)

**Layout**:
- Header with scan summary stats (flags found, severity breakdown)
- Split view: Code display (left 60%) | Flag details (right 40%)
- Code display with line numbers and highlighted flagged lines
- Flag cards in scrollable list:
  - Severity badge (color-coded)
  - Rule name and category
  - Explanation text
  - **Feedback buttons**: "✓ Valid Issue" | "✗ False Positive"
  - Optional notes text input
  - "Explain with AI" button (if Claude API enabled)

**Interactions**:
- Click flag card → highlight corresponding line in code
- Submit feedback → disable buttons, show success toast
- All flags reviewed → show "View Dashboard" CTA

### Page 3: Metrics Dashboard (`/dashboard`)

**Layout**:
- Four metric cards at top: Total Scans | Flags Found | Precision | Improvement
- Main chart: Precision over time (line chart with Recharts)
- Table: Per-rule breakdown with confidence scores
- Before/After comparison card (key demo element)

**Visual Requirements**:
- Charts use chess theme colors (black, white, accent green/red)
- Improvement percentages highlighted in green
- Low-confidence rules highlighted in yellow/orange

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Demo works end-to-end | 100% | Scan → Results → Feedback → Dashboard flow completes |
| Before/After improvement shown | ≥15% precision gain | Dashboard comparison card |
| Feedback capture rate | 100% of demo flags | All demo flags receive feedback |
| Sub-3-second scan time | <3s for 100 lines | API response time |
| Zero critical bugs in demo | 0 crashes | Manual testing |

---

## 24-Hour Timeline

### Phase 1: Foundation (Hours 0-6)

| Hour | Task | Deliverable |
|------|------|-------------|
| 0-1 | Project setup: repos, folders, dependencies | Empty Next.js + FastAPI running |
| 1-2 | Database schema + SQLite setup | `database.py` with all tables |
| 2-4 | Detection engine: implement all regex rules | `detectors/*.py` with tests |
| 4-6 | `/api/scan` endpoint complete | Can POST code, get flags back |

### Phase 2: Core Features (Hours 6-14)

| Hour | Task | Deliverable |
|------|------|-------------|
| 6-8 | Frontend: Code input page | Landing page with form |
| 8-10 | Frontend: Results page | Display flags with highlighting |
| 10-12 | `/api/feedback` endpoint + UI buttons | Feedback submission works |
| 12-14 | `/api/metrics` endpoint | Aggregated metrics return |

### Phase 3: Dashboard & Polish (Hours 14-20)

| Hour | Task | Deliverable |
|------|------|-------------|
| 14-16 | Dashboard page with charts | Metrics visualization |
| 16-18 | Before/After comparison component | Key demo element |
| 18-20 | Styling: chess theme, colors, polish | Professional appearance |

### Phase 4: Demo Prep (Hours 20-24)

| Hour | Task | Deliverable |
|------|------|-------------|
| 20-21 | Create demo dataset (5 code samples with known issues) | Seeded data |
| 21-22 | Run through demo flow, record baseline metrics | "Before" state |
| 22-23 | Collect feedback, verify "After" improvement shows | Demo validated |
| 23-24 | Practice presentation, prepare slides | Ready to present |

**Critical Rule**: After hour 20, NO new features. Only bug fixes and demo prep.

---

## Scoring Criteria Mapping

| Criteria | Marks | Features Addressing It |
|----------|-------|------------------------|
| 1. Problem definition | 10 | PRD problem statement, anomaly categories, rule definitions |
| 2. Anomaly detection | 20 | Detection engine with 15+ regex rules, severity levels |
| 3. Human-in-the-loop | **25** | Feedback buttons, notes, rule confidence adjustment, feedback storage |
| 4. Before/After improvement | 20 | Metrics dashboard, precision tracking, comparison visualization |
| 5. Explainability & ethics | 15 | Explanation text per rule, optional Claude explanations |
| 6. Presentation clarity | 10 | Clean UI, chess theme, working demo flow |

---

## Future Scope / Stretch Goals

**Not building in hackathon, but worth mentioning**:
- GitHub integration (scan on PR/commit)
- VS Code extension
- Additional languages (Go, Java, TypeScript)
- Machine learning-based pattern detection
- Team collaboration features
- Rule customization interface
- CI/CD pipeline integration

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SQLite performance issues | Low | Medium | Keep demo dataset small (<100 scans) |
| Regex false positives | Medium | Low | Pre-test all rules; allowlist obvious FPs |
| Frontend-backend integration bugs | Medium | High | Test API endpoints early with Postman |
| Scope creep | High | High | Strict timeline adherence; no features after hour 20 |
| Claude API rate limits (stretch) | Low | Low | Make LLM feature optional; cache responses |

---

---
