import React from 'react';
import { Sparkles, FileSpreadsheet, Database, RefreshCw } from 'lucide-react';

export default function Navbar({ aiStatus, sheetsStatus, onSyncSheets, isSyncing }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h1>AI-Powered Portfolio & Resume Generator</h1>
      </div>

      <div className="navbar-badges">
        {/* Gemini AI status badge */}
        <span className={`badge ${aiStatus?.configured ? 'badge-primary' : 'badge-neutral'}`} title={aiStatus?.mode}>
          <Sparkles size={13} />
          {aiStatus?.configured ? 'Gemini 2.5 Active' : 'AI Local Fallback'}
        </span>

        {/* Google Sheets status badge */}
        <span 
          className={`badge ${sheetsStatus?.connected ? 'badge-success' : sheetsStatus?.configured ? 'badge-warning' : 'badge-neutral'}`}
          title={sheetsStatus?.message}
        >
          <FileSpreadsheet size={13} />
          {sheetsStatus?.connected ? 'Sheets Connected' : 'Sheets Offline'}
        </span>

        {/* Sync Button */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onSyncSheets}
          disabled={isSyncing}
          title="Synchronize verified SQLite portfolio to Google Sheets"
        >
          <RefreshCw size={14} className={isSyncing ? 'spin-icon' : ''} />
          <span>{isSyncing ? 'Syncing...' : 'Sync to Sheets'}</span>
        </button>
      </div>
    </header>
  );
}

