import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, Check, ArrowRight, RotateCcw } from 'lucide-react';

const SAMPLE_RAW_TEXT = `Johnathan Doe
Email: john.doe.demo@example.com | Phone: (555) 987-6543
GitHub: github.com/johndoedemo | Location: Austin, TX

Summary:
Energetic computer science student passionate about building scalable web applications and distributed backends. Experienced with React, Node.js, and Python.

Education:
University of Texas at Austin, B.S. in Computer Science (2022 - 2026). GPA: 3.82.

Technical Skills:
Python, JavaScript, React, PostgreSQL, Docker, Git, REST APIs, Tailwind CSS.

Projects:
1. CampusEventHub: Full stack platform for collegiate student organizations using React and Express. Deployed with Docker containers on AWS.
2. AlgoVisualizer: Interactive graph algorithm visualizer built with vanilla JavaScript and HTML5 Canvas.

Certifications:
AWS Certified Developer Associate (2024)`;

export default function AIImport({ notify, onDataChanged }) {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [committing, setCommitting] = useState(false);

  const handleStructure = async () => {
    if (!rawText.trim()) {
      notify('Please enter or paste unstructured text.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.structurePortfolio(rawText);
      setExtractedData(res.data);
      notify('Information successfully structured by AI!', 'success');
    } catch (err) {
      notify(`AI structuring error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!extractedData) return;
    setCommitting(true);
    try {
      const res = await api.commitStructuredData(extractedData);
      notify('Structured records successfully saved to SQLite database!', 'success');
      if (onDataChanged) onDataChanged();
      setExtractedData(null);
      setRawText('');
    } catch (err) {
      notify(`Commit error: ${err.message}`, 'error');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">AI Portfolio Structuring</h2>
        <p className="page-subtitle">
          Paste unstructured resumes, bio text, or notes. Gemini AI maps them into structured relational database fields.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: extractedData ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* Input Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles size={18} color="#2563eb" />
              Unstructured Input
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setRawText(SAMPLE_RAW_TEXT)}
            >
              Fill Sample Bio
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Paste Raw Text / Bio / Old Resume Snippets:</label>
            <textarea
              className="form-control"
              style={{ minHeight: '340px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              placeholder="Paste raw text here... e.g. John Doe, Software engineer with experience in Python and React. Email: john@example.com..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleStructure}
            disabled={loading || !rawText.trim()}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Analyzing with Gemini AI...' : 'Convert to Structured Schema'}</span>
          </button>
        </div>

        {/* Review & Edit Card */}
        {extractedData && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Check size={18} color="#10b981" />
                Review AI Extracted Fields
              </h3>
              <span className={`badge ${extractedData._source === 'gemini_api' ? 'badge-primary' : 'badge-warning'}`}>
                {extractedData._source === 'gemini_api' ? 'Gemini 2.5 Output' : 'Heuristic Engine'}
              </span>
            </div>

            {extractedData._notice && (
              <div style={{ padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#92400e', marginBottom: '14px' }}>
                {extractedData._notice}
              </div>
            )}

            <div style={{ maxHeight: '340px', overflowY: 'auto', marginBottom: '16px' }}>
              {/* Personal Info */}
              {extractedData.personal_info && (
                <div style={{ marginBottom: '12px', padding: '10px', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Candidate Details:</div>
                  <div style={{ fontSize: '0.82rem' }}>
                    <b>Name:</b> {extractedData.personal_info.full_name || 'N/A'} | <b>Email:</b> {extractedData.personal_info.email || 'N/A'}
                  </div>
                </div>
              )}

              {/* Skills */}
              {extractedData.skills && extractedData.skills.length > 0 && (
                <div style={{ marginBottom: '12px', padding: '10px', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Extracted Skills ({extractedData.skills.length}):</div>
                  <div>
                    {extractedData.skills.map((s, idx) => (
                      <span key={idx} className="tag-pill tag-match">{s.name} ({s.category})</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {extractedData.projects && extractedData.projects.length > 0 && (
                <div style={{ marginBottom: '12px', padding: '10px', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Extracted Projects ({extractedData.projects.length}):</div>
                  {extractedData.projects.map((p, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                      • <b>{p.title}</b>: {p.tech_stack || p.description}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {extractedData.education && extractedData.education.length > 0 && (
                <div style={{ marginBottom: '12px', padding: '10px', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Education:</div>
                  {extractedData.education.map((e, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem' }}>
                      • {e.degree} in {e.field_of_study} — {e.institution} ({e.start_date} - {e.end_date})
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn btn-success"
              style={{ width: '100%' }}
              onClick={handleCommit}
              disabled={committing}
            >
              <Check size={16} />
              <span>{committing ? 'Saving Records...' : 'Confirm & Save to Portfolio Database'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

