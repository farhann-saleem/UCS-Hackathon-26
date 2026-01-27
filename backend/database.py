import aiosqlite
import os
from datetime import datetime
from typing import Optional

DATABASE_PATH = os.getenv("DATABASE_PATH", "./checkmate.db")


async def get_db() -> aiosqlite.Connection:
    """Get database connection."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db() -> None:
    """Initialize database with required tables."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Scans table - stores each code scan
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS scans (
                scan_id TEXT PRIMARY KEY,
                code TEXT NOT NULL,
                language TEXT NOT NULL,
                name TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """
        )

        # Flags table - stores each flagged issue
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS flags (
                flag_id TEXT PRIMARY KEY,
                scan_id TEXT NOT NULL,
                rule_id TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                line_number INTEGER NOT NULL,
                line_content TEXT NOT NULL,
                suggestion TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (scan_id) REFERENCES scans(scan_id)
            )
        """
        )

        # Feedback table - stores human feedback on flags
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS feedback (
                feedback_id TEXT PRIMARY KEY,
                scan_id TEXT NOT NULL,
                flag_id TEXT NOT NULL,
                verdict TEXT NOT NULL CHECK (verdict IN ('valid', 'false_positive')),
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (scan_id) REFERENCES scans(scan_id),
                FOREIGN KEY (flag_id) REFERENCES flags(flag_id)
            )
        """
        )

        # Rule metrics table - tracks precision per rule
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS rule_metrics (
                rule_id TEXT PRIMARY KEY,
                rule_name TEXT NOT NULL,
                total_flags INTEGER NOT NULL DEFAULT 0,
                valid_count INTEGER NOT NULL DEFAULT 0,
                false_positive_count INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """
        )

        # Add name column to scans table if it doesn't exist (migration)
        try:
            await db.execute(
                """
                ALTER TABLE scans ADD COLUMN name TEXT
            """
            )
        except Exception:
            # Column already exists, ignore
            pass

        await db.commit()


# Scan operations
async def create_scan(scan_id: str, code: str, language: str) -> None:
    """Create a new scan record."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            "INSERT INTO scans (scan_id, code, language) VALUES (?, ?, ?)",
            (scan_id, code, language),
        )
        await db.commit()


async def get_scan(scan_id: str) -> Optional[dict]:
    """Get a scan by ID."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM scans WHERE scan_id = ?", (scan_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None


async def get_all_scans() -> list[dict]:
    """Get all scans with their flag counts, ordered by newest first."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT s.scan_id, s.code, s.language, s.name, s.created_at, 
                      COUNT(f.flag_id) as flag_count
               FROM scans s
               LEFT JOIN flags f ON s.scan_id = f.scan_id
               GROUP BY s.scan_id
               ORDER BY s.created_at DESC"""
        )
        rows = await cursor.fetchall()
        scans = []
        for row in rows:
            scan_dict = dict(row)
            # Extract language and first line of code
            code_preview = scan_dict["code"].split("\n")[0][:50]
            scan_dict["code_preview"] = code_preview
            scans.append(scan_dict)
        return scans


# Flag operations
async def create_flag(
    flag_id: str,
    scan_id: str,
    rule_id: str,
    severity: str,
    message: str,
    line_number: int,
    line_content: str,
    suggestion: Optional[str] = None,
) -> None:
    """Create a new flag record."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            """INSERT INTO flags
               (flag_id, scan_id, rule_id, severity, message, line_number, line_content, suggestion)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                flag_id,
                scan_id,
                rule_id,
                severity,
                message,
                line_number,
                line_content,
                suggestion,
            ),
        )
        await db.commit()


