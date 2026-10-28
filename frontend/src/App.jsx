import React, { useState, useEffect } from 'react';
import { api } from './services/api';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Notification from './components/Notification';

// Pages
import Dashboard from './pages/Dashboard';
import PortfolioManager from './pages/PortfolioManager';
import AIImport from './pages/AIImport';
import JDAnalyzer from './pages/JDAnalyzer';
import ResumeBuilder from './pages/ResumeBuilder';
import Settings from './pages/Settings';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [aiStatus, setAiStatus] = useState(null);
  const [sheetsStatus, setSheetsStatus] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Cross-page state for transferring JD analysis to Resume Builder
  const [transferredResumeConfig, setTransferredResumeConfig] = useState({
    targetRole: 'Machine Learning Engineering Intern',
    preSelectedMatches: null
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const loadSystemStatus = async () => {
    try {
      const [statsRes, aiRes, sheetsRes] = await Promise.allSettled([
        api.getPortfolioStats(),
        api.getAIStatus(),
        api.getSheetsStatus()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.stats || {});
      }
      if (aiRes.status === 'fulfilled' && aiRes.value?.success) {
        setAiStatus(aiRes.value);
      }
      if (sheetsRes.status === 'fulfilled' && sheetsRes.value?.success) {
        setSheetsStatus(sheetsRes.value.status);
      }
    } catch (err) {
      console.error('Status loading error:', err);
    }
  };

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const handleSyncSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncToSheets();
      if (res.success) {
        showNotification(res.message || 'Successfully synchronized with Google Sheets!', 'success');
        loadSystemStatus();
      } else {
        showNotification(res.error || 'Google Sheets sync failed. Check setup in Settings.', 'warning');
      }
    } catch (err) {
      showNotification(`Sync error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset portfolio database to initial demonstration records?')) return;
    try {
      await api.resetDemoData();
      showNotification('Database successfully reset to demonstration data.', 'success');
      loadSystemStatus();
    } catch (err) {
      showNotification(`Reset failed: ${err.message}`, 'error');
    }
  };

  const handleTransferToResumeBuilder = ({ targetRole, jdAnalysis, matchResult }) => {
    setTransferredResumeConfig({
      targetRole: targetRole,
      preSelectedMatches: matchResult
    });
    setCurrentTab('resume-builder');
    showNotification(`Transferred requirements for "${targetRole}" to Resume Builder!`, 'success');
  };

  return (
    <div className="app-layout">
      {/* Fixed Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          aiStatus={aiStatus}
          sheetsStatus={sheetsStatus}
          onSyncSheets={handleSyncSheets}
          isSyncing={isSyncing}
        />

        <main>
          {currentTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              sheetsStatus={sheetsStatus}
              aiStatus={aiStatus}
              onNavigate={(tab) => setCurrentTab(tab)}
              onResetDemo={handleResetDemo}
              onSyncSheets={handleSyncSheets}
              isSyncing={isSyncing}
            />
          )}

          {currentTab === 'portfolio' && (
            <PortfolioManager
              notify={showNotification}
              onDataChanged={loadSystemStatus}
            />
          )}

          {currentTab === 'ai-import' && (
            <AIImport
              notify={showNotification}
              onDataChanged={loadSystemStatus}
            />
          )}

          {currentTab === 'jd-analyzer' && (
            <JDAnalyzer
              notify={showNotification}
              onTransferToResumeBuilder={handleTransferToResumeBuilder}
            />
          )}

          {currentTab === 'resume-builder' && (
            <ResumeBuilder
              notify={showNotification}
              initialRole={transferredResumeConfig.targetRole}
              preSelectedMatches={transferredResumeConfig.preSelectedMatches}
            />
          )}

          {currentTab === 'settings' && (
            <Settings
              aiStatus={aiStatus}
              sheetsStatus={sheetsStatus}
              notify={showNotification}
              onRefreshStatus={loadSystemStatus}
              onResetDemo={handleResetDemo}
              onSyncSheets={handleSyncSheets}
              isSyncing={isSyncing}
            />
          )}
        </main>

        {/* Global Toast Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
}

