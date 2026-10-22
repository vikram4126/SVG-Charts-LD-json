import React, { useState, useEffect, useRef } from 'react';
import {
  TEMPLATES,
  getSectors,
  getChartDetails,
  generateAemSnippetForReact,
  convertSector,
  getDbMetadata
} from './chartEngine';
import ApiSettingsPage from './ApiSettingsPage';

export default function App() {
  const [lang, setLang] = useState('EN');
  const [activeView, setActiveView] = useState('studio'); // 'studio' | 'api_settings'
  const [dataVersion, setDataVersion] = useState(0); // increments on data update
  const [category, setCategory] = useState('cost_of_capital');
  const [templateId, setTemplateId] = useState('wacc_full_grid');
  const [sector, setSector] = useState('Automotive');
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, html: '', x: 0, y: 0, placement: 'right' });

  const meta = getDbMetadata();
  const sectors = getSectors(lang);
  const currentTemplates = TEMPLATES[category] || [];
  const activeTemplate = currentTemplates.find(t => t.id === templateId) || currentTemplates[0];
  const effectiveTemplateId = activeTemplate ? activeTemplate.id : templateId;

  // Recalculate chart details (automatically refreshes when dataVersion changes)
  const { title, subtitle, renderedHtml, templateObj } = getChartDetails(category, effectiveTemplateId, sector, lang);
  const { snippet, schemaString } = generateAemSnippetForReact(renderedHtml, title, effectiveTemplateId, sector, templateObj, lang);

  const handleLangChange = (newLang) => {
    if (newLang === lang) return;
    setLang(newLang);
    setSector(convertSector(sector, newLang));
  };

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
      const tipW = 210;
      const tipH = 65;
      let left = e.clientX + 14;
      let placement = 'right';
      if (left + tipW > window.innerWidth - 12) {
        left = e.clientX - tipW - 14;
        placement = 'left';
      }
      let top = e.clientY - tipH / 2;
      if (top < 10) top = 10;
      if (top + tipH > window.innerHeight - 10) {
        top = window.innerHeight - tipH - 10;
      }
      setTooltip({ visible: true, html: tipHtml, x: left, y: top, placement });
    } else {
      if (tooltip.visible) {
        setTooltip({ visible: false, html: '', x: 0, y: 0, placement: 'right' });
      }
    }
  };

  const handleStageMouseLeave = () => {
    setTooltip({ visible: false, html: '', x: 0, y: 0, placement: 'right' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-msg">
          {toastMessage}
        </div>
      )}

      {/* Floating Hover Tooltip with Vertically Centered Triangle */}
      {tooltip.visible && (
        <div
          className={`kpmg-tooltip ${tooltip.placement === 'left' ? 'arrow-right' : 'arrow-left'}`}
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
          <h1 className="main-title">API to SVG+LD_Json</h1>
          <div className="header-nav">
            <button
              type="button"
              className={`nav-tab-btn ${activeView === 'studio' ? 'active' : ''}`}
              onClick={() => setActiveView('studio')}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              {lang === 'DE' ? 'Diagramm-Studio' : 'Chart Studio'}
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeView === 'api_settings' ? 'active' : ''}`}
              onClick={() => setActiveView('api_settings')}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {lang === 'DE' ? 'Benutzerdefinierte API & Daten' : 'Custom API & Data'}
            </button>
            {meta?.isCustom && (
              <span
                className="custom-status-pill"
                onClick={() => setActiveView('api_settings')}
                title={lang === 'DE' ? 'Klicken, um benutzerdefinierte API-Einstellungen zu öffnen' : 'Click to manage custom data'}
              >
                ● {lang === 'DE' ? 'Benutzerdefinierte Daten aktiv' : 'Custom Data Active'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* View 1: Custom API & Data Management Page */}
      {activeView === 'api_settings' && (
        <main style={{ flex: 1 }}>
          <ApiSettingsPage
            onBackToStudio={() => setActiveView('studio')}
            onDataUpdated={() => {
              setDataVersion(v => v + 1);
              showToast(lang === 'DE' ? 'Diagramme mit neuen Daten aktualisiert!' : 'Charts updated with new live data!');
            }}
            lang={lang}
          />
        </main>
      )}

      {/* View 2: Chart Studio (Controls Panel & Interactive Stage) */}
      {activeView === 'studio' && (
        <>
          {/* Controls Panel */}
          <div className="control-panel-wrap">
            <div className="control-panel">
              <div className="selectors-row">
                {/* Language Toggle */}
                <div className="control-group" style={{ flex: '0 0 auto', minWidth: 'auto' }}>
                  <label>Language</label>
                  <div className="lang-toggle-wrap">
                    <button
                      type="button"
                      className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}
                      onClick={() => handleLangChange('EN')}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      className={`lang-btn ${lang === 'DE' ? 'active' : ''}`}
                      onClick={() => handleLangChange('DE')}
                    >
                      DE
                    </button>
                  </div>
                </div>

                {/* 1. Category */}
                <div className="control-group">
                  <label htmlFor="categorySelect">{lang === 'DE' ? '1. Thema / API-Kategorie' : '1. Topic / API Category'}</label>
                  <select
                    id="categorySelect"
                    className="styled-select"
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    <option value="cost_of_capital">{lang === 'DE' ? 'Kapitalkosten (WACC)' : 'Cost of Capital (WACC)'}</option>
                    <option value="multiples">{lang === 'DE' ? 'Bewertungsmultiplikatoren' : 'Valuation Multiples'}</option>
                    <option value="mrp">{lang === 'DE' ? 'Marktrisikoprämie & Basiszinssatz' : 'Market Risk Premium & Base Rate'}</option>
                    <option value="country_risk">{lang === 'DE' ? 'Länderrisikoprämie' : 'Country Risk Premium'}</option>
                    <option value="overview">{lang === 'DE' ? 'Gesamtübersicht-Dashboard' : 'Overview Hub Dashboard'}</option>
                  </select>
                </div>

                {/* 2. Template Style */}
                <div className="control-group" style={{ flex: 1.4 }}>
                  <label htmlFor="templateSelect">{lang === 'DE' ? '2. Diagramm-Vorlage' : '2. Chart Template Style'}</label>
                  <select
                    id="templateSelect"
                    className="styled-select"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                  >
                    {currentTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {lang === 'DE' ? (t.nameDE || t.name) : t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Industry/Sector (when needed) */}
                {activeTemplate?.needsSector && (
                  <div className="control-group" id="sectorControlGroup">
                    <label htmlFor="industrySelect">{lang === 'DE' ? '3. Branche / Sektor wählen' : '3. Select Industry / Sector'}</label>
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
        </>
      )}

      </div>
  );
}
