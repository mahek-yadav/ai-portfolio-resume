import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Sparkles, 
  FileSearch, 
  FileText, 
  Settings as SettingsIcon 
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio Manager', icon: FolderGit2 },
    { id: 'ai-import', label: 'AI Portfolio Import', icon: Sparkles },
    { id: 'jd-analyzer', label: 'Job Description Analyzer', icon: FileSearch },
    { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
    { id: 'settings', label: 'System & Integrations', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Sparkles size={20} />
        </div>
        <div className="sidebar-title">PortfoliAI Resume</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>SQLite Relational Engine</div>
        <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '2px' }}>
          Gemini 2.5 + Google Sheets
        </div>
      </div>
    </aside>
  );
}

