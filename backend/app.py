"""
app.py - Flask REST API for AI Portfolio Database & Resume Generator
Provides complete endpoints for CRUD, Gemini AI analysis, Google Sheets sync, and PDF generation.
"""

import os
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

import database as db
import gemini_service as ai
import sheets_service as sheets
import resume_generator as rg

load_dotenv()

FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")
# Enable CORS for local development across Vite ports (e.g., 5173, 3000)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database is initialized on startup
db.init_db()

# ----------------------------------------------------------------
# 1. PORTFOLIO CRUD ENDPOINTS
# ----------------------------------------------------------------
@app.route("/api/portfolio", methods=["GET"])
def get_full_portfolio():
    """Retrieve complete verified portfolio data."""
    try:
        portfolio = db.get_complete_portfolio()
        return jsonify({"success": True, "portfolio": portfolio}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/portfolio/stats", methods=["GET"])
def get_portfolio_stats():
    """Retrieve count statistics and system metadata for Dashboard."""
    try:
        stats = db.get_portfolio_summary_stats()
        is_demo = db.get_metadata("is_demo_data") == "true"
        last_sync = db.get_metadata("sheets_last_sync_time") or "Never synced"
        return jsonify({
            "success": True,
            "stats": stats,
            "is_demo_data": is_demo,
            "last_sheets_sync": last_sync
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/portfolio/<category>", methods=["GET"])
def get_category_records(category):
    """Retrieve all records for a specific category."""
    try:
        records = db.get_all(category)
        return jsonify({"success": True, "category": category, "records": records}), 200
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/portfolio/<category>", methods=["POST"])
def create_category_record(category):
    """Create a new portfolio record."""
    data = request.get_json() or {}
    try:
        new_id = db.insert_record(category, data)
        new_record = db.get_by_id(category, new_id)
        return jsonify({"success": True, "message": "Record created successfully", "record": new_record}), 201
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/portfolio/<category>/<int:record_id>", methods=["PUT"])
def update_category_record(category, record_id):
    """Update an existing portfolio record."""
    data = request.get_json() or {}
    try:
        updated = db.update_record(category, record_id, data)
        if not updated:
            return jsonify({"success": False, "error": "Record not found or no changes made"}), 404
        record = db.get_by_id(category, record_id)
        return jsonify({"success": True, "message": "Record updated successfully", "record": record}), 200
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/portfolio/<category>/<int:record_id>", methods=["DELETE"])
def delete_category_record(category, record_id):
    """Delete a record by category and ID."""
    try:
        deleted = db.delete_record(category, record_id)
        if not deleted:
            return jsonify({"success": False, "error": "Record not found"}), 404
        return jsonify({"success": True, "message": f"Record {record_id} deleted successfully"}), 200
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/portfolio/reset-demo", methods=["POST"])
def reset_demo_data():
    """Resets database back to realistic demonstration data."""
    try:
        from seed_data import seed_database
        seed_database(force=True)
        return jsonify({"success": True, "message": "Database reset to verified demonstration records"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ----------------------------------------------------------------
# 2. GEMINI AI ENDPOINTS
# ----------------------------------------------------------------
@app.route("/api/ai/status", methods=["GET"])
def get_ai_status():
    """Check whether Gemini API is active or in fallback mode."""
    configured = ai.is_gemini_configured()
    return jsonify({
        "success": True,
        "configured": configured,
        "model": "gemini-2.5-flash",
        "mode": "Active Gemini API" if configured else "Local Heuristic Fallback Engine"
    }), 200

@app.route("/api/ai/structure-portfolio", methods=["POST"])
def structure_portfolio():
    """Extract structured portfolio categories from raw unstructured text."""
    body = request.get_json() or {}
    raw_text = body.get("raw_text", "").strip()
    if not raw_text:
        return jsonify({"success": False, "error": "Please provide input text to analyze."}), 400
        
    try:
        structured_data = ai.structure_unstructured_portfolio(raw_text)
        return jsonify({"success": True, "data": structured_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/ai/commit-structured-data", methods=["POST"])
def commit_structured_data():
    """Commits reviewed structured data into the SQLite database."""
    body = request.get_json() or {}
    items = body.get("items", {})
    committed_counts = {}
    
    try:
        # Personal info: update or insert
        if "personal_info" in items and items["personal_info"]:
            pi_data = items["personal_info"]
            existing = db.get_all("personal_info")
            if existing:
                db.update_record("personal_info", existing[0]["id"], pi_data)
            else:
                db.insert_record("personal_info", pi_data)
            committed_counts["personal_info"] = 1
            
        # Other list-based categories
        for cat in ["summaries", "education", "skills", "certifications", "projects", "experience", "achievements", "publications", "languages", "extracurriculars"]:
            records = items.get(cat, [])
            count = 0
            for r in records:
                if isinstance(r, dict) and any(r.values()):
                    db.insert_record(cat, r)
                    count += 1
            if count > 0:
                committed_counts[cat] = count
                
        return jsonify({
            "success": True,
            "message": f"Successfully committed records to database.",
            "counts": committed_counts
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/ai/analyze-jd", methods=["POST"])
def analyze_jd():
    """Analyzes a job description to extract core competencies and keywords."""
    body = request.get_json() or {}
    jd_text = body.get("jd_text", "").strip()
    if not jd_text:
        return jsonify({"success": False, "error": "Job description text is required."}), 400
        
    try:
        analysis = ai.analyze_job_description(jd_text)
        return jsonify({"success": True, "analysis": analysis}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/ai/match-portfolio", methods=["POST"])
def match_portfolio():
    """Compares JD requirements against candidate portfolio."""
    body = request.get_json() or {}
    jd_analysis = body.get("jd_analysis", {})
    if not jd_analysis:
        return jsonify({"success": False, "error": "jd_analysis object is required."}), 400
        
    try:
        portfolio = db.get_complete_portfolio()
        match_result = ai.match_portfolio_with_jd(portfolio, jd_analysis)
        return jsonify({"success": True, "match": match_result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/ai/improve-summary", methods=["POST"])
def improve_summary():
    """Suggests ATS-optimized summary based exclusively on verified portfolio records."""
    body = request.get_json() or {}
    current_summary = body.get("current_summary", "")
    target_role = body.get("target_role", "Software Engineer")
    selected_records = body.get("selected_records", {})
    
    try:
        suggestions = ai.suggest_resume_improvements(current_summary, selected_records, target_role)
        return jsonify({"success": True, "suggestions": suggestions}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ----------------------------------------------------------------
# 3. GOOGLE SHEETS ENDPOINTS
# ----------------------------------------------------------------
@app.route("/api/sheets/status", methods=["GET"])
def get_sheets_status():
    """Check live Google Sheets API connectivity and configuration."""
    status = sheets.get_sheets_status()
    return jsonify({"success": True, "status": status}), 200

@app.route("/api/sheets/sync", methods=["POST"])
def sync_to_sheets():
    """Export current SQLite data into separate Google Sheets worksheets."""
    result = sheets.sync_portfolio_to_sheets()
    if result.get("success"):
        return jsonify(result), 200
    else:
        return jsonify(result), 400

# ----------------------------------------------------------------
# 4. RESUME GENERATION & PREVIEW ENDPOINTS
# ----------------------------------------------------------------
def _gather_selected_portfolio(selected_ids: dict, custom_summary: str = None) -> dict:
    """Helper: fetches only records whose IDs were explicitly checked."""
    # Attempt reading from Google Sheets if configured, fallback to SQLite
    portfolio_source, source_type = sheets.read_portfolio_from_sheets_with_fallback()
    
    filtered_data = {
        "_source_backend": source_type,
        "personal_info": portfolio_source.get("personal_info", []),
        "summary_text": custom_summary or "",
        "skills": [],
        "projects": [],
        "experience": [],
        "education": [],
        "certifications": [],
        "achievements": [],
        "publications": [],
        "languages": [],
        "extracurriculars": []
    }
    
    # If custom summary wasn't provided, use primary summary
    if not filtered_data["summary_text"]:
        summaries = portfolio_source.get("summaries", [])
        primary = next((s["summary_text"] for s in summaries if s.get("is_primary") == 1), None)
        filtered_data["summary_text"] = primary or (summaries[0]["summary_text"] if summaries else "")
        
    for cat in ["skills", "projects", "experience", "education", "certifications", "achievements", "publications", "languages", "extracurriculars"]:
        allowed_ids = set(selected_ids.get(cat, []))
        for rec in portfolio_source.get(cat, []):
            if rec.get("id") in allowed_ids:
                filtered_data[cat].append(rec)
                
    return filtered_data

@app.route("/api/resume/preview", methods=["POST"])
def preview_resume():
    """Returns structured resume content for live on-screen preview."""
    body = request.get_json() or {}
    selected_ids = body.get("selected_ids", {})
    custom_summary = body.get("custom_summary")
    target_role = body.get("target_role", "Software Engineer")
    
    try:
        resume_content = _gather_selected_portfolio(selected_ids, custom_summary)
        resume_content["target_role"] = target_role
        return jsonify({"success": True, "resume": resume_content}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/resume/generate-pdf", methods=["POST"])
def generate_resume_pdf():
    """Generates an ATS-friendly single-column PDF resume and returns download details."""
    body = request.get_json() or {}
    selected_ids = body.get("selected_ids", {})
    custom_summary = body.get("custom_summary")
    target_role = body.get("target_role", "Software Engineer")
    
    try:
        resume_content = _gather_selected_portfolio(selected_ids, custom_summary)
        
        # Build clean filename e.g. Resume_Aarav_Sharma_ML_Intern.pdf
        personal = resume_content.get("personal_info", [{}])[0]
        raw_name = personal.get("full_name", "Candidate").split("(")[0].strip()
        filename = f"Resume_{raw_name}_{target_role}.pdf"
        
        file_path = rg.create_resume_pdf(resume_content, output_filename=filename)
        actual_filename = os.path.basename(file_path)
        
        return jsonify({
            "success": True,
            "filename": actual_filename,
            "download_url": f"/api/resume/download/{actual_filename}",
            "message": "Resume PDF generated successfully"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/resume/download/<filename>", methods=["GET"])
def download_resume(filename):
    """Serves the generated PDF file safely."""
    safe_name = rg.sanitize_filename(filename)
    if not safe_name.endswith(".pdf"):
        safe_name += ".pdf"
    file_path = os.path.join(rg.OUTPUT_DIR, safe_name)
    
    if not os.path.exists(file_path):
        return jsonify({"success": False, "error": "File not found"}), 404
        
    return send_file(
        file_path,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=safe_name
    )

# ----------------------------------------------------------------
# 5. FRONTEND STATIC FILE SERVING (Unified Single-Port Deployment)
# ----------------------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serves the built React single-page app and assets."""
    if path.startswith("api/"):
        return jsonify({"error": "API route not found"}), 404
        
    static_file = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(static_file):
        return send_from_directory(app.static_folder, path)
        
    index_file = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index_file):
        return send_from_directory(app.static_folder, "index.html")
        
    return jsonify({
        "status": "online",
        "message": "AI Portfolio Backend API is online. Build the frontend via 'npm run build'."
    }), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    print(f"Starting AI Portfolio & Resume Generator Backend on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
