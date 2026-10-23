import { generateLiveAemSnippet } from '../src/liveAemEngine.js';
import fs from 'fs';
import path from 'path';

const snippet1 = generateLiveAemSnippet({
  templateId: 'wacc_band_over_time',
  category: 'cost_of_capital',
  sector: 'Automotive',
  lang: 'EN',
  apiBaseUrl: 'https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium',
  title: 'Automotive - WACC Over Time'
});

const snippet2 = generateLiveAemSnippet({
  templateId: 'wacc_countries_table',
  category: 'cost_of_capital',
  sector: 'Automotive',
  lang: 'EN',
  apiBaseUrl: 'https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium',
  title: 'Automotive - Origin of Companies'
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AEM Multi-Chart Live Embed Test Page (100% Dynamic API)</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: Inter, Arial, sans-serif;
      background: #F8FAFC;
      color: #1E293B;
      margin: 0;
      padding: 30px 20px;
    }
    .aem-page-container {
      max-width: 1000px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      padding: 36px 40px;
    }
    .aem-header-banner {
      border-bottom: 2px solid #00338D;
      padding-bottom: 16px;
      margin-bottom: 32px;
    }
    .aem-header-banner h1 {
      font-size: 24px;
      font-weight: 700;
      color: #00338D;
      margin: 0 0 8px 0;
    }
    .aem-header-banner p {
      font-size: 13.5px;
      color: #64748B;
      margin: 0;
      line-height: 1.5;
    }
    .aem-component-slot {
      margin-bottom: 40px;
      border: 1px dashed #CBD5E1;
      padding: 24px;
      border-radius: 8px;
      background: #FFFFFF;
    }
    .aem-slot-label {
      font-size: 11px;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  </style>
</head>
<body>

  <div class="aem-page-container">
    <div class="aem-header-banner">
      <h1>AEM Page Simulation: 100% Dynamic Live KPMG Atlas Charts</h1>
      <p>Demonstrating multiple dynamic self-contained chart snippets pasted on the same AEM page. <strong>Zero static rows or numbers are hardcoded</strong>. Each component fetches live data directly from the KPMG API and renders on-the-fly!</p>
    </div>

    <!-- AEM Embed Component Slot 1: Chart 1 -->
    <div class="aem-component-slot">
      <div class="aem-slot-label">📦 AEM Component 1: WACC Band Over Time (Automotive)</div>
      ${snippet1}
    </div>

    <!-- AEM Embed Component Slot 2: Chart 2 -->
    <div class="aem-component-slot">
      <div class="aem-slot-label">📦 AEM Component 2: Origin of Companies Table (Automotive)</div>
      ${snippet2}
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(path.resolve('../test-aem-live.html'), html);
fs.writeFileSync(path.resolve('./public/test-aem-live.html'), html);
console.log('Successfully regenerated test-aem-live.html with 100% dynamic snippets!');
