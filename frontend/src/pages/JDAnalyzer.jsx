import React, { useState } from 'react';
import { api } from '../services/api';
import { FileSearch, Sparkles, CheckCircle, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

const SAMPLE_ML_JD = `Job Title: Machine Learning Engineering Intern
Company: DataNova Technologies (Sample Job Posting)
Location: Seattle, WA / Hybrid

About the Role:
DataNova is seeking an enthusiastic Machine Learning Engineering Intern to join our Predictive Systems team. Build, benchmark, and deploy predictive models using tabular and time-series datasets.

Key Responsibilities:
- Design, implement, and validate machine learning pipelines in Python using Scikit-Learn and PyTorch.
- Conduct exploratory data analysis (EDA), data cleaning, feature engineering, and outlier detection with Pandas and NumPy.
- Benchmark classification and regression algorithms, evaluating precision, recall, F1-score, and R² metrics.
- Assist in containerizing model inference services and integrating REST APIs with Flask.
- Document experimental findings and comparative performance benchmarks.

Qualifications & Requirements:
- Currently pursuing a Bachelor's degree in Computer Science, Data Science, or related STEM field.
- Strong programming fundamentals in Python and proficiency with SQL for data extraction.
- Hands-on project experience in Machine Learning, Statistical Modeling, and Data Analysis.
- Familiarity with core ML libraries: Scikit-Learn, Pandas, NumPy, and Matplotlib.
- Experience with deep learning frameworks like PyTorch is a plus.
- Solid understanding of Git version control and collaborative development.`;

const SAMPLE_FE_JD = `Job Title: Frontend Developer Intern
Company: PixelPulse Interactive (Sample Job Posting)
Location: Remote / Flexible

About the Role:
PixelPulse Interactive is looking for a creative, detail-oriented Frontend Developer Intern to join our web applications team. You will craft modular, high-performance UI components using React.js.

Key Responsibilities:
- Build responsive, interactive user interfaces using React.js, modern JavaScript (ES6+), HTML5, and CSS3.
- Develop reusable, accessible UI component libraries utilizing CSS Flexbox and Grid layouts.
- Integrate frontend client interfaces with backend RESTful APIs and handle asynchronous data loading states.
- Ensure cross-browser compatibility, mobile responsiveness, and adhere to WCAG AA accessibility standards.
- Write clean, maintainable code with Git version control and GitHub pull request reviews.

Qualifications & Requirements:
- Currently pursuing a degree in Computer Science, Software Engineering, or equivalent.
- Strong proficiency in JavaScript (ES6+), HTML5, and CSS3 (Flexbox, Grid).
- Practical experience building component-driven single-page applications with React.js and Vite.
- Understanding of state management, REST API consumption, and browser developer tools.
- Experience with responsive design principles and mobile-first layouts.`;

export default function JDAnalyzer({ notify, onTransferToResumeBuilder }) {
  const [jdText, setJdText] = useState(SAMPLE_ML_JD);
  const [loading, setLoading] = useState(false);
  const [jdAnalysis, setJdAnalysis] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const handleAnalyzeAndMatch = async () => {
    if (!jdText.trim()) {
      notify('Please enter a Job Description.', 'warning');
      return;
    }
    setLoading(true);
    try {
      // 1. Analyze JD
      const analysisRes = await api.analyzeJobDescription(jdText);
      const analysis = analysisRes.analysis;
      setJdAnalysis(analysis);

      // 2. Match with portfolio
      const matchRes = await api.matchPortfolio(analysis);
      setMatchResult(matchRes.match);
      notify('Job Description successfully analyzed and matched!', 'success');
    } catch (err) {
      notify(`Analysis error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = () => {
    if (!jdAnalysis || !matchResult) return;
    onTransferToResumeBuilder({
      targetRole: jdAnalysis.job_title || 'Software Engineering Intern',
      jdAnalysis: jdAnalysis,
      matchResult: matchResult
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Job Description Analyzer & Portfolio Matcher</h2>
        <p className="page-subtitle">
          Paste a target job posting. Gemini extracts requirements, identifies matching skills, and pinpoints missing qualifications.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: jdAnalysis ? '1.1fr 1.3fr' : '1fr', gap: '20px' }}>
        {/* Input Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FileSearch size={18} color="#2563eb" />
              Target Job Posting
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setJdText(SAMPLE_ML_JD)}
              >
                Sample ML JD
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setJdText(SAMPLE_FE_JD)}
              >
                Sample Frontend JD
              </button>
            </div>
          </div>

          <div className="form-group">
            <textarea
              className="form-control"
              style={{ minHeight: '380px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste complete job description here..."
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleAnalyzeAndMatch}
            disabled={loading || !jdText.trim()}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Analyzing with Gemini & Matching...' : 'Analyze JD & Match Portfolio'}</span>
          </button>
        </div>

        {/* Results Column */}
        {jdAnalysis && matchResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Extracted Requirements */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{jdAnalysis.job_title}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {jdAnalysis.company_name} — {jdAnalysis.role_summary}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: matchResult.match_score > 70 ? '#10b981' : '#f59e0b' }}>
                    {matchResult.match_score}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Match Score
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Required Skills:
                </div>
                <div>
                  {jdAnalysis.required_technical_skills?.map((s, i) => (
                    <span key={i} className="tag-pill tag-match">{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Tools & Technologies:
                </div>
                <div>
                  {jdAnalysis.tools_and_technologies?.map((t, i) => (
                    <span key={i} className="tag-pill" style={{ background: '#f1f5f9', color: '#334155' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <b>Education Requirement:</b> {jdAnalysis.education_requirements}
              </div>
            </div>

            {/* Match Evaluation & Gap Analysis */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <CheckCircle size={18} color="#10b981" />
                  Portfolio Verification & Gap Analysis
                </h3>
              </div>

              {/* Matching Skills */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#065f46', marginBottom: '6px' }}>
                  ✓ Verified Matching Skills in Portfolio ({matchResult.matching_skills?.length || 0}):
                </div>
                <div>
                  {matchResult.matching_skills?.map((s, i) => (
                    <span key={i} className="tag-pill tag-match">{s}</span>
                  ))}
                </div>
              </div>

              {/* Missing Requirements */}
              {matchResult.missing_requirements?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#991b1b', marginBottom: '6px' }}>
                    ✗ Missing / Unverified in Candidate Records:
                  </div>
                  <div>
                    {matchResult.missing_requirements.map((m, i) => (
                      <span key={i} className="tag-pill tag-missing">{m}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Note: Never invent these skills on your resume. You can add genuine learning goals or coursework in your portfolio manager.
                  </div>
                </div>
              )}

              {/* Focus advice */}
              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe', fontSize: '0.84rem', marginBottom: '16px' }}>
                <b>Suggested Strategy:</b> {matchResult.suggested_resume_focus}
              </div>

              <button
                className="btn btn-success btn-lg"
                style={{ width: '100%' }}
                onClick={handleTransfer}
              >
                <span>Transfer Match to Resume Builder</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