async def get_flags_by_scan(scan_id: str) -> list[dict]:
    """Get all flags for a scan."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM flags WHERE scan_id = ? ORDER BY line_number", (scan_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


# Feedback operations
async def create_feedback(
    feedback_id: str, scan_id: str, flag_id: str, verdict: str
) -> None:
    """Create or update feedback and update rule metrics."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Get the rule_id for this flag
        cursor = await db.execute(
            "SELECT rule_id FROM flags WHERE flag_id = ?", (flag_id,)
        )
        row = await cursor.fetchone()

        # If flag not in database, it might be from CLI scan - allow feedback anyway
        rule_id = None
        if row:
            rule_id = row[0]

        # Check if feedback already exists
        existing_cursor = await db.execute(
            "SELECT verdict FROM feedback WHERE flag_id = ?", (flag_id,)
        )
        existing_row = await existing_cursor.fetchone()
        
        if existing_row:
            # Update existing feedback (allow users to change their mind)
            old_verdict = existing_row[0]
            await db.execute(
                "UPDATE feedback SET verdict = ? WHERE flag_id = ?",
                (verdict, flag_id),
            )
            # Recalculate metrics: subtract old, add new
            if rule_id:
                # Remove old verdict
                if old_verdict == "valid":
                    await db.execute(
                        "UPDATE rule_metrics SET valid_count = MAX(0, valid_count - 1), total_flags = MAX(0, total_flags - 1) WHERE rule_id = ?",
                        (rule_id,),
                    )
                elif old_verdict == "false_positive":
                    await db.execute(
                        "UPDATE rule_metrics SET false_positive_count = MAX(0, false_positive_count - 1), total_flags = MAX(0, total_flags - 1) WHERE rule_id = ?",
                        (rule_id,),
                    )
                # Add new verdict
                if verdict == "valid":
                    await db.execute(
                        """INSERT INTO rule_metrics (rule_id, rule_name, total_flags, valid_count, false_positive_count)
                           VALUES (?, ?, 1, 1, 0)
                           ON CONFLICT(rule_id) DO UPDATE SET
                           valid_count = valid_count + 1,
                           total_flags = total_flags + 1,
                           updated_at = datetime('now')""",
                        (rule_id, rule_id),
                    )
                elif verdict == "false_positive":
                    await db.execute(
                        """INSERT INTO rule_metrics (rule_id, rule_name, total_flags, valid_count, false_positive_count)
                           VALUES (?, ?, 1, 0, 1)
                           ON CONFLICT(rule_id) DO UPDATE SET
                           false_positive_count = false_positive_count + 1,
                           total_flags = total_flags + 1,
                           updated_at = datetime('now')""",
                        (rule_id, rule_id),
                    )
        else:
            # Insert new feedback
            await db.execute(
                "INSERT INTO feedback (feedback_id, scan_id, flag_id, verdict) VALUES (?, ?, ?, ?)",
                (feedback_id, scan_id, flag_id, verdict),
            )

            # Update rule metrics only if we found the rule_id
            if rule_id:
                if verdict == "valid":
                    await db.execute(
                        """INSERT INTO rule_metrics (rule_id, rule_name, total_flags, valid_count, false_positive_count)
                           VALUES (?, ?, 1, 1, 0)
                           ON CONFLICT(rule_id) DO UPDATE SET
                           valid_count = valid_count + 1,
                           total_flags = total_flags + 1,
                           updated_at = datetime('now')""",
                        (rule_id, rule_id),
                    )
                elif verdict == "false_positive":
                    await db.execute(
                        """INSERT INTO rule_metrics (rule_id, rule_name, total_flags, valid_count, false_positive_count)
                           VALUES (?, ?, 1, 0, 1)
                           ON CONFLICT(rule_id) DO UPDATE SET
                           false_positive_count = false_positive_count + 1,
                           total_flags = total_flags + 1,
                           updated_at = datetime('now')""",
                        (rule_id, rule_id),
                    )

        await db.commit()


async def get_feedback_for_flag(flag_id: str) -> Optional[dict]:
    """Get feedback for a specific flag."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM feedback WHERE flag_id = ?", (flag_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None


async def get_feedback_verdict(flag_id: str) -> Optional[str]:
    """Get the verdict (valid/false_positive) for a flag, or None if not reviewed."""
    feedback = await get_feedback_for_flag(flag_id)
    return feedback.get("verdict") if feedback else None


async def get_flag_by_id(flag_id: str) -> Optional[dict]:
    """Get a flag by its ID."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM flags WHERE flag_id = ?", (flag_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None


# Metrics operations
async def get_metrics() -> dict:
    """Get aggregated metrics for dashboard."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Total scans
        cursor = await db.execute("SELECT COUNT(*) as count FROM scans")
        total_scans = (await cursor.fetchone())[0]

        # Total flags
        cursor = await db.execute("SELECT COUNT(*) as count FROM flags")
        total_flags = (await cursor.fetchone())[0]

        # Total feedback
        cursor = await db.execute("SELECT COUNT(*) as count FROM feedback")
        total_feedback = (await cursor.fetchone())[0]

        # Rule metrics
        cursor = await db.execute(
            "SELECT * FROM rule_metrics ORDER BY total_flags DESC"
        )
        rules = [dict(row) for row in await cursor.fetchall()]

        # Calculate overall precision
        total_valid = sum(r["valid_count"] for r in rules)
        total_reviewed = sum(r["total_flags"] for r in rules)
        overall_precision = (
            (total_valid / total_reviewed * 100) if total_reviewed > 0 else 0
        )

        return {
            "total_scans": total_scans,
            "total_flags": total_flags,
            "total_feedback": total_feedback,
            "overall_precision": round(overall_precision, 1),
            "rules": rules,
        }


async def get_scan_count() -> int:
    """Get total number of scans."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM scans")
        return (await cursor.fetchone())[0]


async def update_scan_name(scan_id: str, name: str) -> None:
    """Update the name of a scan."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("UPDATE scans SET name = ? WHERE scan_id = ?", (name, scan_id))
        await db.commit()
