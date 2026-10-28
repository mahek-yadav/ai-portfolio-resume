"""
test_suite.py - Comprehensive Unit and Integration Tests
Covers SQLite CRUD, AI fallback handling, Google Sheets safety, and ReportLab PDF generation.
Run via: backend/venv/bin/pytest backend/test_suite.py
"""

import os
import json
import pytest
from app import app
import database as db
import resume_generator as rg
import gemini_service as ai
import sheets_service as sheets
from seed_data import seed_database

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    """Ensure database has clean demonstration data for tests."""
    seed_database(force=True)

@pytest.fixture
def client():
    """Flask test client."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

# -------------------------------------------------------------
# 1. DATABASE TESTS
# -------------------------------------------------------------
def test_database_seeded_records():
    """Ensure all 11 categories have initial demonstration data."""
    portfolio = db.get_complete_portfolio()
    assert len(portfolio["personal_info"]) >= 1
    assert len(portfolio["education"]) >= 1
    assert len(portfolio["skills"]) >= 5
    assert len(portfolio["projects"]) >= 2
    assert len(portfolio["experience"]) >= 1

def test_database_crud_cycle():
    """Test insert, read, update, delete for skills table."""
    # Create
    skill_data = {
        "name": "GraphQL Test",
        "category": "Web Technologies",
        "proficiency_level": "Intermediate"
    }
    new_id = db.insert_record("skills", skill_data)
    assert new_id > 0
    
    # Read
    record = db.get_by_id("skills", new_id)
    assert record is not None
    assert record["name"] == "GraphQL Test"
    
    # Update
    updated = db.update_record("skills", new_id, {"proficiency_level": "Advanced"})
    assert updated is True
    record_updated = db.get_by_id("skills", new_id)
    assert record_updated["proficiency_level"] == "Advanced"
    
    # Delete
    deleted = db.delete_record("skills", new_id)
    assert deleted is True
    assert db.get_by_id("skills", new_id) is None

def test_invalid_category_rejection():
    """Ensure invalid table names are rejected to prevent SQL injection."""
    with pytest.raises(ValueError):
        db.get_all("malicious_table_drop")
        
    with pytest.raises(ValueError):
        db.insert_record("non_existent_table", {"name": "test"})

# -------------------------------------------------------------
# 2. REPORTLAB PDF RESUME TESTS
# -------------------------------------------------------------
def test_pdf_generation_valid():
    """Ensure ReportLab successfully compiles an ATS single-column PDF."""
    test_resume_data = {
        "personal_info": {
            "full_name": "Test Candidate",
            "email": "test@example.com",
            "phone": "+1 555-0199",
            "location": "Boston, MA",
            "linkedin_url": "https://linkedin.com",
            "github_url": "https://github.com"
        },
        "summary_text": "Focused software engineer with a track record in Python and React.",
        "skills": [
            {"name": "Python", "category": "Programming Languages"},
            {"name": "React", "category": "Web Technologies"}
        ],
        "education": [
            {
                "institution": "MIT",
                "degree": "B.S.",
                "field_of_study": "Computer Science",
                "start_date": "2020",
                "end_date": "2024",
                "grade_or_gpa": "3.9"
            }
        ],
        "projects": [
            {
                "title": "Cloud Dashboard",
                "tech_stack": "React, Python",
                "description": "Constructed real-time metrics monitor."
            }
        ]
    }
    
    file_path = rg.create_resume_pdf(test_resume_data, "test_output.pdf")
    assert os.path.exists(file_path)
    assert os.path.getsize(file_path) > 1000  # Non-trivial size
    
    # Verify PDF magic bytes (%PDF-)
    with open(file_path, "rb") as f:
        header = f.read(5)
        assert header == b"%PDF-"
        
    # Clean up test file
    if os.path.exists(file_path):
        os.remove(file_path)

def test_safe_filename():
    """Test path traversal and special characters sanitation."""
    safe = rg.sanitize_filename("../../etc/passwd.pdf")
    assert "/" not in safe
    assert ".." not in safe

# -------------------------------------------------------------
# 3. AI SERVICES & FALLBACK TESTS
# -------------------------------------------------------------
def test_ai_fallback_structure_parser():
    """Test heuristic text extraction when Gemini API is offline."""
    raw = "Alex Johnson. Email: alex.j@example.com. Phone: (555) 123-4567. Proficient in Python, React, and SQL."
    structured = ai.structure_unstructured_portfolio(raw)
    assert structured is not None
    assert "personal_info" in structured
    assert structured["personal_info"]["email"] == "alex.j@example.com"
    assert any(s["name"] == "Python" for s in structured.get("skills", []))

def test_ai_fallback_jd_analysis():
    """Test JD analyzer fallback."""
    sample_jd = "Role: Machine Learning Intern. Required: Python, Scikit-Learn, SQL, and Git."
    analysis = ai.analyze_job_description(sample_jd)
    assert analysis["job_title"] is not None
    assert "Python" in analysis.get("required_technical_skills", [])

# -------------------------------------------------------------
# 4. GOOGLE SHEETS SAFETY TESTS
# -------------------------------------------------------------
def test_sheets_status_without_crash():
    """Ensure Google Sheets status returns safe failure without crashing when unconfigured."""
    status = sheets.get_sheets_status()
    assert "configured" in status
    assert "connected" in status
    assert isinstance(status["connected"], bool)

# -------------------------------------------------------------
# 5. FLASK API INTEGRATION TESTS
# -------------------------------------------------------------
def test_api_get_full_portfolio(client):
    """GET /api/portfolio returns success and all categories."""
    res = client.get("/api/portfolio")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "skills" in data["portfolio"]

def test_api_portfolio_stats(client):
    """GET /api/portfolio/stats returns numerical counts."""
    res = client.get("/api/portfolio/stats")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "stats" in data
    assert data["stats"]["projects"] >= 1

def test_api_resume_preview(client):
    """POST /api/resume/preview formats selected records."""
    all_projects = db.get_all("projects")
    first_proj_id = all_projects[0]["id"]
    
    payload = {
        "selected_ids": {
            "projects": [first_proj_id]
        },
        "custom_summary": "Test Custom Summary for Preview",
        "target_role": "Backend Intern"
    }
    res = client.post("/api/resume/preview", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["resume"]["projects"]) == 1
    assert data["resume"]["projects"][0]["id"] == first_proj_id
    assert data["resume"]["summary_text"] == "Test Custom Summary for Preview"

