/**
 * KPMG API Live Data Sync Script for React App
 * Usage: node sync.js [API_URL]
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.argv[2] || 'https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium';

const ENDPOINTS = [
  'WACC_Values',
  'WACC_Countries',
  'WACC_SubIndustries',
  'Multiples_Values',
  'Multiples_Countries',
  'Multiples_SubIndustries',
  'MRP_BZ',
  'BZ_CreditSpread',
  'LRP_AverageOverTime',
  'LRP_SelectedCountries',
  'LRP_AverageLRPs'
];

function fetchEndpoint(name) {
  const url = `${BASE_URL.replace(/\/+$/, '')}/${name}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log(`  ✓ ${name} fetched (${json.length || Object.keys(json).length} items)`);
          resolve({ name, data: json });
        } catch (e) {
          console.error(`  ✗ Error parsing ${name}:`, e.message);
          resolve({ name, data: null });
        }
      });
    }).on('error', (err) => {
      console.error(`  ✗ Network error on ${name}:`, err.message);
      resolve({ name, data: null });
    });
  });
}

async function runSync() {
  console.log(`\n========================================`);
  console.log(`🔄 Syncing Live Data from KPMG API for React App:`);
  console.log(`   ${BASE_URL}`);
  console.log(`========================================\n`);

  const dbPath = path.join(__dirname, 'src', 'data', 'kpmg_all_data.json');
  let currentDb = {};
  if (fs.existsSync(dbPath)) {
    try {
      currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch(e) {}
  }

  for (const ep of ENDPOINTS) {
    const res = await fetchEndpoint(ep);
    if (res.data) {
      currentDb[res.name] = res.data;
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf-8');
  console.log(`\n💾 Saved updated data to: ${dbPath}`);
  console.log(`✨ Vite will automatically hot-reload with fresh data!\n`);
}

runSync();
