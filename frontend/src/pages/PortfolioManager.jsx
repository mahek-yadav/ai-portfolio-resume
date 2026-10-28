import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  User, 
  FileText, 
  GraduationCap, 
  Code2, 
  Award, 
  FolderGit2, 
  Briefcase, 
  Trophy, 
  BookOpen, 
  Languages as LangIcon, 
  Activity 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'personal_info', label: 'Personal Info', icon: User },
  { id: 'summaries', label: 'Summaries', icon: FileText },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'publications', label: 'Publications', icon: BookOpen },
  { id: 'languages', label: 'Languages', icon: LangIcon },
  { id: 'extracurriculars', label: 'Activities', icon: Activity }
];

export default function PortfolioManager({ notify, onDataChanged }) {
  const [activeCategory, setActiveCategory] = useState('skills');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadCategoryRecords(activeCategory);
  }, [activeCategory]);

  const loadCategoryRecords = async (category) => {
    setLoading(true);
    try {
      const res = await api.getCategoryRecords(category);
      setRecords(res.records || []);
    } catch (err) {
      notify(`Failed to load ${category}: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({ ...rec });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this verified portfolio entry?')) return;
    try {
      await api.deleteRecord(activeCategory, id);
      notify('Entry deleted successfully.', 'success');
      loadCategoryRecords(activeCategory);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      notify(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.updateRecord(activeCategory, editingRecord.id, formData);
        notify('Record updated successfully.', 'success');
      } else {
        await api.createRecord(activeCategory, formData);
        notify('Record created successfully.', 'success');
      }
      setIsModalOpen(false);
      loadCategoryRecords(activeCategory);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      notify(`Save error: ${err.message}`, 'error');
    }
  };

  // Dynamic form renderer based on active category
  const renderFormFields = () => {
    switch (activeCategory) {
      case 'personal_info':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" required value={formData.full_name || ''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-control" type="email" required value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-control" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input className="form-control" value={formData.linkedin_url || ''} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input className="form-control" value={formData.github_url || ''} onChange={(e) => setFormData({...formData, github_url: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Portfolio Website URL</label>
              <input className="form-control" value={formData.portfolio_url || ''} onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})} />
            </div>
          </>
        );

      case 'summaries':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Objective / Title *</label>
              <input className="form-control" required placeholder="e.g. Machine Learning Focus" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Summary Text *</label>
              <textarea className="form-control" rows={4} required value={formData.summary_text || ''} onChange={(e) => setFormData({...formData, summary_text: e.target.value})} />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.is_primary === 1} onChange={(e) => setFormData({...formData, is_primary: e.target.checked ? 1 : 0})} />
                <span>Mark as Primary Summary</span>
              </label>
            </div>
          </>
        );

      case 'education':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Institution *</label>
              <input className="form-control" required value={formData.institution || ''} onChange={(e) => setFormData({...formData, institution: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Degree *</label>
              <input className="form-control" required placeholder="e.g. Bachelor of Science" value={formData.degree || ''} onChange={(e) => setFormData({...formData, degree: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Field of Study *</label>
              <input className="form-control" required placeholder="e.g. Computer Science" value={formData.field_of_study || ''} onChange={(e) => setFormData({...formData, field_of_study: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-control" placeholder="Aug 2022" value={formData.start_date || ''} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-control" placeholder="May 2026" value={formData.end_date || ''} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Grade / GPA</label>
              <input className="form-control" placeholder="e.g. 3.85 / 4.00" value={formData.grade_or_gpa || ''} onChange={(e) => setFormData({...formData, grade_or_gpa: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Relevant Coursework / Description</label>
              <textarea className="form-control" rows={3} value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </>
        );

      case 'skills':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Skill Name *</label>
              <input className="form-control" required placeholder="e.g. Python, React.js" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" required value={formData.category || 'Programming Languages'} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="Programming Languages">Programming Languages</option>
                <option value="Web Technologies">Web Technologies</option>
                <option value="Machine Learning & Data">Machine Learning & Data</option>
                <option value="Developer Tools & Cloud">Developer Tools & Cloud</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Proficiency Level</label>
              <select className="form-control" value={formData.proficiency_level || 'Intermediate'} onChange={(e) => setFormData({...formData, proficiency_level: e.target.value})}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </>
        );

      case 'projects':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input className="form-control" required value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-control" placeholder="Lead Developer" value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Tech Stack (comma-separated)</label>
              <input className="form-control" placeholder="Python, Scikit-Learn, Flask" value={formData.tech_stack || ''} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Description / Bullets *</label>
              <textarea className="form-control" rows={4} required placeholder="Engineered regression model pipeline evaluating 79 variables..." value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">GitHub Repository URL</label>
                <input className="form-control" value={formData.github_url || ''} onChange={(e) => setFormData({...formData, github_url: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Live Demo URL</label>
                <input className="form-control" value={formData.live_demo_url || ''} onChange={(e) => setFormData({...formData, live_demo_url: e.target.value})} />
              </div>
            </div>
          </>
        );

      case 'experience':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Company / Organization *</label>
              <input className="form-control" required value={formData.company_name || ''} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Role Title *</label>
              <input className="form-control" required value={formData.role_title || ''} onChange={(e) => setFormData({...formData, role_title: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select className="form-control" value={formData.employment_type || 'Internship'} onChange={(e) => setFormData({...formData, employment_type: e.target.value})}>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="Seattle, WA / Remote" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-control" placeholder="Jun 2024" value={formData.start_date || ''} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-control" placeholder="Aug 2024" value={formData.end_date || ''} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Responsibilities & Achievements</label>
              <textarea className="form-control" rows={4} value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </>
        );

      case 'certifications':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Certification Title *</label>
              <input className="form-control" required value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Issuing Organization *</label>
              <input className="form-control" required value={formData.issuing_organization || ''} onChange={(e) => setFormData({...formData, issuing_organization: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input className="form-control" placeholder="May 2024" value={formData.issue_date || ''} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Credential ID</label>
                <input className="form-control" value={formData.credential_id || ''} onChange={(e) => setFormData({...formData, credential_id: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Verification URL</label>
              <input className="form-control" value={formData.credential_url || ''} onChange={(e) => setFormData({...formData, credential_url: e.target.value})} />
            </div>
          </>
        );

      default:
        // Generic fallback form
        return (
          <>
            <div className="form-group">
              <label className="form-label">Title / Name *</label>
              <input className="form-control" required value={formData.title || formData.activity_name || formData.language || ''} onChange={(e) => {
                const key = activeCategory === 'languages' ? 'language' : (activeCategory === 'extracurriculars' ? 'activity_name' : 'title');
                setFormData({...formData, [key]: e.target.value});
              }} />
            </div>
            <div className="form-group">
              <label className="form-label">Details / Description</label>
              <textarea className="form-control" rows={3} value={formData.description || formData.proficiency || ''} onChange={(e) => {
                const key = activeCategory === 'languages' ? 'proficiency' : 'description';
                setFormData({...formData, [key]: e.target.value});
              }} />
            </div>
          </>
        );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Portfolio Database Manager</h2>
          <p className="page-subtitle">
            Manage verified credentials, achievements, and technical records stored in SQLite.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Entry</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={14} />
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading records...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No records in this category. Click "Add New Entry" to create one.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Primary Field</th>
                  <th>Secondary Info</th>
                  <th>Details</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const title = rec.title || rec.full_name || rec.name || rec.institution || rec.company_name || rec.activity_name || rec.language;
                  const subtitle = rec.degree || rec.role_title || rec.issuing_organization || rec.category || rec.proficiency || rec.email || '';
                  const desc = rec.summary_text || rec.description || rec.tech_stack || rec.location || '';

                  return (
                    <tr key={rec.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        #{rec.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{title}</td>
                      <td>
                        <span className="badge badge-neutral">{subtitle}</span>
                      </td>
                      <td style={{ maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {desc}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ marginRight: '6px', padding: '4px 8px' }}
                          onClick={() => handleOpenEdit(rec)}
                          title="Edit record"
                        >
                          <Pencil size={13} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => handleDelete(rec.id)}
                          title="Delete record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        title={editingRecord ? `Edit Entry (#${editingRecord.id})` : `Add New ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          {renderFormFields()}
          <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingRecord ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

