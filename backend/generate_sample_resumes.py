"""
generate_sample_resumes.py - Generates two job-specific demonstration resumes
from Mahek Yadav's verified SQLite portfolio database.
"""

import os
from database import get_complete_portfolio
from resume_generator import create_resume_pdf

def generate_both_sample_resumes():
    portfolio = get_complete_portfolio()
    personal = portfolio["personal_info"][0] if portfolio["personal_info"] else {}
    education = portfolio["education"]
    languages = portfolio["languages"]
    
    # -------------------------------------------------------------
    # RESUME A: Machine Learning & AI Tools Intern
    # -------------------------------------------------------------
    ml_skills_names = [
        "Python", "C++", "Machine Learning (ML)", "AI Tools & Prompt Engineering",
        "Database Management Systems (DBMS)", "Computer Networks (CN)",
        "Git & GitHub", "VS Code", "Problem Solving"
    ]
    ml_skills = [s for s in portfolio["skills"] if s["name"] in ml_skills_names]
    
    ml_projects = [
        p for p in portfolio["projects"] 
        if "prompt" in p["title"].lower() or "hackathon" in p["title"].lower()
    ]
    
    ml_certifications = [
        c for c in portfolio["certifications"]
        if "prompt" in c["title"].lower() or "dsa" in c["title"].lower()
    ]
    
    ml_summary = next(
        (s["summary_text"] for s in portfolio["summaries"] if "machine learning" in s["title"].lower()),
        portfolio["summaries"][0]["summary_text"]
    )
    
    resume_a_data = {
        "personal_info": personal,
        "summary_text": ml_summary,
        "skills": ml_skills,
        "experience": portfolio["experience"],
        "projects": ml_projects,
        "education": education,
        "certifications": ml_certifications,
        "achievements": portfolio["achievements"][:3],
        "publications": portfolio["publications"],
        "languages": languages,
        "extracurriculars": [portfolio["extracurriculars"][0]] if portfolio["extracurriculars"] else []
    }
    
    path_a = create_resume_pdf(resume_a_data, "resume_ml_intern.pdf")
    print(f"Generated Resume A (ML & AI Tools Intern): {path_a}")
    
    # -------------------------------------------------------------
    # RESUME B: Frontend Developer & UI/UX Intern
    # -------------------------------------------------------------
    fe_skills_names = [
        "React.js", "JavaScript (ES6+)", "HTML5 & CSS3", "Node.js", "Vite",
        "RESTful APIs", "UI/UX Design", "Git & GitHub", "Problem Solving",
        "Hackathon Sprint Collaboration"
    ]
    fe_skills = [s for s in portfolio["skills"] if s["name"] in fe_skills_names]
    
    fe_projects = [
        p for p in portfolio["projects"] 
        if "fashion" in p["title"].lower() or "hackathon" in p["title"].lower() or "odoo" in p["title"].lower()
    ]
    
    fe_certifications = [
        c for c in portfolio["certifications"]
        if "react" in c["title"].lower() or "dsa" in c["title"].lower()
    ]
    
    fe_summary = next(
        (s["summary_text"] for s in portfolio["summaries"] if "frontend" in s["title"].lower() or "web" in s["title"].lower()),
        portfolio["summaries"][0]["summary_text"]
    )
    
    resume_b_data = {
        "personal_info": personal,
        "summary_text": fe_summary,
        "skills": fe_skills,
        "experience": portfolio["experience"],
        "projects": fe_projects,
        "education": education,
        "certifications": fe_certifications,
        "achievements": portfolio["achievements"],
        "publications": [],  # Tailored out for FE role
        "languages": languages,
        "extracurriculars": portfolio["extracurriculars"]
    }
    
    path_b = create_resume_pdf(resume_b_data, "resume_frontend_intern.pdf")
    print(f"Generated Resume B (Frontend Developer Intern): {path_b}")

if __name__ == "__main__":
    generate_both_sample_resumes()
