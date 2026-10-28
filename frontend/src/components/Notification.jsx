import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ message, type = 'info', onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    error: <AlertCircle size={18} color="#ef4444" />,
    warning: <AlertCircle size={18} color="#f59e0b" />,
    info: <Info size={18} color="#2563eb" />
  };

  const bgClasses = {
    success: 'badge-success',
    error: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-primary'
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100,
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '460px'
      }}
    >
      <div>{icons[type] || icons.info}</div>
      <div style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-main)' }}>
        {message}
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

