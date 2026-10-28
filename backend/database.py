"""
database.py - SQLite Database Manager for AI Portfolio & Resume Generator
Provides schema initialization, parameterized CRUD operations, and sample data seeding.
"""

import sqlite3
import os
from typing import Dict, List, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "portfolio.db")
SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

def get_db_connection() -> sqlite3.Connection:
    """Creates a database connection with dict-like row access."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initializes tables using schema.sql."""
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    
    with get_db_connection() as conn:
        conn.executescript(schema_sql)
        conn.commit()

# Table column definitions for safe validation & query building
TABLE_FIELDS = {
    "personal_info": ["full_name", "email", "phone", "location", "linkedin_url", "github_url", "portfolio_url"],
    "summaries": ["title", "summary_text", "is_primary"],
    "education": ["institution", "degree", "field_of_study", "start_date", "end_date", "grade_or_gpa", "location", "description"],
    "skills": ["name", "category", "proficiency_level"],
    "certifications": ["title", "issuing_organization", "issue_date", "expiration_date", "credential_id", "credential_url"],
    "projects": ["title", "role", "tech_stack", "start_date", "end_date", "description", "github_url", "live_demo_url", "is_featured"],
    "experience": ["company_name", "role_title", "employment_type", "location", "start_date", "end_date", "description"],
    "achievements": ["title", "issuer", "date_achieved", "description"],
    "publications": ["title", "journal_or_conference", "publication_date", "authors", "doi_or_url", "description"],
    "languages": ["language", "proficiency"],
    "extracurriculars": ["activity_name", "role_or_position", "organization", "start_date", "end_date", "description"]
}

def get_all(category: str) -> List[Dict[str, Any]]:
    """Fetch all records for a category."""
    if category not in TABLE_FIELDS:
        raise ValueError(f"Invalid category: {category}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {category} ORDER BY id ASC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_by_id(category: str, record_id: int) -> Optional[Dict[str, Any]]:
    """Fetch single record by primary key."""
    if category not in TABLE_FIELDS:
        raise ValueError(f"Invalid category: {category}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {category} WHERE id = ?", (record_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def insert_record(category: str, data: Dict[str, Any]) -> int:
    """Insert a new record safely using parameterized SQL."""
    if category not in TABLE_FIELDS:
        raise ValueError(f"Invalid category: {category}")
    
    valid_fields = [f for f in TABLE_FIELDS[category] if f in data]
    if not valid_fields:
        raise ValueError(f"No valid fields provided for {category}")
    
    columns = ", ".join(valid_fields)
    placeholders = ", ".join(["?"] * len(valid_fields))
    values = [data[f] for f in valid_fields]
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(f"INSERT INTO {category} ({columns}) VALUES ({placeholders})", values)
        conn.commit()
        return cursor.lastrowid

def update_record(category: str, record_id: int, data: Dict[str, Any]) -> bool:
    """Update an existing record safely using parameterized SQL."""
    if category not in TABLE_FIELDS:
        raise ValueError(f"Invalid category: {category}")
    
    valid_fields = [f for f in TABLE_FIELDS[category] if f in data]
    if not valid_fields:
        return False
    
    set_clause = ", ".join([f"{f} = ?" for f in valid_fields])
    values = [data[f] for f in valid_fields]
    values.append(record_id)
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE {category} SET {set_clause} WHERE id = ?", values)
        conn.commit()
        return cursor.rowcount > 0

def delete_record(category: str, record_id: int) -> bool:
    """Delete a record by primary key."""
    if category not in TABLE_FIELDS:
        raise ValueError(f"Invalid category: {category}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM {category} WHERE id = ?", (record_id,))
        conn.commit()
        return cursor.rowcount > 0

def get_complete_portfolio() -> Dict[str, Any]:
    """Retrieve complete verified portfolio data across all 11 tables."""
    portfolio = {}
    for cat in TABLE_FIELDS.keys():
        portfolio[cat] = get_all(cat)
    return portfolio

def get_portfolio_summary_stats() -> Dict[str, int]:
    """Get count of entries in each portfolio category."""
    stats = {}
    with get_db_connection() as conn:
        cursor = conn.cursor()
        for cat in TABLE_FIELDS.keys():
            cursor.execute(f"SELECT COUNT(*) as count FROM {cat}")
            stats[cat] = cursor.fetchone()["count"]
    return stats

def get_metadata(key: str) -> Optional[str]:
    """Retrieve system metadata."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_metadata WHERE key = ?", (key,))
        row = cursor.fetchone()
        return row["value"] if row else None

def set_metadata(key: str, value: str):
    """Store or update system metadata."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO system_metadata (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP",
            (key, value)
        )
        conn.commit()

