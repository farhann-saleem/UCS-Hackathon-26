
## Document 2: CLAUDE.md

---

```markdown

## MVP Priority (First 20 hours)
Skip these features initially:
- LLM explanations (stretch goal only)
- File upload (paste-only is fine)
- Syntax highlighting in input

Focus ONLY on:
1. Scan endpoint with regex detection
2. Results page with feedback buttons
3. Metrics dashboard with before/after

# CheckMate

Human-in-the-loop anomaly detection for AI-generated code. A web app that scans code for security vulnerabilities, collects human feedback on flagged issues, and demonstrates measurable improvement in detection precision.

## Tech Stack

**Frontend:**
- Next.js 14.2.x (App Router)
- React 18.2.x
- TypeScript 5.3.x
- Tailwind CSS 3.4.x
- Shadcn/ui components
- Recharts for data visualization
- react-syntax-highlighter for code display

**Backend:**
- Python 3.11+
- FastAPI 0.115.x
- Pydantic 2.7.x for validation
- SQLite with aiosqlite
- SQLAlchemy 2.0.x (optional, can use raw SQL)

## Project Structure

```
checkmate/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing + code input
│   │   ├── results/
│   │   │   └── [scanId]/page.tsx # Results display
│   │   ├── dashboard/page.tsx    # Metrics dashboard
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Tailwind imports
│   ├── components/
│   │   ├── ui/                   # Shadcn components
│   │   ├── CodeInput.tsx         # Code submission form
│   │   ├── FlaggedResult.tsx     # Single flag card
│   │   ├── FeedbackButtons.tsx   # Valid/FP buttons
│   │   ├── CodeDisplay.tsx       # Syntax-highlighted code
│   │   └── MetricsChart.tsx      # Recharts wrapper
│   ├── lib/
│   │   ├── api.ts                # Backend API calls
│   │   └── utils.ts              # Utility functions
│   ├── package.json
│   └── next.config.js
├── backend/
│   ├── main.py                   # FastAPI app entry
│   ├── database.py               # SQLite setup + queries
│   ├── models.py                 # Pydantic schemas
│   ├── detectors/
│   │   ├── __init__.py
│   │   ├── base.py               # Base detector class
│   │   ├── secrets.py            # API keys, passwords
│   │   ├── sql_injection.py      # SQL injection patterns
│   │   └── dangerous_functions.py # eval, exec, etc.
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── scan.py               # POST /api/scan
│   │   ├── feedback.py           # POST /api/feedback
│   │   └── metrics.py            # GET /api/metrics
│   └── requirements.txt
├── .env.example
├── README.md
└── CLAUDE.md
```

## Implementation Order

Build in this exact sequence:

### Phase 1: Backend Foundation (Hours 0-6)
1. `backend/database.py` - SQLite tables (scans, flags, feedback, rule_metrics)
2. `backend/models.py` - Pydantic models for all API requests/responses
3. `backend/detectors/base.py` - Base detector class with rule structure
4. `backend/detectors/secrets.py` - All secrets detection regex patterns
5. `backend/detectors/sql_injection.py` - SQL injection patterns
6. `backend/detectors/dangerous_functions.py` - Dangerous function patterns
7. `backend/routes/scan.py` - POST /api/scan endpoint
8. `backend/main.py` - FastAPI app with CORS

### Phase 2: Frontend + Feedback (Hours 6-14)
9. `frontend/` - Initialize Next.js with `npx create-next-app@14`
10. Install Shadcn: `npx shadcn@latest init`
11. Add components: `npx shadcn@latest add button card badge input textarea tabs table`
12. `frontend/lib/api.ts` - API client functions
13. `frontend/app/page.tsx` - Landing page with CodeInput
14. `frontend/components/CodeInput.tsx` - Form component
15. `frontend/app/results/[scanId]/page.tsx` - Results display
16. `frontend/components/FlaggedResult.tsx` - Flag card with feedback
17. `backend/routes/feedback.py` - POST /api/feedback endpoint

### Phase 3: Metrics Dashboard (Hours 14-20)
18. `backend/routes/metrics.py` - GET /api/metrics endpoint
19. `frontend/app/dashboard/page.tsx` - Dashboard page
20. `frontend/components/MetricsChart.tsx` - Precision over time chart
21. Before/After comparison card component
22. Styling and theme application

### Phase 4: Demo Prep (Hours 20-24)
23. Create sample code files with known vulnerabilities
24. Seed database with demo data
25. Test full flow: scan → feedback → metrics improvement
26. Bug fixes only, no new features

## Code Style

### Python
- Use type hints for all function parameters and returns
- Pydantic models for all API input/output
- Async functions for database operations
- f-strings for string formatting (but NOT in SQL queries!)
- Snake_case for variables and functions
- 4-space indentation

### TypeScript/React
- Functional components with hooks
- TypeScript strict mode
- Named exports (not default exports)
- Props interfaces defined above components
- Use Shadcn component primitives, don't reinvent UI
- Tailwind utilities, no custom CSS files

### General
- No console.log in production code (use proper logging)
- Handle all errors explicitly
- Add comments only for non-obvious logic

## Key Files to Create First

```bash
# Backend - create these files first
touch backend/database.py      # Database setup is foundation
touch backend/models.py        # Pydantic models
touch backend/detectors/__init__.py
touch backend/detectors/secrets.py  # Start with secrets detection
touch backend/main.py          # FastAPI app

