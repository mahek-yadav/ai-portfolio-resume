import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Sparkles, 
  FileSpreadsheet, 
  Database, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  RotateCcw
} from 'lucide-react';

export default function Settings({ 
  aiStatus, 
  sheetsStatus, 
  notify, 
  onRefreshStatus, 
  onResetDemo, 
  onSyncSheets, 
  isSyncing 
}) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyEmail = () => {
    if (sheetsStatus?.service_account_email) {
      navigator.clipboard.writeText(sheetsStatus.service_account_email);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      notify('Service account email copied to clipboard!', 'info');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">System Settings & Integrations</h2>
        <p className="page-subtitle">
          Real Google Sheets API and Gemini AI configuration details without exposing secret keys.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Gemini AI Status & Guide */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={18} color="#2563eb" />
              Google Gemini 2.5 Integration
            </h3>
            <span className={`badge ${aiStatus?.configured ? 'badge-primary' : 'badge-neutral'}`}>
              {aiStatus?.configured ? 'Active SDK' : 'Fallback Engine'}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <b>SDK:</b> Official <code>google-genai</code> Python Client<br />
              <b>Model:</b> <code>gemini-2.5-flash</code><br />
              <b>Status:</b> {aiStatus?.mode}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              All AI calls are securely routed through the Flask backend. API keys are never exposed in React or browser network responses.
            </p>
          </div>

          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.83rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>How to configure Gemini API:</div>
            <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Get a free API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Google AI Studio</a>.</li>
              <li>Open <code>backend/.env</code> in your editor.</li>
              <li>Set <code>GEMINI_API_KEY=your_actual_key</code> and save.</li>
              <li>Restart the Flask backend terminal.</li>
            </ol>
          </div>
        </div>

        {/* Google Sheets Status & Guide */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileSpreadsheet size={18} color="#10b981" />
              Google Sheets API Integration
            </h3>
            <span className={`badge ${sheetsStatus?.connected ? 'badge-success' : 'badge-neutral'}`}>
              {sheetsStatus?.connected ? 'Real Sheets Connected' : 'Offline'}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <b>Spreadsheet ID:</b> <code>{sheetsStatus?.spreadsheet_id || 'Not set'}</code>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <b>Last Synchronized:</b> {sheetsStatus?.last_sync_time || 'Never'}
            </div>
            <div style={{ padding: '8px 12px', background: sheetsStatus?.connected ? '#ecfdf5' : '#f8fafc', border: `1px solid ${sheetsStatus?.connected ? '#a7f3d0' : '#e2e8f0'}`, borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
              {sheetsStatus?.message}
            </div>
          </div>

          {sheetsStatus?.service_account_email && (
            <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ fontWeight: 600, color: '#1e40af' }}>Service Account Email:</span><br />
                <code>{sheetsStatus.service_account_email}</code>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={copyEmail} title="Copy Email">
                <Copy size={13} />
                <span>{copySuccess ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onRefreshStatus}
              style={{ flex: 1 }}
            >
              <RefreshCw size={14} />
              <span>Refresh Connection</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={onSyncSheets}
              disabled={isSyncing}
              style={{ flex: 1 }}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Step by Step Google Sheets Instructions */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Key size={18} color="#f59e0b" />
            Complete Google Sheets Service Account Setup Guide
          </h3>
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '12px' }}>
            This application uses <b>genuine Google Sheets API v4</b> with Google Cloud Service Account authentication (no fake CSV downloads or simulations). Follow these 5 steps to connect your personal spreadsheet:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <b>Step 1: Create GCP Project</b>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Visit <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Google Cloud Console</a> and create a project (e.g. <code>ai-portfolio-project</code>).
              </p>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <b>Step 2: Enable Sheets API</b>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Go to <b>APIs & Services &gt; Library</b>, search for <b>Google Sheets API</b>, and click <b>Enable</b>.
              </p>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <b>Step 3: Create Service Account</b>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Go to <b>APIs & Services &gt; Credentials &gt; Create Credentials &gt; Service Account</b>. Under Keys, click <b>Add Key &gt; Create New Key (JSON)</b>.
              </p>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <b>Step 4: Save JSON Credentials</b>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Save the downloaded file as <code>backend/credentials/service_account.json</code> (or point <code>GOOGLE_SERVICE_ACCOUNT_FILE</code> in <code>.env</code> to it).
              </p>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <b>Step 5: Share Spreadsheet & Set ID</b>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Create a blank Google Sheet, click <b>Share</b>, add the service account email with <b>Editor</b> permissions. Copy the ID from the URL and set <code>SPREADSHEET_ID=your_id</code> in <code>backend/.env</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Database size={18} color="#2563eb" />
            SQLite Database Management
          </h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Restore Realistic Demonstration Data</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Resets all 11 tables with balanced demonstration records (Aarav Sharma demo profile) to showcase both Machine Learning and Frontend resume generation.
            </div>
          </div>
          <button className="btn btn-secondary" onClick={onResetDemo}>
            <RotateCcw size={16} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}

