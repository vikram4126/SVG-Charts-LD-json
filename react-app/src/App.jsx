import React, { useState, useEffect, useRef } from 'react';
import {
  TEMPLATES,
  getSectors,
  getChartDetails,
  generateAemSnippetForReact
} from './chartEngine';

export default function App() {
  const [category, setCategory] = useState('mrp');
  const [templateId, setTemplateId] = useState('mrp_full_page');
  const [sector, setSector] = useState('Automotive');
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, html: '', x: 0, y: 0 });

  const sectors = getSectors();
  const currentTemplates = TEMPLATES[category] || [];
  const activeTemplate = currentTemplates.find(t => t.id === templateId) || currentTemplates[0];
  const effectiveTemplateId = activeTemplate ? activeTemplate.id : templateId;

  // Recalculate chart details
  const { title, subtitle, renderedHtml, templateObj } = getChartDetails(category, effectiveTemplateId, sector);
  const { snippet, schemaString } = generateAemSnippetForReact(renderedHtml, title, effectiveTemplateId, sector, templateObj);

  // When category changes, reset templateId to first of that category
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    const tmpls = TEMPLATES[newCat] || [];
    if (tmpls.length > 0) {
      setTemplateId(tmpls[0].id);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  const copyAemCode = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      showToast('Ready-to-use AEM HTML + Schema.org JSON-LD copied to clipboard!');
    });
  };

  const copySchemaOnly = () => {
    const script = `<script type="application/ld+json">\n${schemaString}\n</script>`;
    navigator.clipboard.writeText(script).then(() => {
      showToast('Complete Schema.org JSON-LD copied! Ready for validator.schema.org');
    });
  };

  const downloadSvg = () => {
    // Extract first SVG from rendered markup if present
    const match = renderedHtml.match(/<svg[\s\S]*?<\/svg>/);
    if (!match) {
      showToast('No standalone SVG found to download (this view is an HTML table).');
      return;
    }
    const blob = new Blob([match[0]], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateId}-${sector}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('SVG downloaded successfully!');
  };

  // Interactive Hover Tooltip Logic
  const handleStageMouseMove = (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      const tipHtml = target.getAttribute('data-tooltip');
      const tipW = 200;
      const tipH = 70;
      let left = e.clientX + 14;
      let top = e.clientY - tipH - 10;
      if (left + tipW > window.innerWidth - 12) {
        left = e.clientX - tipW - 14;
      }
      if (top < 10) {
        top = e.clientY + 18;
      }
      setTooltip({ visible: true, html: tipHtml, x: left, y: top });
    } else {
      if (tooltip.visible) {
        setTooltip({ visible: false, html: '', x: 0, y: 0 });
      }
    }
  };

  const handleStageMouseLeave = () => {
    setTooltip({ visible: false, html: '', x: 0, y: 0 });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-msg">
          {toastMessage}
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {tooltip.visible && (
        <div
          className="kpmg-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'none',
            display: 'block'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}

      {/* Small Centered Main Header */}
      <header className="app-header">
        <div className="header-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <h1 className="main-title">API to SVG+LD_Json</h1>
            <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
              REACT 19
            </span>
          </div>
        </div>
      </header>

      {/* Controls Panel */}
      <div className="control-panel-wrap">
        <div className="control-panel">
          <div className="selectors-row">
            {/* 1. Category */}
            <div className="control-group">
              <label htmlFor="categorySelect">1. Topic / API Category</label>
              <select
                id="categorySelect"
                className="styled-select"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="mrp">Market Risk Premium & Base Rate</option>
                <option value="cost_of_capital">Cost of Capital (WACC)</option>
                <option value="multiples">Valuation Multiples</option>
                <option value="country_risk">Country Risk Premium</option>
                <option value="overview">Overview Hub Dashboard</option>
              </select>
            </div>

            {/* 2. Template Style */}
            <div className="control-group" style={{ flex: 1.4 }}>
              <label htmlFor="templateSelect">2. Chart Template Style</label>
              <select
                id="templateSelect"
                className="styled-select"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                {currentTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Industry/Sector (when needed) */}
            {activeTemplate?.needsSector && (
              <div className="control-group" id="sectorControlGroup">
                <label htmlFor="industrySelect">3. Select Industry / Sector</label>
                <select
                  id="industrySelect"
                  className="styled-select"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Stage */}
      <main className="stage-wrap" style={{ flex: 1 }}>
        <div className="stage-card">
          <div className="stage-header">
            <div className="stage-title-wrap">
              <span className="tag-badge">
                {activeTemplate?.ep || '/Live'}
              </span>
              <div>
                <h2 className="stage-title" style={{ margin: 0, fontSize: '15px' }}>{title}</h2>
                <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>{subtitle}</div>
              </div>
            </div>

            <div className="stage-actions">
              <button className="btn btn-secondary" onClick={() => setShowCodeDrawer(!showCodeDrawer)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                {showCodeDrawer ? 'Hide Code' : 'View Code'}
              </button>
              <button className="btn btn-accent" onClick={copySchemaOnly}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                Copy JSON-LD
              </button>
              <button className="btn btn-secondary" onClick={downloadSvg} title="Download SVG graphic">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                SVG
              </button>
              <button className="btn btn-primary" onClick={copyAemCode}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                Copy AEM Code
              </button>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div
            className="stage-body"
            onMouseMove={handleStageMouseMove}
            onMouseLeave={handleStageMouseLeave}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />

          {/* Self-Contained AEM Snippet Drawer */}
          {showCodeDrawer && (
            <div className="code-drawer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #334155' }}>
                <span style={{ color: '#38BDF8', fontWeight: 700 }}>Self-Contained AEM Snippet with Full Schema.org JSON-LD Data</span>
                <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '11.5px' }} onClick={copyAemCode}>
                  Copy Code
                </button>
              </div>
              <pre><code>{snippet}</code></pre>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#94A3B8', borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        KPMG Atlas • React Chart Studio & Schema.org JSON-LD Dataset Generator
      </footer>
    </div>
  );
}