# Frontend - after backend API works
npx create-next-app@14 frontend --typescript --tailwind --app
cd frontend && npx shadcn@latest init
```

## Dependencies

### Backend (requirements.txt)
```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.7.0
pydantic-settings>=2.0.0
aiosqlite>=0.19.0
python-dotenv>=1.0.0
```

### Frontend (package.json additions)
```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.11.0",
    "react-syntax-highlighter": "^15.5.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.303.0"
  },
  "devDependencies": {
    "@types/react-syntax-highlighter": "^15.5.0"
  }
}
```

### Shadcn Components to Install
```bash
npx shadcn@latest add button card badge input textarea tabs table scroll-area separator sonner
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite+aiosqlite:///./checkmate.db
ALLOWED_ORIGINS=http://localhost:3000
DEBUG=true
# Optional for LLM explanations
ANTHROPIC_API_KEY=sk-ant-...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database Reset
```bash
rm backend/checkmate.db
# Restart backend - tables auto-create
```

## Testing Approach

**Backend:**
- Test each detector with known vulnerable code snippets
- Use FastAPI TestClient for API endpoint tests
- Verify regex patterns in isolation first

**Frontend:**
- Manual testing during development
- Test API integration with real backend running
- Verify feedback flow updates UI correctly

**Demo Testing:**
- Run full flow: paste code → scan → review → feedback → check dashboard
- Verify "precision improvement" shows after feedback

## Common Pitfalls to Avoid

1. **SQL in f-strings**: The detection engine catches this in USER code, but don't do it in your own backend code. Use parameterized queries.

2. **CORS errors**: Backend MUST include CORS middleware before routes. If you get CORS errors, check `main.py` middleware order.

3. **SQLite async**: Use `aiosqlite` not `sqlite3`. All database functions must be `async def`.

4. **Shadcn imports**: Components go in `components/ui/`. Import from `@/components/ui/button` not `shadcn`.

5. **Next.js App Router**: Use `"use client"` directive for components with hooks or event handlers.

6. **Regex escaping**: In Python regex strings, use raw strings `r"pattern"` to avoid escape issues.

7. **UUID generation**: Use `uuid.uuid4()` for scan_id and flag_id. Convert to string for SQLite.

8. **Timestamp handling**: Store as ISO-8601 strings in SQLite (`datetime('now')`).

## Important Constraints

