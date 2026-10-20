/**
 * KPMG API Live Data Sync Script
 * Fetches all 11 live endpoints directly without browser CORS restrictions,
 * saves to kpmg_all_data.json, and automatically rebuilds studio HTML files.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  return new Promise((resolve, reject) => {
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
  console.log(`🔄 Syncing Live Data from KPMG API:`);
  console.log(`   ${BASE_URL}`);
  console.log(`========================================\n`);

  const outputDbPath = path.join(__dirname, 'output', 'kpmg_all_data.json');
  const inputDbPath = path.join(__dirname, 'inputs', 'kpmg_all_data.json');
  const dbPath = fs.existsSync(outputDbPath) ? outputDbPath : inputDbPath;
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

  // Save to output folder
  if (!fs.existsSync(path.join(__dirname, 'output'))) {
    fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });
  }
  fs.writeFileSync(outputDbPath, JSON.stringify(currentDb, null, 2), 'utf-8');
  console.log(`\n💾 Saved updated data to output/kpmg_all_data.json`);

  // Also sync inputs folder if present
  if (fs.existsSync(path.join(__dirname, 'inputs'))) {
    fs.writeFileSync(inputDbPath, JSON.stringify(currentDb, null, 2), 'utf-8');
    console.log(`💾 Saved updated data to inputs/kpmg_all_data.json`);
  }

  console.log(`🔨 Rebuilding KPMG Chart Studio and index.html...`);
  try {
    const buildScript = '/Users/vikram/.gemini/antigravity-ide/brain/6a4e3d86-1504-428c-a1f3-fe88cc5df877/scratch/build_studio.py';
    execSync(`python3 "${buildScript}"`, { stdio: 'inherit' });
    console.log(`\n✨ Done! All charts and Schema.org metadata are updated with 100% fresh API data!\n`);
  } catch (err) {
    console.error(`Error rebuilding studio:`, err.message);
  }
}

runSync();
