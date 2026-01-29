# 📖 CheckMate Setup Guide

Complete installation and setup instructions for CheckMate.

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Troubleshooting](#troubleshooting)
- [Development Setup](#development-setup)

---

## Installation

### Option 1: Install from PyPI (Recommended) 

**The easiest way - works globally on your system.**

```bash
pip install checkmate-ai
```

Verify installation:
```bash
checkmate version
```

Output:
```
╭──────────────────────────────────────────────────────────╮
│ ♞ CheckMate                                              │
│ Version: 1.0.0                                           │
│ AI Code Security Scanner with Human-in-the-Loop Feedback │
╰──────────────────────────────────────────────────────────╯
```

✅ **You're ready!** Jump to [Quick Start](#quick-start)

---

### Option 2: Install from Source

**For development or contributing to CheckMate.**

#### Prerequisites
- Python 3.11 or higher
- pip package manager
- Git

#### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/farhann-saleem/checkmate-ai.git
   cd checkmate
   ```

2. **Create virtual environment (optional but recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install in editable mode**
   ```bash
   pip install -e .
   ```

4. **Verify installation**
   ```bash
   checkmate version
   ```

---

## Quick Start

### Step 1: Start the Dashboard

Open **Terminal 1** and run:
```bash
checkmate dashboard
```

What happens:
- ✅ FastAPI backend starts on `localhost:8001`
- ✅ Next.js dashboard starts on `localhost:3000`
- ✅ Browser opens automatically
- 📍 Shows: "Waiting for scan..."

Keep this terminal open!

### Step 2: Run a Scan

Open **Terminal 2** and run:
```bash
checkmate scan samples/vulnerable_1.py
```

What happens:
- ✅ Detects 5 security flags
- ✅ Dashboard auto-refreshes in browser
- ✅ Shows flags with explanations and suggested fixes

### Step 3: Review Flags in Dashboard

Browser shows (auto-opens):
```
📍 http://localhost:3000
```

For each flag:
- **Line number** - Where in the code
- **Severity** - Color badge (Red=Critical, Orange=Danger, Yellow=High Risk)
- **Code snippet** - Syntax-highlighted
- **Explanation** - Why this is dangerous
- **Suggested fix** - How to fix it
- **Buttons** - "Mark as Safe" or "Copy Fix"

### Step 4: Provide Feedback

**Click "Mark as Safe"** on a false positive:
- Backend saves to whitelist
- Whitelist persists automatically

### Step 5: Rescan & See Improvement

In **Terminal 2**:
```bash
checkmate scan samples/vulnerable_1.py
```

Now:
- ✅ Same file scanned again
- ✅ Whitelisted patterns skipped
- ✅ Fewer false positives
- ✅ Dashboard shows **improved precision**

### Step 6: View Metrics

In browser, click **Metrics** (top right):
```
📊 Precision Trend Chart
   ├─ Before: 60%
   ├─ After: 84%
   └─ Improvement: +24%
```

---

## Commands Reference

### Scanning

**Scan single file**
```bash
checkmate scan code.py
```

**Scan multiple files**
```bash
checkmate scan file1.py file2.js file3.ts
```

**Scan all Python and JS files in directory**
```bash
checkmate scan .
```

**Scan with verbose output**
```bash
checkmate scan code.py --verbose
```

### Dashboard

**Start web UI** (includes backend)
```bash
checkmate dashboard
```

**Stop dashboard** - Press `Ctrl+C` in the terminal

### Data Management

**View current whitelist**
```bash
checkmate whitelist
```

Output:
```json
{
  "patterns": [
    {
      "rule_id": "secrets-openai",
      "code_pattern": "sk-test-value",
      "reason": "Test key",
      "added_at": "2026-01-27T10:00:00Z"
    }
  ]
}
```

**Reset all data** (fresh start)
```bash
checkmate reset
```

⚠️ Warning: This clears all scans, feedback, and metrics!

### Utilities

**Show version**
```bash
checkmate version
```

**Show help**
```bash
checkmate --help
```

---

## Troubleshooting

### Issue: "Command not found: checkmate"

**Solution:**
```bash
# Option 1: Reinstall
pip install --force-reinstall checkmate-ai

# Option 2: Check pip is in PATH
which python
which pip
pip --version
```

### Issue: Dashboard doesn't open automatically

**Solution:**
```bash
# Manually open in browser
checkmate dashboard
# Then visit: http://localhost:3000
```

### Issue: Port 3000 or 8001 already in use

**Solution:**
```bash
# Kill process using port
# macOS/Linux:
lsof -ti:3000 | xargs kill -9
lsof -ti:8001 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Scanner not detecting any flags

**Solution:**
```bash
# Verify file exists
ls -la code.py

# Check file has vulnerable code
cat code.py | grep -E "eval|password|sk-"

# Try sample file
checkmate scan samples/vulnerable_1.py
```

### Issue: Dashboard shows "Waiting for scan..." but no results appear

**Solution:**
```bash
# Check backend is running (look for logs in Terminal 1)
# Try scanning again:
checkmate scan samples/vulnerable_1.py

# Refresh browser manually (F5)

# Restart dashboard:
# Press Ctrl+C in Terminal 1
# Then: checkmate dashboard
```

### Issue: White list not working (patterns still detected)

**Solution:**
```bash
# View whitelist
checkmate whitelist

# Check feedback was saved in dashboard
# Try rescan
checkmate scan code.py

# If still issues, reset and retry
checkmate reset
checkmate dashboard
```

---

## Development Setup

### For Contributors

1. **Clone and setup**
   ```bash
   git clone https://github.com/farhann-saleem/checkmate-ai.git
   cd checkmate
   python -m venv venv
   source venv/bin/activate
   pip install -e ".[dev]"
   ```

2. **Install dev dependencies**
   ```bash
   pip install pytest pytest-cov black flake8 mypy
   ```

3. **Run tests**
   ```bash
   pytest tests/ -v
   pytest tests/ --cov=checkmate
   ```

4. **Run linter**
   ```bash
   black checkmate/ backend/ dashboard/
   flake8 checkmate/ backend/
   mypy checkmate/ backend/
   ```

5. **Make changes** and commit:
   ```bash
   git checkout -b feature/your-feature
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

---

## System Requirements

| Component | Requirement |
|-----------|-------------|
| Python | 3.11 or higher |
| pip | Latest version |
| Node.js | 18+ (if running dashboard from source) |
| RAM | 512 MB minimum |
| Disk | 100 MB (including dependencies) |

---

## Environment Variables

Optional configuration via `.env` file (in project root):

```bash
# Backend port (default: 8001)
BACKEND_PORT=8001

# Dashboard port (default: 3000)
DASHBOARD_PORT=3000

# Log level (default: INFO)
LOG_LEVEL=DEBUG

# Database path (default: ./checkmate.db)
DATABASE_PATH=./checkmate.db
```

---

## Uninstall

**Remove CheckMate from your system:**

```bash
pip uninstall checkmate-ai
```

This removes the `checkmate` command globally.

---

## Platform-Specific Notes

### macOS
```bash
# If M1/M2 Mac and pip install fails:
pip install --upgrade pip setuptools wheel
pip install checkmate-ai
```

### Windows
```bash
# Use PowerShell or CMD (Administrator recommended)
# Command same as Linux/macOS
pip install checkmate-ai

# Verify:
checkmate version
```

### Linux (Ubuntu/Debian)
```bash
# Update pip first
python3 -m pip install --upgrade pip

# Install CheckMate
pip3 install checkmate-ai

# Verify:
checkmate version
```

---

## Docker (Optional)

If you want to run CheckMate in a container:

```dockerfile
FROM python:3.11-slim

RUN pip install checkmate-ai

WORKDIR /app
COPY . .

CMD ["checkmate", "dashboard"]
```

Build and run:
```bash
docker build -t checkmate .
docker run -p 3000:3000 -p 8001:8001 checkmate
```

---

## Need Help?

- 📖 **README**: [README.md](./README.md)
- 📋 **PRD**: [PRD.md](./PRD.md)
- 🐞 **Report Bug**: GitHub Issues
- 💬 **Discuss**: GitHub Discussions

---

## PyPI Package Link

**CheckMate on PyPI:** https://pypi.org/project/checkmate-ai/

```bash
# Always install the latest version
pip install --upgrade checkmate-ai
```

---

## What's Next?

✅ **Installation complete!**

Now:
1. Run `checkmate dashboard`
2. In another terminal: `checkmate scan samples/vulnerable_1.py`
3. Review flags in browser
4. Mark false positives and watch precision improve!

**Enjoy scanning! 🚀**
