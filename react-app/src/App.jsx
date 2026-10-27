import React, { useState, useEffect, useRef } from 'react';
import {
  TEMPLATES,
  getSectors,
  getChartDetails,
  generateAemSnippetForReact,
  convertSector,
  getDbMetadata,
  updateActiveDb,
  resetActiveDb
} from './chartEngine';
import { DEFAULT_BASE_URL, fetchAllEndpoints, ENDPOINTS } from './apiService';
import { generateLiveAemSnippet } from './liveAemEngine';

export default function App() {
  const [lang, setLang] = useState('EN');
  const [dataVersion, setDataVersion] = useState(0); // increments on data update
  const [category, setCategory] = useState('cost_of_capital');
  const [templateId, setTemplateId] = useState('wacc_full_grid');
  const [sector, setSector] = useState('Automotive');
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [codeTab, setCodeTab] = useState('pure'); // 'pure' | 'live' | 'static'
  const [toastMessage, setToastMessage] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, html: '', x: 0, y: 0, placement: 'right' });

  const meta = getDbMetadata();
  const [dataSourceMode, setDataSourceMode] = useState(meta?.isCustom ? 'custom' : 'default');
  const [customUrl, setCustomUrl] = useState(
    meta?.sourceUrl && meta.sourceUrl !== 'Default Bundled / Live API' && meta.sourceUrl !== 'Custom Live API'
      ? meta.sourceUrl
      : DEFAULT_BASE_URL
  );
  const [isFetching, setIsFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(null);
  const [fetchStatus, setFetchStatus] = useState(
    meta?.isCustom
      ? {
          type: 'success',
          text: lang === 'DE'
            ? `Live-Daten aktiv (${meta.sourceUrl || 'API'})`
            : `Live data active (${meta.sourceUrl || 'API'})`
        }
      : null
  );

  const sectors = getSectors(lang);
  const currentTemplates = TEMPLATES[category] || [];
  const activeTemplate = currentTemplates.find(t => t.id === templateId) || currentTemplates[0];
  const effectiveTemplateId = activeTemplate ? activeTemplate.id : templateId;

  // Recalculate chart details (automatically refreshes when dataVersion changes)
  const { title, subtitle, renderedHtml, templateObj } = getChartDetails(category, effectiveTemplateId, sector, lang);
  const { snippet, schemaString } = generateAemSnippetForReact(renderedHtml, title, effectiveTemplateId, sector, templateObj, lang);
  const liveSnippet = generateLiveAemSnippet({
    templateId: effectiveTemplateId,
    category,
    sector,
    lang,
    apiBaseUrl: customUrl || DEFAULT_BASE_URL,
    title,
    subtitle,
    renderedMarkup: renderedHtml,
    schemaString,
    templateObj,
    pureZeroStatic: false
  });
  const pureLiveSnippet = generateLiveAemSnippet({
    templateId: effectiveTemplateId,
    category,
    sector,
    lang,
    apiBaseUrl: customUrl || DEFAULT_BASE_URL,
    title,
    subtitle,
    renderedMarkup: null,
    schemaString: null,
    templateObj,
    pureZeroStatic: true
  });

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

  const handleDataSourceModeChange = (mode) => {
    setDataSourceMode(mode);
    if (mode === 'default') {
      if (meta?.isCustom) {
        resetActiveDb();
        setDataVersion(v => v + 1);
        setFetchStatus(null);
        showToast(lang === 'DE' ? 'Auf Standard-API zurückgesetzt' : 'Switched back to Default API');
      }
    }
  };

  const handleFetchAndApply = async () => {
    if (!customUrl.trim()) return;
    setIsFetching(true);
    setFetchProgress({ current: 0, total: ENDPOINTS.length });
    setFetchStatus({
      type: 'loading',
      text: lang === 'DE' ? 'Daten werden von der API abgerufen...' : 'Fetching live data from API...'
    });

    const result = await fetchAllEndpoints(customUrl.trim(), (prog) => {
      setFetchProgress({
        current: prog.index,
        total: prog.total,
        endpoint: prog.endpoint
      });
    });

    setIsFetching(false);

    if (result.endpointsFetched > 0) {
      updateActiveDb(result.data, customUrl.trim());
      setDataVersion(v => v + 1);
      setFetchStatus({
        type: 'success',
        text: lang === 'DE'
          ? `✓ ${result.endpointsFetched} von ${ENDPOINTS.length} Endpunkten erfolgreich geladen und aktiv!`
          : `✓ Successfully fetched & updated ${result.endpointsFetched} of ${ENDPOINTS.length} endpoints! Data is now live in charts.`
      });
      showToast(lang === 'DE' ? 'Diagramme mit Live-Daten aktualisiert!' : 'Charts updated with live data!');
    } else {
      setFetchStatus({
        type: 'error',
        text: lang === 'DE'
          ? 'Fehler beim Abrufen der API. Bitte URL überprüfen.'
          : 'Could not fetch data from this URL. Please check the URL and try again.'
      });
    }
  };

  const handleResetDefault = () => {
    resetActiveDb();
    setDataVersion(v => v + 1);
    setDataSourceMode('default');
    setCustomUrl(DEFAULT_BASE_URL);
    setFetchStatus(null);
    showToast(lang === 'DE' ? 'Standard-Daten wiederhergestellt' : 'Default dataset restored');
  };

  const copyAemCode = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      showToast('Static AEM HTML + Schema.org JSON-LD copied to clipboard!');
    });
  };

  const copyLiveAemCode = () => {
    navigator.clipboard.writeText(liveSnippet).then(() => {
      showToast(lang === 'DE'
        ? 'Live AEM-Code (Hybrid) kopiert! Sofort-Anzeige + Live-Sync.'
        : 'Live AEM Code (Hybrid) copied! Instant preview + live API auto-sync.');
    });
  };

  const copyPureLiveAemCode = () => {
    navigator.clipboard.writeText(pureLiveSnippet).then(() => {
      showToast(lang === 'DE'
        ? 'Pure Live AEM-Code kopiert! (100% Zero-Static, nur Spinner + API-Rendering).'
        : 'Pure Live AEM Code copied! (100% Zero-Static, clean spinner + dynamic API rendering).');
    });
  };

  const copySchemaOnly = () => {
    const script = `<script type="application/ld+json">\n${schemaString}\n</script>`;
    navigator.clipboard.writeText(script).then(() => {
      showToast('Complete Schema.org JSON-LD copied! Ready for validator.schema.org');
    });
  };

  const downloadSvg = () => {
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
        </div>
      </header>

      {/* Controls Panel */}
      <div className="control-panel-wrap">
        <div className="control-panel">
          {/* Data Source Radio Switcher & Inline URL Bar */}
          <div className="datasource-row">
            <div className="datasource-toggle-group">
              <span className="datasource-label">{lang === 'DE' ? 'Datenquelle:' : 'Data Source:'}</span>
              <div className="radio-segmented-wrap">
                <label className={`radio-segmented-btn ${dataSourceMode === 'default' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="dataSourceMode"
                    value="default"
                    checked={dataSourceMode === 'default'}
                    onChange={() => handleDataSourceModeChange('default')}
                  />
                  {lang === 'DE' ? 'Standard-API' : 'Default API'}
                </label>
                <label className={`radio-segmented-btn ${dataSourceMode === 'custom' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="dataSourceMode"
                    value="custom"
                    checked={dataSourceMode === 'custom'}
                    onChange={() => handleDataSourceModeChange('custom')}
                  />
                  {lang === 'DE' ? 'Benutzerdefinierte API-URL' : 'Custom API URL'}
                </label>
              </div>
            </div>

            {meta?.isCustom && (
              <div className="datasource-meta-tag">
                <span className="live-dot"></span>
                <span>{lang === 'DE' ? 'Live-Daten aktiv' : 'Live Data Active'}</span>
              </div>
            )}
          </div>

          {/* Inline Custom API URL Input Bar (appears when Custom URL radio is selected) */}
          {dataSourceMode === 'custom' && (
            <div className="custom-url-box">
              <div className="custom-url-input-row">
                <div className="custom-url-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                  <input
                    type="text"
                    placeholder={lang === 'DE' ? 'API-Basis-URL eingeben (z.B. https://live.kpmg-apps.de/...)' : 'Enter API Base URL (e.g. https://live.kpmg-apps.de/...)'}
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    disabled={isFetching}
                  />
                </div>
                <button
                  type="button"
                  className="btn-fetch-update"
                  onClick={handleFetchAndApply}
                  disabled={isFetching || !customUrl.trim()}
                >
                  {isFetching ? (
                    <>
                      <span className="inline-spinner"></span>
                      {lang === 'DE' ? `Laden (${fetchProgress?.current || 0}/${fetchProgress?.total || 11})...` : `Fetching (${fetchProgress?.current || 0}/${fetchProgress?.total || 11})...`}
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      {lang === 'DE' ? 'Daten abrufen & aktualisieren' : 'Fetch & Update Data'}
                    </>
                  )}
                </button>
                {meta?.isCustom && (
                  <button
                    type="button"
                    className="btn-reset-default"
                    onClick={handleResetDefault}
                    disabled={isFetching}
                    title={lang === 'DE' ? 'Auf Standarddaten zurücksetzen' : 'Reset to default bundled data'}
                  >
                    {lang === 'DE' ? 'Zurücksetzen' : 'Reset'}
                  </button>
                )}
              </div>

              {fetchStatus && (
                <div className={`custom-url-status-badge ${fetchStatus.type}`}>
                  {fetchStatus.type === 'loading' && <span className="inline-spinner small"></span>}
                  {fetchStatus.text}
                </div>
              )}
            </div>
          )}

          {/* Controls Row: Language, Category, Template, Sector */}
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
              <button className="btn btn-secondary" onClick={() => setShowCodeDrawer(!showCodeDrawer)} title={showCodeDrawer ? 'Hide code drawer' : 'View code drawer'}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                {showCodeDrawer ? 'Hide' : 'Code'}
              </button>
              <button className="btn btn-accent" onClick={copySchemaOnly} title="Copy Schema.org JSON-LD">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                JSON-LD
              </button>
              <button className="btn btn-secondary" onClick={downloadSvg} title="Download SVG graphic">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                SVG
              </button>
              <button className="btn btn-secondary" onClick={copyAemCode} title={lang === 'DE' ? 'Statisches AEM-Snapshot kopieren (ohne API-Aktualisierung)' : 'Copy static offline AEM snapshot (fixed numbers)'}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                {lang === 'DE' ? 'Statisch' : 'Static'}
              </button>
              <button className="btn btn-live-aem" onClick={copyLiveAemCode} title={lang === 'DE' ? 'Live-AEM (Hybrid): Sofort-Anzeige + Live-API-Sync' : 'Live AEM (Hybrid): Instant preview + live API auto-sync'}>
                {lang === 'DE' ? 'Live' : 'Live'}
              </button>
              <button className="btn btn-pure-live" onClick={copyPureLiveAemCode} title={lang === 'DE' ? 'Pure Live (Zero-Static): Nur Spinner, 100% dynamisch per API' : 'Pure Live (Zero-Static): Clean spinner, 100% dynamic via API'}>
                {lang === 'DE' ? 'Pure Live' : 'Pure Live'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #334155', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    type="button" 
                    className={`drawer-tab-btn ${codeTab === 'pure' ? 'active' : ''}`}
                    onClick={() => setCodeTab('pure')}
                  >
                    ● Pure Live (Zero-Static)
                  </button>
                  <button 
                    type="button" 
                    className={`drawer-tab-btn ${codeTab === 'live' ? 'active' : ''}`}
                    onClick={() => setCodeTab('live')}
                  >
                    ● Live AEM (Hybrid)
                  </button>
                  <button 
                    type="button" 
                    className={`drawer-tab-btn ${codeTab === 'static' ? 'active' : ''}`}
                    onClick={() => setCodeTab('static')}
                  >
                    Static AEM
                  </button>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '4px 12px', fontSize: '11.5px' }} 
                  onClick={codeTab === 'pure' ? copyPureLiveAemCode : (codeTab === 'live' ? copyLiveAemCode : copyAemCode)}
                >
                  {codeTab === 'pure' ? 'Copy Pure Live Code' : (codeTab === 'live' ? 'Copy Live AEM Code' : 'Copy Static AEM Code')}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
                {codeTab === 'pure' && '⚡ Pure Live Mode (100% Zero-Static): Contains clean spinner placeholder. Zero baked HTML rows or SVG points. SVG, Table & Schema.org JSON-LD are 100% computed from live API on page load!'}
                {codeTab === 'live' && '⚡ Live AEM Mode (Hybrid): Instant 0ms display with fallback markup + background live API refresh whenever visitors open the page.'}
                {codeTab === 'static' && '📄 Static Mode: Instant snapshot with hardcoded SVG and Schema.org dataset without auto-syncing.'}
              </div>
              <pre><code>{codeTab === 'pure' ? pureLiveSnippet : (codeTab === 'live' ? liveSnippet : snippet)}</code></pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
