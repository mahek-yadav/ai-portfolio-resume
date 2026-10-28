"""
sheets_service.py - Real Google Sheets API Integration using Google Cloud Service Account
Exports SQLite portfolio to dedicated worksheets, updates in place, and reads back with fallback.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
from dotenv import load_dotenv

load_dotenv()

# Worksheet names mapping to SQLite tables
WORKSHEET_MAP = {
    "personal_info": "Personal Information",
    "summaries": "Summaries",
    "education": "Education",
    "skills": "Skills",
    "certifications": "Certifications",
    "projects": "Projects",
    "experience": "Experience",
    "achievements": "Achievements",
    "publications": "Publications",
    "languages": "Languages",
    "extracurriculars": "Activities"
}

def get_credentials_info() -> Tuple[Optional[str], Optional[str]]:
    """
    Returns (credentials_path, spreadsheet_id).
    Checks credentials directory or env vars.
    """
    spreadsheet_id = os.getenv("SPREADSHEET_ID", "").strip()
    
    # 1. Direct path from env
    cred_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()
    if cred_path and os.path.exists(cred_path):
        return cred_path, spreadsheet_id
        
    # 2. Default local path in backend/credentials/service_account.json
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    default_path = os.path.join(backend_dir, "credentials", "service_account.json")
    if os.path.exists(default_path):
        return default_path, spreadsheet_id
        
    return None, spreadsheet_id

def get_sheets_service():
    """Builds and returns Google Sheets API service using service account."""
    cred_path, spreadsheet_id = get_credentials_info()
    if not cred_path or not spreadsheet_id:
        return None, "Google Sheets credentials file or SPREADSHEET_ID not configured."
    
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        credentials = service_account.Credentials.from_service_account_file(
            cred_path, scopes=scopes
        )
        service = build("sheets", "v4", credentials=credentials, cache_discovery=False)
        return service, None
    except Exception as e:
        return None, str(e)

def get_service_account_email() -> Optional[str]:
    """Extracts client_email from the credentials JSON for easy sharing."""
    cred_path, _ = get_credentials_info()
    if cred_path and os.path.exists(cred_path):
        try:
            with open(cred_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("client_email")
        except Exception:
            return None
    return None

def get_sheets_status() -> Dict[str, Any]:
    """Checks the real connection status to the Google Sheets API."""
    from database import get_metadata
    
    cred_path, spreadsheet_id = get_credentials_info()
    service_email = get_service_account_email()
    last_sync = get_metadata("sheets_last_sync_time") or "Never synced"
    
    if not cred_path:
        return {
            "configured": False,
            "connected": False,
            "spreadsheet_id": spreadsheet_id or "Not set",
            "service_account_email": service_email or "Not found",
            "last_sync_time": last_sync,
            "message": "Service account JSON file not found. Place your credentials in backend/credentials/service_account.json or set GOOGLE_SERVICE_ACCOUNT_FILE in .env."
        }
        
    if not spreadsheet_id:
        return {
            "configured": False,
            "connected": False,
            "spreadsheet_id": "Not set",
            "service_account_email": service_email,
            "last_sync_time": last_sync,
            "message": "SPREADSHEET_ID is not configured in .env."
        }
        
    service, err = get_sheets_service()
    if not service:
        return {
            "configured": True,
            "connected": False,
            "spreadsheet_id": spreadsheet_id,
            "service_account_email": service_email,
            "last_sync_time": last_sync,
            "message": f"Authentication failed: {err}"
        }
        
    try:
        # Test real read operation
        spreadsheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        title = spreadsheet.get("properties", {}).get("title", "Portfolio Spreadsheet")
        sheets_list = [s["properties"]["title"] for s in spreadsheet.get("sheets", [])]
        
        return {
            "configured": True,
            "connected": True,
            "spreadsheet_title": title,
            "spreadsheet_id": spreadsheet_id,
            "service_account_email": service_email,
            "sheets_count": len(sheets_list),
            "existing_sheets": sheets_list,
            "last_sync_time": last_sync,
            "message": f"Successfully connected to '{title}'."
        }
    except Exception as e:
        return {
            "configured": True,
            "connected": False,
            "spreadsheet_id": spreadsheet_id,
            "service_account_email": service_email,
            "last_sync_time": last_sync,
            "message": f"API Error: Make sure '{service_email}' has Editor access to your spreadsheet. Details: {str(e)}"
        }

def sync_portfolio_to_sheets() -> Dict[str, Any]:
    """
    Exports all 11 categories of verified SQLite data to dedicated worksheets.
    Updates existing sheets in-place without duplicating rows.
    """
    from database import get_all, set_metadata, TABLE_FIELDS
    
    service, err = get_sheets_service()
    if not service:
        return {"success": False, "error": err or "Google Sheets is not configured."}
        
    _, spreadsheet_id = get_credentials_info()
    
    try:
        # 1. Fetch existing sheets
        metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        existing_sheets = {s["properties"]["title"]: s["properties"]["sheetId"] for s in metadata.get("sheets", [])}
        
        # 2. Ensure all worksheets exist
        requests = []
        for table_key, sheet_name in WORKSHEET_MAP.items():
            if sheet_name not in existing_sheets:
                requests.append({
                    "addSheet": {
                        "properties": {
                            "title": sheet_name
                        }
                    }
                })
                
        if requests:
            service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={"requests": requests}
            ).execute()
            
        # 3. Write data to each worksheet
        synced_counts = {}
        for table_key, sheet_name in WORKSHEET_MAP.items():
            records = get_all(table_key)
            fields = ["id"] + TABLE_FIELDS[table_key]
            
            # Header row
            rows = [fields]
            # Data rows
            for rec in records:
                row = [str(rec.get(col, "")) if rec.get(col) is not None else "" for col in fields]
                rows.append(row)
                
            # Clear existing sheet content first to avoid stale data
            service.spreadsheets().values().clear(
                spreadsheetId=spreadsheet_id,
                range=f"'{sheet_name}'!A1:Z1000"
            ).execute()
            
            # Write new updated content
            service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"'{sheet_name}'!A1",
                valueInputOption="RAW",
                body={"values": rows}
            ).execute()
            
            synced_counts[sheet_name] = len(records)
            
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        set_metadata("sheets_last_sync_time", now_str)
        
        return {
            "success": True,
            "timestamp": now_str,
            "synced_counts": synced_counts,
            "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit",
            "message": f"Successfully synchronized {sum(synced_counts.values())} records across {len(synced_counts)} worksheets."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Synchronization failed: {str(e)}"
        }

def read_portfolio_from_sheets_with_fallback() -> Tuple[Dict[str, Any], str]:
    """
    Reads portfolio data directly from Google Sheets if available;
    falls back cleanly to SQLite if not configured or offline.
    """
    from database import get_complete_portfolio
    
    status = get_sheets_status()
    if not status.get("connected"):
        return get_complete_portfolio(), "sqlite_fallback"
        
    service, _ = get_sheets_service()
    _, spreadsheet_id = get_credentials_info()
    
    portfolio = {}
    try:
        from database import TABLE_FIELDS
        for table_key, sheet_name in WORKSHEET_MAP.items():
            result = service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=f"'{sheet_name}'!A1:Z500"
            ).execute()
            values = result.get("values", [])
            
            if not values or len(values) < 2:
                # No data in sheet, fall back to SQLite for this table
                from database import get_all
                portfolio[table_key] = get_all(table_key)
                continue
                
            headers = values[0]
            records = []
            for row in values[1:]:
                rec = {}
                for idx, col in enumerate(headers):
                    val = row[idx] if idx < len(row) else ""
                    if col == "id" and val.isdigit():
                        rec[col] = int(val)
                    elif col in ["is_primary", "is_featured"] and val.isdigit():
                        rec[col] = int(val)
                    else:
                        rec[col] = val
                records.append(rec)
            portfolio[table_key] = records
            
        return portfolio, "google_sheets"
    except Exception as e:
        print(f"Failed to read from Google Sheets: {e}. Falling back to SQLite.")
        return get_complete_portfolio(), "sqlite_fallback"

