import React from 'react';
import { 
  GraduationCap, 
  Code2, 
  Briefcase, 
  Award, 
  FolderGit2, 
  BookOpen, 
  Sparkles, 
  FileSpreadsheet, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ 
  stats, 
  sheetsStatus, 
  aiStatus, 
  onNavigate, 
  onResetDemo, 
  onSyncSheets, 
  isSyncing 
}) {
  const statItems = [
    { label: 'Skills', value: stats.skills || 0, icon: Code2 },
    { label: 'Projects', value: stats.projects || 0, icon: FolderGit2 },
    { label: 'Experience', value: stats.experience || 0, icon: Briefcase },
    { label: 'Certifications', value: stats.certifications || 0, icon: Award },
    { label: 'Education', value: stats.education || 0, icon: GraduationCap },
    { label: 'Publications', value: stats.publications || 0, icon: BookOpen },
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Portfolio Overview & Control Center</h2>
          <p className="page-subtitle">
            Relational SQLite database verified portfolio records with AI-assisted resume generation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onResetDemo}>
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="stat-grid">
        {statItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon">
                <Icon size={22} />
              </div>
              <div>
                <div className="stat-value">{item.value}</div>
                <div className="stat-label">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Quick Workflows Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={18} color="#2563eb" />
              Quick Actions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              onClick={() => onNavigate('resume-builder')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Create Job-Tailored Resume</span>
                <ArrowRight size={16} color="#2563eb" />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Select verified database records and compile an ATS-compliant PDF.
              </p>
            </div>

            <div 
              style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              onClick={() => onNavigate('jd-analyzer')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Analyze Job Description</span>
                <ArrowRight size={16} color="#2563eb" />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Extract skills & keywords from a job posting and match against your portfolio.
              </p>
            </div>

            <div 
              style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              onClick={() => onNavigate('ai-import')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>AI Portfolio Structuring</span>
                <ArrowRight size={16} color="#2563eb" />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Paste unstructured text to automatically map into SQLite database tables.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Status Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileSpreadsheet size={18} color="#10b981" />
              Google Sheets & AI Engine Status
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Google Sheets Synchronization</span>
                <span className={`badge ${sheetsStatus?.connected ? 'badge-success' : 'badge-neutral'}`}>
                  {sheetsStatus?.connected ? 'Connected' : 'Offline / Setup Needed'}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {sheetsStatus?.message}
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Last Synced: <b>{sheetsStatus?.last_sync_time || 'Never'}</b>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: '10px', width: '100%' }}
                onClick={onSyncSheets}
                disabled={isSyncing}
              >
                {isSyncing ? 'Synchronizing...' : 'Export SQLite to Sheets Worksheets'}
              </button>
            </div>

            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Gemini 2.5 AI Engine</span>
                <span className={`badge ${aiStatus?.configured ? 'badge-primary' : 'badge-neutral'}`}>
                  {aiStatus?.configured ? 'Active' : 'Fallback Mode'}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {aiStatus?.configured 
                  ? 'Official Google GenAI Python SDK connected. Structured JSON output active.' 
                  : 'Operating in local rule-based fallback mode. To activate real Gemini API, set GEMINI_API_KEY in backend/.env.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

