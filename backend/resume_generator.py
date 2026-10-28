"""
resume_generator.py - ATS-Friendly PDF Resume Generation using ReportLab
Generates clean, single-column, ATS-optimized resumes with clickable links and safe filenames.
"""

import os
import re
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "generated_resumes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def sanitize_filename(name: str) -> str:
    """Creates safe filenames avoiding path traversal or forbidden characters."""
    base = os.path.basename(name.strip())
    # Separate extension if present
    if base.lower().endswith(".pdf"):
        base = base[:-4]
    clean = re.sub(r'[^a-zA-Z0-9_\-]', '_', base)
    clean = re.sub(r'_+', '_', clean).strip('_')
    safe_base = clean[:60] if clean else "resume"
    return f"{safe_base}.pdf"

def create_resume_pdf(
    resume_data: Dict[str, Any],
    output_filename: str = "generated_resume.pdf"
) -> str:
    """
    Builds a professional, single-column ATS-friendly PDF resume using ReportLab.
    Only includes sections that have selected records.
    Returns the absolute path to the generated PDF.
    """
    safe_name = sanitize_filename(output_filename)
    if not safe_name.endswith(".pdf"):
        safe_name += ".pdf"
    file_path = os.path.join(OUTPUT_DIR, safe_name)
    
    # Document Setup (0.5 inch margins = 36 points)
    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    # Style definitions
    styles = getSampleStyleSheet()
    
    # Color Palette: Professional slate / charcoal accents
    PRIMARY_COLOR = colors.HexColor("#1A202C")     # Deep Charcoal
    ACCENT_COLOR = colors.HexColor("#2B6CB0")      # Elegant Slate Blue
    TEXT_COLOR = colors.HexColor("#2D3748")        # Dark Neutral
    MUTED_COLOR = colors.HexColor("#718096")       # Subdued Gray
    LINE_COLOR = colors.HexColor("#CBD5E0")        # Border Gray
    
    name_style = ParagraphStyle(
        'ResumeName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        textColor=PRIMARY_COLOR,
        spaceAfter=4
    )
    
    contact_style = ParagraphStyle(
        'ResumeContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        alignment=TA_CENTER,
        textColor=TEXT_COLOR,
        spaceAfter=8
    )
    
    section_heading = ParagraphStyle(
        'ResumeSection',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        alignment=TA_LEFT,
        textColor=PRIMARY_COLOR,
        spaceBefore=10,
        spaceAfter=2,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_COLOR,
        alignment=TA_LEFT
    )
    
    item_header_style = ParagraphStyle(
        'ResumeItemHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=PRIMARY_COLOR
    )
    
    item_sub_style = ParagraphStyle(
        'ResumeItemSub',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=MUTED_COLOR
    )
    
    bullet_style = ParagraphStyle(
        'ResumeBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_COLOR,
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=2
    )

    story = []
    
    # 1. PERSONAL INFORMATION & CONTACT
    personal = resume_data.get("personal_info", {})
    if isinstance(personal, list) and personal:
        personal = personal[0]
        
    full_name = personal.get("full_name", "Candidate Name")
    story.append(Paragraph(full_name, name_style))
    
    # Contact items with clickable hyperlinks
    contact_parts = []
    if personal.get("phone"):
        contact_parts.append(personal["phone"])
    if personal.get("email"):
        email = personal["email"]
        contact_parts.append(f'<a href="mailto:{email}" color="#2B6CB0">{email}</a>')
    if personal.get("location"):
        contact_parts.append(personal["location"])
    if personal.get("linkedin_url"):
        linkedin = personal["linkedin_url"]
        contact_parts.append(f'<a href="{linkedin}" color="#2B6CB0">LinkedIn</a>')
    if personal.get("github_url"):
        github = personal["github_url"]
        contact_parts.append(f'<a href="{github}" color="#2B6CB0">GitHub</a>')
    if personal.get("portfolio_url"):
        port = personal["portfolio_url"]
        contact_parts.append(f'<a href="{port}" color="#2B6CB0">Portfolio</a>')
        
    contact_line = " &nbsp;|&nbsp; ".join(contact_parts)
    story.append(Paragraph(contact_line, contact_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_COLOR, spaceAfter=8))
    
    def add_section_header(title: str):
        story.append(Paragraph(title.upper(), section_heading))
        story.append(HRFlowable(width="100%", thickness=0.5, color=LINE_COLOR, spaceAfter=6))

    # 2. PROFESSIONAL SUMMARY
    summary_text = resume_data.get("summary_text", "").strip()
    if summary_text:
        add_section_header("Professional Summary")
        story.append(Paragraph(summary_text, body_style))
        story.append(Spacer(1, 6))

    # 3. TECHNICAL & PROFESSIONAL SKILLS
    skills = resume_data.get("skills", [])
    if skills:
        add_section_header("Technical Skills & Competencies")
        # Group skills by category
        categories: Dict[str, List[str]] = {}
        for s in skills:
            cat = s.get("category", "Additional Skills")
            categories.setdefault(cat, []).append(s.get("name", ""))
            
        for cat_name, skill_list in categories.items():
            formatted = f"<b>{cat_name}:</b> " + ", ".join(skill_list)
            story.append(Paragraph(formatted, body_style))
            story.append(Spacer(1, 2))
        story.append(Spacer(1, 4))

    # 4. EXPERIENCE (INTERNSHIPS & WORK)
    experience = resume_data.get("experience", [])
    if experience:
        add_section_header("Experience & Internships")
        for exp in experience:
            role = exp.get("role_title", "Role")
            company = exp.get("company_name", "Company")
            dates = f"{exp.get('start_date', '')} - {exp.get('end_date', '')}".strip(" -")
            loc = exp.get("location", "")
            
            # Header line: Role, Company | Date, Loc
            header_text = f"<b>{role}</b> — {company}"
            sub_text = f"{dates}{' | ' + loc if loc else ''}"
            story.append(Paragraph(f"{header_text} <font color='#718096' size=8.5>({sub_text})</font>", item_header_style))
            
            desc = exp.get("description", "").strip()
            if desc:
                for line in desc.split("\n"):
                    clean_line = line.strip().lstrip("•-* ")
                    if clean_line:
                        story.append(Paragraph(f"• {clean_line}", bullet_style))
            story.append(Spacer(1, 4))

    # 5. PROJECTS
    projects = resume_data.get("projects", [])
    if projects:
        add_section_header("Key Projects")
        for proj in projects:
            title = proj.get("title", "Project")
            tech = proj.get("tech_stack", "")
            dates = f"{proj.get('start_date', '')} - {proj.get('end_date', '')}".strip(" -")
            
            links = []
            if proj.get("github_url"):
                links.append(f'<a href="{proj["github_url"]}" color="#2B6CB0">Code</a>')
            if proj.get("live_demo_url"):
                links.append(f'<a href="{proj["live_demo_url"]}" color="#2B6CB0">Demo</a>')
            links_str = f" [{' | '.join(links)}]" if links else ""
            
            proj_title_line = f"<b>{title}</b>{links_str}"
            if tech:
                proj_title_line += f" <font color='#4A5568' size=8.5>| <i>{tech}</i></font>"
            story.append(Paragraph(proj_title_line, item_header_style))
            
            desc = proj.get("description", "").strip()
            if desc:
                for line in desc.split("\n"):
                    clean_line = line.strip().lstrip("•-* ")
                    if clean_line:
                        story.append(Paragraph(f"• {clean_line}", bullet_style))
            story.append(Spacer(1, 4))

    # 6. EDUCATION
    education = resume_data.get("education", [])
    if education:
        add_section_header("Education")
        for edu in education:
            inst = edu.get("institution", "")
            deg = edu.get("degree", "")
            field = edu.get("field_of_study", "")
            dates = f"{edu.get('start_date', '')} - {edu.get('end_date', '')}".strip(" -")
            gpa = edu.get("grade_or_gpa", "")
            
            edu_header = f"<b>{deg} in {field}</b> — {inst}"
            edu_sub = f"{dates}{(' | GPA: ' + gpa) if gpa else ''}"
            story.append(Paragraph(f"{edu_header} <font color='#718096' size=8.5>({edu_sub})</font>", item_header_style))
            
            desc = edu.get("description", "").strip()
            if desc:
                story.append(Paragraph(desc, body_style))
            story.append(Spacer(1, 4))

    # 7. CERTIFICATIONS
    certifications = resume_data.get("certifications", [])
    if certifications:
        add_section_header("Certifications & Credentials")
        for cert in certifications:
            title = cert.get("title", "")
            org = cert.get("issuing_organization", "")
            date = cert.get("issue_date", "")
            url = cert.get("credential_url", "")
            cid = cert.get("credential_id", "")
            
            link_html = f' [<a href="{url}" color="#2B6CB0">Verify</a>]' if url else ""
            id_html = f" (ID: {cid})" if cid else ""
            cert_line = f"• <b>{title}</b> — {org} <font color='#718096' size=8.5>({date}){id_html}</font>{link_html}"
            story.append(Paragraph(cert_line, bullet_style))
        story.append(Spacer(1, 4))

    # 8. ACHIEVEMENTS & AWARDS
    achievements = resume_data.get("achievements", [])
    if achievements:
        add_section_header("Honors & Achievements")
        for ach in achievements:
            title = ach.get("title", "")
            issuer = ach.get("issuer", "")
            date = ach.get("date_achieved", "")
            desc = ach.get("description", "")
            ach_line = f"• <b>{title}</b> — {issuer} <font color='#718096' size=8.5>({date})</font>: {desc}"
            story.append(Paragraph(ach_line, bullet_style))
        story.append(Spacer(1, 4))

    # 9. PUBLICATIONS
    publications = resume_data.get("publications", [])
    if publications:
        add_section_header("Publications & Research")
        for pub in publications:
            title = pub.get("title", "")
            conf = pub.get("journal_or_conference", "")
            date = pub.get("publication_date", "")
            doi = pub.get("doi_or_url", "")
            doi_link = f' [<a href="{doi}" color="#2B6CB0">Link</a>]' if doi else ""
            pub_line = f'• "{title}", <i>{conf}</i>, {date}.{doi_link}'
            story.append(Paragraph(pub_line, bullet_style))
        story.append(Spacer(1, 4))

    # 10. LANGUAGES & ACTIVITIES
    languages = resume_data.get("languages", [])
    activities = resume_data.get("extracurriculars", [])
    
    if languages or activities:
        add_section_header("Languages & Activities")
        if languages:
            lang_str = ", ".join([f"{l.get('language')} ({l.get('proficiency')})" for l in languages])
            story.append(Paragraph(f"<b>Languages:</b> {lang_str}", body_style))
            story.append(Spacer(1, 2))
        if activities:
            for act in activities:
                name = act.get("activity_name", "")
                role = act.get("role_or_position", "")
                org = act.get("organization", "")
                dates = f"{act.get('start_date', '')} - {act.get('end_date', '')}".strip(" -")
                act_line = f"• <b>{role}</b>, {org} ({dates}) — {act.get('description', '')}"
                story.append(Paragraph(act_line, bullet_style))
        story.append(Spacer(1, 4))

    # Build the PDF
    doc.build(story)
    return file_path
