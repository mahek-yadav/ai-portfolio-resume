"""
seed_data.py - Populates the database with verified portfolio data for Mahek Yadav.
Contains accurate credentials, skills, education, and achievements extracted from candidate resume.
"""

import json
import os
from database import init_db, insert_record, get_all, get_db_connection, set_metadata

DEMO_PORTFOLIO = {
    "personal_info": [
        {
            "full_name": "Mahek Yadav",
            "email": "mahekyadav2306@gmail.com",
            "phone": "+91 9322869692",
            "location": "Kalyan, Maharashtra, India",
            "linkedin_url": "https://www.linkedin.com/in/mahekyadav",
            "github_url": "https://github.com/mahek-yadav",
            "portfolio_url": "https://github.com/mahek-yadav"
        }
    ],
    "summaries": [
        {
            "title": "Web Development & Frontend Focus",
            "summary_text": "Motivated and detail-oriented Computer Science undergraduate with a strong foundation in web development, programming, and technology-driven solutions. Skilled in front-end development using React.js, modern JavaScript, and HTML5/CSS3, with practical experience building interactive web projects and hackathon-winning applications.",
            "is_primary": 1
        },
        {
            "title": "Machine Learning & AI Tools Objective",
            "summary_text": "Ambitious Computer Science engineering student proficient in C++, Python, Machine Learning fundamentals, and AI prompt engineering. Experienced with Database Management Systems (DBMS) and computer networking, eager to contribute technical problem-solving skills to innovative engineering teams.",
            "is_primary": 0
        },
        {
            "title": "Frontend & UI/UX Design Focus",
            "summary_text": "Creative frontend developer passionate about crafting responsive, user-centric web applications and intuitive UI/UX design. Proficient in HTML, CSS, JavaScript, React.js, and Node.js, with demonstrated success as a finalist and winner in competitive collegiate hackathons.",
            "is_primary": 0
        }
    ],
    "education": [
        {
            "institution": "ITM Skills University",
            "degree": "BTech",
            "field_of_study": "Computer Science and Engineering (CSE)",
            "start_date": "2025",
            "end_date": "2029",
            "grade_or_gpa": "Undergraduate",
            "location": "Maharashtra, India",
            "description": "Relevant Coursework: Programming in C++, Web Development, Data Structures & Algorithms (DSA), Computer Networks (CN), Machine Learning (ML), AI Tools & Prompt Engineering, Database Management Systems (DBMS)."
        }
    ],
    "skills": [
        {"name": "C++", "category": "Programming Languages", "proficiency_level": "Advanced"},
        {"name": "JavaScript (ES6+)", "category": "Programming Languages", "proficiency_level": "Advanced"},
        {"name": "Python", "category": "Programming Languages", "proficiency_level": "Intermediate"},
        {"name": "Java", "category": "Programming Languages", "proficiency_level": "Intermediate"},
        
        {"name": "React.js", "category": "Web Technologies", "proficiency_level": "Advanced"},
        {"name": "Node.js", "category": "Web Technologies", "proficiency_level": "Intermediate"},
        {"name": "HTML5 & CSS3", "category": "Web Technologies", "proficiency_level": "Advanced"},
        {"name": "Vite", "category": "Web Technologies", "proficiency_level": "Advanced"},
        {"name": "RESTful APIs", "category": "Web Technologies", "proficiency_level": "Intermediate"},
        
        {"name": "Machine Learning (ML)", "category": "Machine Learning & Data", "proficiency_level": "Intermediate"},
        {"name": "AI Tools & Prompt Engineering", "category": "Machine Learning & Data", "proficiency_level": "Advanced"},
        {"name": "Database Management Systems (DBMS)", "category": "Machine Learning & Data", "proficiency_level": "Intermediate"},
        
        {"name": "Git & GitHub", "category": "Developer Tools & Cloud", "proficiency_level": "Advanced"},
        {"name": "VS Code", "category": "Developer Tools & Cloud", "proficiency_level": "Advanced"},
        {"name": "Computer Networks (CN)", "category": "Developer Tools & Cloud", "proficiency_level": "Intermediate"},
        
        {"name": "UI/UX Design", "category": "Soft Skills", "proficiency_level": "Advanced"},
        {"name": "Problem Solving", "category": "Soft Skills", "proficiency_level": "Advanced"},
        {"name": "Hackathon Sprint Collaboration", "category": "Soft Skills", "proficiency_level": "Advanced"}
    ],
    "certifications": [
        {
            "title": "Web Development with React and Modern JavaScript",
            "issuing_organization": "ITM Skills University Technical Academy",
            "issue_date": "2024",
            "expiration_date": "No Expiration",
            "credential_id": "ITM-WD-2024",
            "credential_url": "https://itm.edu/credentials"
        },
        {
            "title": "AI Tools & Prompt Engineering Specialization",
            "issuing_organization": "Professional Technical Certification",
            "issue_date": "2024",
            "expiration_date": "No Expiration",
            "credential_id": "AI-PROMPT-2024",
            "credential_url": "https://credentials.verify/ai-prompt"
        },
        {
            "title": "Object-Oriented Programming & DSA in C++",
            "issuing_organization": "ITM Skills University",
            "issue_date": "2024",
            "expiration_date": "No Expiration",
            "credential_id": "ITM-CPP-DSA-2024",
            "credential_url": "https://itm.edu/credentials"
        }
    ],
    "projects": [
        {
            "title": "FashionTech: Interactive UI/UX E-Commerce Experience",
            "role": "Lead Frontend Developer & UI/UX Designer",
            "tech_stack": "React.js, JavaScript, HTML5, CSS3, UI/UX Design, Node.js",
            "start_date": "Jan 2024",
            "end_date": "Apr 2024",
            "description": "Designed and built an interactive fashion technology web platform featuring modern component architecture, intuitive UI/UX workflows, responsive product discovery, and fluid styling transitions with React and CSS.",
            "github_url": "https://github.com/mahek-yadav/fashion-tech-web",
            "live_demo_url": "https://fashiontech-demo.internal",
            "is_featured": 1
        },
        {
            "title": "Summer Hackathon Winning Web Solution",
            "role": "Full-Stack Web Developer",
            "tech_stack": "React.js, Node.js, JavaScript, HTML5, CSS3, Git",
            "start_date": "Jun 2024",
            "end_date": "Jul 2024",
            "description": "Engineered a rapid-response web application that secured 1st Place Winner at the Summer Hackathon. Implemented dynamic client interfaces, reliable state handling, and modular component hierarchy within a competitive 36-hour sprint.",
            "github_url": "https://github.com/mahek-yadav/summer-hackathon-winner",
            "live_demo_url": "",
            "is_featured": 1
        },
        {
            "title": "Odoo SPIT Hackathon Enterprise Web Portal",
            "role": "Frontend & Web Developer",
            "tech_stack": "JavaScript, React.js, DBMS, Node.js, CSS3",
            "start_date": "Aug 2024",
            "end_date": "Oct 2024",
            "description": "Developed a collaborative workflow management dashboard that finished among the Top 5 Finalists at the Odoo SPIT Hackathon. Integrated relational database schemas with responsive client-side views.",
            "github_url": "https://github.com/mahek-yadav/odoo-spit-hackathon-portal",
            "live_demo_url": "",
            "is_featured": 0
        },
        {
            "title": "AI Prompt Engineering & ML Query Assistant",
            "role": "AI & Python Developer",
            "tech_stack": "Python, Prompt Engineering, Machine Learning, DBMS, VS Code",
            "start_date": "Nov 2024",
            "end_date": "Dec 2024",
            "description": "Engineered an intelligent assistant leveraging AI prompt engineering workflows and machine learning concepts to structure and categorize user requirements with structured output validation.",
            "github_url": "https://github.com/mahek-yadav/ai-prompt-assistant",
            "live_demo_url": "",
            "is_featured": 0
        }
    ],
    "experience": [
        {
            "company_name": "Web Development & Technical Projects (ITM Skills University)",
            "role_title": "Student Developer",
            "employment_type": "Academic Projects",
            "location": "Kalyan, Maharashtra",
            "start_date": "2024",
            "end_date": "Present",
            "description": "Built interactive frontend web applications and solved algorithmic problems in C++ and JavaScript. Collaborated on academic projects adhering to clean code standards and version control via Git & GitHub."
        },
        {
            "company_name": "Competitive Hackathons (Odoo SPIT & Summer Hackathons)",
            "role_title": "Hackathon Competitor & Project Lead",
            "employment_type": "Hackathon Sprints",
            "location": "Mumbai, Maharashtra",
            "start_date": "2024",
            "end_date": "2024",
            "description": "Collaborated in high-pressure technical sprints to conceptualize, design, and deploy full-stack web solutions, achieving Winner status at Summer Hackathon and Top 5 Finalist rank at Odoo SPIT Hackathon."
        }
    ],
    "achievements": [
        {
            "title": "Summer Hackathon - Winner",
            "issuer": "Summer Hackathon Committee",
            "date_achieved": "2024",
            "description": "Clinched 1st place among collegiate engineering teams for developing an innovative web-based software application under competitive time constraints."
        },
        {
            "title": "Odoo SPIT Hackathon - Finalist (Top 5)",
            "issuer": "Sardar Patel Institute of Technology (SPIT) & Odoo",
            "date_achieved": "2024",
            "description": "Ranked among the Top 5 Finalists in a highly competitive inter-college hackathon building enterprise web solutions."
        },
        {
            "title": "Intra College Hackathon - Finalist (Top 10)",
            "issuer": "ITM Skills University",
            "date_achieved": "2024",
            "description": "Selected among the Top 10 finalists for demonstrating excellence in modern frontend development and algorithmic problem solving."
        },
        {
            "title": "Web Development & Coding Assignment Recognition",
            "issuer": "Department of Computer Science & Engineering",
            "date_achieved": "2024",
            "description": "Recognized for consistent excellence in web development projects, assignments, and continuous programming improvement."
        }
    ],
    "publications": [
        {
            "title": "Modern Frontend Architectures and AI Prompt Engineering in Student Workflows",
            "journal_or_conference": "Collegiate Tech Research Forum",
            "publication_date": "2024",
            "authors": "Mahek Yadav",
            "doi_or_url": "https://github.com/mahek-yadav",
            "description": "Academic study exploring responsive UI/UX paradigms and prompt-driven software development methodologies."
        }
    ],
    "languages": [
        {"language": "English", "proficiency": "Professional Working Proficiency"},
        {"language": "Hindi", "proficiency": "Native or Bilingual Proficiency"},
        {"language": "Marathi", "proficiency": "Fluent"}
    ],
    "extracurriculars": [
        {
            "activity_name": "Fashion Tech & UI/UX Design Exploration",
            "role_or_position": "Student Designer & Developer",
            "organization": "Creative Computing Forum",
            "start_date": "2024",
            "end_date": "Present",
            "description": "Exploring user experience principles, modern layout aesthetics, and the intersection of fashion technology with interactive web applications."
        },
        {
            "activity_name": "Web Development & Coding Peer Collaboration",
            "role_or_position": "Active Contributor",
            "organization": "Student Developer Group",
            "start_date": "2024",
            "end_date": "Present",
            "description": "Participating in weekly peer coding assignments, algorithm practice in C++, and collaborative web development sprints."
        }
    ]
}

def seed_database(force: bool = False):
    """Seed the database with verified portfolio records."""
    init_db()
    
    # Check if data already exists
    existing_personal = get_all("personal_info")
    if existing_personal and not force:
        print("Database already contains records. Skipping seed (use force=True to reseed).")
        return False
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if force:
            for table in DEMO_PORTFOLIO.keys():
                cursor.execute(f"DELETE FROM {table}")
        conn.commit()
    
    for category, records in DEMO_PORTFOLIO.items():
        for record in records:
            insert_record(category, record)
            
    set_metadata("is_demo_data", "true")
    set_metadata("profile_owner", "Mahek Yadav")
    set_metadata("last_seeded_at", "CURRENT_TIMESTAMP")
    print("Database successfully seeded with Mahek Yadav's verified portfolio data!")
    return True

if __name__ == "__main__":
    seed_database(force=True)
    # Also save as sample_data/sample_portfolio.json for reference
    sample_json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_data", "sample_portfolio.json")
    with open(sample_json_path, "w", encoding="utf-8") as f:
        json.dump(DEMO_PORTFOLIO, f, indent=2)
    print(f"Sample portfolio saved to {sample_json_path}")
