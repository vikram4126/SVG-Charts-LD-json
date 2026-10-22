import React, { useState } from 'react';
import {
  ENDPOINTS,
  ENDPOINT_DESCRIPTIONS,
  DEFAULT_BASE_URL,
  fetchAllEndpoints,
  validateDatabaseJson
} from './apiService';
import {
  getActiveDb,
  getDbMetadata,
  updateActiveDb,
  resetActiveDb
} from './chartEngine';

export default function ApiSettingsPage({ onBackToStudio, onDataUpdated, lang = 'EN' }) {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [pastedJson, setPastedJson] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  const db = getActiveDb();
  const meta = getDbMetadata();

  const isDE = lang === 'DE';

  const handleFetchAll = async () => {
    if (!baseUrl.trim()) {
      setStatusMessage({ type: 'error', text: isDE ? 'Bitte geben Sie eine gültige API-URL ein.' : 'Please enter a valid API URL.' });
      return;
    }

    setIsSyncing(true);
    setSyncLogs([]);
    setSyncProgress({ current: 0, total: ENDPOINTS.length, endpoint: 'Initializing...' });
    setStatusMessage(null);

    const logs = [];
    const addLog = (msg) => {
      logs.push(msg);
      setSyncLogs([...logs]);
    };

    addLog(`[${new Date().toLocaleTimeString()}] Starting sync from: ${baseUrl.trim()}`);

    const result = await fetchAllEndpoints(baseUrl, (prog) => {
      setSyncProgress({
        current: prog.index,
        total: prog.total,
        endpoint: prog.endpoint
      });

      if (prog.status === 'fetching') {
        addLog(`→ Fetching ${prog.endpoint}...`);
      } else if (prog.status === 'success') {
        addLog(`✓ ${prog.endpoint}: Loaded ${prog.count} records (${prog.method})`);
      } else if (prog.status === 'error') {
        addLog(`✗ ${prog.endpoint}: Error - ${prog.error}`);
      }
    });

    setIsSyncing(false);

    if (result.endpointsFetched > 0) {
      updateActiveDb(result.data, baseUrl.trim());
      onDataUpdated();
      setStatusMessage({
        type: 'success',
        text: isDE
          ? `Erfolgreich ${result.endpointsFetched} von ${ENDPOINTS.length} Endpunkten aktualisiert! Daten sind jetzt aktiv.`
          : `Successfully updated ${result.endpointsFetched} of ${ENDPOINTS.length} endpoints! Data is now active in charts.`
      });
      addLog(`[${new Date().toLocaleTimeString()}] Sync completed. ${result.endpointsFetched} endpoints saved to local storage.`);
    } else {
      setStatusMessage({
        type: 'error',
        text: isDE
          ? 'Keine Daten konnten abgerufen werden. Prüfen Sie die URL oder nutzen Sie die JSON-Eingabe unten.'
          : 'Could not fetch data. Check the URL or use the JSON Paste/Upload option below.'
      });
    }
  };

  const handleApplyPastedJson = () => {
    setJsonError('');
    if (!pastedJson.trim()) {
      setJsonError(isDE ? 'Bitte JSON-Inhalt einfügen.' : 'Please paste JSON content.');
      return;
    }

    try {
      const parsed = JSON.parse(pastedJson);
      const validation = validateDatabaseJson(parsed);

      if (!validation.valid) {
        setJsonError(validation.error);
        return;
      }

      if (validation.isFullDb) {
        updateActiveDb(parsed, 'Pasted JSON');
        onDataUpdated();
        setStatusMessage({
          type: 'success',
          text: isDE
            ? `Vollständige Datenbank aktualisiert (${validation.matchedEndpoints.length} Endpunkte erkannt)!`
            : `Full database updated (${validation.matchedEndpoints.length} endpoints detected)!`
        });
        setPastedJson('');
      } else if (validation.isSingleEndpoint) {
        setJsonError(
          isDE
            ? 'Ein einzelnes Array wurde erkannt. Bitte fügen Sie ein vollständiges Objekt mit Endpunkt-Schlüsseln ein (z. B. {"WACC_Values": [...]})'
            : 'Single array detected. Please wrap with endpoint key (e.g. {"WACC_Values": [...]}) or paste full database object.'
        );
      }
    } catch (e) {
      setJsonError(isDE ? `Ungültiges JSON: ${e.message}` : `Invalid JSON: ${e.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const validation = validateDatabaseJson(parsed);
        if (!validation.valid) {
          setJsonError(validation.error);
          return;
        }
        updateActiveDb(parsed, file.name);
        onDataUpdated();
        setStatusMessage({
          type: 'success',
          text: isDE
            ? `Datei "${file.name}" erfolgreich importiert und angewendet!`
            : `File "${file.name}" successfully imported and applied!`
        });
      } catch (err) {
        setJsonError(`Error parsing file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (window.confirm(isDE ? 'Möchten Sie wirklich auf die KPMG-Standarddaten zurücksetzen?' : 'Reset to default KPMG dataset? Custom changes will be removed.')) {
      resetActiveDb();
      onDataUpdated();
      setStatusMessage({
        type: 'info',
        text: isDE ? 'Standard-Datenbank wiederhergestellt.' : 'Default factory dataset restored.'
      });
      setSyncLogs([]);
    }
  };

  const handleExportJson = () => {
    const activeData = getActiveDb();
    const blob = new Blob([JSON.stringify(activeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpmg_all_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #DDE2E6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#00338D', margin: 0 }}>
            {isDE ? '⚙️ Benutzerdefinierte API & Datenverwaltung' : '⚙️ Custom API & Live Data Management'}
          </h2>
          <p style={{ fontSize: '12.5px', color: '#666666', margin: '3px 0 0' }}>
            {isDE
              ? 'Konfigurieren Sie neue API-Endpunkte, aktualisieren Sie Daten live oder importieren Sie benutzerdefinierte JSON-Datensätze.'
              : 'Configure custom API endpoints, sync live data, or import JSON datasets to update all charts dynamically.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBackToStudio}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            {isDE ? 'Zurück zu den Diagrammen' : 'Back to Chart Studio'}
          </button>
        </div>
      </div>

      {/* Global Status Alert Banner */}
      {statusMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: statusMessage.type === 'success' ? '#ECFDF5' : statusMessage.type === 'error' ? '#FEF2F2' : '#EFF6FF',
          border: `1px solid ${statusMessage.type === 'success' ? '#10B981' : statusMessage.type === 'error' ? '#EF4444' : '#3B82F6'}`,
          color: statusMessage.type === 'success' ? '#065F46' : statusMessage.type === 'error' ? '#991B1B' : '#1E40AF'
        }}>
          <span>{statusMessage.type === 'success' ? '✓' : statusMessage.type === 'error' ? '⚠' : 'ℹ'}</span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid of Two Columns: Live API Connection & Direct JSON Upload */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 540px), 1fr))', gap: '24px' }}>
        
        {/* Card 1: Custom API Live Sync */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #DDE2E6', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#00338D', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" fill="none" stroke="#00338D" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              {isDE ? '1. Live API-URL Verbindung' : '1. Connect via Custom API URL'}
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '12px',
              fontWeight: 600,
              background: meta.isCustom ? '#DEF7EC' : '#F3F4F6',
              color: meta.isCustom ? '#03543F' : '#4B5563'
            }}>
              {meta.isCustom ? (isDE ? '● Benutzerdefiniert aktiv' : '● Custom Data Active') : (isDE ? '● Standard-Daten' : '● Default Data')}
            </span>
          </div>

          <p style={{ fontSize: '12px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
            {isDE
              ? 'Geben Sie die Basis-URL Ihrer neuen API ein. Das Tool ruft alle 11 Endpunkte (/WACC_Values, /MRP_BZ usw.) ab und aktualisiert alle Diagramme sofort.'
              : 'Enter the Base URL of your new API. The studio will fetch all 11 endpoints (/WACC_Values, /MRP_BZ, etc.) and update all charts immediately.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#666666', letterSpacing: '0.5px' }}>
              {isDE ? 'API-Basis-URL' : 'API Base URL'}
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleFetchAll}
              disabled={isSyncing}
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isSyncing ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
                  {isDE ? 'Lade Daten herunter...' : 'Fetching Live Data...'}
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  {isDE ? 'Alle Endpunkte abrufen & aktualisieren' : 'Fetch & Update All Endpoints'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setBaseUrl(DEFAULT_BASE_URL)}
              className="btn btn-secondary"
              title="Reset URL to default KPMG Freemium API"
              style={{ fontSize: '12px', padding: '10px 14px' }}
            >
              {isDE ? 'Standard-URL' : 'Default URL'}
            </button>
          </div>

          {/* Progress Bar when syncing */}
          {syncProgress && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666666' }}>
                <span>{isDE ? 'Fortschritt' : 'Progress'}: {syncProgress.current} / {syncProgress.total}</span>
                <span style={{ fontWeight: 600 }}>{syncProgress.endpoint}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%`, height: '100%', background: '#00338D', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          {/* Live Sync Console Logs */}
          {syncLogs.length > 0 && (
            <div style={{
              background: '#0F172A',
              color: '#38BDF8',
              padding: '12px',
              borderRadius: '6px',
              fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
              fontSize: '11.5px',
              maxHeight: '160px',
              overflowY: 'auto',
              lineHeight: 1.5
            }}>
              {syncLogs.map((log, idx) => (
                <div key={idx} style={{ color: log.startsWith('✓') ? '#34D399' : log.startsWith('✗') ? '#F87171' : '#E2E8F0' }}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: JSON File Upload & Direct Paste (Guaranteed 100% Fail-Safe) */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #DDE2E6', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#00338D', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" fill="none" stroke="#00338D" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            {isDE ? '2. JSON-Datei hochladen oder einfügen' : '2. Upload or Paste JSON (100% Offline / No-CORS)'}
          </h3>

          <p style={{ fontSize: '12px', color: '#666666', lineHeight: 1.5, margin: 0 }}>
            {isDE
              ? 'Falls Ihre Firmen-Firewall oder Ihr Netzwerk externe Browser-Aufrufe blockiert, können Sie Ihre JSON-Datei hier direkt hochladen oder den JSON-Code einfügen.'
              : 'If your corporate network or API has strict CORS policies, you can directly upload a JSON database file or paste the raw JSON text below.'}
          </p>

          {/* File Upload Zone */}
          <div style={{
            border: '2px dashed #CBD5E1',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            background: '#F8FAFC',
            position: 'relative',
            cursor: 'pointer'
          }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <svg width="22" height="22" fill="none" stroke="#666666" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#00338D' }}>
                {isDE ? 'Klicken oder .json-Datei hierher ziehen' : 'Click or drop .json database file here'}
              </span>
              <span style={{ fontSize: '11px', color: '#888888' }}>
                {isDE ? 'Unterstützt kpmg_all_data.json' : 'Supports kpmg_all_data.json structure'}
              </span>
            </div>
          </div>

          {/* Paste JSON Text Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#666666', letterSpacing: '0.5px' }}>
              {isDE ? 'Oder JSON hier einfügen' : 'Or Paste JSON Data Here'}
            </label>
            <textarea
              rows={4}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder='{ "WACC_Values": [ ... ], "Multiples_Values": [ ... ] }'
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '11.5px',
                fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {jsonError && (
            <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: 500 }}>
              ⚠ {jsonError}
            </div>
          )}

          <button
            type="button"
            onClick={handleApplyPastedJson}
            className="btn btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            {isDE ? 'Eingefügtes JSON anwenden' : 'Validate & Apply Pasted JSON'}
          </button>
        </div>
      </div>

      {/* Card 3: Endpoints Table & Status Inspector */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #DDE2E6', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#00338D', margin: 0 }}>
              {isDE ? 'Aktiver Datenstatus & Endpunkt-Übersicht' : 'Active Dataset & Endpoint Records'}
            </h3>
            <p style={{ fontSize: '12px', color: '#666666', margin: '3px 0 0' }}>
              {meta.isCustom
                ? (isDE ? `Quelle: ${meta.sourceUrl} (Zuletzt aktualisiert: ${new Date(meta.updatedAt).toLocaleString()})` : `Source: ${meta.sourceUrl} (Updated: ${new Date(meta.updatedAt).toLocaleString()})`)
                : (isDE ? 'Quelle: KPMG Standard Freemium Cache' : 'Source: KPMG Default Freemium Cache')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleExportJson}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              {isDE ? 'Daten herunterladen (JSON)' : 'Download Dataset (JSON)'}
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px', color: '#DC2626' }}
            >
              {isDE ? 'Auf Standard zurücksetzen' : 'Reset to Default'}
            </button>
          </div>
        </div>

        {/* Endpoints Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="kpmg-table" style={{ width: '100%', fontSize: '12.5px' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '220px' }}>{isDE ? 'Endpunkt' : 'Endpoint Name'}</th>
                <th>{isDE ? 'Beschreibung' : 'Description'}</th>
                <th style={{ width: '120px', textAlign: 'right' }}>{isDE ? 'Einträge' : 'Records'}</th>
                <th style={{ width: '100px', textAlign: 'center' }}>{isDE ? 'Status' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep, idx) => {
                const count = Array.isArray(db[ep]) ? db[ep].length : 0;
                return (
                  <tr key={ep}>
                    <td style={{ color: '#888' }}>{idx + 1}</td>
                    <td style={{ fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace', fontWeight: 600, color: '#00338D' }}>
                      /{ep}
                    </td>
                    <td style={{ color: '#666666' }}>{ENDPOINT_DESCRIPTIONS[ep]}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#333333' }}>
                      {count.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: count > 0 ? '#DEF7EC' : '#FEE2E2',
                        color: count > 0 ? '#03543F' : '#991B1B'
                      }}>
                        {count > 0 ? '✓ Ready' : 'Empty'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
