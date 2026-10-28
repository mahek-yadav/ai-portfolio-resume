/**
 * api.js - Centralized API Service for communicating with Flask Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }
    return data;
  }
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response;
}

export const api = {
  // 1. Portfolio CRUD
  async getFullPortfolio() {
    const res = await fetch(`${API_BASE_URL}/portfolio`);
    return handleResponse(res);
  },

  async getPortfolioStats() {
    const res = await fetch(`${API_BASE_URL}/portfolio/stats`);
    return handleResponse(res);
  },

  async getCategoryRecords(category) {
    const res = await fetch(`${API_BASE_URL}/portfolio/${category}`);
    return handleResponse(res);
  },

  async createRecord(category, data) {
    const res = await fetch(`${API_BASE_URL}/portfolio/${category}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateRecord(category, id, data) {
    const res = await fetch(`${API_BASE_URL}/portfolio/${category}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteRecord(category, id) {
    const res = await fetch(`${API_BASE_URL}/portfolio/${category}/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE_URL}/portfolio/reset-demo`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // 2. Gemini AI
  async getAIStatus() {
    const res = await fetch(`${API_BASE_URL}/ai/status`);
    return handleResponse(res);
  },

  async structurePortfolio(rawText) {
    const res = await fetch(`${API_BASE_URL}/ai/structure-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText })
    });
    return handleResponse(res);
  },

  async commitStructuredData(items) {
    const res = await fetch(`${API_BASE_URL}/ai/commit-structured-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return handleResponse(res);
  },

  async analyzeJobDescription(jdText) {
    const res = await fetch(`${API_BASE_URL}/ai/analyze-jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd_text: jdText })
    });
    return handleResponse(res);
  },

  async matchPortfolio(jdAnalysis) {
    const res = await fetch(`${API_BASE_URL}/ai/match-portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd_analysis: jdAnalysis })
    });
    return handleResponse(res);
  },

  async improveSummary(currentSummary, selectedRecords, targetRole) {
    const res = await fetch(`${API_BASE_URL}/ai/improve-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_summary: currentSummary,
        selected_records: selectedRecords,
        target_role: targetRole
      })
    });
    return handleResponse(res);
  },

  // 3. Google Sheets
  async getSheetsStatus() {
    const res = await fetch(`${API_BASE_URL}/sheets/status`);
    return handleResponse(res);
  },

  async syncToSheets() {
    const res = await fetch(`${API_BASE_URL}/sheets/sync`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // 4. Resume Preview & PDF Generation
  async previewResume(selectedIds, customSummary, targetRole) {
    const res = await fetch(`${API_BASE_URL}/resume/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selected_ids: selectedIds,
        custom_summary: customSummary,
        target_role: targetRole
      })
    });
    return handleResponse(res);
  },

  async generateResumePdf(selectedIds, customSummary, targetRole) {
    const res = await fetch(`${API_BASE_URL}/resume/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selected_ids: selectedIds,
        custom_summary: customSummary,
        target_role: targetRole
      })
    });
    return handleResponse(res);
  },

  getDownloadUrl(filename) {
    return `${API_BASE_URL}/resume/download/${filename}`;
  }
};
