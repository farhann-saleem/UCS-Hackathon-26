"""Sample vulnerable Python file for CheckMate demo."""

import os
import pickle

# SEC001: Hardcoded OpenAI API key
api_key = "sk-1234567890abcdefghijklmnopqrstuvwxyz"

# SEC004: Hardcoded password
password = "admin123"
db_password = "supersecret123"

# SEC007: Database URL with credentials
DATABASE_URL = "postgres://admin:password123@localhost:5432/mydb"


def get_user(user_id):
    """SQL injection vulnerability."""
    # SQL001: f-string in SQL query
    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return cursor.fetchone()


def run_command(user_input):
    """Command injection vulnerability."""
    # FUNC005: os.system with user input
    os.system("ls -la " + user_input)


def process_data(data):
    """Dangerous deserialization."""
    # FUNC003: pickle.loads
    return pickle.loads(data)


def evaluate_expression(expr):
    """Dangerous eval usage."""
    # FUNC001: eval
    return eval(expr)


def execute_code(code):
    """Dangerous exec usage."""
    # FUNC002: exec
    exec(code)