**24-Hour Hackathon Rules:**
- NO machine learning / model training - pure regex pattern matching only
- Focus on working demo over polish
- Human-in-the-loop feedback is THE MOST IMPORTANT feature (25 marks)
- Must demonstrate measurable before/after improvement
- After hour 20: bug fixes only, no new features

**Technical Constraints:**
- SQLite only (no Postgres/MySQL setup)
- No authentication required (demo simplicity)
- Support Python and JavaScript only
- All detection is regex-based, no AST parsing

**Scoring Priority:**
1. Human-in-the-loop feedback works (25 marks)
2. Before/After improvement shown (20 marks)
3. Detection engine flags issues (20 marks)
4. Clear explanations for flags (15 marks)
5. Problem is well-defined (10 marks)
6. Presentation is clear (10 marks)

## Regex Patterns Reference

### Secrets (High Priority)
```python
OPENAI_KEY = r'sk-[a-zA-Z0-9]{20,60}'
AWS_ACCESS_KEY = r'AKIA[0-9A-Z]{16}'
GITHUB_TOKEN = r'ghp_[a-zA-Z0-9]{36}'
HARDCODED_PASSWORD = r'(?i)(password|passwd|pwd)\s*=\s*["\'][^"\']+["\']'
DATABASE_URL = r'(postgres|mysql|mongodb)://[^:]+:[^@]+@'
```

### SQL Injection
```python
PYTHON_FSTRING_SQL = r'cursor\.execute\s*\(\s*f["\'].*\{.*\}.*["\']'
JS_TEMPLATE_SQL = r'(execute|query)\s*\(\s*`.*\$\{.*\}.*`'
```

### Dangerous Functions
```python
PYTHON_EVAL = r'\beval\s*\('
PYTHON_EXEC = r'\bexec\s*\('
PYTHON_PICKLE = r'pickle\.loads?\s*\('
PYTHON_YAML_UNSAFE = r'yaml\.load\s*\([^)]*\)(?!.*SafeLoader)'
PYTHON_OS_SYSTEM = r'os\.system\s*\('
SUBPROCESS_SHELL = r'subprocess\.(call|run|Popen).*shell\s*=\s*True'
JS_EVAL = r'\beval\s*\('
JS_INNERHTML = r'\.innerHTML\s*=\s*[^"\'\`]'
REACT_DANGEROUS = r'dangerouslySetInnerHTML\s*='
```

## API Quick Reference

### POST /api/scan
```bash
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"code": "api_key = \"sk-test123\"", "language": "python"}'
```

### POST /api/feedback
```bash
curl -X POST http://localhost:8000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"scan_id": "abc", "flag_id": "xyz", "verdict": "valid"}'
```

### GET /api/metrics
```bash
curl http://localhost:8000/api/metrics
```

## Demo Checklist

Before presenting, verify:
- [ ] Can paste code and scan successfully
- [ ] Flags display with correct severity colors
- [ ] Feedback buttons work (toast confirms)
- [ ] Dashboard shows current metrics
- [ ] Before/After comparison shows improvement
- [ ] No console errors in browser
- [ ] Backend has no unhandled exceptions
```

---

## Summary

This documentation package provides everything needed to build CheckMate in a 24-hour hackathon:

**Document 1 (PRD)** contains:
- Complete problem definition and user persona
- Detailed feature specifications with priority levels
- Full database schema and API specifications
- UI/UX requirements for all three pages
- Hour-by-hour implementation timeline
- Explicit mapping of features to scoring criteria

**Document 2 (CLAUDE.md)** contains:
- Exact tech stack versions
- File-by-file implementation order
- All code style guidelines
- Complete dependency lists
- Regex patterns ready to copy
- Common pitfalls specific to this project
- API testing commands

**Key success factors**:
- Human-in-the-loop feedback system is the core differentiator (25 marks)
- Before/After improvement must be demonstrable and measurable
- Stick to regex-only detection—no ML complexity
- Follow the timeline strictly; no new features after hour 20