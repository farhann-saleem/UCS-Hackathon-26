#!/usr/bin/env python3
"""
Seed the database with demo data for presentation.
Run this after starting the backend at least once to create tables.
"""

import asyncio
import uuid
from database import init_db, create_scan, create_flag, create_feedback

# Sample vulnerable code snippets for demo
DEMO_SCANS = [
    {
        "code": '''import os
api_key = "sk-1234567890abcdefghijklmnopqrstuvwxyz"
password = "admin123"

def get_user(user_id):
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return cursor.fetchone()

os.system("rm -rf " + user_input)
result = eval(user_input)
''',
        "language": "python",
        "flags": [
            ("SEC001", "critical", "Hardcoded OpenAI API key detected", 2, 'api_key = "sk-1234567890abcdefghijklmnopqrstuvwxyz"', "Use environment variables", "valid"),
            ("SEC004", "high", "Hardcoded password detected", 3, 'password = "admin123"', "Use secrets manager", "valid"),
            ("SQL001", "critical", "SQL injection vulnerability", 6, 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")', "Use parameterized queries", "valid"),
            ("FUNC005", "high", "Command injection via os.system", 9, 'os.system("rm -rf " + user_input)', "Use subprocess with list args", "valid"),
            ("FUNC001", "critical", "Dangerous eval() usage", 10, 'result = eval(user_input)', "Use ast.literal_eval", "valid"),
        ]
    },
    {
        "code": '''const apiKey = "sk-abcdefghijklmnopqrstuvwxyz1234567890";
const dbUrl = "postgres://admin:secret@localhost/mydb";

async function getUser(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return db.execute(query);
}

element.innerHTML = userInput;
eval(userInput);
''',
        "language": "javascript",
        "flags": [
            ("SEC001", "critical", "Hardcoded API key", 1, 'const apiKey = "sk-abcdefghijklmnopqrstuvwxyz1234567890"', "Use env vars", "valid"),
            ("SEC005", "critical", "Database credentials in code", 2, 'const dbUrl = "postgres://admin:secret@localhost/mydb"', "Use env vars", "valid"),
            ("SQL004", "critical", "SQL injection in template literal", 5, "const query = `SELECT * FROM users WHERE id = ${userId}`", "Use parameterized queries", "valid"),
            ("FUNC007", "high", "XSS via innerHTML", 9, "element.innerHTML = userInput", "Sanitize with DOMPurify", "false_positive"),  # Demo FP
            ("FUNC001", "critical", "Dangerous eval()", 10, "eval(userInput)", "Avoid eval", "valid"),
        ]
    },
    {
        "code": '''import pickle
import yaml

data = pickle.load(open("data.pkl", "rb"))
config = yaml.load(open("config.yml"))

jwt_secret = "my-super-secret-key-12345"
''',
        "language": "python",
        "flags": [
            ("FUNC003", "critical", "Unsafe pickle deserialization", 4, 'data = pickle.load(open("data.pkl", "rb"))', "Use JSON instead", "valid"),
            ("FUNC004", "high", "Unsafe yaml.load", 5, 'config = yaml.load(open("config.yml"))', "Use yaml.safe_load", "false_positive"),  # Demo FP
            ("SEC009", "high", "Hardcoded JWT secret", 7, 'jwt_secret = "my-super-secret-key-12345"', "Use env vars", "valid"),
        ]
    }
]


async def seed_demo_data():
    """Seed the database with demo data."""
    await init_db()

    print("Seeding demo data...")

    for scan_data in DEMO_SCANS:
        scan_id = str(uuid.uuid4())
        await create_scan(scan_id, scan_data["code"], scan_data["language"])
        print(f"Created scan: {scan_id[:8]}...")

        for flag_data in scan_data["flags"]:
            rule_id, severity, message, line_num, line_content, suggestion, verdict = flag_data
            flag_id = str(uuid.uuid4())

            await create_flag(
                flag_id=flag_id,
                scan_id=scan_id,
                rule_id=rule_id,
                severity=severity,
                message=message,
                line_number=line_num,
                line_content=line_content,
                suggestion=suggestion
            )

            # Add feedback
            feedback_id = str(uuid.uuid4())
            await create_feedback(feedback_id, scan_id, flag_id, verdict)
            print(f"  - {rule_id}: {verdict}")

    print("\nDemo data seeded successfully!")
    print("Total: 3 scans, 13 flags, 13 feedback entries")
    print("\nExpected metrics:")
    print("  - Valid: 11 flags")
    print("  - False Positives: 2 flags")
    print("  - Overall Precision: ~84.6%")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
