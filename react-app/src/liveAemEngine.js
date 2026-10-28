/**
 * KPMG Atlas True Dynamic AEM Live Widget Generator
 * 
 * Generates 100% dynamic, self-contained widget code for Adobe Experience Manager (AEM).
 * 
 * CRITICAL DESIGN:
 * - ZERO hardcoded static numbers or rows (no baked-in table rows or static SVG points).
 * - Code fetches directly from the live API URL whenever the page is loaded anywhere.
 * - Dynamic SVG / Table and Schema.org JSON-LD are computed and rendered on-the-fly from live API response.
 * - Fully scoped container and variables so multiple widgets can be placed on the same AEM page.
 */

const ENDPOINT_MAP = {
  wacc_band_over_time: 'WACC_Values',
  wacc_params_table: 'WACC_Values',
  wacc_countries_table: 'WACC_Countries',
  wacc_subindustries_table: 'WACC_SubIndustries',
  wacc_full_grid: 'WACC_Values',
  multiples_columns_over_time: 'Multiples_Values',
  multiples_forecast_bars: 'Multiples_Values',
  multiples_countries_table: 'Multiples_Countries',
  multiples_subindustries_table: 'Multiples_SubIndustries',
  multiples_full_grid: 'Multiples_Values',
  mrp_3line_trend: 'MRP_BZ',
  mrp_tenure_step_curve: 'BZ_CreditSpread',
  mrp_full_page: 'MRP_BZ',
  crp_rating_lines: 'LRP_AverageOverTime',
  crp_countries_table: 'LRP_SelectedCountries',
  crp_bars_over_time: 'LRP_AverageLRPs',
  crp_full_page: 'LRP_AverageOverTime',
  ov_wacc_horiz: 'WACC_Values',
  ov_multiples_horiz: 'Multiples_Values',
  ov_mrp_trend: 'MRP_BZ',
  ov_crp_bars: 'LRP_AverageLRPs',
  ov_full_grid: 'WACC_Values'
};

