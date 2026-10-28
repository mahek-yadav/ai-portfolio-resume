import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FileText, 
  Download, 
  Sparkles, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  ExternalLink,
  Code2,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award
} from 'lucide-react';

export default function ResumeBuilder({ 
  notify, 
  initialRole = 'Machine Learning Engineering Intern', 
  preSelectedMatches = null 
}) {
  const [portfolio, setPortfolio] = useState(null);
  const [targetRole, setTargetRole] = useState(initialRole);
  const [summaryText, setSummaryText] = useState('');
  
  // Selected IDs tracked by actual database ID
  const [selectedIds, setSelectedIds] = useState({
    skills: [],
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    achievements: [],
    publications: [],
    languages: [],
    extracurriculars: []
  });

  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [improvingSummary, setImprovingSummary] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState(null);

  // Load portfolio on mount
  useEffect(() => {
    loadPortfolioData();
  }, []);

  // Update target role if transferred from JD analyzer
  useEffect(() => {
    if (initialRole) {
      setTargetRole(initialRole);
    }
  }, [initialRole]);

  const loadPortfolioData = async () => {
    try {
      const res = await api.getFullPortfolio();
      const p = res.portfolio;
      setPortfolio(p);

      // Default summary
      const primarySummary = p.summaries?.find(s => s.is_primary === 1)?.summary_text || p.summaries?.[0]?.summary_text || '';
      setSummaryText(primarySummary);

      // Default selection: select all education, languages, and top records
      const initialSelected = {
        skills: p.skills?.map(s => s.id) || [],
        projects: p.projects?.map(proj => proj.id) || [],
        experience: p.experience?.map(e => e.id) || [],
        education: p.education?.map(edu => edu.id) || [],
        certifications: p.certifications?.map(c => c.id) || [],
        achievements: p.achievements?.map(a => a.id) || [],
        publications: p.publications?.map(pub => pub.id) || [],
        languages: p.languages?.map(l => l.id) || [],
        extracurriculars: p.extracurriculars?.map(act => act.id) || []
      };

      // If pre-selected matching IDs were passed from JD analyzer, apply them
      if (preSelectedMatches) {
        if (preSelectedMatches.relevant_project_ids?.length) {
          initialSelected.projects = preSelectedMatches.relevant_project_ids;
        }
        if (preSelectedMatches.relevant_certification_ids?.length) {
          initialSelected.certifications = preSelectedMatches.relevant_certification_ids;
        }
        if (preSelectedMatches.relevant_experience_ids?.length) {
          initialSelected.experience = preSelectedMatches.relevant_experience_ids;
        }
        // Match skills
        if (preSelectedMatches.matching_skills?.length) {
          const matchLower = preSelectedMatches.matching_skills.map(s => s.toLowerCase());
          const matchedSkillIds = p.skills
            ?.filter(s => matchLower.some(m => s.name.toLowerCase().includes(m) || m.includes(s.name.toLowerCase())))
            ?.map(s => s.id) || [];
          if (matchedSkillIds.length > 0) {
            initialSelected.skills = matchedSkillIds;
          }
        }
      }

      setSelectedIds(initialSelected);
      refreshPreview(initialSelected, primarySummary, targetRole);
    } catch (err) {
      notify(`Error loading portfolio: ${err.message}`, 'error');
    }
  };

  const refreshPreview = async (ids, summary, role) => {
    try {
      const res = await api.previewResume(ids, summary, role);
      setPreviewData(res.resume);
    } catch (err) {
      console.error("Preview error", err);
    }
  };

  const toggleSelection = (category, id) => {
    const current = selectedIds[category] || [];
    const updated = current.includes(id)
      ? current.filter(itemId => itemId !== id)
      : [...current, id];

    const newSelected = { ...selectedIds, [category]: updated };
    setSelectedIds(newSelected);
    refreshPreview(newSelected, summaryText, targetRole);
  };

  const toggleSelectAll = (category) => {
    const allIds = portfolio[category]?.map(item => item.id) || [];
    const current = selectedIds[category] || [];
    const updated = current.length === allIds.length ? [] : allIds;

    const newSelected = { ...selectedIds, [category]: updated };
    setSelectedIds(newSelected);
    refreshPreview(newSelected, summaryText, targetRole);
  };

  const handleImproveSummary = async () => {
    if (!summaryText.trim()) return;
    setImprovingSummary(true);
    try {
      // Gather selected records to provide context to Gemini
      const selectedRecords = {
        skills: portfolio.skills.filter(s => selectedIds.skills.includes(s.id)),
        projects: portfolio.projects.filter(p => selectedIds.projects.includes(p.id)),
        experience: portfolio.experience.filter(e => selectedIds.experience.includes(e.id))
      };

      const res = await api.improveSummary(summaryText, selectedRecords, targetRole);
      const suggestions = res.suggestions;
      if (suggestions.suggested_summary) {
        setSummaryText(suggestions.suggested_summary);
        refreshPreview(selectedIds, suggestions.suggested_summary, targetRole);
        notify('Professional summary tailored with AI (verified facts only)!', 'success');
      }
    } catch (err) {
      notify(`Summary enhancement error: ${err.message}`, 'error');
    } finally {
      setImprovingSummary(false);
    }
  };

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true);
    try {
      const res = await api.generateResumePdf(selectedIds, summaryText, targetRole);
      setDownloadInfo(res);
      notify('ATS PDF Resume generated successfully!', 'success');
      
      // Auto trigger download
      const fullUrl = res.download_url;
      window.open(fullUrl, '_blank');
    } catch (err) {
      notify(`PDF generation error: ${err.message}`, 'error');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (!portfolio) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        Loading portfolio records...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Dynamic Resume Generator</h2>
          <p className="page-subtitle">
            Customize target role, select verified database records with checkboxes, and compile an ATS single-column PDF.
          </p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleGeneratePdf}
          disabled={generatingPdf}
        >
          <Download size={18} />
          <span>{generatingPdf ? 'Compiling PDF...' : 'Generate & Download PDF'}</span>
        </button>
      </div>

      {downloadInfo && (
        <div style={{ padding: '12px 18px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 600, color: '#065f46' }}>✓ PDF Ready: </span>
            <span style={{ color: '#047857' }}>{downloadInfo.filename}</span>
          </div>
          <a
            href={downloadInfo.download_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-success btn-sm"
          >
            <Download size={14} />
            <span>Download PDF Again</span>
          </a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '24px' }}>
        {/* Left Column: Form & Selection Checkboxes */}
        <div>
          {/* Target Role & Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Target Role & Summary</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Target Job Title *</label>
              <input
                className="form-control"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  refreshPreview(selectedIds, summaryText, e.target.value);
                }}
                placeholder="e.g. Machine Learning Engineering Intern"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Professional Summary (Editable)</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleImproveSummary}
                  disabled={improvingSummary}
                  title="Tailor phrasing using verified facts only (Strict Accuracy Rule)"
                >
                  <Sparkles size={13} color="#2563eb" />
                  <span>{improvingSummary ? 'Tailoring...' : 'AI Enhance Summary'}</span>
                </button>
              </div>
              <textarea
                className="form-control"
                rows={4}
                value={summaryText}
                onChange={(e) => {
                  setSummaryText(e.target.value);
                  refreshPreview(selectedIds, e.target.value, targetRole);
                }}
              />
            </div>
          </div>

          {/* Category Checkbox Selectors */}
          {/* 1. SKILLS */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Code2 size={16} color="#2563eb" />
                Select Skills ({selectedIds.skills.length} / {portfolio.skills?.length || 0})
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => toggleSelectAll('skills')}
              >
                {selectedIds.skills.length === portfolio.skills?.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="selection-grid">
              {portfolio.skills?.map((s) => {
                const isSelected = selectedIds.skills.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className={`checkbox-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSelection('skills', s.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PROJECTS */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FolderGit2 size={16} color="#2563eb" />
                Select Projects ({selectedIds.projects.length} / {portfolio.projects?.length || 0})
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => toggleSelectAll('projects')}
              >
                {selectedIds.projects.length === portfolio.projects?.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {portfolio.projects?.map((p) => {
                const isSelected = selectedIds.projects.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`checkbox-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSelection('projects', p.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}><b>Tech:</b> {p.tech_stack}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.description?.slice(0, 110)}...</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. EXPERIENCE */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Briefcase size={16} color="#2563eb" />
                Select Experience ({selectedIds.experience.length} / {portfolio.experience?.length || 0})
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => toggleSelectAll('experience')}
              >
                {selectedIds.experience.length === portfolio.experience?.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {portfolio.experience?.map((e) => {
                const isSelected = selectedIds.experience.includes(e.id);
                return (
                  <div
                    key={e.id}
                    className={`checkbox-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSelection('experience', e.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.role_title} — {e.company_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{e.start_date} - {e.end_date} | {e.location}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. CERTIFICATIONS */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Award size={16} color="#2563eb" />
                Select Certifications ({selectedIds.certifications.length} / {portfolio.certifications?.length || 0})
              </h3>
            </div>
            <div className="selection-grid">
              {portfolio.certifications?.map((c) => {
                const isSelected = selectedIds.certifications.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className={`checkbox-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSelection('certifications', c.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.issuing_organization} ({c.issue_date})</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Resume Preview */}
        <div>
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Live ATS Resume Preview
              </div>
              <span className="badge badge-neutral">
                Source: {previewData?._source_backend === 'google_sheets' ? 'Google Sheets' : 'SQLite DB'}
              </span>
            </div>

            <div className="resume-paper">
              {/* Candidate Info */}
              <h2>{portfolio.personal_info?.[0]?.full_name || 'Candidate Name'}</h2>
              <div className="contact-line">
                {portfolio.personal_info?.[0]?.phone} &nbsp;|&nbsp;
                {portfolio.personal_info?.[0]?.email} &nbsp;|&nbsp;
                {portfolio.personal_info?.[0]?.location} &nbsp;|&nbsp;
                <span style={{ color: '#2563eb' }}>LinkedIn</span> &nbsp;|&nbsp;
                <span style={{ color: '#2563eb' }}>GitHub</span>
              </div>

              {/* Summary */}
              {summaryText && (
                <div>
                  <div className="section-title">PROFESSIONAL SUMMARY</div>
                  <p style={{ fontSize: '0.86rem', lineHeight: '1.45', color: '#334155' }}>
                    {summaryText}
                  </p>
                </div>
              )}

              {/* Skills */}
              {previewData?.skills?.length > 0 && (
                <div>
                  <div className="section-title">TECHNICAL SKILLS</div>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {previewData.skills.map(s => s.name).join(' • ')}
                  </div>
                </div>
              )}

              {/* Experience */}
              {previewData?.experience?.length > 0 && (
                <div>
                  <div className="section-title">EXPERIENCE & INTERNSHIPS</div>
                  {previewData.experience.map(e => (
                    <div key={e.id} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                        <span>{e.role_title} — {e.company_name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.start_date} - {e.end_date}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                        {e.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {previewData?.projects?.length > 0 && (
                <div>
                  <div className="section-title">KEY PROJECTS</div>
                  {previewData.projects.map(p => (
                    <div key={p.id} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                        <span>{p.title} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>| {p.tech_stack}</span></span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.start_date} - {p.end_date}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {previewData?.education?.length > 0 && (
                <div>
                  <div className="section-title">EDUCATION</div>
                  {previewData.education.map(edu => (
                    <div key={edu.id} style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                        <span>{edu.degree} in {edu.field_of_study} — {edu.institution}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{edu.start_date} - {edu.end_date}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GPA: {edu.grade_or_gpa}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {previewData?.certifications?.length > 0 && (
                <div>
                  <div className="section-title">CERTIFICATIONS</div>
                  {previewData.certifications.map(c => (
                    <div key={c.id} style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '2px' }}>
                      • <b>{c.title}</b> — {c.issuing_organization} ({c.issue_date})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
