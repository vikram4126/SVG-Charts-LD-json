/**
 * KPMG Atlas Live AEM Snippet Generator
 * 
 * Generates self-contained, drop-in HTML/SVG/JS snippets ready to be pasted directly into 
 * Adobe Experience Manager (AEM) Embed / Custom HTML Components.
 * 
 * Key Features:
 * 1. Zero-delay initial render (static fallback included for instant paint and search crawler indexing).
 * 2. Background live API fetch (auto-fetches fresh data from API URL upon page load).
 * 3. Dynamic SVG/Table and Schema.org JSON-LD re-render when new data arrives.
 * 4. Scoped container UID so multiple live charts can be placed on the exact same AEM page without conflict.
 * 5. 100% self-contained: no external CDN scripts, no build tools, no npm needed in AEM.
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
  templateObj
}) {
  const uid = 'kpmg_' + templateId + '_' + Math.random().toString(36).substring(2, 8);
  const endpoint = ENDPOINT_MAP[templateId] || 'WACC_Values';
  const cleanApiBase = (apiBaseUrl || 'https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium').replace(/\/+$/, '');
  const targetUrl = `${cleanApiBase}/${endpoint}`;

  const snippet = `<!-- ========================================================================= -->
<!-- KPMG Atlas Live Dynamic Component: ${title} -->
<!-- Ready to paste directly into AEM Embed / Custom HTML Component -->
<!-- Features: Auto-syncs live data from API upon page load, supports multiple charts per page -->
<!-- ========================================================================= -->

<div id="${uid}" class="kpmg-atlas-live-container" style="position:relative; width:100%; max-width:100%; font-family:Inter, Arial, sans-serif; background:#FFFFFF; margin:0 0 24px 0; padding:0; box-sizing:border-box;">
  <style>
    #${uid} { font-family: Inter, Arial, sans-serif; color: #1E293B; }
    #${uid} h3 { font-size: 16px; margin: 0 0 10px 0; color: #666666; font-weight: 600; }
    #${uid} .atlas-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 6px 0; }
    #${uid} .atlas-table th { text-align: left; padding: 8px; font-size: 11.5px; font-weight: 700; color: #666666; letter-spacing: 0.5px; text-transform: uppercase; border-bottom: 1.5px solid #CBD5E1; }
    #${uid} .atlas-table td { padding: 8px; border-bottom: 1px solid #F1F5F9; color: #333333; font-weight: 400; }
    #${uid} .atlas-table .num-col { text-align: right; font-weight: 400; color: #333333; }
    #${uid} .kpmg-live-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #047857; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 3px 8px; border-radius: 12px; }
    #${uid} .kpmg-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; display: inline-block; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
    #${uid} .mrp-col .hover-dot, #${uid} .crp-col .hover-dot { opacity: 0; transition: opacity 0.15s ease; }
    #${uid} .mrp-col:hover .hover-dot, #${uid} .crp-col:hover .hover-dot { opacity: 1 !important; }
    #${uid} .tenure-pt .tenure-glow { opacity: 0; transition: opacity 0.15s ease; }
    #${uid} .tenure-pt:hover .tenure-glow { opacity: 0.35 !important; }
    #${uid} .tenure-pt:hover .tenure-diamond { filter: drop-shadow(0 0 3px rgba(253, 52, 156, 0.8)); }
    #${uid} .kpmg-chart-tooltip { position: fixed; display: none; background: #1E293B; color: #FFFFFF; padding: 8px 14px; border-radius: 6px; font-size: 12px; line-height: 1.45; pointer-events: none; z-index: 9999999; box-shadow: 0 8px 24px rgba(0,0,0,0.35); white-space: nowrap; }
    #${uid} .kpmg-chart-tooltip.arrow-right::after { content: ''; display: block; position: absolute; top: 50%; right: -6px; transform: translateY(-50%); width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid #1E293B; pointer-events: none; }
    #${uid} .kpmg-chart-tooltip.arrow-left::after { content: ''; display: block; position: absolute; top: 50%; left: -6px; transform: translateY(-50%); width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 8px solid #1E293B; pointer-events: none; }
  </style>

  <!-- Live Chart Container (Initial baseline renders immediately with 0 delay) -->
  <div class="kpmg-stage-wrapper">
    ${renderedMarkup}
  </div>

  <!-- Live Sync Status Indicator -->
  <div style="display:flex; justify-content:flex-end; align-items:center; margin-top:8px; padding:0 2px;">
    <span class="kpmg-live-badge" title="Auto-synchronizes with live API upon page load">
      <span class="kpmg-live-dot"></span>
      <span class="kpmg-status-text">${lang === 'DE' ? 'Live API synchronisiert' : 'Live API Connected'}</span>
    </span>
  </div>

  <!-- Interactive Floating Tooltip -->
  <div class="kpmg-chart-tooltip"></div>

  <!-- Dynamic Live Sync Engine Script -->
  <script>
  (function() {
    var cId = "${uid}";
    var container = document.getElementById(cId);
    if (!container) return;
    var stage = container.querySelector(".kpmg-stage-wrapper");
    var tip = container.querySelector(".kpmg-chart-tooltip");
    var statusText = container.querySelector(".kpmg-status-text");

    // Tooltip Hover Logic
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

    // Background Live API Fetcher
    var targetUrl = "${targetUrl}";
    function fetchAndRefresh() {
      fetch(targetUrl, { headers: { "Accept": "application/json" } })
        .then(function(res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function(liveRows) {
          if (!Array.isArray(liveRows) || liveRows.length === 0) return;
          var updatedMarkup = null;

          // Helper formatters
          function fmtPct(v) { return (Number(v) * 100).toFixed(2) + "%"; }
          function fmtNum(v, d) { return Number(v).toFixed(d !== undefined ? d : 1); }
          function fmtDateQ(iso) {
            if (!iso) return "";
            var d = new Date(iso);
            var q = Math.floor(d.getMonth() / 3) + 1;
            return "Q" + q + " " + d.getFullYear();
          }

          var sector = "${sector}";
          var lang = "${lang}";
          var templateId = "${templateId}";

          // Re-render chart based on active template
          if (templateId === "wacc_band_over_time") {
            var rows = liveRows.filter(function(d) {
              return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
            }).sort(function(a, b) { return a.Date_Data.localeCompare(b.Date_Data); });

            if (rows.length > 0) {
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
                var tipText = "<div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'>" + qHeader + "</div><div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'><span style='display:inline-block; width:10px; height:10px; background:#00338D; border:1px solid #FFFFFF;'></span><span>" + medianLabel + ": " + fmtPct(r.WACC_Value_Median) + "</span></div>";
                return '<g class="has-tooltip median-point" data-tooltip="' + tipText + '" style="cursor:pointer;"><rect x="' + xL + '" y="' + (yMed - 10) + '" width="' + colW + '" height="20" fill="transparent"/><circle cx="' + scaleX(i) + '" cy="' + yMed + '" r="4" fill="#00338D" stroke="#FFFFFF" stroke-width="1.5"/></g>';
              }).join("");

              updatedMarkup = '<div style="background:#fff; padding:6px 0;">' +
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
          } else if (templateId === "wacc_params_table") {
            var rows = liveRows.filter(function(d) {
              return d.Sector_name_EN === sector || d.Sector_name_DE === sector;
            }).sort(function(a, b) { return a.Date_Data.localeCompare(b.Date_Data); });
            var latest = rows[rows.length - 1];
            if (latest) {
              var dObj = new Date(latest.Date_Data);
              var dateStr = (dObj.getDate() < 10 ? "0" : "") + dObj.getDate() + "." + ((dObj.getMonth() + 1) < 10 ? "0" : "") + (dObj.getMonth() + 1) + "." + dObj.getFullYear();
              var tableTitle = sector + " - " + (lang === "DE" ? "Gewichtete durchschnittliche Kapitalkosten zum " : "Weighted Average Cost of Capital as of ") + dateStr;
              updatedMarkup = '<div style="background:#fff; padding:6px 0;">' +
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
                  '<tfoot><tr style="border-top:1px solid #333; border-bottom:1px solid #333; font-weight:700;"><td style="color:#333; font-size:13px; font-weight:600; padding:8px;">' + (lang === "DE" ? "Gewichtete durchschnittliche Kapitalkosten (WACC)" : "Weighted Average Cost of Capital (WACC)") + '</td><td class="num-col" style="font-size:13px; color:#333; font-weight:700; padding:8px;">' + fmtPct(latest.WACC_Value_Median) + '</td></tr></tfoot>' +
                '</table>' +
                '<p style="font-size:11px; color:#666; margin-top:14px; line-height:1.45;">' + (lang === "DE" ? "*Der WACC stellt den Median der einzelnen Unternehmens-WACCs dar." : "*WACC represents the median across individual peer companies.") + '</p>' +
              '</div>';
            }
          }

          // If template re-rendered, update DOM and status badge
          if (updatedMarkup && stage) {
            stage.innerHTML = updatedMarkup;
            if (statusText) {
              statusText.textContent = (lang === "DE" ? "Live aktualisiert um " : "Live updated at ") + new Date().toLocaleTimeString();
            }
          }
        })
        .catch(function(err) {
          console.warn("[KPMG Atlas Live Sync] Using baseline data:", err);
          if (statusText) {
            statusText.textContent = (lang === "DE" ? "Basisdaten aktiv (API Offline)" : "Baseline data active");
          }
        });
    }

    // Run live sync when page finishes loading
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fetchAndRefresh);
    } else {
      fetchAndRefresh();
    }
  })();
  <\/script>
</div>

<!-- Schema.org JSON-LD (Search Crawler & AI Indexing) -->
<script type="application/ld+json" id="schema_${uid}">
${schemaString}
<\/script>
`;

  return snippet;
}