export function generateLiveAemSnippet({
  templateId,
  category,
  sector,
  lang = 'EN',
  apiBaseUrl = 'https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium',
  title,
  subtitle,
  renderedMarkup,
  schemaString,
  templateObj,
  pureZeroStatic = false
}) {
  const uid = 'kpmg_' + templateId + '_' + Math.random().toString(36).substring(2, 8);
  const endpoint = ENDPOINT_MAP[templateId] || 'WACC_Values';
  const cleanApiBase = (apiBaseUrl || 'https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium').replace(/\/+$/, '');
  const apiUrl = `${cleanApiBase}/${endpoint}`;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": title || "KPMG Atlas Dataset",
    "inLanguage": lang === 'DE' ? 'de-DE' : 'en-US',
    "description": lang === 'DE' ? `${title || 'KPMG Atlas'} dynamischer Datensatz über KPMG Atlas API.` : `${title || 'KPMG Atlas'} dynamic dataset via KPMG Atlas API.`,
    "creator": {
      "@type": "Organization",
      "name": "KPMG Deal Advisory"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": apiUrl
    },
    "temporalCoverage": new Date().toISOString().substring(0, 10),
    "variableMeasured": templateId
  };
  const jsonLdContent = (pureZeroStatic || !schemaString) ? JSON.stringify(defaultSchema, null, 2) : schemaString;

  const headerComment = pureZeroStatic
    ? `<!-- ========================================================================= -->
<!-- KPMG Atlas Pure Dynamic Live Widget: ${title} -->
<!-- 100% Zero-Static: Loads with spinner & renders SVG, Table + Schema from API -->
<!-- Zero static HTML rows, zero baked-in SVG paths. Paste into AEM Embed component. -->
<!-- ========================================================================= -->`
    : `<!-- ========================================================================= -->
<!-- KPMG Atlas Dynamic Live Widget: ${title} -->
<!-- Hybrid Mode: Instant pre-rendered preview + Live API auto-sync on load -->
<!-- Paste directly into AEM Embed / Custom HTML Component -->
<!-- ========================================================================= -->`;

  const containerContent = pureZeroStatic
    ? `<div class="kpmg-loading-box">
      <span class="kpmg-spinner"></span>
      <span>${lang === 'DE' ? 'Lade Live-Daten von KPMG API...' : 'Loading live data from KPMG API...'}</span>
    </div>`
    : (renderedMarkup || `
    <div class="kpmg-loading-box">
      <span class="kpmg-spinner"></span>
      <span>${lang === 'DE' ? 'Lade Live-Daten von KPMG API...' : 'Loading live data from KPMG API...'}</span>
    </div>
    `);

  const snippet = `${headerComment}

<div id="${uid}" class="kpmg-atlas-live-widget" 
     data-api-url="${apiUrl}"
     data-template="${templateId}"
     data-sector="${sector}"
     data-lang="${lang}"
     style="position:relative; width:100%; font-family:Inter, Arial, sans-serif; background:#FFFFFF; margin:0 0 24px 0; padding:0; box-sizing:border-box;">

  <style>
    #${uid} { font-family: Inter, Arial, sans-serif; color: #1E293B; }
    #${uid} h3 { font-size: 16px; margin: 0 0 10px 0; color: #666666; font-weight: 600; }
    #${uid} .atlas-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 4px 0; }
    #${uid} .atlas-table th { text-align: left; padding: 5px 8px; font-size: 11.5px; font-weight: 700; color: #666666; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1.5px solid #CBD5E1; }
    #${uid} .atlas-table td { padding: 5px 8px; border-bottom: 1px solid #F1F5F9; color: #333333; font-weight: 400; }
    #${uid} .atlas-table .num-col { text-align: right; font-weight: 400; color: #333333; }
    #${uid} .kpmg-loading-box { padding: 36px 20px; text-align: center; color: #64748B; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 10px; background: #F8FAFC; border-radius: 8px; border: 1px dashed #CBD5E1; }
    #${uid} .kpmg-spinner { width: 16px; height: 16px; border: 2px solid #CBD5E1; border-top-color: #00338D; border-radius: 50%; animation: kpmgSpin 0.8s linear infinite; display: inline-block; }
    #${uid} .kpmg-chart-tooltip { position: fixed; display: none; background: #1E293B; color: #FFFFFF; padding: 8px 14px; border-radius: 6px; font-size: 12px; line-height: 1.45; pointer-events: none; z-index: 9999999; box-shadow: 0 8px 24px rgba(0,0,0,0.35); white-space: nowrap; }
    #${uid} .kpmg-chart-tooltip.arrow-right::after { content: ''; display: block; position: absolute; top: 50%; right: -6px; transform: translateY(-50%); width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid #1E293B; pointer-events: none; }
    #${uid} .kpmg-chart-tooltip.arrow-left::after { content: ''; display: block; position: absolute; top: 50%; left: -6px; transform: translateY(-50%); width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 8px solid #1E293B; pointer-events: none; }
    @keyframes kpmgSpin { to { transform: rotate(360deg); } }
  </style>

  <!-- Live Chart Container (${pureZeroStatic ? 'Zero-Static: Spinner placeholder, dynamically populated via API' : 'Pre-rendered for instantaneous 0ms display + auto-refreshed via live API'}) -->
  <div class="kpmg-stage-wrapper">
    ${containerContent}
  </div>

  <!-- Interactive Floating Tooltip -->
  <div class="kpmg-chart-tooltip"></div>

  <!-- Self-Contained Live Fetch & Render Script -->
  <script>
  (function() {
    var cId = "${uid}";
    var container = document.getElementById(cId);
    if (!container) return;
    var stage = container.querySelector(".kpmg-stage-wrapper");
    var tip = container.querySelector(".kpmg-chart-tooltip");

    var apiUrl = "${apiUrl}";
    var templateId = "${templateId}";
    var sector = "${sector}";
    var lang = "${lang}";
    var title = "${(title || '').replace(/"/g, '\\"')}";

    // Helper formatters
    function fmtPct(v) { return (Number(v) * 100).toFixed(2) + "%"; }
    function fmtNum(v, d) { return Number(v).toFixed(d !== undefined ? d : 1); }
    function fmtDateQ(iso) {
      if (!iso) return "";
      var d = new Date(iso);
      var q = Math.floor(d.getMonth() / 3) + 1;
      return "Q" + q + " " + d.getFullYear();
    }

    // Floating Tooltip Event Listeners
    container.addEventListener("mousemove", function(e) {
      var t = e.target.closest("[data-tooltip]");
      if (t && tip) {
        tip.innerHTML = t.getAttribute("data-tooltip");
        tip.style.display = "block";
        var tipW = tip.offsetWidth || 210, tipH = tip.offsetHeight || 65;
        var left = e.clientX + 14, placement = "right";
        if (left + tipW > window.innerWidth - 12) { left = e.clientX - tipW - 14; placement = "left"; }
        var top = e.clientY - tipH / 2;
        if (top < 10) top = 10;
        if (top + tipH > window.innerHeight - 10) top = window.innerHeight - tipH - 10;
        tip.style.left = left + "px";
        tip.style.top = top + "px";
        tip.style.transform = "none";
        tip.className = "kpmg-chart-tooltip " + (placement === "left" ? "arrow-right" : "arrow-left");
      } else if (tip) {
        tip.style.display = "none";
      }
    });
    container.addEventListener("mouseleave", function() { if (tip) tip.style.display = "none"; });

    // Helper sub-renderers
    function buildWaccBand(liveRows) {
      var rows = liveRows.filter(function(d) {
        return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
      }).sort(function(a, b) { return a.Date_Data.localeCompare(b.Date_Data); });
      if (!rows.length) return "<p>Keine Daten für " + sector + "</p>";

      var w = 640, h = 340, pL = 75, pR = 30, pT = 25, pB = 65;
      var cW = w - pL - pR, cH = h - pT - pB;
      var minVal = 0.04, maxVal = 0.12;
      var scaleX = function(i) { return pL + (i / (rows.length - 1)) * cW; };
      var scaleY = function(v) { return pT + cH - ((v - minVal) / (maxVal - minVal)) * cH; };

      var gridLines = "";
      for (var v = 0.04; v <= 0.1201; v += 0.01) {
        var y = scaleY(v);
        gridLines += '<line x1="' + pL + '" y1="' + y + '" x2="' + (w - pR) + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<text x="' + (pL - 10) + '" y="' + (y + 4) + '" fill="#666" font-size="10.5" text-anchor="end">' + (v * 100).toFixed(2) + ' %</text>';
      }

      var upperPts = rows.map(function(r, i) { return scaleX(i) + "," + scaleY(r.WACC_Value_Upper); }).join(" ");
      var lowerPts = rows.slice().reverse().map(function(r, i) { return scaleX(rows.length - 1 - i) + "," + scaleY(r.WACC_Value_Lower); }).join(" ");
      var bandD = "M " + upperPts + " L " + lowerPts + " Z";
      var medD = rows.map(function(r, i) { return (i === 0 ? "M" : "L") + " " + scaleX(i) + " " + scaleY(r.WACC_Value_Median); }).join(" ");

      var xLabels = rows.map(function(r, i) {
        var parts = fmtDateQ(r.Date_Data).split(" ");
        return '<text x="' + scaleX(i) + '" y="' + (pT + cH + 16) + '" fill="#666" font-size="10.5" font-weight="500" text-anchor="middle">' + (parts[0] || "") + '</text>' +
               '<text x="' + scaleX(i) + '" y="' + (pT + cH + 29) + '" fill="#666" font-size="10" text-anchor="middle">' + (parts[1] || "") + '</text>';
      }).join("");

      var medianLabel = lang === "DE" ? "Median des WACC" : "Median of WACC";
      var rangeLabel = lang === "DE" ? "Bandbreite des WACC" : "Range of WACC";
      var titleText = sector + " - " + (lang === "DE" ? "WACC im Zeitverlauf" : "WACC Over Time");

      var rangeHits = rows.map(function(r, i) {
        var qHeader = fmtDateQ(r.Date_Data);
        var colW = cW / (rows.length - 1);
        var xL = scaleX(i) - colW / 2;
        var yTop = scaleY(r.WACC_Value_Upper), yBottom = scaleY(r.WACC_Value_Lower);
        var tipText = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + qHeader + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border:1px solid #FFFFFF;'></span><span>" + rangeLabel + ": [" + fmtPct(r.WACC_Value_Lower) + ", " + fmtPct(r.WACC_Value_Upper) + "]</span></div>";
        return '<g class="has-tooltip" data-tooltip="' + tipText + '" style="cursor:pointer;"><rect x="' + xL + '" y="' + yTop + '" width="' + colW + '" height="' + Math.max(yBottom - yTop, 8) + '" fill="transparent"/></g>';
      }).join("");

      var medHits = rows.map(function(r, i) {
        var qHeader = fmtDateQ(r.Date_Data);
        var colW = cW / (rows.length - 1);
        var xL = scaleX(i) - colW / 2;
        var yMed = scaleY(r.WACC_Value_Median);
        var tipText = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'> " + qHeader + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00338D; border:1px solid #FFFFFF;'></span><span>" + medianLabel + ": " + fmtPct(r.WACC_Value_Median) + "</span></div>";
        return '<g class="has-tooltip median-point" data-tooltip="' + tipText + '" style="cursor:pointer;"><rect x="' + xL + '" y="' + (yMed - 10) + '" width="' + colW + '" height="20" fill="transparent"/></g>';
      }).join("");

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">' + titleText + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          '<line x1="' + pL + '" y1="' + pT + '" x2="' + pL + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          '<line x1="' + pL + '" y1="' + (pT + cH) + '" x2="' + (w - pR) + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          gridLines +
          '<path d="' + bandD + '" fill="#00b8f5" fill-opacity="0.80"/>' +
          '<path d="' + medD + '" fill="none" stroke="#00338D" stroke-width="2.5"/>' +
          rangeHits + medHits + xLabels +
          '<g transform="translate(' + (w / 2 - 120) + ', ' + (pT + cH + 48) + ')">' +
            '<rect x="0" y="-3" width="22" height="6" fill="#00338D"/><text x="28" y="3" font-size="11" fill="#333">' + medianLabel + '</text>' +
            '<rect x="140" y="-3" width="22" height="6" fill="#00b8f5" fill-opacity="0.80"/><text x="168" y="3" font-size="11" fill="#333">' + rangeLabel + '</text>' +
          '</g>' +
          '<text x="18" y="' + (pT + cH/2) + '" fill="#666" font-size="11" transform="rotate(-90 18 ' + (pT + cH/2) + ')" text-anchor="middle">WACC (in %)</text>' +
        '</svg></div>';
    }

    function buildWaccParams(liveRows) {
      var rows = liveRows.filter(function(d) {
        return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
      }).sort(function(a, b) { return a.Date_Data.localeCompare(b.Date_Data); });
      var latest = rows[rows.length - 1];
      if (!latest) return "<p>Keine Daten für " + sector + "</p>";

      var dObj = new Date(latest.Date_Data);
      var dateStr = (dObj.getDate() < 10 ? "0" : "") + dObj.getDate() + "." + ((dObj.getMonth() + 1) < 10 ? "0" : "") + (dObj.getMonth() + 1) + "." + dObj.getFullYear();
      var tableTitle = sector + " - " + (lang === "DE" ? "Gewichtete durchschnittliche Kapitalkosten zum " : "Weighted Average Cost of Capital as of ") + dateStr;

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:14px; font-weight:600;">' + tableTitle + '</h3>' +
        '<table class="atlas-table">' +
          '<thead><tr><th colspan="2" style="color:#333; font-size:12.5px; font-weight:700; text-transform:none;">' + (lang === "DE" ? "Eigenkapitalkosten" : "Cost of Equity") + '</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>' + (lang === "DE" ? "Basiszinssatz" : "Risk-free rate") + '</td><td class="num-col">' + fmtPct(latest.Rf) + '</td></tr>' +
            '<tr><td>Unlevered Beta</td><td class="num-col">' + fmtNum(latest.UnlevBeta, 2) + '</td></tr>' +
            '<tr><td>Debt Beta</td><td class="num-col">' + fmtNum(latest.BetaRelevered, 2) + '</td></tr>' +
            '<tr><td>' + (lang === "DE" ? "Marktrisikoprämie" : "Market risk premium") + '</td><td class="num-col">' + fmtPct(latest.MRP) + '</td></tr>' +
            '<tr style="border-top:1px solid #CBD5E1;"><td>' + (lang === "DE" ? "Verschuldete Eigenkapitalkosten" : "Levered cost of equity") + '</td><td class="num-col">' + fmtPct(latest.LevCostOfEquity) + '</td></tr>' +
            '<tr><td>' + (lang === "DE" ? "Eigenkapitalquote" : "Equity ratio") + '</td><td class="num-col">' + fmtPct(latest.Equity_ratio) + '</td></tr>' +
          '</tbody>' +
          '<thead><tr><th colspan="2" style="color:#333; font-size:12.5px; font-weight:700; text-transform:none;">' + (lang === "DE" ? "Fremdkapitalkosten" : "Cost of Debt") + '</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>' + (lang === "DE" ? "Basiszinssatz" : "Risk-free rate") + '</td><td class="num-col">' + fmtPct(latest.Rf) + '</td></tr>' +
            '<tr><td>Credit Spread</td><td class="num-col">' + fmtPct(latest.CreditSpread) + '</td></tr>' +
            '<tr><td>Tax Shield</td><td class="num-col">' + fmtPct(latest.TaxRate) + '</td></tr>' +
            '<tr style="border-top:1px solid #CBD5E1;"><td>' + (lang === "DE" ? "Fremdkapitalkosten" : "Cost of debt") + '</td><td class="num-col">' + fmtPct(latest.CostOfDebtAfterTax) + '</td></tr>' +
            '<tr><td>' + (lang === "DE" ? "Fremdkapitalquote" : "Debt ratio") + '</td><td class="num-col">' + fmtPct(latest.Debt_ratio) + '</td></tr>' +
          '</tbody>' +
          '<tfoot><tr style="border-top:1px solid #333; border-bottom:1px solid #333; font-weight:700;"><td style="color:#333; font-size:13px; font-weight:600; padding:5px 8px;">' + (lang === "DE" ? "Gewichtete durchschnittliche Kapitalkosten (WACC)" : "Weighted Average Cost of Capital (WACC)") + '</td><td class="num-col" style="font-size:13px; color:#333; font-weight:700; padding:5px 8px;">' + fmtPct(latest.WACC_Value_Median) + '</td></tr></tfoot>' +
        '</table>' +
        '<p style="font-size:11px; color:#666; margin-top:14px; line-height:1.45;">' + (lang === "DE" ? "*Der WACC stellt den Median der einzelnen Unternehmens-WACCs dar." : "*WACC represents the median across individual peer companies.") + '</p>' +
      '</div>';
    }

    function buildCountriesTable(liveRows, datasetKey) {
      var allRows = (liveRows || []).filter(function(d) {
        return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
      });
      var latestDate = allRows.reduce(function(m, r) { return (r.Date_Data && r.Date_Data > m) ? r.Date_Data : m; }, "");
      var filtered = latestDate ? allRows.filter(function(r) { return r.Date_Data === latestDate; }) : allRows;
      var rows = filtered.sort(function(a, b) {
        return Number(b.N_Companies || 0) - Number(a.N_Companies || 0);
      }).slice(0, 10);
      var total = rows.reduce(function(s, r) { return s + (Number(r.N_Companies) || 0); }, 0);

      var trs = rows.map(function(r) {
        var ctryName = (lang === "DE" ? (r.Country_DE || r.Country_EN) : (r.Country_EN || r.Country_DE)) || r.Country || r.Ctry_Name_EN || "";
        return '<tr><td style="color:#333; font-weight:400; padding:5px 8px;">' + ctryName + '</td><td class="num-col" style="color:#333; font-weight:400; padding:5px 8px;">' + Number(r.N_Companies || 0).toLocaleString() + '</td></tr>';
      }).join("");

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:12px; font-weight:600;">' + sector + ' - ' + (lang === "DE" ? "Herkunft der Unternehmen" : "Origin of all companies included in the entire database") + '</h3>' +
        '<table class="atlas-table">' +
          '<thead><tr><th style="padding:5px 8px;">' + (lang === "DE" ? "Land" : "Country") + '</th><th style="text-align:right; padding:5px 8px;">' + (lang === "DE" ? "Anzahl Unternehmen" : "Number of Companies") + '</th></tr></thead>' +
          '<tbody>' + trs + '</tbody>' +
          '<tfoot><tr style="border-top:1.5px solid #CBD5E1; font-weight:700;"><td style="color:#333; font-weight:700; padding:5px 8px;">' + (lang === "DE" ? "Gesamt" : "Total") + '</td><td class="num-col" style="color:#333; font-weight:700; padding:5px 8px;">' + total.toLocaleString() + '</td></tr></tfoot>' +
        '</table></div>';
    }

    function buildSubIndustriesTable(liveRows, datasetKey) {
      var allRows = (liveRows || []).filter(function(d) {
        return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
      });
      var latestDate = allRows.reduce(function(m, r) { return (r.Date_Data && r.Date_Data > m) ? r.Date_Data : m; }, "");
      var filtered = latestDate ? allRows.filter(function(r) { return r.Date_Data === latestDate; }) : allRows;
      var rows = filtered.sort(function(a, b) {
        return Number(b.N_Companies || 0) - Number(a.N_Companies || 0);
      }).slice(0, 10);

      var trs = rows.map(function(r) {
        var name = (lang === "DE" ? (r.SimpleIndustry_DE || r.SubIndustry_DE || r.SimpleIndustry_EN || r.SubIndustry_EN) : (r.SimpleIndustry_EN || r.SubIndustry_EN)) || r.SubIndustry || r.SimpleIndustry || "";
        return '<tr><td style="color:#333; font-weight:400; padding:5px 8px;">' + name + '</td><td class="num-col" style="color:#333; font-weight:400; padding:5px 8px;">' + Number(r.N_Companies || 0).toLocaleString() + '</td></tr>';
      }).join("");

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:12px; font-weight:600;">' + sector + ' - ' + (lang === "DE" ? "Teilsektoren" : "Sub-Sectors") + '</h3>' +
        '<table class="atlas-table">' +
          '<thead><tr><th style="padding:5px 8px;">' + (lang === "DE" ? "Teilsektor" : "Sub-Sector") + '</th><th style="text-align:right; padding:5px 8px;">' + (lang === "DE" ? "Anzahl Unternehmen" : "Number of Companies") + '</th></tr></thead>' +
          '<tbody>' + trs + '</tbody>' +
        '</table></div>';
    }

    function buildMrp3Line(liveRows, isDashboard) {
      var rows = (liveRows || []).slice().sort(function(a, b) { return (a.Date || "").localeCompare(b.Date || ""); });
      var w = 640, h = 340, pL = 55, pR = 25, pT = 30, pB = 65;
      var cW = w - pL - pR, cH = h - pT - pB;
      var minVal = 0.0, maxVal = 0.12;
      var scaleX = function(i) { return pL + (i / Math.max(rows.length - 1, 1)) * cW; };
      var scaleY = function(v) { return pT + cH - (v / maxVal) * cH; };

      var gridLines = "";
      for (var v = 0.0; v <= 0.1201; v += 0.02) {
        var y = scaleY(v);
        gridLines += '<line x1="' + pL + '" y1="' + y + '" x2="' + (w - pR) + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<text x="' + (pL - 8) + '" y="' + (y + 4) + '" fill="#666" font-size="10.5" text-anchor="end">' + (v * 100).toFixed(1) + ' %</text>';
      }

      var pathTotal = rows.map(function(r, i) { return (i === 0 ? "M" : "L") + " " + scaleX(i) + " " + scaleY(r.Gesamtrendite || 0); }).join(" ");
      var pathMrp = rows.map(function(r, i) { return (i === 0 ? "M" : "L") + " " + scaleX(i) + " " + scaleY(r.MRP || 0); }).join(" ");
      var pathRf = rows.map(function(r, i) { return (i === 0 ? "M" : "L") + " " + scaleX(i) + " " + scaleY(r.Basiszins || 0); }).join(" ");

      var xLabels = rows.map(function(r, i) {
        var d = new Date(r.Date);
        var m = ["Jan","Feb","Mrz","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"][d.getMonth()];
        return '<text x="' + scaleX(i) + '" y="' + (pT + cH + 16) + '" fill="#666" font-size="10" text-anchor="middle">' + (m || "") + ' ' + (d.getFullYear() ? d.getFullYear().toString().substring(2) : "") + '</text>';
      }).join("");

      var hitboxes = rows.map(function(r, i) {
        var parts = fmtDateQ(r.Date).split(" ");
        var qHeader = (parts[0] || "") + " " + (parts[1] || "");
        var colW = cW / Math.max(rows.length - 1, 1);
        var totalTipLabel = lang === "DE" ? "Gesamtrendite" : "Total rate of return";
        var mrpTipLabel = lang === "DE" ? "Marktrisikoprämie" : "Market risk premium";
        var rfTipLabel = lang === "DE" ? "Basiszinssatz" : "Risk-free rate";
        var tipHtml = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:6px; font-size:12px;'>" + qHeader + "</div>" +
          "<div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0; margin-bottom:4px;'><span style='display:inline-block; width:10px; height:10px; background:#00338D; border:1px solid #FFFFFF;'></span><span>" + totalTipLabel + ": <span style='color:#FFFFFF; font-weight:normal;'>" + fmtPct(r.Gesamtrendite) + "</span></span></div>" +
          "<div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0; margin-bottom:4px;'><span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border:1px solid #FFFFFF;'></span><span>" + mrpTipLabel + ": <span style='color:#FFFFFF; font-weight:normal;'>" + fmtPct(r.MRP) + "</span></span></div>" +
          "<div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#fd349c; border:1px solid #FFFFFF;'></span><span>" + rfTipLabel + ": <span style='color:#FFFFFF; font-weight:normal;'>" + fmtPct(r.Basiszins) + "</span></span></div>";

        return '<g class="has-tooltip mrp-col" data-tooltip="' + tipHtml + '" style="cursor:pointer;">' +
          '<rect x="' + (scaleX(i) - colW/2) + '" y="' + pT + '" width="' + colW + '" height="' + cH + '" fill="transparent"/>' +
          '<circle class="hover-dot" cx="' + scaleX(i) + '" cy="' + scaleY(r.Gesamtrendite || 0) + '" r="4.5" fill="#00338D" pointer-events="none"/>' +
          '<circle class="hover-dot" cx="' + scaleX(i) + '" cy="' + scaleY(r.MRP || 0) + '" r="4.5" fill="#00b8f5" pointer-events="none"/>' +
          '<circle class="hover-dot" cx="' + scaleX(i) + '" cy="' + scaleY(r.Basiszins || 0) + '" r="4.5" fill="#fd349c" pointer-events="none"/>' +
        '</g>';
      }).join("");

      var totalLegendLabel = lang === "DE" ? "Gesamtrendite" : "Total rate of return";
      var mrpLegendLabel = lang === "DE" ? "Marktrisikoprämie" : "Market risk premium";
      var rfLegendLabel = lang === "DE" ? "Basiszinssatz" : "Risk-free rate";
      var legShift = lang === "DE" ? (w / 2 - 188) : (w / 2 - 206);

      var legend = '<g transform="translate(' + legShift + ', ' + (pT + cH + 48) + ')">' +
        '<line x1="0" y1="0" x2="26" y2="0" stroke="#00338D" stroke-width="5"/>' +
        '<text x="32" y="4" font-size="11" fill="#333">' + totalLegendLabel + '</text>' +
        '<line x1="' + (lang === "DE" ? 120 : 145) + '" y1="0" x2="' + (lang === "DE" ? 146 : 171) + '" y2="0" stroke="#00b8f5" stroke-width="5"/>' +
        '<text x="' + (lang === "DE" ? 152 : 177) + '" y="4" font-size="11" fill="#333">' + mrpLegendLabel + '</text>' +
        '<line x1="' + (lang === "DE" ? 270 : 305) + '" y1="0" x2="' + (lang === "DE" ? 296 : 331) + '" y2="0" stroke="#fd349c" stroke-width="5"/>' +
        '<text x="' + (lang === "DE" ? 302 : 337) + '" y="4" font-size="11" fill="#333">' + rfLegendLabel + '</text>' +
      '</g>';

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:' + (isDashboard ? '14px' : '16px') + '; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:' + (isDashboard ? '400' : '600') + ';">' + (lang === "DE" ? "Marktrisikoprämie, Basiszinssatz & Gesamtrendite" : "Total Return, Risk-Free Rate & MRP") + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          '<line x1="' + pL + '" y1="' + pT + '" x2="' + pL + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          '<line x1="' + pL + '" y1="' + (pT + cH) + '" x2="' + (w - pR) + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          gridLines +
          '<path d="' + pathTotal + '" fill="none" stroke="#00338D" stroke-width="2.5"/>' +
          '<path d="' + pathMrp + '" fill="none" stroke="#00b8f5" stroke-width="2.5"/>' +
          '<path d="' + pathRf + '" fill="none" stroke="#fd349c" stroke-width="2.5"/>' +
          hitboxes +
          xLabels +
          legend +
        '</svg></div>';
    }

    function buildTenureStepCurve(liveRows) {
      var rows = (liveRows || []).slice().sort(function(a, b) { return Number(a.Tenure) - Number(b.Tenure); });
      var w = 640, h = 340, pL = 65, pR = 25, pT = 30, pB = 65;
      var cW = w - pL - pR, cH = h - pT - pB;
      var minVal = 0.024, maxVal = 0.036;
      var maxTenure = 30;
      var scaleX = function(t) { return pL + ((t - 1) / (maxTenure - 1)) * cW; };
      var scaleY = function(v) { return pT + cH - ((v - minVal) / (maxVal - minVal)) * cH; };

      var gridLines = "";
      for (var v = 0.024; v <= 0.0361; v += 0.002) {
        var y = scaleY(v);
        gridLines += '<line x1="' + pL + '" y1="' + y + '" x2="' + (w - pR) + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<text x="' + (pL - 8) + '" y="' + (y + 4) + '" fill="#666" font-size="10.5" text-anchor="end">' + (v * 100).toFixed(1) + ' %</text>';
      }

      var stepPath = "";
      var colW = cW / (maxTenure - 1);
      var hitboxes = "";
      rows.forEach(function(r, i) {
        var x = scaleX(r.Tenure);
        var y = scaleY(r.BZ);
        if (i === 0) { stepPath += "M " + x + " " + y; }
        else { stepPath += " H " + x + " V " + y; }

        var tipHtml = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + r.Tenure + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#fd349c; border:1px solid #FFFFFF;'></span><span>" + (lang === "DE" ? "Basiszinssatz (gerundet): " : "Risk-free rate (rounded): ") + fmtPct(r.BZ) + "</span></div>";
        hitboxes += '<g class="has-tooltip tenure-pt" data-tooltip="' + tipHtml + '" style="cursor:pointer;">' +
                    '<rect x="' + (x - colW/2) + '" y="' + pT + '" width="' + colW + '" height="' + cH + '" fill="transparent"/>' +
                    '<circle class="tenure-glow" cx="' + x + '" cy="' + y + '" r="7" fill="#fd349c" opacity="0" pointer-events="none"/>' +
                    '<rect class="tenure-diamond" x="' + (x - 3) + '" y="' + (y - 3) + '" width="6" height="6" fill="#fd349c" transform="rotate(45 ' + x + ' ' + y + ')" pointer-events="none"/>' +
                    '</g>';
      });

      var xTicks = "";
      for (var t = 1; t <= 30; t++) {
        xTicks += '<text x="' + scaleX(t) + '" y="' + (pT + cH + 16) + '" fill="#666" font-size="9" text-anchor="middle">' + t + '</text>';
      }

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">' + (lang === "DE" ? "Aktuelle Zinsstrukturkurve des Basiszinssatzes" : "Current Risk-Free Rate Step Curve") + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          '<line x1="' + pL + '" y1="' + pT + '" x2="' + pL + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          '<line x1="' + pL + '" y1="' + (pT + cH) + '" x2="' + (w - pR) + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          gridLines +
          '<path d="' + stepPath + '" fill="none" stroke="#7213ea" stroke-width="2.5"/>' +
          hitboxes + xTicks +
          '<text x="' + (w/2) + '" y="' + (pT + cH + 32) + '" fill="#666" font-size="11" text-anchor="middle">' + (lang === "DE" ? "Laufzeit (in Jahren)" : "Tenure (in years)") + '</text>' +
          '<text x="18" y="' + (pT + cH/2) + '" fill="#666" font-size="11" transform="rotate(-90 18 ' + (pT + cH/2) + ')" text-anchor="middle">' + (lang === "DE" ? "Basiszinssatz (in %)" : "Risk-free rate (in %)") + '</text>' +
          '<g transform="translate(' + (w / 2 - 85) + ', ' + (pT + cH + 48) + ')">' +
            '<line x1="0" y1="0" x2="26" y2="0" stroke="#7213ea" stroke-width="5"/>' +
            '<text x="32" y="4" font-size="11" fill="#333">' + (lang === "DE" ? "Basiszinssatz (gerundet)" : "Risk-free rate (rounded)") + '</text>' +
          '</g>' +
        '</svg></div>';
    }

    function buildCrpCountriesTable(liveRows) {
      var trs = (liveRows || []).map(function(r) {
        var ctry = (lang === "DE" ? (r.Ctry_Name_DE || r.Ctry_Name_EN) : r.Ctry_Name_EN) || r.Country;
        return '<tr>' +
          '<td style="color:#333; font-weight:400; padding:5px 8px;">' + (r.Rating || "") + '</td>' +
          '<td style="color:#333; font-weight:400; padding:5px 8px;">' + (ctry || "") + '</td>' +
          '<td class="num-col" style="color:#333; font-weight:400; text-align:right; padding:5px 8px;">' + fmtPct(r.CRP_6m) + '</td>' +
          '<td class="num-col" style="color:#333; font-weight:400; text-align:right; padding:5px 8px;">' + fmtPct(r.CRP_1y) + '</td>' +
          '<td class="num-col" style="color:#333; font-weight:400; text-align:right; padding:5px 8px;">' + fmtPct(r.CRP_2y) + '</td>' +
        '</tr>';
      }).join("");

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:12px; font-weight:600;">' + (lang === "DE" ? "Länderrisikoprämie ausgewählter Länder" : "Country Risk Premium of Selected Countries") + '</h3>' +
        '<table class="atlas-table">' +
          '<thead>' +
            '<tr><th style="padding:5px 8px;">Rating</th><th style="padding:5px 8px;">' + (lang === "DE" ? "Land" : "Country") + '</th><th style="text-align:right; padding:5px 8px;">6M</th><th style="text-align:right; padding:5px 8px;">1J</th><th style="text-align:right; padding:5px 8px;">2J</th></tr>' +
          '</thead>' +
          '<tbody>' + trs + '</tbody>' +
        '</table></div>';
    }

    function buildCrpRatingLines(liveRows) {
      var ratings = ["BBB-", "BBB", "BBB+"];
      var dates = [];
      (liveRows || []).forEach(function(r) { if (dates.indexOf(r.Date) === -1) dates.push(r.Date); });
      dates.sort();

      var w = 640, h = 340, pL = 55, pR = 25, pT = 30, pB = 65;
      var cW = w - pL - pR, cH = h - pT - pB;
      var minVal = 0.006, maxVal = 0.020;
      var scaleX = function(i) { return pL + (i / Math.max(dates.length - 1, 1)) * cW; };
      var scaleY = function(v) { return pT + cH - ((v - minVal) / (maxVal - minVal)) * cH; };

      var gridLines = "";
      for (var v = 0.006; v <= 0.0201; v += 0.002) {
        var y = scaleY(v);
        gridLines += '<line x1="' + pL + '" y1="' + y + '" x2="' + (w - pR) + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<text x="' + (pL - 8) + '" y="' + (y + 4) + '" fill="#666" font-size="10.5" text-anchor="end">' + (v * 100).toFixed(1) + ' %</text>';
      }

      var colors = { "BBB-": "#00338D", "BBB": "#00b8f5", "BBB+": "#fd349c" };
      var lines = ratings.map(function(rCode) {
        var rRows = (liveRows || []).filter(function(r) { return r.Rating === rCode; }).sort(function(a, b) { return a.Date.localeCompare(b.Date); });
        var pathD = rRows.map(function(r, i) { return (i === 0 ? "M" : "L") + " " + scaleX(i) + " " + scaleY(r.Median || 0); }).join(" ");
        return '<path d="' + pathD + '" fill="none" stroke="' + colors[rCode] + '" stroke-width="2.5"/>';
      }).join("");

      var xLabels = dates.map(function(d, i) {
        var dt = new Date(d);
        var q = Math.floor(dt.getMonth() / 3) + 1;
        return '<text x="' + scaleX(i) + '" y="' + (pT + cH + 16) + '" fill="#666" font-size="10.5" font-weight="500" text-anchor="middle">Q' + q + '</text>' +
               '<text x="' + scaleX(i) + '" y="' + (pT + cH + 29) + '" fill="#666" font-size="10" text-anchor="middle">' + dt.getFullYear() + '</text>';
      }).join("");

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">' + (lang === "DE" ? "Länderrisikoprämie im Zeitverlauf" : "Country Risk Premium Over Time") + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          '<line x1="' + pL + '" y1="' + pT + '" x2="' + pL + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          '<line x1="' + pL + '" y1="' + (pT + cH) + '" x2="' + (w - pR) + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          gridLines + lines + xLabels +
          '<g transform="translate(' + (w / 2 - 140) + ', ' + (pT + cH + 48) + ')">' +
            '<line x1="0" y1="0" x2="26" y2="0" stroke="#00338D" stroke-width="5"/><text x="32" y="4" font-size="11" fill="#333">BBB-</text>' +
            '<line x1="100" y1="0" x2="126" y2="0" stroke="#00b8f5" stroke-width="5"/><text x="132" y="4" font-size="11" fill="#333">BBB</text>' +
            '<line x1="200" y1="0" x2="226" y2="0" stroke="#fd349c" stroke-width="5"/><text x="232" y="4" font-size="11" fill="#333">BBB+</text>' +
          '</g>' +
        '</svg></div>';
    }

    function buildOvCrpBars(liveRows) {
      var rows = liveRows || [];
      var order = ["CCC", "B", "BB", "BBB", "A", "AA"];
      var sortedRows = rows.slice().sort(function(a, b) {
        return order.indexOf(a.Rating) - order.indexOf(b.Rating);
      });

      var w = 640, h = 330, pL = 60, pR = 30, pT = 25, pB = 55;
      var cW = w - pL - pR, cH = h - pT - pB;
      var maxX = 0.09;
      var scaleX = function(v) { return pL + (v / maxX) * cW; };

      var gridLines = "";
      for (var v = 0; v <= 0.0901; v += 0.01) {
        var x = scaleX(v);
        gridLines += '<line x1="' + x + '" y1="' + pT + '" x2="' + x + '" y2="' + (pT + cH) + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<line x1="' + x + '" y1="' + (pT + cH) + '" x2="' + x + '" y2="' + (pT + cH + 4) + '" stroke="#CBD5E1" stroke-width="1"/>' +
                     '<text x="' + x + '" y="' + (pT + cH + 17) + '" fill="#666" font-size="11" text-anchor="middle">' + (v * 100).toFixed(1) + '%</text>';
      }

      var crpLabel = lang === "DE" ? "Bandbreite der Länderrisikoprämie" : "Range of country risk premium";
      var rowH = cH / Math.max(sortedRows.length, 1);
      var bars = "";
      sortedRows.forEach(function(r, idx) {
        var y = pT + (idx + 0.5) * rowH;
        var x1 = scaleX(r.Min || 0), x2 = scaleX(r.Max || 0);
        var tipHtml = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + r.Rating + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border:1px solid #FFFFFF;'></span><span>" + crpLabel + " [" + fmtPct(r.Min) + ", " + fmtPct(r.Max) + "]</span></div>";
        bars += '<text x="' + (pL - 12) + '" y="' + (y + 4) + '" fill="#666" font-size="12" font-weight="500" text-anchor="end">' + r.Rating + '</text>' +
                '<rect class="has-tooltip" data-tooltip="' + tipHtml + '" x="' + x1 + '" y="' + (y - 9) + '" width="' + Math.max(x2 - x1, 4) + '" height="18" fill="#00b8f5" style="cursor:pointer;"/>';
      });

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:14px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:400;">' + (lang === "DE" ? "Aktuelle Länderrisikoprämie nach Rating" : "Current country risk premium per rating") + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          gridLines + bars +
          '<g transform="translate(' + (w / 2 - (lang === "DE" ? 115 : 95)) + ', ' + (pT + cH + 40) + ')">' +
            '<rect x="0" y="-10" width="12" height="12" fill="#00b8f5"/><text x="18" y="0" fill="#666" font-size="11">' + crpLabel + '</text>' +
          '</g>' +
        '</svg></div>';
    }

    function buildMultiplesColumns(liveRows) {
      var sRows = (liveRows || []).filter(function(d) {
        return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
      });
      var dates = [];
      sRows.forEach(function(r) { if (dates.indexOf(r.Date_Data) === -1) dates.push(r.Date_Data); });
      dates.sort();

      var w = 620, h = 320, pL = 50, pR = 25, pT = 30, pB = 60;
      var cW = w - pL - pR, cH = h - pT - pB;

      var maxDataVal = 0;
      sRows.forEach(function(r) {
        var up = Number(r.Multiple_Value_Upper || 0);
        var lo = Number(r.Multiple_Value_Lower || 0);
        if (up > maxDataVal) maxDataVal = up;
        if (lo > maxDataVal) maxDataVal = lo;
      });

      var maxVal = 25.0;
      var step = 5.0;
      if (maxDataVal > 50.0) {
        maxVal = 60.0;
        step = 10.0;
        if (maxDataVal > 60.0) maxVal = Math.ceil(maxDataVal / 10) * 10;
      } else if (maxDataVal > 45.0) {
        maxVal = 50.0;
        step = 5.0;
      } else if (maxDataVal > 40.0) {
        maxVal = 45.0;
        step = 5.0;
      } else if (maxDataVal > 35.0) {
        maxVal = 40.0;
        step = 5.0;
      } else if (maxDataVal > 30.0) {
        maxVal = 35.0;
        step = 5.0;
      } else if (maxDataVal > 25.0) {
        maxVal = 30.0;
        step = 5.0;
      } else if (maxDataVal > 20.0) {
        maxVal = 25.0;
        step = 5.0;
      } else {
        maxVal = 20.0;
        step = 5.0;
      }

      var scaleY = function(v) { return pT + cH - (v / maxVal) * cH; };

      var gridLines = "";
      for (var v = 0; v <= maxVal + 0.01; v += step) {
        var y = scaleY(v);
        gridLines += '<line x1="' + pL + '" y1="' + y + '" x2="' + (w - pR) + '" y2="' + y + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<text x="' + (pL - 8) + '" y="' + (y + 4) + '" fill="#666" font-size="10.5" text-anchor="end">' + v.toFixed(1) + ' x</text>';
      }

      var colGroupW = cW / Math.max(dates.length, 1);
      var barW = Math.min(colGroupW * 0.35, 18);

      var ebitLabel = lang === "DE" ? "Bandbreite der EBIT-Multiplikatoren" : "Range of EBIT multiples";
      var ebitdaLabel = lang === "DE" ? "Bandbreite der EBITDA-Multiplikatoren" : "Range of EBITDA multiples";

      var bars = dates.map(function(d, i) {
        var cx = pL + (i + 0.5) * colGroupW;
        var ebitda = sRows.find(function(x) { return x.Multiple_Name === "EBITDA-Multiple" && x.Date_Data === d; });
        var ebit = sRows.find(function(x) { return x.Multiple_Name === "EBIT-Multiple" && x.Date_Data === d; });

        var parts = fmtDateQ(d).split(" ");
        var qHeader = (parts[0] || "") + ", " + (parts[1] || "");

        var out = "";
        if (ebitda) {
          var y1 = scaleY(ebitda.Multiple_Value_Upper || 0), y0 = scaleY(ebitda.Multiple_Value_Lower || 0);
          var tipEbitda = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + qHeader + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00338D; border:1px solid #FFFFFF;'></span><span>" + ebitdaLabel + " [" + Number(ebitda.Multiple_Value_Lower).toFixed(1) + "x, " + Number(ebitda.Multiple_Value_Upper).toFixed(1) + "x]</span></div>";
          out += '<rect class="has-tooltip" data-tooltip="' + tipEbitda + '" x="' + (cx - barW - 2) + '" y="' + y1 + '" width="' + barW + '" height="' + Math.max(y0 - y1, 2) + '" fill="#00338D" style="cursor:pointer;"/>';
        }
        if (ebit) {
          var y1 = scaleY(ebit.Multiple_Value_Upper || 0), y0 = scaleY(ebit.Multiple_Value_Lower || 0);
          var tipEbit = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + qHeader + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border:1px solid #FFFFFF;'></span><span>" + ebitLabel + " [" + Number(ebit.Multiple_Value_Lower).toFixed(1) + "x, " + Number(ebit.Multiple_Value_Upper).toFixed(1) + "x]</span></div>";
          out += '<rect class="has-tooltip" data-tooltip="' + tipEbit + '" x="' + (cx + 2) + '" y="' + y1 + '" width="' + barW + '" height="' + Math.max(y0 - y1, 2) + '" fill="#00b8f5" style="cursor:pointer;"/>';
        }
        return out;
      }).join("");

      var xLabels = dates.map(function(d, i) {
        var cx = pL + (i + 0.5) * colGroupW;
        var dt = new Date(d);
        var q = Math.floor(dt.getMonth() / 3) + 1;
        return '<text x="' + cx + '" y="' + (pT + cH + 16) + '" fill="#666" font-size="10.5" font-weight="500" text-anchor="middle">Q' + q + '</text>' +
               '<text x="' + cx + '" y="' + (pT + cH + 29) + '" fill="#666" font-size="10" text-anchor="middle">' + dt.getFullYear() + '</text>';
      }).join("");

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">' + sector + ' - ' + (lang === "DE" ? "Multiples im Zeitverlauf" : "Average multiples over time") + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          '<line x1="' + pL + '" y1="' + pT + '" x2="' + pL + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          '<line x1="' + pL + '" y1="' + (pT + cH) + '" x2="' + (w - pR) + '" y2="' + (pT + cH) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          gridLines + bars + xLabels +
          '<g transform="translate(' + (lang === "DE" ? w / 2 - 260 : w / 2 - 190) + ', ' + (pT + cH + 48) + ')">' +
            '<rect x="0" y="-3" width="16" height="8" fill="#00338D"/><text x="22" y="4" font-size="11" fill="#333">' + ebitdaLabel + '</text>' +
            '<rect x="' + (lang === "DE" ? 280 : 210) + '" y="-3" width="16" height="8" fill="#00b8f5"/><text x="' + (lang === "DE" ? 302 : 232) + '" y="4" font-size="11" fill="#333">' + ebitLabel + '</text>' +
          '</g>' +
        '</svg></div>';
    }

    function buildMultiplesForecastBars(liveRows) {
      var allRows = (liveRows || []).filter(function(d) {
        return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
      });
      var latestDate = allRows.reduce(function(m, r) { return (r.Date_Data && r.Date_Data > m) ? r.Date_Data : m; }, "");
      var currentRows = allRows.filter(function(r) { return r.Date_Data === latestDate; });

      var horizons = [
        { label: lang === "DE" ? "+2J Prognose (2028)" : "+2 Year Estimate (2028)", date: "2028-12-31" },
        { label: lang === "DE" ? "+1J Prognose (2027)" : "+1 Year Estimate (2027)", date: "2027-12-31" },
        { label: lang === "DE" ? "Ist (2026)" : "Actual (2026)", date: "2026-12-31" }
      ];

      var w = 620, h = 260;
      var pL = 160, pR = 30, pT = 20, pB = 60;
      var cW = w - pL - pR, cH = h - pT - pB;

      var maxDataX = 0;
      currentRows.forEach(function(r) {
        var up = Number(r.Multiple_Value_Upper || 0);
        var lo = Number(r.Multiple_Value_Lower || 0);
        if (up > maxDataX) maxDataX = up;
        if (lo > maxDataX) maxDataX = lo;
      });

      var maxX = 25.0;
      var stepX = 5.0;
      if (maxDataX > 50.0) { maxX = 60.0; stepX = 10.0; if (maxDataX > 60.0) maxX = Math.ceil(maxDataX / 10) * 10; }
      else if (maxDataX > 45.0) { maxX = 50.0; stepX = 5.0; }
      else if (maxDataX > 40.0) { maxX = 45.0; stepX = 5.0; }
      else if (maxDataX > 35.0) { maxX = 40.0; stepX = 5.0; }
      else if (maxDataX > 30.0) { maxX = 35.0; stepX = 5.0; }
      else if (maxDataX > 25.0) { maxX = 30.0; stepX = 5.0; }
      else if (maxDataX > 20.0) { maxX = 25.0; stepX = 5.0; }
      else { maxX = 20.0; stepX = 5.0; }

      var scaleX = function(v) { return pL + (v / maxX) * cW; };

      var gridLines = "";
      for (var v = 0; v <= maxX + 0.01; v += stepX) {
        var x = scaleX(v);
        gridLines += '<line x1="' + x + '" y1="' + pT + '" x2="' + x + '" y2="' + (h - pB) + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<text x="' + x + '" y="' + (h - pB + 16) + '" fill="#666" font-size="10.5" text-anchor="middle">' + v.toFixed(1) + ' x</text>';
      }

      var ebitLabel = lang === "DE" ? "Bandbreite der EBIT-Multiplikatoren" : "Range of EBIT multiples";
      var ebitdaLabel = lang === "DE" ? "Bandbreite der EBITDA-Multiplikatoren" : "Range of EBITDA multiples";

      var bars = "";
      horizons.forEach(function(hItem, idx) {
        var yCenter = pT + (idx + 0.5) * (cH / horizons.length);
        var ebitda = currentRows.find(function(r) { return r.Multiple_Name === "EBITDA-Multiple" && (r.Multiple_Date || "").startsWith(hItem.date.slice(0,4)); }) ||
                     currentRows.find(function(r) { return r.Multiple_Name === "EBITDA-Multiple"; });
        var ebit = currentRows.find(function(r) { return r.Multiple_Name === "EBIT-Multiple" && (r.Multiple_Date || "").startsWith(hItem.date.slice(0,4)); }) ||
                   currentRows.find(function(r) { return r.Multiple_Name === "EBIT-Multiple"; });

        bars += '<text x="' + (pL - 14) + '" y="' + (yCenter + 4) + '" fill="#333" font-size="11" font-weight="500" text-anchor="end">' + hItem.label + '</text>';

        if (ebitda) {
          var x1 = scaleX(ebitda.Multiple_Value_Lower || 0);
          var x2 = scaleX(ebitda.Multiple_Value_Upper || 0);
          var tip1 = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + hItem.label + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00338D; border:1px solid #FFFFFF;'></span><span>" + ebitdaLabel + " [" + Number(ebitda.Multiple_Value_Lower).toFixed(1) + "x, " + Number(ebitda.Multiple_Value_Upper).toFixed(1) + "x]</span></div>";
          bars += '<rect class="has-tooltip" data-tooltip="' + tip1 + '" x="' + x1 + '" y="' + (yCenter - 14) + '" width="' + Math.max(x2 - x1, 4) + '" height="11" fill="#00338D" style="cursor:pointer;"/>';
        }

        if (ebit) {
          var x1 = scaleX(ebit.Multiple_Value_Lower || 0);
          var x2 = scaleX(ebit.Multiple_Value_Upper || 0);
          var tip2 = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + hItem.label + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border:1px solid #FFFFFF;'></span><span>" + ebitLabel + " [" + Number(ebit.Multiple_Value_Lower).toFixed(1) + "x, " + Number(ebit.Multiple_Value_Upper).toFixed(1) + "x]</span></div>";
          bars += '<rect class="has-tooltip" data-tooltip="' + tip2 + '" x="' + x1 + '" y="' + (yCenter + 3) + '" width="' + Math.max(x2 - x1, 4) + '" height="11" fill="#00b8f5" style="cursor:pointer;"/>';
        }
      });

      var titleText = sector + " - " + (lang === "DE" ? "Multiples zum " : "Average multiples as at ") + (latestDate ? latestDate.split("T")[0] : "30/09/2026");

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">' + titleText + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          '<line x1="' + pL + '" y1="' + pT + '" x2="' + pL + '" y2="' + (h - pB) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          '<line x1="' + pL + '" y1="' + (h - pB) + '" x2="' + (pL + cW) + '" y2="' + (h - pB) + '" stroke="#CBD5E1" stroke-width="1"/>' +
          gridLines + bars +
          '<g transform="translate(' + (lang === "DE" ? w / 2 - 260 : w / 2 - 190) + ', ' + (h - 15) + ')">' +
            '<rect x="0" y="0" width="12" height="12" fill="#00338D"/><text x="18" y="10" font-size="11" fill="#333">' + ebitdaLabel + '</text>' +
            '<rect x="' + (lang === "DE" ? 280 : 210) + '" y="0" width="12" height="12" fill="#00b8f5"/><text x="' + (lang === "DE" ? 298 : 228) + '" y="10" font-size="11" fill="#333">' + ebitLabel + '</text>' +
          '</g>' +
        '</svg></div>';
    }

    function buildOvWaccHoriz(liveRows) {
      var latestDate = (liveRows || []).reduce(function(m, r) { return (r.Date_Data && r.Date_Data > m) ? r.Date_Data : m; }, "");
      var items = (liveRows || []).filter(function(r) { return r.Date_Data === latestDate; });

      var w = 640, h = 360, pL = 150, pR = 30, pT = 25, pB = 60;
      var cW = w - pL - pR, cH = h - pT - pB;
      var minX = 0.05, maxX = 0.12;
      var scaleX = function(v) { return pL + ((v - minX) / (maxX - minX)) * cW; };

      var gridLines = "";
      for (var v = 0.05; v <= 0.1201; v += 0.01) {
        var x = scaleX(v);
        gridLines += '<line x1="' + x + '" y1="' + pT + '" x2="' + x + '" y2="' + (pT + cH) + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<line x1="' + x + '" y1="' + (pT + cH) + '" x2="' + x + '" y2="' + (pT + cH + 4) + '" stroke="#CBD5E1" stroke-width="1"/>' +
                     '<text x="' + x + '" y="' + (pT + cH + 17) + '" fill="#666" font-size="10.5" text-anchor="middle">' + (v * 100).toFixed(1) + '%</text>';
      }

      var rowH = cH / Math.max(items.length, 1);
      var rangeWaccLabel = lang === "DE" ? "Bandbreite des WACC" : "Range of WACC";
      var bars = "";
      items.forEach(function(item, idx) {
        var y = pT + (idx + 0.5) * rowH;
        var x1 = scaleX(item.WACC_Value_Lower || 0), x2 = scaleX(item.WACC_Value_Upper || 0);
        var secName = (lang === "DE" && item.Sector_name_DE) ? item.Sector_name_DE : item.Sector_name_EN;
        var tipHtml = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + secName + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00338D; border:1px solid #FFFFFF;'></span><span>" + rangeWaccLabel + " [" + fmtPct(item.WACC_Value_Lower) + ", " + fmtPct(item.WACC_Value_Upper) + "]</span></div>";
        bars += '<text x="' + (pL - 10) + '" y="' + (y + 3) + '" fill="#666" font-size="10" text-anchor="end">' + secName + '</text>' +
                '<rect class="has-tooltip" data-tooltip="' + tipHtml + '" x="' + x1 + '" y="' + (y - 4) + '" width="' + Math.max(x2 - x1, 4) + '" height="8" fill="#00338D" style="cursor:pointer;"/>';
      });

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:14px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:400;">' + (lang === "DE" ? "Aktuelle gewichtete durchschnittliche Kapitalkosten (WACC)" : "Current weighted average cost of capital (WACC)") + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          gridLines + bars +
          '<g transform="translate(' + (w / 2 - 80) + ', ' + (pT + cH + 40) + ')">' +
            '<rect x="0" y="-10" width="12" height="12" fill="#00338D"/><text x="18" y="0" fill="#666" font-size="11">' + rangeWaccLabel + '</text>' +
          '</g>' +
        '</svg></div>';
    }

    function buildOvMultiplesHoriz(liveRows) {
      var latestDate = (liveRows || []).reduce(function(m, r) { return (r.Date_Data && r.Date_Data > m) ? r.Date_Data : m; }, "");
      var allRows = (liveRows || []).filter(function(r) { return r.Date_Data === latestDate; });
      var secKey = lang === "DE" ? "Sector_name_DE" : "Sector_name_EN";
      var sectors = [];
      allRows.forEach(function(r) {
        var s = r[secKey] || r.Sector_name_EN;
        if (s && sectors.indexOf(s) === -1) sectors.push(s);
      });

      var w = 640, h = 360, pL = 150, pR = 30, pT = 25, pB = 60;
      var cW = w - pL - pR, cH = h - pT - pB;
      var maxX = 60.0;
      var scaleX = function(v) { return pL + (v / maxX) * cW; };

      var gridLines = "";
      for (var v = 0; v <= 60.01; v += 10.0) {
        var x = scaleX(v);
        gridLines += '<line x1="' + x + '" y1="' + pT + '" x2="' + x + '" y2="' + (pT + cH) + '" stroke="#E2E8F0" stroke-width="1"/>' +
                     '<line x1="' + x + '" y1="' + (pT + cH) + '" x2="' + x + '" y2="' + (pT + cH + 4) + '" stroke="#CBD5E1" stroke-width="1"/>' +
                     '<text x="' + x + '" y="' + (pT + cH + 17) + '" fill="#666" font-size="10.5" text-anchor="middle">' + v.toFixed(1) + ' x</text>';
      }

      var ebitLabel = lang === "DE" ? "Bandbreite der EBIT-Multiplikatoren" : "Range of EBIT multiples";
      var ebitdaLabel = lang === "DE" ? "Bandbreite der EBITDA-Multiplikatoren" : "Range of EBITDA multiples";

      var rowH = cH / Math.max(sectors.length, 1);
      var bars = "";
      sectors.forEach(function(sec, idx) {
        var y = pT + (idx + 0.5) * rowH;
        var ebitda = allRows.find(function(r) { return (r[secKey] === sec || r.Sector_name_EN === sec) && r.Multiple_Name === "EBITDA-Multiple"; });
        var ebit = allRows.find(function(r) { return (r[secKey] === sec || r.Sector_name_EN === sec) && r.Multiple_Name === "EBIT-Multiple"; });

        bars += '<text x="' + (pL - 10) + '" y="' + (y + 3) + '" fill="#666" font-size="10" text-anchor="end">' + sec + '</text>';
        if (ebit) {
          var x1 = scaleX(ebit.Multiple_Value_Lower || 0), x2 = scaleX(ebit.Multiple_Value_Upper || 0);
          var ebitTip = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + sec + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border:1px solid #FFFFFF;'></span><span>" + ebitLabel + " [" + Number(ebit.Multiple_Value_Lower).toFixed(1) + "x, " + Number(ebit.Multiple_Value_Upper).toFixed(1) + "x]</span></div>";
          bars += '<rect class="has-tooltip" data-tooltip="' + ebitTip + '" x="' + x1 + '" y="' + (y - 6) + '" width="' + Math.max(x2 - x1, 4) + '" height="5" fill="#00b8f5" style="cursor:pointer;"/>';
        }
        if (ebitda) {
          var x1 = scaleX(ebitda.Multiple_Value_Lower || 0), x2 = scaleX(ebitda.Multiple_Value_Upper || 0);
          var ebitdaTip = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + sec + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00338D; border:1px solid #FFFFFF;'></span><span>" + ebitdaLabel + " [" + Number(ebitda.Multiple_Value_Lower).toFixed(1) + "x, " + Number(ebitda.Multiple_Value_Upper).toFixed(1) + "x]</span></div>";
          bars += '<rect class="has-tooltip" data-tooltip="' + ebitdaTip + '" x="' + x1 + '" y="' + (y + 1) + '" width="' + Math.max(x2 - x1, 4) + '" height="5" fill="#00338D" style="cursor:pointer;"/>';
        }
      });

      return '<div style="background:#fff; padding:6px 0;">' +
        '<h3 style="font-size:14px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:400;">' + (lang === "DE" ? "Aktuelle Bandbreiten der Branchenmultiplikatoren" : "Current Industry Multiple Ranges") + '</h3>' +
        '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%; height:auto;">' +
          gridLines + bars +
          '<g transform="translate(' + (w / 2 - (lang === 'DE' ? 260 : 190)) + ', ' + (pT + cH + 42) + ')">' +
            '<rect x="0" y="-10" width="12" height="12" fill="#00b8f5"/><text x="18" y="0" fill="#666" font-size="11">' + ebitLabel + '</text>' +
            '<rect x="' + (lang === "DE" ? 270 : 200) + '" y="-10" width="12" height="12" fill="#00338D"/><text x="' + (lang === "DE" ? 288 : 218) + '" y="0" fill="#666" font-size="11">' + ebitdaLabel + '</text>' +
          '</g>' +
        '</svg></div>';
    }

    // Dynamic Chart Generator Router: Returns complete SVG/Table HTML for individual charts
    function renderDynamic(liveRows) {
      if (templateId === "wacc_band_over_time") return buildWaccBand(liveRows);
      if (templateId === "wacc_params_table") return buildWaccParams(liveRows);
      if (templateId === "wacc_countries_table") return buildCountriesTable(liveRows, "WACC_Countries");
      if (templateId === "wacc_subindustries_table") return buildSubIndustriesTable(liveRows, "WACC_SubIndustries");
      if (templateId === "multiples_columns_over_time") return buildMultiplesColumns(liveRows);
      if (templateId === "multiples_forecast_bars") return buildMultiplesForecastBars(liveRows);
      if (templateId === "multiples_countries_table") return buildCountriesTable(liveRows, "Multiples_Countries");
      if (templateId === "multiples_subindustries_table") return buildSubIndustriesTable(liveRows, "Multiples_SubIndustries");
      if (templateId === "mrp_3line_trend") return buildMrp3Line(liveRows, false);
      if (templateId === "ov_mrp_trend") return buildMrp3Line(liveRows, true);
      if (templateId === "mrp_tenure_step_curve") return buildTenureStepCurve(liveRows);
      if (templateId === "crp_rating_lines") return buildCrpRatingLines(liveRows);
      if (templateId === "crp_countries_table") return buildCrpCountriesTable(liveRows);
      if (templateId === "crp_bars_over_time" || templateId === "ov_crp_bars") return buildOvCrpBars(liveRows);
      if (templateId === "ov_wacc_horiz") return buildOvWaccHoriz(liveRows);
      if (templateId === "ov_multiples_horiz") return buildOvMultiplesHoriz(liveRows);
      return null;
    }

  // Dynamic Schema.org Generator: Reconstructs fresh observations directly from live API data
  function buildDynamicObservations(liveRows, secondaryRows) {
    var obs = [];
    var isDE = lang === "DE";

    if (templateId === "mrp_3line_trend" || templateId === "mrp_full_page") {
      (liveRows || []).forEach(function(r) {
        if (!r.Date) return;
        obs.push({
          "@type": "Dataset",
          "name": isDE ? ("Deutschland Bewertungssätze (" + fmtDateQ(r.Date) + ")") : ("Germany Valuation Rates (" + fmtDateQ(r.Date) + ")"),
          "temporalCoverage": r.Date.split("T")[0],
          "variableMeasured": [
            { "@type": "PropertyValue", "name": isDE ? "Gesamtrendite" : "Total Return (Gesamtrendite)", "value": Number((r.Gesamtrendite * 100).toFixed(2)), "unitText": "%" },
            { "@type": "PropertyValue", "name": isDE ? "Basiszinssatz" : "Base Rate (Basiszins)", "value": Number((r.Basiszins * 100).toFixed(2)), "unitText": "%" },
            { "@type": "PropertyValue", "name": isDE ? "Marktrisikoprämie" : "Market Risk Premium (MRP)", "value": Number((r.MRP * 100).toFixed(2)), "unitText": "%" }
          ]
        });
      });
    }

    if (templateId === "mrp_tenure_step_curve" || (templateId === "mrp_full_page" && secondaryRows)) {
      var stepRows = templateId === "mrp_full_page" ? secondaryRows : liveRows;
      if (Array.isArray(stepRows) && stepRows.length > 0) {
        obs.push({
          "@type": "Dataset",
          "name": isDE ? "Basiszinssatzkurve nach Laufzeit" : "Risk-Free Rates Curve by Tenure",
          "variableMeasured": stepRows.map(function(r) {
            return {
              "@type": "PropertyValue",
              "name": isDE ? ("Laufzeit " + r.Tenure + " Jahr(e)") : ("Tenure " + r.Tenure + " Year(s)"),
              "value": Number((r.BZ * 100).toFixed(2)),
              "unitText": "%"
            };
          })
        });
      }
    }

    if (templateId === "crp_rating_lines" || templateId === "crp_full_page") {
      (liveRows || []).forEach(function(r) {
        if (!r.Date) return;
        obs.push({
          "@type": "Dataset",
          "name": isDE ? ("Länderrisikoprämie: Rating " + r.Rating + " (" + fmtDateQ(r.Date) + ")") : ("Country Risk Premium: Rating " + r.Rating + " (" + fmtDateQ(r.Date) + ")"),
          "temporalCoverage": r.Date.split("T")[0],
          "variableMeasured": [
            { "@type": "PropertyValue", "name": "CRP (" + r.Rating + ")", "value": Number((r.Median * 100).toFixed(2)), "unitText": "%" }
          ]
        });
      });
    }

    if (templateId === "crp_countries_table" || (templateId === "crp_full_page" && secondaryRows)) {
      var cRows = templateId === "crp_full_page" ? secondaryRows : liveRows;
      if (Array.isArray(cRows)) {
        cRows.forEach(function(r) {
          var ctry = isDE ? (r.Ctry_Name_DE || r.Ctry_Name_EN || r.Country) : (r.Ctry_Name_EN || r.Country);
          obs.push({
            "@type": "Dataset",
            "name": ctry + " (Rating " + r.Rating + ")",
            "variableMeasured": [
              { "@type": "PropertyValue", "name": isDE ? "Länderrisikoprämie 6 Monate" : "6 Months CRP", "value": Number((r.CRP_6m * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": isDE ? "Länderrisikoprämie 1 Jahr" : "1 Year CRP", "value": Number((r.CRP_1y * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": isDE ? "Länderrisikoprämie 2 Jahre" : "2 Years CRP", "value": Number((r.CRP_2y * 100).toFixed(2)), "unitText": "%" }
            ]
          });
        });
      }
    }

    if (templateId === "wacc_band_over_time" || templateId === "wacc_full_grid") {
      var sRows = (liveRows || []).filter(function(d) {
        return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
      }).sort(function(a, b) { return a.Date_Data.localeCompare(b.Date_Data); });
      sRows.forEach(function(r) {
        obs.push({
          "@type": "Dataset",
          "name": sector + " - " + fmtDateQ(r.Date_Data),
          "temporalCoverage": r.Date_Data ? r.Date_Data.split("T")[0] : "",
          "variableMeasured": [
            {
              "@type": "PropertyValue",
              "name": isDE ? "Median des WACC" : "Median of WACC",
              "value": Number((r.WACC_Value_Median * 100).toFixed(2)),
              "minValue": Number((r.WACC_Value_Lower * 100).toFixed(2)),
              "maxValue": Number((r.WACC_Value_Upper * 100).toFixed(2)),
              "unitText": "%"
            }
          ]
        });
      });
    }

    if (templateId === "multiples_columns_over_time" || templateId === "multiples_forecast_bars" || templateId === "multiples_full_grid") {
      var mRows = (liveRows || []).filter(function(d) {
        return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
      }).sort(function(a, b) { return (a.Date_Data || "").localeCompare(b.Date_Data || ""); });
      mRows.forEach(function(r) {
        var label = r.Date_Data ? fmtDateQ(r.Date_Data) : (r.Year || "");
        obs.push({
          "@type": "Dataset",
          "name": sector + " " + (r.Multiple_Type || "Multiples") + " (" + label + ")",
          "temporalCoverage": r.Date_Data ? r.Date_Data.split("T")[0] : (r.Year || ""),
          "variableMeasured": [
            {
              "@type": "PropertyValue",
              "name": (r.Multiple_Type || "Multiple") + " (Lower)",
              "value": Number(r.Multiple_Value_Lower || 0),
              "unitText": "x"
            },
            {
              "@type": "PropertyValue",
              "name": (r.Multiple_Type || "Multiple") + " (Upper)",
              "value": Number(r.Multiple_Value_Upper || 0),
              "unitText": "x"
            }
          ]
        });
      });
    }

    if (templateId === "ov_full_grid" || templateId === "ov_wacc_horiz") {
      var wRows = (liveRows || []).slice();
      var latestDate = wRows.reduce(function(m, r) { return (r.Date_Data && r.Date_Data > m) ? r.Date_Data : m; }, "");
      var items = wRows.filter(function(r) { return r.Date_Data === latestDate; });
      items.forEach(function(r) {
        var sec = isDE ? (r.Sector_name_DE || r.Sector_name_EN) : r.Sector_name_EN;
        obs.push({
          "@type": "Dataset",
          "name": sec + " WACC (" + (latestDate ? latestDate.split("T")[0] : "") + ")",
          "variableMeasured": [
            { "@type": "PropertyValue", "name": "WACC Lower", "value": Number((r.WACC_Value_Lower * 100).toFixed(2)), "unitText": "%" },
            { "@type": "PropertyValue", "name": "WACC Upper", "value": Number((r.WACC_Value_Upper * 100).toFixed(2)), "unitText": "%" }
          ]
        });
      });
    }

    return obs;
  }

  // Dynamic Schema.org Generator: Injects fresh JSON-LD into DOM directly from live API data
  function updateDynamicSchema(liveRows, secondaryRows) {
    var schemaEl = document.getElementById("schema_" + cId);
    if (!schemaEl) {
      schemaEl = document.createElement("script");
      schemaEl.type = "application/ld+json";
      schemaEl.id = "schema_" + cId;
      document.head.appendChild(schemaEl);
    }

    var dynamicObs = buildDynamicObservations(liveRows, secondaryRows);
    var baseObj = null;
    try {
      if (schemaEl.textContent) {
        baseObj = JSON.parse(schemaEl.textContent);
      }
    } catch (e) {}

    var schemaObj = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": (baseObj && baseObj.name) || "${(title || '').replace(/"/g, '\\"')}",
      "inLanguage": lang === "DE" ? "de-DE" : "en-US",
      "description": (baseObj && baseObj.description) || "${lang === 'DE' ? 'Strukturierter Datensatz veröffentlicht über KPMG Atlas.' : 'Structured dataset published via KPMG Atlas.'}",
      "creator": { "@type": "Organization", "name": "KPMG Deal Advisory" },
      "distribution": {
        "@type": "DataDownload",
        "encodingFormat": "application/json",
        "contentUrl": apiUrl
      },
      "temporalCoverage": new Date().toISOString().substring(0, 10),
      "hasPart": (dynamicObs && dynamicObs.length > 0) ? dynamicObs : (baseObj && baseObj.hasPart ? baseObj.hasPart : [])
    };
    schemaEl.textContent = JSON.stringify(schemaObj, null, 2);
  }

  // Live Fetch API Execution (Simple GET requests without preflight headers to avoid CORS OPTIONS rejection)
  function syncLiveApi() {
    if (templateId === "wacc_full_grid") {
      var u1 = "${cleanApiBase}/WACC_Values";
      var u2 = "${cleanApiBase}/WACC_Countries";
      var u3 = "${cleanApiBase}/WACC_SubIndustries";
      Promise.all([
        fetch(u1).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u2).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u3).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      ]).then(function(resArr) {
        var waccRows = resArr[0], ctryRows = resArr[1], subRows = resArr[2];
        if (stage) {
          var bandSlot = stage.querySelector('[data-widget-slot="wacc_band"]');
          var ctrySlot = stage.querySelector('[data-widget-slot="wacc_countries"]');
          var paramsSlot = stage.querySelector('[data-widget-slot="wacc_params"]');
          var subSlot = stage.querySelector('[data-widget-slot="wacc_subindustries"]');
          if (bandSlot && ctrySlot && paramsSlot && subSlot) {
            bandSlot.innerHTML = buildWaccBand(waccRows);
            ctrySlot.innerHTML = buildCountriesTable(ctryRows, "WACC_Countries");
            paramsSlot.innerHTML = buildWaccParams(waccRows);
            subSlot.innerHTML = buildSubIndustriesTable(subRows, "WACC_SubIndustries");
          } else {
            stage.innerHTML = '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px;">' +
              '<div data-widget-slot="wacc_band" style="padding:6px 0;">' + buildWaccBand(waccRows) + '</div>' +
              '<div data-widget-slot="wacc_countries" style="padding:6px 0;">' + buildCountriesTable(ctryRows, "WACC_Countries") + '</div>' +
              '<div data-widget-slot="wacc_params" style="padding:6px 0;">' + buildWaccParams(waccRows) + '</div>' +
              '<div data-widget-slot="wacc_subindustries" style="padding:6px 0;">' + buildSubIndustriesTable(subRows, "WACC_SubIndustries") + '</div>' +
            '</div>';
          }
        }
        updateDynamicSchema(waccRows);
      }).catch(function(err) {
        console.warn("[KPMG Atlas Live Widget] WACC Full sync skipped:", err.message);
      });
      return;
    }

    if (templateId === "multiples_full_grid") {
      var u1 = "${cleanApiBase}/Multiples_Values";
      var u2 = "${cleanApiBase}/Multiples_Countries";
      var u3 = "${cleanApiBase}/Multiples_SubIndustries";
      Promise.all([
        fetch(u1).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u2).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u3).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      ]).then(function(resArr) {
        var multRows = resArr[0], ctryRows = resArr[1], subRows = resArr[2];
        if (stage) {
          var colSlot = stage.querySelector('[data-widget-slot="multiples_columns"]');
          var ctrySlot = stage.querySelector('[data-widget-slot="multiples_countries"]');
          var fcastSlot = stage.querySelector('[data-widget-slot="multiples_forecast"]');
          var subSlot = stage.querySelector('[data-widget-slot="multiples_subindustries"]');
          if (colSlot && ctrySlot && fcastSlot && subSlot) {
            colSlot.innerHTML = buildMultiplesColumns(multRows);
            ctrySlot.innerHTML = buildCountriesTable(ctryRows, "Multiples_Countries");
            fcastSlot.innerHTML = buildMultiplesForecastBars(multRows);
            subSlot.innerHTML = buildSubIndustriesTable(subRows, "Multiples_SubIndustries");
          } else {
            stage.innerHTML = '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px;">' +
              '<div data-widget-slot="multiples_columns" style="padding:6px 0;">' + buildMultiplesColumns(multRows) + '</div>' +
              '<div data-widget-slot="multiples_countries" style="padding:6px 0;">' + buildCountriesTable(ctryRows, "Multiples_Countries") + '</div>' +
              '<div data-widget-slot="multiples_forecast" style="padding:6px 0;">' + buildMultiplesForecastBars(multRows) + '</div>' +
              '<div data-widget-slot="multiples_subindustries" style="padding:6px 0;">' + buildSubIndustriesTable(subRows, "Multiples_SubIndustries") + '</div>' +
            '</div>';
          }
        }
        updateDynamicSchema(multRows);
      }).catch(function(err) {
        console.warn("[KPMG Atlas Live Widget] Multiples Full sync skipped:", err.message);
      });
      return;
    }

    if (templateId === "mrp_full_page") {
      var u1 = "${cleanApiBase}/MRP_BZ";
      var u2 = "${cleanApiBase}/BZ_CreditSpread";
      Promise.all([
        fetch(u1).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u2).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      ]).then(function(resArr) {
        var mrpRows = resArr[0], bzRows = resArr[1];
        if (stage) {
          var tSlot = stage.querySelector('[data-widget-slot="mrp_trend"]');
          var sSlot = stage.querySelector('[data-widget-slot="mrp_step"]');
          if (tSlot && sSlot) {
            tSlot.innerHTML = buildMrp3Line(mrpRows, false);
            sSlot.innerHTML = buildTenureStepCurve(bzRows);
          } else {
            stage.innerHTML = '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px; align-items:start;">' +
              '<div data-widget-slot="mrp_trend" style="padding:6px 0;">' + buildMrp3Line(mrpRows, false) + '</div>' +
              '<div data-widget-slot="mrp_step" style="padding:6px 0;">' + buildTenureStepCurve(bzRows) + '</div>' +
            '</div>';
          }
        }
        updateDynamicSchema(mrpRows, bzRows);
      }).catch(function(err) {
        console.warn("[KPMG Atlas Live Widget] MRP Full sync skipped:", err.message);
      });
      return;
    }

    if (templateId === "crp_full_page") {
      var u1 = "${cleanApiBase}/LRP_AverageOverTime";
      var u2 = "${cleanApiBase}/LRP_SelectedCountries";
      Promise.all([
        fetch(u1).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u2).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      ]).then(function(resArr) {
        var lrpRows = resArr[0], ctryRows = resArr[1];
        if (stage) {
          var rSlot = stage.querySelector('[data-widget-slot="crp_rating_lines"]');
          var cSlot = stage.querySelector('[data-widget-slot="crp_countries"]');
          if (rSlot && cSlot) {
            rSlot.innerHTML = buildCrpRatingLines(lrpRows);
            cSlot.innerHTML = buildCrpCountriesTable(ctryRows);
          } else {
            stage.innerHTML = '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px; align-items:start;">' +
              '<div data-widget-slot="crp_rating_lines" style="padding:6px 0;">' + buildCrpRatingLines(lrpRows) + '</div>' +
              '<div data-widget-slot="crp_countries" style="padding:6px 0;">' + buildCrpCountriesTable(ctryRows) + '</div>' +
            '</div>';
          }
        }
        updateDynamicSchema(lrpRows, ctryRows);
      }).catch(function(err) {
        console.warn("[KPMG Atlas Live Widget] CRP Full sync skipped:", err.message);
      });
      return;
    }

    if (templateId === "ov_full_grid") {
      var u1 = "${cleanApiBase}/WACC_Values";
      var u2 = "${cleanApiBase}/Multiples_Values";
      var u3 = "${cleanApiBase}/MRP_BZ";
      var u4 = "${cleanApiBase}/LRP_AverageLRPs";
      Promise.all([
        fetch(u1).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u2).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u3).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
        fetch(u4).then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      ]).then(function(resArr) {
        var waccRows = resArr[0], multRows = resArr[1], mrpRows = resArr[2], crpRows = resArr[3];
        if (stage) {
          var waccSlot = stage.querySelector('[data-widget-slot="ov_wacc"]');
          var multSlot = stage.querySelector('[data-widget-slot="ov_multiples"]');
          var mrpSlot = stage.querySelector('[data-widget-slot="ov_mrp"]');
          var crpSlot = stage.querySelector('[data-widget-slot="ov_crp"]');
          if (waccSlot && multSlot && mrpSlot && crpSlot) {
            waccSlot.innerHTML = buildOvWaccHoriz(waccRows);
            multSlot.innerHTML = buildOvMultiplesHoriz(multRows);
            mrpSlot.innerHTML = buildMrp3Line(mrpRows, true);
            crpSlot.innerHTML = buildOvCrpBars(crpRows);
          } else {
            stage.innerHTML = '<div class="overview-dashboard-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px;">' +
              '<div data-widget-slot="ov_wacc" style="padding:6px 0;">' + buildOvWaccHoriz(waccRows) + '</div>' +
              '<div data-widget-slot="ov_multiples" style="padding:6px 0;">' + buildOvMultiplesHoriz(multRows) + '</div>' +
              '<div data-widget-slot="ov_mrp" style="padding:6px 0;">' + buildMrp3Line(mrpRows, true) + '</div>' +
              '<div data-widget-slot="ov_crp" style="padding:6px 0;">' + buildOvCrpBars(crpRows) + '</div>' +
            '</div>';
          }
        }
        updateDynamicSchema(waccRows);
      }).catch(function(err) {
        console.warn("[KPMG Atlas Live Widget] Overview Grid sync skipped:", err.message);
      });
      return;
    }

    fetch(apiUrl)
      .then(function(res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function(liveRows) {
        if (!Array.isArray(liveRows) || liveRows.length === 0) {
          throw new Error("No data returned from API");
        }
        var html = renderDynamic(liveRows);
        if (html && stage) {
          stage.innerHTML = html;
        }
        updateDynamicSchema(liveRows);
      })
      .catch(function(err) {
        console.warn("[KPMG Atlas Live Widget] Live sync skipped:", err.message);
      });
  }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", syncLiveApi);
    } else {
      syncLiveApi();
    }
  })();
  <\/script>
</div>

<!-- Schema.org JSON-LD (Search Crawler & AI Indexing) -->
<script type="application/ld+json" id="schema_${uid}">
${jsonLdContent}
<\/script>
`;

  return snippet;
}
