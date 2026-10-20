// KPMG Atlas Chart Engine for React
import DB from "./data/kpmg_all_data.json";

export { DB };

const TEMPLATES = {
      cost_of_capital: [
        { id: "wacc_band_over_time", name: "WACC Over Time (Area Band + Median Line)", ep: "/WACC_Values", needsSector: true },
        { id: "wacc_params_table", name: "Parameter Breakdown Table (Equity & Debt Beta, Rf)", ep: "/WACC_Values", needsSector: true },
        { id: "wacc_countries_table", name: "Origin of Companies Table", ep: "/WACC_Countries", needsSector: true },
        { id: "wacc_subindustries_table", name: "Sub-Sectors Breakdown Table", ep: "/WACC_SubIndustries", needsSector: true },
        { id: "wacc_full_grid", name: "Complete Cost of Capital Dashboard", ep: "/WACC_Values", needsSector: true },
      ],
      multiples: [
        { id: "multiples_columns_over_time", name: "Average Multiples Over Time (Dual Columns)", ep: "/Multiples_Values", needsSector: true },
        { id: "multiples_forecast_bars", name: "Multiples Forecasts (+1y, +2y Horizon Bars)", ep: "/Multiples_Values", needsSector: true },
        { id: "multiples_countries_table", name: "Origin of Companies Table", ep: "/Multiples_Countries", needsSector: true },
        { id: "multiples_subindustries_table", name: "Sub-Sectors Breakdown Table", ep: "/Multiples_SubIndustries", needsSector: true },
        { id: "multiples_full_grid", name: "Complete Multiples Dashboard", ep: "/Multiples_Values", needsSector: true },
      ],
      mrp: [
        { id: "mrp_3line_trend", name: "Total Return, Risk-Free & MRP Trend (3 Lines)", ep: "/MRP_BZ", needsSector: false },
        { id: "mrp_tenure_step_curve", name: "Current Risk-Free Rate Step Curve (Tenure 1-30)", ep: "/BZ_CreditSpread", needsSector: false },
        { id: "mrp_full_page", name: "Complete MRP & Risk-Free Page", ep: "/MRP_BZ", needsSector: false },
      ],
      country_risk: [
        { id: "crp_rating_lines", name: "Country Risk Premium Over Time (BBB-, BBB, BBB+)", ep: "/LRP_AverageOverTime", needsSector: false },
        { id: "crp_countries_table", name: "Selected Countries Reporting Table", ep: "/LRP_SelectedCountries", needsSector: false },
        { id: "crp_full_page", name: "Complete Country Risk Page", ep: "/LRP_AverageOverTime", needsSector: false },
      ],
      overview: [
        { id: "ov_wacc_horiz", name: "Current WACC by Industry (Horizontal Range Bars)", ep: "/WACC_Values", needsSector: false },
        { id: "ov_multiples_horiz", name: "Current Industry Multiple Ranges (Horizontal Dual Bars)", ep: "/Multiples_Values", needsSector: false },
        { id: "ov_mrp_trend", name: "Market Risk Premium Trend", ep: "/MRP_BZ", needsSector: false },
        { id: "ov_crp_bars", name: "Country Risk Premium by Rating (Floating Bands)", ep: "/LRP_AverageLRPs", needsSector: false },
        { id: "ov_full_grid", name: "Complete Overview Dashboard", ep: "/WACC_Values", needsSector: false },
      ]
    };

    // Formatters
    const fmtPct = (val) => (Number(val) * 100).toFixed(2) + "%";
    const fmtNum = (val, d = 1) => Number(val).toFixed(d);
    const fmtDateQ = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `Q${q} ${d.getFullYear()}`;
    };

    function onCategoryChange() {
      const cat = document.getElementById("categorySelect").value;
      const tSelect = document.getElementById("templateSelect");
      const templates = TEMPLATES[cat] || [];

      tSelect.innerHTML = templates.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
      renderPreview();
    }

    function renderPreview() {
      const cat = document.getElementById("categorySelect").value;
      const templateId = document.getElementById("templateSelect").value;
      const sector = document.getElementById("industrySelect").value;
      const includeDropdown = document.getElementById("includeDropdownCheck").checked;

      const templateObj = (TEMPLATES[cat] || []).find(t => t.id === templateId);
      const sectorGroup = document.getElementById("sectorControlGroup");
      if (templateObj && templateObj.needsSector) {
        sectorGroup.style.display = "flex";
      } else {
        sectorGroup.style.display = "none";
      }

      document.getElementById("endpointBadge").textContent = templateObj ? templateObj.ep : "";

      let renderedHtml = "";
      let title = "";
      let subtitle = "";

      // Route to template renderer
      switch(templateId) {
        case "wacc_band_over_time":
          {
            title = `${sector} - Weighted average cost of capital over time`;
            subtitle = "Range of WACC (Teal Band) and Median of WACC (Navy Line) over quarters";
            renderedHtml = renderWaccBandOverTime(sector);
            break;
          }
        case "wacc_params_table":
          {
            title = `${sector} - Weighted average cost of capital as at 30/09/2026`;
            subtitle = "Detailed financial parameter breakdown (Cost of Equity & Cost of Debt)";
            renderedHtml = renderWaccParamsTable(sector);
            break;
          }
        case "wacc_countries_table":
          {
            title = `${sector} - Origin of all companies included in the entire database`;
            subtitle = "Number of analyzed companies grouped by country of origin";
            renderedHtml = renderCountriesTable("WACC_Countries", sector);
            break;
          }
        case "wacc_subindustries_table":
          {
            title = `${sector} - Sub-sectors included in the entire database`;
            subtitle = "Granular industry breakdown and sample count";
            renderedHtml = renderSubIndustriesTable("WACC_SubIndustries", sector);
            break;
          }
        case "wacc_full_grid":
          {
            title = `${sector} - Complete Cost of Capital Dashboard`;
            subtitle = "Comprehensive multi-component view for Cost of Capital";
            renderedHtml = renderFullWaccGrid(sector);
            break;
          }
        case "multiples_columns_over_time":
          {
            title = `${sector} - Average multiples over time`;
            subtitle = "Dual column chart: Range of EBITDA (Navy) & EBIT (Cyan) multiples";
            renderedHtml = renderMultiplesColumnsOverTime(sector);
            break;
          }
        case "multiples_forecast_bars":
          {
            title = `${sector} - Average multiples as at 30/09/2026`;
            subtitle = "Horizontal range comparisons: Actual (2026), +1Y Estimate (2027), +2Y Estimate (2028)";
            renderedHtml = renderMultiplesForecastBars(sector);
            break;
          }
        case "multiples_countries_table":
          {
            title = `${sector} - Origin of all companies (Multiples Database)`;
            subtitle = "Companies count by country";
            renderedHtml = renderCountriesTable("Multiples_Countries", sector);
            break;
          }
        case "multiples_subindustries_table":
          {
            title = `${sector} - Sub-sectors included (Multiples Database)`;
            subtitle = "Sub-industries breakdown";
            renderedHtml = renderSubIndustriesTable("Multiples_SubIndustries", sector);
            break;
          }
        case "multiples_full_grid":
          {
            title = `${sector} - Complete Multiples Dashboard`;
            subtitle = "Multi-component view with columns, forecast bars, and origin tables";
            renderedHtml = renderFullMultiplesGrid(sector);
            break;
          }
        case "mrp_3line_trend":
          {
            title = "Total rate of return, risk-free rate and market risk premium for Germany over time";
            subtitle = "Historical 3-line trend from Q3 2024 to Q3 2026";
            renderedHtml = renderMrp3LineTrend();
            break;
          }
        case "mrp_tenure_step_curve":
          {
            title = "Current risk-free rates";
            subtitle = "Risk-free rate (rounded) step curve by Tenure (1 to 30 years)";
            renderedHtml = renderTenureStepCurve();
            break;
          }
        case "mrp_full_page":
          {
            title = "Market risk premium as at 30/09/2026";
            subtitle = "The market risk premium for Germany proposed by KPMG as at 30/09/2026 is 5.25%.";
            renderedHtml = renderFullMrpPage();
            break;
          }
        case "crp_rating_lines":
          {
            title = "Country risk premium over time for countries with BBB rating codes";
            subtitle = "Trends across BBB-, BBB, and BBB+ ratings";
            renderedHtml = renderCrpRatingLines();
            break;
          }
        case "crp_countries_table":
          {
            title = "Country risk premium for selected countries at current reporting date";
            subtitle = "6 Months, 1 Year, and 2 Years tenor spreads";
            renderedHtml = renderSelectedCountriesCrpTable();
            break;
          }
        case "crp_full_page":
          {
            title = "Country risk premia as at 30/09/2026";
            subtitle = "Average country risk premium for BBB rating is 1.10%";
            renderedHtml = renderFullCrpPage();
            break;
          }
        case "ov_wacc_horiz":
          {
            title = "Current weighted average cost of capital (WACC)";
            subtitle = "Horizontal range bars across all 13 industries";
            renderedHtml = renderOverviewWaccHoriz();
            break;
          }
        case "ov_multiples_horiz":
          {
            title = "Current Industry Multiple Ranges";
            subtitle = "Horizontal dual range bars (EBITDA & EBIT) across all industries";
            renderedHtml = renderOverviewMultiplesHoriz();
            break;
          }
        case "ov_crp_bars":
          {
            title = "Current country risk premium per rating";
            subtitle = "Stepped floating range bars (AA to CCC)";
            renderedHtml = renderOverviewCrpBars();
            break;
          }
        case "ov_full_grid":
          {
            title = "Cost of Capital & Multiples Overview Dashboard";
            subtitle = "Complete Executive Overview Dashboard";
            renderedHtml = renderFullOverviewGrid();
            break;
          }
        default:
          renderedHtml = `<p>Please select a template</p>`;
      }

      document.getElementById("stageTitleHeading").textContent = title;
      document.getElementById("stageSubtitleText").textContent = subtitle;
      document.getElementById("stageContainer").innerHTML = renderedHtml;

      // Generate the self-contained code snippet for AEM with FULL JSON-LD DATA
      updateGeneratedCode(renderedHtml, title, templateId, sector, templateObj);
    }

    /* =========================================================================
       TEMPLATE RENDERERS
       ========================================================================= */

    // 1. WACC Area Band + Median Line Over Time
    function renderWaccBandOverTime(sector) {
      const rows = (DB.WACC_Values || []).filter(d => d.Sector_name_EN === sector).sort((a,b) => a.Date_Data.localeCompare(b.Date_Data));
      if (!rows.length) return `<p>No WACC data for ${sector}</p>`;

      const w = 640, h = 340;
      const pL = 75, pR = 30, pT = 25, pB = 65;
      const cW = w - pL - pR, cH = h - pT - pB;

      const minVal = 0.04, maxVal = 0.12; // 4.00% to 12.00% matching KPMG reference
      const scaleX = (i) => pL + (i / (rows.length - 1)) * cW;
      const scaleY = (v) => pT + cH - ((v - minVal) / (maxVal - minVal)) * cH;

      let gridLines = "";
      for (let v = 0.04; v <= 0.1201; v += 0.01) {
        const y = scaleY(v);
        gridLines += `
          <line x1="${pL}" y1="${y}" x2="${w - pR}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>
          <text x="${pL - 10}" y="${y + 4}" fill="#666" font-size="10.5" text-anchor="end">${(v * 100).toFixed(2)} %</text>
        `;
      }

      let upperPts = rows.map((r, i) => `${scaleX(i)},${scaleY(r.WACC_Value_Upper)}`).join(" ");
      let lowerPts = rows.slice().reverse().map((r, i) => `${scaleX(rows.length - 1 - i)},${scaleY(r.WACC_Value_Lower)}`).join(" ");
      let bandD = `M ${upperPts} L ${lowerPts} Z`;
      let medD = rows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(r.WACC_Value_Median)}`).join(" ");

      // Two-row centered Quarter & Year labels (Q on 1st row, Year on 2nd row)
      let xLabels = rows.map((r, i) => {
        const parts = fmtDateQ(r.Date_Data).split(" ");
        const qStr = parts[0] || "";
        const yrStr = parts[1] || "";
        return `
          <text x="${scaleX(i)}" y="${pT + cH + 16}" fill="#666" font-size="10.5" font-weight="500" text-anchor="middle">${qStr}</text>
          <text x="${scaleX(i)}" y="${pT + cH + 29}" fill="#666" font-size="10" text-anchor="middle">${yrStr}</text>
        `;
      }).join("");

      const legend = `
        <g transform="translate(${w / 2 - 120}, ${pT + cH + 48})">
          <rect x="0" y="-3" width="22" height="6" fill="#00338D"/>
          <text x="28" y="3" font-size="11" fill="#333" font-family="Inter, Arial, sans-serif">Median of WACC</text>
          <rect x="140" y="-3" width="22" height="6" fill="#00b8f5" fill-opacity="0.80"/>
          <text x="168" y="3" font-size="11" fill="#333" font-family="Inter, Arial, sans-serif">Range of WACC</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">${sector} - Weighted average cost of capital over time</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Solid Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${pT + cH}" x2="${w - pR}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            <!-- Light Blue Range Band -->
            <path d="${bandD}" fill="#00b8f5" fill-opacity="0.80" />

            <!-- Dark Navy Median Line -->
            <path d="${medD}" fill="none" stroke="#00338D" stroke-width="2.5" />

            <!-- Range of WACC Hitboxes (Triggers ONLY when hovering on the light blue area) -->
            ${rows.map((r, i) => {
              const parts = fmtDateQ(r.Date_Data).split(" ");
              const qHeader = `${parts[0] || ""} ${parts[1] || ""}`;
              const colW = cW / (rows.length - 1);
              const xL = scaleX(i) - colW / 2;
              const yTop = scaleY(r.WACC_Value_Upper);
              const yBottom = scaleY(r.WACC_Value_Lower);
              const bandH = Math.max(yBottom - yTop, 8);
              const rangeTip = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${qHeader}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border-radius:0px; flex-shrink:0;'&gt;&lt;/span&gt;&lt;span&gt;Range of WACC: &lt;strong style='color:#FFFFFF;'&gt;[${fmtPct(r.WACC_Value_Lower)}, ${fmtPct(r.WACC_Value_Upper)}]&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;`;
              return `
                <g class="has-tooltip" data-tooltip="${rangeTip}" style="cursor:pointer;">
                  <rect x="${xL}" y="${yTop}" width="${colW}" height="${bandH}" fill="transparent" />
                </g>
              `;
            }).join("")}

            <!-- Median of WACC Hitboxes (Placed on top so hovering on the navy line triggers ONLY Median) -->
            ${rows.map((r, i) => {
              const parts = fmtDateQ(r.Date_Data).split(" ");
              const qHeader = `${parts[0] || ""} ${parts[1] || ""}`;
              const colW = cW / (rows.length - 1);
              const xL = scaleX(i) - colW / 2;
              const yMed = scaleY(r.WACC_Value_Median);
              const medTip = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${qHeader}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00338D; border-radius:0px; flex-shrink:0;'&gt;&lt;/span&gt;&lt;span&gt;Median of WACC: &lt;strong style='color:#FFFFFF;'&gt;${fmtPct(r.WACC_Value_Median)}&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;`;
              return `
                <g class="has-tooltip median-point" data-tooltip="${medTip}" style="cursor:pointer;">
                  <rect x="${xL}" y="${yMed - 10}" width="${colW}" height="20" fill="transparent" />
                  <circle cx="${scaleX(i)}" cy="${yMed}" r="4" fill="#00338D" stroke="#FFFFFF" stroke-width="1.5" class="med-dot" style="opacity:0; transition:opacity 0.15s ease;" />
                </g>
              `;
            }).join("")}
            ${xLabels}
            ${legend}
            <!-- Rotated Y-axis label with plenty of clearance from percentage values -->
            <text x="18" y="${pT + cH/2}" fill="#666" font-size="11" transform="rotate(-90 18 ${pT + cH/2})" text-anchor="middle">WACC (in %)</text>
          </svg>
        </div>
      `;
    }

    // 2. Multiples Over Time Dual Columns
    function renderMultiplesColumnsOverTime(sector) {
      const allRows = (DB.Multiples_Values || []).filter(d => d.Sector_name_EN === sector);
      const dates = [...new Set(allRows.map(d => d.Date_Data))].sort();

      const w = 620, h = 320;
      const pL = 50, pR = 25, pT = 30, pB = 60;
      const cW = w - pL - pR, cH = h - pT - pB;

      // Check max value for this sector
      const maxDataVal = Math.max(
        ...allRows.map(r => Math.max(Number(r.Multiple_Value_Upper || 0), Number(r.Multiple_Value_Lower || 0))),
        0
      );

      // Tiered Y-axis scale:
      // value 20+ -> 25.0x, 25+ -> 30.0x, 30+ -> 35.0x, 35+ -> 40.0x, 40+ -> 45.0x, 45+ -> 50.0x, 50+ -> 60.0x
      let maxVal = 25.0;
      let step = 5.0;
      if (maxDataVal > 50.0) {
        maxVal = 60.0;
        step = 10.0;
        if (maxDataVal > 60.0) {
          maxVal = Math.ceil(maxDataVal / 10) * 10;
        }
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

      const scaleY = (v) => pT + cH - (v / maxVal) * cH;
      const colGroupW = cW / (dates.length || 1);

      let gridLines = "";
      for (let v = 0; v <= maxVal + 0.01; v += step) {
        const y = scaleY(v);
        gridLines += `
          <line x1="${pL}" y1="${y}" x2="${w - pR}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>
          <text x="${pL - 8}" y="${y + 4}" fill="#666" font-size="10.5" text-anchor="end">${v.toFixed(1)} x</text>
        `;
      }

      let bars = "";
      dates.forEach((d, i) => {
        const gX = pL + i * colGroupW;
        const ebitda = allRows.find(x => x.Multiple_Name === "EBITDA-Multiple" && x.Date_Data === d);
        const ebit = allRows.find(x => x.Multiple_Name === "EBIT-Multiple" && x.Date_Data === d);

        const parts = fmtDateQ(d).split(" ");
        const qStr = parts[0] || "";
        const yrStr = parts[1] || "";
        const qHeader = `${qStr},${yrStr}`;

        const bW = 10;
        if (ebitda) {
          const yU = scaleY(ebitda.Multiple_Value_Upper);
          const yL = scaleY(ebitda.Multiple_Value_Lower);
          const ebitdaTip = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${qHeader}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00338D; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;Range of EBITDA multiples [${Number(ebitda.Multiple_Value_Lower).toFixed(1)}x, ${Number(ebitda.Multiple_Value_Upper).toFixed(1)}x]&lt;/span&gt;&lt;/div&gt;`;
          bars += `<rect class="has-tooltip" data-tooltip="${ebitdaTip}" x="${gX + colGroupW*0.25 - bW/2}" y="${yU}" width="${bW}" height="${Math.max(yL - yU, 4)}" fill="#00338D" style="cursor:pointer;"/>`;
        }
        if (ebit) {
          const yU = scaleY(ebit.Multiple_Value_Upper);
          const yL = scaleY(ebit.Multiple_Value_Lower);
          const ebitTip = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${qHeader}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;Range of EBIT multiples [${Number(ebit.Multiple_Value_Lower).toFixed(1)}x, ${Number(ebit.Multiple_Value_Upper).toFixed(1)}x]&lt;/span&gt;&lt;/div&gt;`;
          bars += `<rect class="has-tooltip" data-tooltip="${ebitTip}" x="${gX + colGroupW*0.65 - bW/2}" y="${yU}" width="${bW}" height="${Math.max(yL - yU, 4)}" fill="#00b8f5" style="cursor:pointer;"/>`;
        }

        bars += `
          <text x="${gX + colGroupW/2}" y="${h - pB + 16}" fill="#666" font-size="10" font-weight="500" text-anchor="middle">${qStr}</text>
          <text x="${gX + colGroupW/2}" y="${h - pB + 29}" fill="#666" font-size="9.5" text-anchor="middle">${yrStr}</text>
        `;
      });

      const legend = `
        <g transform="translate(${w / 2 - 140}, ${h - 15})">
          <rect x="0" y="0" width="12" height="12" fill="#00338D"/>
          <text x="18" y="10" font-size="11" fill="#333">Range of EBITDA multiples</text>
          <rect x="170" y="0" width="12" height="12" fill="#00b8f5"/>
          <text x="188" y="10" font-size="11" fill="#333">Range of EBIT multiples</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">${sector} - Average multiples over time</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Solid Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${pT + cH}" x2="${w - pR}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            ${bars}
            ${legend}
          </svg>
        </div>
      `;
    }

    // 3. Multiples Forecast Horizon Bars
    function renderMultiplesForecastBars(sector) {
      const allRows = (DB.Multiples_Values || []).filter(d => d.Sector_name_EN === sector);
      const latestDate = allRows.reduce((m, r) => r.Date_Data > m ? r.Date_Data : m, "");
      const currentRows = allRows.filter(r => r.Date_Data === latestDate);

      const horizons = [
        { label: "+2 Year Estimate (2028)", date: "2028-12-31" },
        { label: "+1 Year Estimate (2027)", date: "2027-12-31" },
        { label: "Actual (2026)", date: "2026-12-31" }
      ];

      const w = 620, h = 260;
      const pL = 160, pR = 30, pT = 20, pB = 60;
      const cW = w - pL - pR, cH = h - pT - pB;

      // Check max value for current forecast rows
      const maxDataX = Math.max(
        ...currentRows.map(r => Math.max(Number(r.Multiple_Value_Upper || 0), Number(r.Multiple_Value_Lower || 0))),
        0
      );
      // Tiered X-axis scale:
      // value 20+ -> 25.0x, 25+ -> 30.0x, 30+ -> 35.0x, 35+ -> 40.0x, 40+ -> 45.0x, 45+ -> 50.0x, 50+ -> 60.0x
      let maxX = 25.0;
      let stepX = 5.0;
      if (maxDataX > 50.0) {
        maxX = 60.0;
        stepX = 10.0;
        if (maxDataX > 60.0) {
          maxX = Math.ceil(maxDataX / 10) * 10;
        }
      } else if (maxDataX > 45.0) {
        maxX = 50.0;
        stepX = 5.0;
      } else if (maxDataX > 40.0) {
        maxX = 45.0;
        stepX = 5.0;
      } else if (maxDataX > 35.0) {
        maxX = 40.0;
        stepX = 5.0;
      } else if (maxDataX > 30.0) {
        maxX = 35.0;
        stepX = 5.0;
      } else if (maxDataX > 25.0) {
        maxX = 30.0;
        stepX = 5.0;
      } else if (maxDataX > 20.0) {
        maxX = 25.0;
        stepX = 5.0;
      } else {
        maxX = 20.0;
        stepX = 5.0;
      }

      const scaleX = (v) => pL + (v / maxX) * cW;

      let gridLines = "";
      for (let v = 0; v <= maxX + 0.01; v += stepX) {
        const x = scaleX(v);
        gridLines += `
          <line x1="${x}" y1="${pT}" x2="${x}" y2="${h - pB}" stroke="#E2E8F0" stroke-width="1"/>
          <text x="${x}" y="${h - pB + 16}" fill="#666" font-size="10.5" text-anchor="middle">${v.toFixed(1)} x</text>
        `;
      }

      let bars = "";
      horizons.forEach((hItem, idx) => {
        const yCenter = pT + (idx + 0.5) * (cH / horizons.length);
        const ebitda = currentRows.find(r => r.Multiple_Name === "EBITDA-Multiple" && (r.Multiple_Date || "").startsWith(hItem.date.slice(0,4))) || currentRows.find(r => r.Multiple_Name === "EBITDA-Multiple");
        const ebit = currentRows.find(r => r.Multiple_Name === "EBIT-Multiple" && (r.Multiple_Date || "").startsWith(hItem.date.slice(0,4))) || currentRows.find(r => r.Multiple_Name === "EBIT-Multiple");

        bars += `<text x="${pL - 14}" y="${yCenter + 4}" fill="#333" font-size="11" font-weight="500" text-anchor="end">${hItem.label}</text>`;

        if (ebitda) {
          const x1 = scaleX(ebitda.Multiple_Value_Lower);
          const x2 = scaleX(ebitda.Multiple_Value_Upper);
          const ebitdaTip = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${hItem.label}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00338D; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;Range of EBITDA multiples [${Number(ebitda.Multiple_Value_Lower).toFixed(1)}x, ${Number(ebitda.Multiple_Value_Upper).toFixed(1)}x]&lt;/span&gt;&lt;/div&gt;`;
          bars += `<rect class="has-tooltip" data-tooltip="${ebitdaTip}" x="${x1}" y="${yCenter - 14}" width="${Math.max(x2 - x1, 4)}" height="11" fill="#00338D" style="cursor:pointer;"/>`;
        }

        if (ebit) {
          const x1 = scaleX(ebit.Multiple_Value_Lower);
          const x2 = scaleX(ebit.Multiple_Value_Upper);
          const ebitTip = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${hItem.label}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;Range of EBIT multiples [${Number(ebit.Multiple_Value_Lower).toFixed(1)}x, ${Number(ebit.Multiple_Value_Upper).toFixed(1)}x]&lt;/span&gt;&lt;/div&gt;`;
          bars += `<rect class="has-tooltip" data-tooltip="${ebitTip}" x="${x1}" y="${yCenter + 3}" width="${Math.max(x2 - x1, 4)}" height="11" fill="#00b8f5" style="cursor:pointer;"/>`;
        }
      });

      const legend = `
        <g transform="translate(${w / 2 - 140}, ${h - 15})">
          <rect x="0" y="0" width="12" height="12" fill="#00338D"/>
          <text x="18" y="10" font-size="11" fill="#333">Range of EBITDA multiples</text>
          <rect x="170" y="0" width="12" height="12" fill="#00b8f5"/>
          <text x="188" y="10" font-size="11" fill="#333">Range of EBIT multiples</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">${sector} - Average multiples as at 30/09/2026</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Solid Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${h - pB}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${h - pB}" x2="${pL + cW}" y2="${h - pB}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            ${bars}
            ${legend}
          </svg>
        </div>
      `;
    }

    // 4. Parameter Breakdown Table (Matches user's exact photo with Weighted Average Cost of Capital (WACC) row!)
    function renderWaccParamsTable(sector) {
      const rows = (DB.WACC_Values || []).filter(d => d.Sector_name_EN === sector);
      const item = rows.reduce((m, r) => r.Date_Data > m.Date_Data ? r : m, rows[0] || {});

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:14px; font-weight:600;">${sector} - Weighted average cost of capital as at 30/09/2026</h3>
          <table class="atlas-table">
            <thead>
              <tr>
                <th colspan="2" style="color:#333; font-size:12.5px; font-weight:700; text-transform:none; background:transparent;">Cost of Equity</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Risk-Free Rate</td><td class="num-col">${fmtPct(item.Rf)}</td></tr>
              <tr><td>Unlevered Beta</td><td class="num-col">${fmtNum(item.UnlevBeta, 2)}</td></tr>
              <tr><td>Debt Beta</td><td class="num-col">${fmtNum(item.BetaRelevered, 2)}</td></tr>
              <tr><td>Market Risk Premium</td><td class="num-col">${fmtPct(item.MRP)}</td></tr>
              <tr style="border-top:1px solid #CBD5E1;"><td>Levered Cost of Equity</td><td class="num-col">${fmtPct(item.LevCostOfEquity)}</td></tr>
              <tr><td>Equity Ratio</td><td class="num-col">${fmtPct(item.Equity_ratio)}</td></tr>
            </tbody>
            <thead>
              <tr>
                <th colspan="2" style="color:#333; font-size:12.5px; font-weight:700; text-transform:none; background:transparent;">Cost of Debt</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Risk-Free Rate</td><td class="num-col">${fmtPct(item.Rf)}</td></tr>
              <tr><td>Credit Spread</td><td class="num-col">${fmtPct(item.CreditSpread)}</td></tr>
              <tr><td>Tax Shield</td><td class="num-col">${fmtPct(item.TaxRate)}</td></tr>
              <tr style="border-top:1px solid #CBD5E1;"><td>Cost of Debt</td><td class="num-col">${fmtPct(item.CostOfDebtAfterTax)}</td></tr>
              <tr><td>Debt Ratio</td><td class="num-col">${fmtPct(item.Debt_ratio)}</td></tr>
            </tbody>
            <tfoot>
              <tr style="border-top:1px solid #333; border-bottom:1px solid #333; font-weight:700;">
                <td style="color:#333; font-size:13px; font-weight:600; padding:5px; border-bottom:1px solid #333;">Weighted Average Cost of Capital (WACC)</td>
                <td class="num-col" style="font-size:13px; color:#333; font-weight:700; padding:5px; border-bottom:1px solid #333;">${fmtPct(item.WACC_Value_Median)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="font-size:11px; color:#666; margin-top:14px; line-height:1.45;">
            *The WACC represents the median of the individual company WACCs within the selected industry and therefore cannot be directly derived from the average values of the individual WACC components presented in this table.
          </p>
        </div>
      `;
    }

    // 5. Origin of Companies Table
    function renderCountriesTable(datasetKey, sector) {
      const rows = (DB[datasetKey] || []).filter(d => d.Sector_name_EN === sector);
      const topCountries = rows.sort((a,b) => b.N_Companies - a.N_Companies).slice(0, 10);

      const trs = topCountries.map(r => `
        <tr>
          <td style="color:#333; font-weight:400;">${r.Country_EN}</td>
          <td class="num-col" style="color:#333; font-weight:400;">${Number(r.N_Companies).toLocaleString()}</td>
        </tr>
      `).join("");

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:12px; font-weight:600;">${sector} - Origin of all companies included in the entire database</h3>
          <table class="atlas-table">
            <thead>
              <tr>
                <th>Country</th>
                <th style="text-align:right; color:#666666;">Number of Companies</th>
              </tr>
            </thead>
            <tbody>
              ${trs}
            </tbody>
          </table>
        </div>
      `;
    }

    // 6. Sub-Sectors Breakdown Table
    function renderSubIndustriesTable(datasetKey, sector) {
      const rows = (DB[datasetKey] || []).filter(d => d.Sector_name_EN === sector);
      const topSubs = rows.sort((a,b) => b.N_Companies - a.N_Companies).slice(0, 10);

      const trs = topSubs.map(r => `
        <tr>
          <td style="color:#333; font-weight:400;">${r.SimpleIndustry_EN || r.SubIndustry_EN}</td>
          <td class="num-col" style="color:#333; font-weight:400;">${Number(r.N_Companies).toLocaleString()}</td>
        </tr>
      `).join("");

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:12px; font-weight:600;">${sector} - Sub-sectors included in the entire database</h3>
          <table class="atlas-table">
            <thead>
              <tr>
                <th>Sub-Industry</th>
                <th style="text-align:right; color:#666666;">Number of Companies</th>
              </tr>
            </thead>
            <tbody>
              ${trs}
            </tbody>
          </table>
        </div>
      `;
    }

    // 7. Complete WACC Dashboard
    function renderFullWaccGrid(sector) {
      return `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px;">
          <div style="padding:6px 0;">${renderWaccBandOverTime(sector)}</div>
          <div style="padding:6px 0;">${renderCountriesTable("WACC_Countries", sector)}</div>
          <div style="padding:6px 0;">${renderWaccParamsTable(sector)}</div>
          <div style="padding:6px 0;">${renderSubIndustriesTable("WACC_SubIndustries", sector)}</div>
        </div>
      `;
    }

    // 8. Complete Multiples Dashboard
    function renderFullMultiplesGrid(sector) {
      return `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px;">
          <div style="padding:6px 0;">${renderMultiplesColumnsOverTime(sector)}</div>
          <div style="padding:6px 0;">${renderCountriesTable("Multiples_Countries", sector)}</div>
          <div style="padding:6px 0;">${renderMultiplesForecastBars(sector)}</div>
          <div style="padding:6px 0;">${renderSubIndustriesTable("Multiples_SubIndustries", sector)}</div>
        </div>
      `;
    }

    // 9. MRP 3-Line Trend (Matches exact Photo 1 design with unified 3-metric tooltip)
    function renderMrp3LineTrend() {
      const rows = DB.MRP_BZ || [];
      const w = 640, h = 340;
      const pL = 55, pR = 25, pT = 30, pB = 65;
      const cW = w - pL - pR, cH = h - pT - pB;

      const minVal = 0.02, maxVal = 0.10; // 2% to 10%
      const scaleX = (i) => pL + (i / (rows.length - 1)) * cW;
      const scaleY = (v) => pT + cH - ((v - minVal) / (maxVal - minVal)) * cH;

      let gridLines = "";
      for (let v = 0.02; v <= 0.1001; v += 0.01) {
        const y = scaleY(v);
        gridLines += `
          <line x1="${pL}" y1="${y}" x2="${w - pR}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>
          <text x="${pL - 8}" y="${y + 4}" fill="#666" font-size="10.5" text-anchor="end">${(v * 100).toFixed(1)} %</text>
        `;
      }

      const totalPath = rows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(r.Gesamtrendite)}`).join(" ");
      const mrpPath = rows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(r.MRP)}`).join(" ");
      const rfPath = rows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(r.Basiszins)}`).join(" ");

      // Two-row centered Quarter & Year labels
      const xLabels = rows.map((r, i) => {
        const parts = fmtDateQ(r.Date).split(" ");
        const qStr = parts[0] || "";
        const yrStr = parts[1] || "";
        return `
          <text x="${scaleX(i)}" y="${pT + cH + 16}" fill="#666" font-size="10.5" font-weight="500" text-anchor="middle">${qStr}</text>
          <text x="${scaleX(i)}" y="${pT + cH + 29}" fill="#666" font-size="10" text-anchor="middle">${yrStr}</text>
        `;
      }).join("");

      // Interactive hover hitboxes matching photo 1 with full 3-metric tooltip
      const colW = cW / (rows.length - 1);
      const hitboxes = rows.map((r, i) => {
        const parts = fmtDateQ(r.Date).split(" ");
        const qHeader = `${parts[0] || ""},${parts[1] || ""}`;
        const tipHtml = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:6px; font-size:12px;'&gt;${qHeader}&lt;/div&gt;` +
          `&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0; margin-bottom:4px;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00338D; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;Total rate of return: &lt;strong style='color:#FFFFFF;'&gt;${fmtPct(r.Gesamtrendite)}&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;` +
          `&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0; margin-bottom:4px;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;Market risk premium: &lt;strong style='color:#FFFFFF;'&gt;${fmtPct(r.MRP)}&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;` +
          `&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#fd349c; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;Risk-free rate: &lt;strong style='color:#FFFFFF;'&gt;${fmtPct(r.Basiszins)}&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;`;

        return `
          <g class="has-tooltip mrp-col" data-tooltip="${tipHtml}" style="cursor:pointer;">
            <rect x="${scaleX(i) - colW/2}" y="${pT}" width="${colW}" height="${cH}" fill="transparent"/>
            <circle class="hover-dot" cx="${scaleX(i)}" cy="${scaleY(r.Gesamtrendite)}" r="4.5" fill="#00338D" pointer-events="none"/>
            <circle class="hover-dot" cx="${scaleX(i)}" cy="${scaleY(r.MRP)}" r="4.5" fill="#00b8f5" pointer-events="none"/>
            <circle class="hover-dot" cx="${scaleX(i)}" cy="${scaleY(r.Basiszins)}" r="4.5" fill="#fd349c" pointer-events="none"/>
          </g>
        `;
      }).join("");

      const legend = `
        <g transform="translate(${w / 2 - 180}, ${pT + cH + 48})">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#00338D" stroke-width="3"/>
          <text x="26" y="4" font-size="11" fill="#333">Total rate of return</text>
          <line x1="140" y1="0" x2="160" y2="0" stroke="#00b8f5" stroke-width="3"/>
          <text x="166" y="4" font-size="11" fill="#333">Market risk premium</text>
          <line x1="290" y1="0" x2="310" y2="0" stroke="#fd349c" stroke-width="3"/>
          <text x="316" y="4" font-size="11" fill="#333">Risk-free rate</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">Total rate of return, risk-free rate and market risk premium for Germany over time</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Solid Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${pT + cH}" x2="${w - pR}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            <path d="${totalPath}" fill="none" stroke="#00338D" stroke-width="2.5"/>
            <path d="${mrpPath}" fill="none" stroke="#00b8f5" stroke-width="2.5"/>
            <path d="${rfPath}" fill="none" stroke="#fd349c" stroke-width="2.5"/>
            ${hitboxes}
            ${xLabels}
            ${legend}
          </svg>
        </div>
      `;
    }

    // 9b. Complete MRP Page Container (Side-by-side Left and Right Layout)
    function renderFullMrpPage() {
      return `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px; align-items:start;">
          <div style="padding:6px 0;">${renderMrp3LineTrend()}</div>
          <div style="padding:6px 0;">${renderTenureStepCurve()}</div>
        </div>
      `;
    }

    // 10. Risk-Free Rate Step Curve (Matches exact Photo 2 design with tenure hover tooltip)
    function renderTenureStepCurve() {
      const rows = DB.BZ_CreditSpread || [];
      const w = 640, h = 340;
      const pL = 65, pR = 25, pT = 30, pB = 65;
      const cW = w - pL - pR, cH = h - pT - pB;

      const minVal = 0.024, maxVal = 0.036; // 2.4% to 3.6%
      const maxTenure = 30;
      const scaleX = (t) => pL + ((t - 1) / (maxTenure - 1)) * cW;
      const scaleY = (v) => pT + cH - ((v - minVal) / (maxVal - minVal)) * cH;

      let gridLines = "";
      for (let v = 0.024; v <= 0.0361; v += 0.002) {
        const y = scaleY(v);
        gridLines += `
          <line x1="${pL}" y1="${y}" x2="${w - pR}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>
          <text x="${pL - 8}" y="${y + 4}" fill="#666" font-size="10.5" text-anchor="end">${(v * 100).toFixed(1)} %</text>
        `;
      }

      let stepPath = "";
      let dots = "";
      let hitboxes = "";
      const colW = cW / (maxTenure - 1);

      rows.forEach((r, i) => {
        const x = scaleX(r.Tenure);
        const y = scaleY(r.BZ);
        if (i === 0) {
          stepPath += `M ${x} ${y}`;
        } else {
          const prevY = scaleY(rows[i-1].BZ);
          stepPath += ` H ${x} V ${y}`;
        }
        // Diamond markers are embedded inside interactive hitboxes for hover glow and crisp rendering

        // Tooltip matching Photo 2: Row 1 = Tenure number (e.g. 12), Row 2 = ■ Risk-free rate (rounded): X.XX%
        const tipHtml = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${r.Tenure}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#fd349c; border-radius:0px; flex-shrink:0;'&gt;&lt;/span&gt;&lt;span&gt;Risk-free rate (rounded): &lt;strong style='color:#FFFFFF;'&gt;${fmtPct(r.BZ)}&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;`;
        hitboxes += `
          <g class="has-tooltip tenure-pt" data-tooltip="${tipHtml}" style="cursor:pointer;">
            <rect x="${x - colW/2}" y="${pT}" width="${colW}" height="${cH}" fill="transparent"/>
            <circle class="tenure-glow" cx="${x}" cy="${y}" r="7" fill="#fd349c" pointer-events="none"/>
            <rect class="tenure-diamond" x="${x - 3}" y="${y - 3}" width="6" height="6" fill="#fd349c" transform="rotate(45 ${x} ${y})" pointer-events="none"/>
          </g>
        `;
      });

      let xTicks = "";
      for (let t = 1; t <= 30; t++) {
        xTicks += `<text x="${scaleX(t)}" y="${pT + cH + 16}" fill="#666" font-size="9" text-anchor="middle">${t}</text>`;
      }

      const legend = `
        <g transform="translate(${w / 2 - 85}, ${pT + cH + 48})">
          <line x1="0" y1="0" x2="22" y2="0" stroke="#7213ea" stroke-width="3"/>
          <text x="28" y="4" font-size="11" fill="#333">Risk-free rate (rounded)</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">Current risk-free rates</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Solid Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${pT + cH}" x2="${w - pR}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            <path d="${stepPath}" fill="none" stroke="#7213ea" stroke-width="2.5"/>
            ${dots}
            ${hitboxes}
            ${xTicks}
            <text x="${w/2}" y="${pT + cH + 32}" fill="#666" font-size="11" text-anchor="middle">Tenure (in years)</text>
            <!-- Left Y-axis Rotated Label -->
            <text x="18" y="${pT + cH/2}" fill="#666" font-size="11" transform="rotate(-90 18 ${pT + cH/2})" text-anchor="middle">Risk-free rate</text>
            ${legend}
          </svg>
        </div>
      `;
    }

    // 11. CRP by Rating Curve
    function renderCrpRatingLines() {
      const rows = DB.LRP_AverageOverTime || [];
      const ratings = ["BBB-", "BBB", "BBB+"];
      const dates = [...new Set(rows.map(d => d.Date))].sort();

      const w = 640, h = 340;
      const pL = 55, pR = 25, pT = 30, pB = 65;
      const cW = w - pL - pR, cH = h - pT - pB;

      const minVal = 0.006, maxVal = 0.020;
      const scaleX = (i) => pL + (i / (dates.length - 1)) * cW;
      const scaleY = (v) => pT + cH - ((v - minVal) / (maxVal - minVal)) * cH;

      let gridLines = "";
      for (let v = 0.006; v <= 0.0201; v += 0.002) {
        const y = scaleY(v);
        gridLines += `
          <line x1="${pL}" y1="${y}" x2="${w - pR}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>
          <text x="${pL - 8}" y="${y + 4}" fill="#666" font-size="10.5" text-anchor="end">${(v * 100).toFixed(1)} %</text>
        `;
      }

      const colors = { "BBB-": "#00338D", "BBB": "#00b8f5", "BBB+": "#fd349c" };
      let lines = "";

      ratings.forEach(rCode => {
        const rRows = rows.filter(r => r.Rating === rCode).sort((a,b) => a.Date.localeCompare(b.Date));
        const pathD = rRows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(r.Median)}`).join(" ");
        lines += `<path d="${pathD}" fill="none" stroke="${colors[rCode]}" stroke-width="2.5"/>`;
      });

      // Two-row centered Quarter & Year labels
      const xLabels = dates.map((d, i) => {
        const parts = fmtDateQ(d).split(" ");
        const qStr = parts[0] || "";
        const yrStr = parts[1] || "";
        return `
          <text x="${scaleX(i)}" y="${pT + cH + 16}" fill="#666" font-size="10.5" font-weight="500" text-anchor="middle">${qStr}</text>
          <text x="${scaleX(i)}" y="${pT + cH + 29}" fill="#666" font-size="10" text-anchor="middle">${yrStr}</text>
        `;
      }).join("");

      // Interactive hover hitboxes with unified tooltip and hover dots
      const colW = cW / (dates.length - 1);
      const hitboxes = dates.map((d, i) => {
        const parts = fmtDateQ(d).split(" ");
        const qHeader = `${parts[0] || ""},${parts[1] || ""}`;
        const rMinus = rows.find(r => r.Date === d && r.Rating === "BBB-");
        const rMid = rows.find(r => r.Date === d && r.Rating === "BBB");
        const rPlus = rows.find(r => r.Date === d && r.Rating === "BBB+");

        const tipHtml = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:6px; font-size:12px;'&gt;${qHeader}&lt;/div&gt;` +
          (rMinus ? `&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0; margin-bottom:4px;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00338D; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;BBB-: &lt;strong style='color:#FFFFFF;'&gt;${fmtPct(rMinus.Median)}&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;` : "") +
          (rMid ? `&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0; margin-bottom:4px;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;BBB: &lt;strong style='color:#FFFFFF;'&gt;${fmtPct(rMid.Median)}&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;` : "") +
          (rPlus ? `&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#fd349c; border-radius:0px;'&gt;&lt;/span&gt;&lt;span&gt;BBB+: &lt;strong style='color:#FFFFFF;'&gt;${fmtPct(rPlus.Median)}&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;` : "");

        return `
          <g class="has-tooltip crp-col" data-tooltip="${tipHtml}" style="cursor:pointer;">
            <rect x="${scaleX(i) - colW/2}" y="${pT}" width="${colW}" height="${cH}" fill="transparent"/>
            ${rMinus ? `<circle class="hover-dot" cx="${scaleX(i)}" cy="${scaleY(rMinus.Median)}" r="4.5" fill="#00338D" pointer-events="none"/>` : ""}
            ${rMid ? `<circle class="hover-dot" cx="${scaleX(i)}" cy="${scaleY(rMid.Median)}" r="4.5" fill="#00b8f5" pointer-events="none"/>` : ""}
            ${rPlus ? `<circle class="hover-dot" cx="${scaleX(i)}" cy="${scaleY(rPlus.Median)}" r="4.5" fill="#fd349c" pointer-events="none"/>` : ""}
          </g>
        `;
      }).join("");

      const legend = `
        <g transform="translate(${w / 2 - 130}, ${pT + cH + 48})">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#00338D" stroke-width="3"/>
          <text x="26" y="4" font-size="11" fill="#333">BBB-</text>
          <line x1="90" y1="0" x2="110" y2="0" stroke="#00b8f5" stroke-width="3"/>
          <text x="116" y="4" font-size="11" fill="#333">BBB</text>
          <line x1="180" y1="0" x2="200" y2="0" stroke="#fd349c" stroke-width="3"/>
          <text x="206" y="4" font-size="11" fill="#333">BBB+</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">Country risk premium over time for countries with BBB rating codes</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Solid Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${pT + cH}" x2="${w - pR}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            ${lines}
            ${hitboxes}
            ${xLabels}
            ${legend}
            <text x="18" y="${pT + cH/2}" fill="#666" font-size="11" transform="rotate(-90 18 ${pT + cH/2})" text-anchor="middle">CRP (in %)</text>
          </svg>
        </div>
      `;
    }
    const renderCrpCurve = renderCrpRatingLines;

    // 12. Selected Countries CRP Table (Matches user photo with grouped header and #666 text)
    function renderSelectedCountriesCrpTable() {
      const rows = DB.LRP_SelectedCountries || [];

      const trs = rows.map(r => `
        <tr>
          <td style="color:#333; font-weight:400; padding:5px;">${r.Rating}</td>
          <td style="color:#333; font-weight:400; padding:5px;">${r.Ctry_Name_EN}</td>
          <td class="num-col" style="color:#333; font-weight:400; text-align:right; padding:5px;">${fmtPct(r.CRP_6m)}</td>
          <td class="num-col" style="color:#333; font-weight:400; text-align:right; padding:5px;">${fmtPct(r.CRP_1y)}</td>
          <td class="num-col" style="color:#333; font-weight:400; text-align:right; padding:5px;">${fmtPct(r.CRP_2y)}</td>
        </tr>
      `).join("");

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:14px; font-weight:600;">Country risk premium for selected countries at current reporting date</h3>
          <table class="atlas-table" style="border-bottom:1.5px solid #CBD5E1;">
            <thead>
              <tr>
                <th rowspan="2" style="vertical-align:bottom; padding:5px; color:#666666; border-bottom:1.5px solid #CBD5E1;">RATING</th>
                <th rowspan="2" style="vertical-align:bottom; padding:5px; color:#666666; border-bottom:1.5px solid #CBD5E1;">COUNTRY</th>
                <th colspan="3" style="text-align:right; padding:5px; color:#666666; border-bottom:1px solid #E2E8F0; letter-spacing:0.5px;">COUNTRY RISK PREMIUM</th>
              </tr>
              <tr>
                <th style="text-align:right; padding:5px; color:#666666; border-bottom:1.5px solid #CBD5E1;">6 MONTHS</th>
                <th style="text-align:right; padding:5px; color:#666666; border-bottom:1.5px solid #CBD5E1;">1 YEAR</th>
                <th style="text-align:right; padding:5px; color:#666666; border-bottom:1.5px solid #CBD5E1;">2 YEARS</th>
              </tr>
            </thead>
            <tbody>
              ${trs}
            </tbody>
          </table>
        </div>
      `;
    }

    // 14. Full Country Risk Page (Side-by-side Left and Right Layout)
    function renderFullCrpPage() {
      return `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px; align-items:start;">
          <div style="padding:6px 0;">${renderCrpRatingLines()}</div>
          <div style="padding:6px 0;">${renderSelectedCountriesCrpTable()}</div>
        </div>
      `;
    }

    // 15. Overview WACC Horizontal Bars
    function renderOverviewWaccHoriz() {
      const latestDate = (DB.WACC_Values || []).reduce((m, r) => r.Date_Data > m ? r.Date_Data : m, "");
      const items = (DB.WACC_Values || []).filter(r => r.Date_Data === latestDate);

      const w = 640, h = 360;
      const pL = 150, pR = 30, pT = 25, pB = 60;
      const cW = w - pL - pR, cH = h - pT - pB;

      const minX = 0.05, maxX = 0.12;
      const scaleX = (v) => pL + ((v - minX) / (maxX - minX)) * cW;

      let gridLines = "";
      for (let v = 0.05; v <= 0.1201; v += 0.01) {
        const x = scaleX(v);
        gridLines += `
          <line x1="${x}" y1="${pT}" x2="${x}" y2="${pT + cH}" stroke="#E2E8F0" stroke-width="1"/>
          <line x1="${x}" y1="${pT + cH}" x2="${x}" y2="${pT + cH + 4}" stroke="#666" stroke-width="1"/>
          <text x="${x}" y="${pT + cH + 17}" fill="#666" font-size="10.5" text-anchor="middle">${(v * 100).toFixed(1)}%</text>
        `;
      }

      let bars = "";
      const rowH = cH / items.length;
      items.forEach((item, idx) => {
        const y = pT + (idx + 0.5) * rowH;
        const x1 = scaleX(item.WACC_Value_Lower);
        const x2 = scaleX(item.WACC_Value_Upper);

        const tipHtml = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${item.Sector_name_EN}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00338D; border-radius:0px; flex-shrink:0;'&gt;&lt;/span&gt;&lt;span&gt;Range of WACC &lt;strong style='color:#FFFFFF;'&gt;[${fmtPct(item.WACC_Value_Lower)}, ${fmtPct(item.WACC_Value_Upper)}]&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;`;
        bars += `
          <line x1="${pL}" y1="${y}" x2="${pL + cW}" y2="${y}" stroke="#F8FAFC" stroke-width="1"/>
          <text x="${pL - 10}" y="${y + 3}" fill="#666666" font-size="10" text-anchor="end">${item.Sector_name_EN}</text>
          <rect class="has-tooltip" data-tooltip="${tipHtml}" x="${x1}" y="${y - 4}" width="${Math.max(x2 - x1, 4)}" height="8" fill="#00338D" style="cursor:pointer;"/>
        `;
      });

      const legend = `
        <g transform="translate(${w / 2 - 50}, ${pT + cH + 42})">
          <rect x="0" y="-10" width="12" height="12" fill="#00338D"/>
          <text x="18" y="0" fill="#666" font-size="11" font-family="Inter, Arial, sans-serif">Range of WACC</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">Current weighted average cost of capital (WACC)</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${pT + cH}" x2="${pL + cW}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            ${bars}
            ${legend}
          </svg>
        </div>
      `;
    }

    // 16. Overview Multiples Horizontal Dual Bars
    function renderOverviewMultiplesHoriz() {
      const latestDate = (DB.Multiples_Values || []).reduce((m, r) => r.Date_Data > m ? r.Date_Data : m, "");
      const allRows = (DB.Multiples_Values || []).filter(r => r.Date_Data === latestDate);
      const sectors = [...new Set(allRows.map(r => r.Sector_name_EN))];

      const w = 640, h = 360;
      const pL = 150, pR = 30, pT = 25, pB = 60;
      const cW = w - pL - pR, cH = h - pT - pB;

      const maxX = 60.0;
      const scaleX = (v) => pL + (v / maxX) * cW;

      let gridLines = "";
      for (let v = 0; v <= 60.0; v += 10.0) {
        const x = scaleX(v);
        gridLines += `
          <line x1="${x}" y1="${pT}" x2="${x}" y2="${pT + cH}" stroke="#E2E8F0" stroke-width="1"/>
          <line x1="${x}" y1="${pT + cH}" x2="${x}" y2="${pT + cH + 4}" stroke="#666" stroke-width="1"/>
          <text x="${x}" y="${pT + cH + 17}" fill="#666" font-size="10.5" text-anchor="middle">${v.toFixed(1)} x</text>
        `;
      }

      let bars = "";
      const rowH = cH / sectors.length;
      sectors.forEach((sec, idx) => {
        const y = pT + (idx + 0.5) * rowH;
        const ebitda = allRows.find(r => r.Sector_name_EN === sec && r.Multiple_Name === "EBITDA-Multiple");
        const ebit = allRows.find(r => r.Sector_name_EN === sec && r.Multiple_Name === "EBIT-Multiple");

        bars += `
          <line x1="${pL}" y1="${y}" x2="${pL + cW}" y2="${y}" stroke="#F8FAFC" stroke-width="1"/>
          <text x="${pL - 10}" y="${y + 3}" fill="#666666" font-size="10" text-anchor="end">${sec}</text>
        `;

        // Top bar: Pacific Blue #00b8f5 (EBIT-Multiple) matching Photo 2
        if (ebit) {
          const x1 = scaleX(ebit.Multiple_Value_Lower);
          const x2 = scaleX(ebit.Multiple_Value_Upper);
          const ebitTip = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${sec}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border-radius:0px; flex-shrink:0;'&gt;&lt;/span&gt;&lt;span&gt;Range of EBIT multiples &lt;strong style='color:#FFFFFF;'&gt;[${ebit.Multiple_Value_Lower.toFixed(1)}x, ${ebit.Multiple_Value_Upper.toFixed(1)}x]&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;`;
          bars += `
            <rect class="has-tooltip" data-tooltip="${ebitTip}" x="${x1}" y="${y - 6}" width="${Math.max(x2 - x1, 4)}" height="5" fill="#00b8f5" style="cursor:pointer;"/>
          `;
        }
        // Bottom bar: Primary Blue #00338D (EBITDA-Multiple) matching Photo 2
        if (ebitda) {
          const x1 = scaleX(ebitda.Multiple_Value_Lower);
          const x2 = scaleX(ebitda.Multiple_Value_Upper);
          const ebitdaTip = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${sec}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00338D; border-radius:0px; flex-shrink:0;'&gt;&lt;/span&gt;&lt;span&gt;Range of EBITDA multiples &lt;strong style='color:#FFFFFF;'&gt;[${ebitda.Multiple_Value_Lower.toFixed(1)}x, ${ebitda.Multiple_Value_Upper.toFixed(1)}x]&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;`;
          bars += `
            <rect class="has-tooltip" data-tooltip="${ebitdaTip}" x="${x1}" y="${y + 1}" width="${Math.max(x2 - x1, 4)}" height="5" fill="#00338D" style="cursor:pointer;"/>
          `;
        }
      });

      const legend = `
        <g transform="translate(${w / 2 - 145}, ${pT + cH + 42})">
          <rect x="0" y="-10" width="12" height="12" fill="#00b8f5"/>
          <text x="18" y="0" fill="#666" font-size="11" font-family="Inter, Arial, sans-serif">Range of EBIT multiples</text>
          
          <rect x="175" y="-10" width="12" height="12" fill="#00338D"/>
          <text x="193" y="0" fill="#666" font-size="11" font-family="Inter, Arial, sans-serif">Range of EBITDA multiples</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">Current Industry Multiple Ranges</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${pT + cH}" x2="${pL + cW}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            ${bars}
            ${legend}
          </svg>
        </div>
      `;
    }

    // 17. Overview Country Risk Bars
    function renderOverviewCrpBars() {
      const rows = DB.LRP_AverageLRPs || [];
      const order = ["CCC", "B", "BB", "BBB", "A", "AA"];
      const sortedRows = [...rows].sort((a,b) => order.indexOf(a.Rating) - order.indexOf(b.Rating));

      const w = 640, h = 330;
      const pL = 60, pR = 30, pT = 25, pB = 55;
      const cW = w - pL - pR, cH = h - pT - pB;

      const maxX = 0.09;
      const scaleX = (v) => pL + (v / maxX) * cW;

      let gridLines = "";
      for (let v = 0; v <= 0.0901; v += 0.01) {
        const x = scaleX(v);
        gridLines += `
          <line x1="${x}" y1="${pT}" x2="${x}" y2="${pT + cH}" stroke="#E2E8F0" stroke-width="1"/>
          <line x1="${x}" y1="${pT + cH}" x2="${x}" y2="${pT + cH + 4}" stroke="#666" stroke-width="1"/>
          <text x="${x}" y="${pT + cH + 17}" fill="#666" font-size="11" text-anchor="middle">${(v * 100).toFixed(1)}%</text>
        `;
      }

      let bars = "";
      const rowH = cH / (sortedRows.length || 1);
      sortedRows.forEach((r, idx) => {
        const y = pT + (idx + 0.5) * rowH;
        const x1 = scaleX(r.Min);
        const x2 = scaleX(r.Max);

        const tipHtml = `&lt;div style='font-weight:700; color:#FFFFFF; margin-bottom:5px; font-size:12px;'&gt;${r.Rating}&lt;/div&gt;&lt;div style='display:flex; align-items:center; gap:6px; font-size:11.5px; color:#E2E8F0;'&gt;&lt;span style='display:inline-block; width:10px; height:10px; background:#00b8f5; border-radius:0px; flex-shrink:0;'&gt;&lt;/span&gt;&lt;span&gt;Range of country risk premium &lt;strong style='color:#FFFFFF;'&gt;[${fmtPct(r.Min)}, ${fmtPct(r.Max)}]&lt;/strong&gt;&lt;/span&gt;&lt;/div&gt;`;
        bars += `
          <line x1="${pL}" y1="${y}" x2="${pL + cW}" y2="${y}" stroke="#F8FAFC" stroke-width="1"/>
          <text x="${pL - 12}" y="${y + 4}" fill="#666666" font-size="12" font-weight="500" text-anchor="end">${r.Rating}</text>
          <rect class="has-tooltip" data-tooltip="${tipHtml}" x="${x1}" y="${y - 9}" width="${Math.max(x2 - x1, 4)}" height="18" fill="#00b8f5" style="cursor:pointer;"/>
        `;
      });

      const legend = `
        <g transform="translate(${w / 2 - 95}, ${pT + cH + 40})">
          <rect x="0" y="-10" width="12" height="12" fill="#00b8f5"/>
          <text x="18" y="0" fill="#666" font-size="11" font-family="Inter, Arial, sans-serif">Range of country risk premium</text>
        </g>
      `;

      return `
        <div style="background:#fff; padding:6px 0;">
          <h3 style="font-size:16px; font-family:inherit; color:#666666; margin-bottom:8px; font-weight:600;">Current country risk premium per rating</h3>
          <svg viewBox="0 0 ${w} ${h}" style="width:100%; height:auto;">
            <!-- Axes -->
            <line x1="${pL}" y1="${pT}" x2="${pL}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            <line x1="${pL}" y1="${pT + cH}" x2="${pL + cW}" y2="${pT + cH}" stroke="#CBD5E1" stroke-width="1"/>
            ${gridLines}
            ${bars}
            ${legend}
          </svg>
        </div>
      `;
    }

    // 18. Full Overview Dashboard Grid
    function renderFullOverviewGrid() {
      return `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:40px 30px;">
          <div style="padding:6px 0;">${renderOverviewWaccHoriz()}</div>
          <div style="padding:6px 0;">${renderOverviewMultiplesHoriz()}</div>
          <div style="padding:6px 0;">${renderMrp3LineTrend()}</div>
          <div style="padding:6px 0;">${renderOverviewCrpBars()}</div>
        </div>
      `;
    }

        /* =========================================================================
       COMPLETE SCHEMA.ORG GENERATOR (100% VALID DATASET SPECIFICATION)
       All sub-items are valid Schema.org Datasets with PropertyValue metrics
       ========================================================================= */
    function buildDetailedObservations(templateId, sector) {
      const obs = [];

      if (templateId === "wacc_band_over_time" || templateId === "wacc_full_grid") {
        const rows = (DB.WACC_Values || []).filter(d => d.Sector_name_EN === sector).sort((a,b) => a.Date_Data.localeCompare(b.Date_Data));
        rows.forEach(r => {
          obs.push({
            "@type": "Dataset",
            "name": `${sector} - ${fmtDateQ(r.Date_Data)}`,
            "temporalCoverage": r.Date_Data ? r.Date_Data.split("T")[0] : "",
            "variableMeasured": [
              {
                "@type": "PropertyValue",
                "name": "Median of WACC",
                "value": Number((r.WACC_Value_Median * 100).toFixed(2)),
                "minValue": Number((r.WACC_Value_Lower * 100).toFixed(2)),
                "maxValue": Number((r.WACC_Value_Upper * 100).toFixed(2)),
                "unitText": "%"
              }
            ]
          });
        });
      }

      if (templateId === "wacc_params_table" || templateId === "wacc_full_grid") {
        const rows = (DB.WACC_Values || []).filter(d => d.Sector_name_EN === sector);
        const item = rows.reduce((m, r) => r.Date_Data > m.Date_Data ? r : m, rows[0] || {});
        if (item.Date_Data) {
          obs.push({
            "@type": "Dataset",
            "name": `${sector} - Financial Parameters (${fmtDateQ(item.Date_Data)})`,
            "temporalCoverage": item.Date_Data.split("T")[0],
            "variableMeasured": [
              { "@type": "PropertyValue", "name": "Risk-Free Rate (Cost of Equity)", "value": Number((item.Rf * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Unlevered Beta", "value": Number(Number(item.UnlevBeta).toFixed(2)) },
              { "@type": "PropertyValue", "name": "Debt Beta", "value": Number(Number(item.BetaRelevered).toFixed(2)) },
              { "@type": "PropertyValue", "name": "Market Risk Premium", "value": Number((item.MRP * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Levered Cost of Equity", "value": Number((item.LevCostOfEquity * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Equity Ratio", "value": Number((item.Equity_ratio * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Credit Spread", "value": Number((item.CreditSpread * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Tax Shield", "value": Number((item.TaxRate * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Cost of Debt", "value": Number((item.CostOfDebtAfterTax * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Debt Ratio", "value": Number((item.Debt_ratio * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Weighted Average Cost of Capital (WACC)", "value": Number((item.WACC_Value_Median * 100).toFixed(2)), "unitText": "%" }
            ]
          });
        }
      }

      if (templateId === "wacc_countries_table" || templateId === "multiples_countries_table" || templateId === "wacc_full_grid" || templateId === "multiples_full_grid") {
        const dsKey = templateId.includes("multiples") ? "Multiples_Countries" : "WACC_Countries";
        const rows = (DB[dsKey] || []).filter(d => d.Sector_name_EN === sector).sort((a,b) => b.N_Companies - a.N_Companies).slice(0, 15);
        obs.push({
          "@type": "Dataset",
          "name": `${sector} - Company Count by Country`,
          "variableMeasured": rows.map(r => ({
            "@type": "PropertyValue",
            "name": r.Country_EN,
            "value": Number(r.N_Companies),
            "unitText": "companies"
          }))
        });
      }

      if (templateId === "wacc_subindustries_table" || templateId === "multiples_subindustries_table" || templateId === "wacc_full_grid" || templateId === "multiples_full_grid") {
        const dsKey = templateId.includes("multiples") ? "Multiples_SubIndustries" : "WACC_SubIndustries";
        const rows = (DB[dsKey] || []).filter(d => d.Sector_name_EN === sector).sort((a,b) => b.N_Companies - a.N_Companies).slice(0, 15);
        obs.push({
          "@type": "Dataset",
          "name": `${sector} - Company Count by Sub-Industry`,
          "variableMeasured": rows.map(r => ({
            "@type": "PropertyValue",
            "name": r.SimpleIndustry_EN || r.SubIndustry_EN,
            "value": Number(r.N_Companies),
            "unitText": "companies"
          }))
        });
      }

      if (templateId === "multiples_columns_over_time" || templateId === "multiples_full_grid") {
        const allRows = (DB.Multiples_Values || []).filter(d => d.Sector_name_EN === sector);
        const dates = [...new Set(allRows.map(d => d.Date_Data))].sort();
        dates.forEach(d => {
          const ebitda = allRows.find(x => x.Multiple_Name === "EBITDA-Multiple" && x.Date_Data === d);
          const ebit = allRows.find(x => x.Multiple_Name === "EBIT-Multiple" && x.Date_Data === d);
          const vars = [];
          if (ebitda) {
            vars.push({
              "@type": "PropertyValue",
              "name": "EBITDA Multiple Range",
              "minValue": Number(ebitda.Multiple_Value_Lower),
              "maxValue": Number(ebitda.Multiple_Value_Upper),
              "unitText": "x"
            });
          }
          if (ebit) {
            vars.push({
              "@type": "PropertyValue",
              "name": "EBIT Multiple Range",
              "minValue": Number(ebit.Multiple_Value_Lower),
              "maxValue": Number(ebit.Multiple_Value_Upper),
              "unitText": "x"
            });
          }
          obs.push({
            "@type": "Dataset",
            "name": `${sector} - ${fmtDateQ(d)} Multiples`,
            "temporalCoverage": d.split("T")[0],
            "variableMeasured": vars
          });
        });
      }

      if (templateId === "multiples_forecast_bars" || templateId === "multiples_full_grid") {
        const allRows = (DB.Multiples_Values || []).filter(d => d.Sector_name_EN === sector);
        const latestDate = allRows.reduce((m, r) => r.Date_Data > m ? r.Date_Data : m, "");
        const currentRows = allRows.filter(r => r.Date_Data === latestDate);
        currentRows.forEach(r => {
          obs.push({
            "@type": "Dataset",
            "name": `${sector} - ${r.Multiple_Name} (${r.Multiple_Date ? r.Multiple_Date.slice(0,4) : 'Forecast'})`,
            "temporalCoverage": r.Multiple_Date ? r.Multiple_Date.slice(0,10) : "",
            "variableMeasured": [
              {
                "@type": "PropertyValue",
                "name": r.Multiple_Name,
                "minValue": Number(r.Multiple_Value_Lower),
                "maxValue": Number(r.Multiple_Value_Upper),
                "unitText": "x"
              }
            ]
          });
        });
      }

      if (templateId === "ov_wacc_horiz" || templateId === "ov_full_grid") {
        const latestDate = (DB.WACC_Values || []).reduce((m, r) => r.Date_Data > m ? r.Date_Data : m, "");
        const items = (DB.WACC_Values || []).filter(r => r.Date_Data === latestDate);
        obs.push({
          "@type": "Dataset",
          "name": "WACC Ranges by Sector",
          "temporalCoverage": latestDate ? latestDate.split("T")[0] : "",
          "variableMeasured": items.map(item => ({
            "@type": "PropertyValue",
            "name": `${item.Sector_name_EN} WACC`,
            "value": Number((item.WACC_Value_Median * 100).toFixed(2)),
            "minValue": Number((item.WACC_Value_Lower * 100).toFixed(2)),
            "maxValue": Number((item.WACC_Value_Upper * 100).toFixed(2)),
            "unitText": "%"
          }))
        });
      }

      if (templateId === "ov_multiples_horiz" || templateId === "ov_full_grid") {
        const latestDate = (DB.Multiples_Values || []).reduce((m, r) => r.Date_Data > m ? r.Date_Data : m, "");
        const allRows = (DB.Multiples_Values || []).filter(r => r.Date_Data === latestDate);
        obs.push({
          "@type": "Dataset",
          "name": "Valuation Multiples Ranges by Sector",
          "temporalCoverage": latestDate ? latestDate.split("T")[0] : "",
          "variableMeasured": allRows.map(r => ({
            "@type": "PropertyValue",
            "name": `${r.Sector_name_EN} (${r.Multiple_Name})`,
            "minValue": Number(r.Multiple_Value_Lower),
            "maxValue": Number(r.Multiple_Value_Upper),
            "unitText": "x"
          }))
        });
      }

      if (templateId === "mrp_3line_trend" || templateId === "mrp_full_page" || templateId === "ov_mrp_trend" || templateId === "ov_full_grid") {
        const rows = DB.MRP_BZ || [];
        rows.forEach(r => {
          obs.push({
            "@type": "Dataset",
            "name": `Germany Valuation Rates (${fmtDateQ(r.Date)})`,
            "temporalCoverage": r.Date.split("T")[0],
            "variableMeasured": [
              { "@type": "PropertyValue", "name": "Total Return (Gesamtrendite)", "value": Number((r.Gesamtrendite * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Base Rate (Basiszins)", "value": Number((r.Basiszins * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "Market Risk Premium (MRP)", "value": Number((r.MRP * 100).toFixed(2)), "unitText": "%" }
            ]
          });
        });
      }

      if (templateId === "mrp_tenure_step_curve" || templateId === "mrp_full_page") {
        const rows = DB.BZ_CreditSpread || [];
        obs.push({
          "@type": "Dataset",
          "name": "Risk-Free Rates Curve by Tenure",
          "variableMeasured": rows.map(r => ({
            "@type": "PropertyValue",
            "name": `Tenure ${r.Tenure} Year(s)`,
            "value": Number((r.BZ * 100).toFixed(2)),
            "unitText": "%"
          }))
        });
      }

      if (templateId === "crp_rating_lines" || templateId === "crp_full_page") {
        const rows = DB.LRP_AverageOverTime || [];
        rows.forEach(r => {
          obs.push({
            "@type": "Dataset",
            "name": `Country Risk Premium: Rating ${r.Rating} (${fmtDateQ(r.Date)})`,
            "temporalCoverage": r.Date.split("T")[0],
            "variableMeasured": [
              {
                "@type": "PropertyValue",
                "name": `CRP (Rating ${r.Rating})`,
                "value": Number((r.Median * 100).toFixed(2)),
                "unitText": "%"
              }
            ]
          });
        });
      }

      if (templateId === "crp_countries_table" || templateId === "crp_full_page") {
        const rows = DB.LRP_SelectedCountries || [];
        rows.forEach(r => {
          obs.push({
            "@type": "Dataset",
            "name": `${r.Ctry_Name_EN} (Rating ${r.Rating})`,
            "variableMeasured": [
              { "@type": "PropertyValue", "name": "6 Months CRP", "value": Number((r.CRP_6m * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "1 Year CRP", "value": Number((r.CRP_1y * 100).toFixed(2)), "unitText": "%" },
              { "@type": "PropertyValue", "name": "2 Years CRP", "value": Number((r.CRP_2y * 100).toFixed(2)), "unitText": "%" }
            ]
          });
        });
      }

      if (templateId === "ov_crp_bars" || templateId === "ov_full_grid") {
        const rows = DB.LRP_AverageLRPs || [];
        rows.forEach(r => {
          obs.push({
            "@type": "Dataset",
            "name": `Rating ${r.Rating} CRP Range`,
            "variableMeasured": [
              {
                "@type": "PropertyValue",
                "name": `Rating ${r.Rating}`,
                "minValue": Number((r.Min * 100).toFixed(2)),
                "maxValue": Number((r.Max * 100).toFixed(2)),
                "unitText": "%"
              }
            ]
          });
        });
      }

      return obs;
    }

    /* =========================================================================
       CODE GENERATION & CLIPBOARD
       ========================================================================= */
    function updateGeneratedCode(renderedMarkup, chartTitle, templateId, sector, templateObj) {
      const includeDropdown = document.getElementById("includeDropdownCheck").checked;

      // Build complete Schema.org JSON-LD with full observation data
      const detailedObservations = buildDetailedObservations(templateId, sector);

      const fullSchemaJson = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": chartTitle,
        "description": `${chartTitle} structured dataset published via KPMG Atlas.`,
        "creator": {
          "@type": "Organization",
          "name": "KPMG Deal Advisory"
        },
        "distribution": {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": `https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium${templateObj ? templateObj.ep : ''}`
        },
        "hasPart": detailedObservations
      };

      const schemaString = JSON.stringify(fullSchemaJson, null, 2);

      // Clean, standalone code snippet ready for AEM HTML / Embed Component
      const snippet = `<!-- KPMG Atlas Component: ${chartTitle} -->
<!-- Ready to paste into AEM Embed / Custom HTML Component -->
<div class="kpmg-atlas-chart-container" style="position:relative; max-width:100%; font-family:Inter, Arial, sans-serif; background:#fff; padding:0;">
  <style>
    .kpmg-atlas-chart-container .atlas-table { width:100%; border-collapse:collapse; font-size:13px; }
    .kpmg-atlas-chart-container .atlas-table th { text-align:left; padding:5px; font-size:11.5px; font-weight:700; color:#666666; letter-spacing:0.5px; text-transform:uppercase; border-bottom:1.5px solid #CBD5E1; }
    .kpmg-atlas-chart-container .atlas-table td { padding:5px; border-bottom:1px solid #F1F5F9; color:#333; font-weight:400; }
    .kpmg-atlas-chart-container .atlas-table .num-col { text-align:right; font-weight:400; color:#333; }
  </style>
  ${renderedMarkup}
  <style>
    .mrp-col .hover-dot, .crp-col .hover-dot { opacity: 0; transition: opacity 0.15s ease; }
    .mrp-col:hover .hover-dot, .crp-col:hover .hover-dot { opacity: 1 !important; }
    .tenure-pt .tenure-glow { opacity: 0; transition: opacity 0.15s ease; }
    .tenure-pt:hover .tenure-glow { opacity: 0.35 !important; }
    .tenure-pt:hover .tenure-diamond { filter: drop-shadow(0 0 3px rgba(253, 52, 156, 0.8)); }
  </style>
  <div class="kpmg-chart-tooltip" style="position:fixed; display:none; background:rgba(15,23,42,0.88); color:#fff; padding:8px 14px; border-radius:6px; font-family:Inter, Arial, sans-serif; font-size:12px; line-height:1.45; pointer-events:none; z-index:9999999; box-shadow:0 8px 24px rgba(0,0,0,0.35); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.15); transform:translate(-50%, -125%); white-space:nowrap;"></div>
  <script>
  (function() {
    var c = document.currentScript.closest('.kpmg-atlas-chart-container');
    if (!c) return;
    var tip = c.querySelector('.kpmg-chart-tooltip');
    c.addEventListener('mousemove', function(e) {
      var t = e.target.closest('[data-tooltip]');
      if (t && tip) {
        tip.innerHTML = t.getAttribute('data-tooltip');
        tip.style.display = 'block';
        var tipW = tip.offsetWidth || 190;
        var tipH = tip.offsetHeight || 65;
        var left = e.clientX + 14;
        var top = e.clientY - tipH - 10;
        if (left + tipW > window.innerWidth - 12) {
          left = e.clientX - tipW - 14;
        }
        if (top < 10) {
          top = e.clientY + 18;
        }
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
        tip.style.transform = 'none';
      } else if (tip) {
        tip.style.display = 'none';
      }
    });
    c.addEventListener('mouseleave', function() {
      if (tip) tip.style.display = 'none';
    });
  })();
  <\/script>
</div>

<!-- Full Schema.org Dataset Metadata for SEO & AI Crawlers (Complete Observations Data) -->
<script type="application/ld+json">
${schemaString}
<\/script>
`;

      window.currentSchemaString = schemaString;
      document.getElementById("generatedCodeBlock").textContent = snippet;
    }

    function copyAemCode() {
      const code = document.getElementById("generatedCodeBlock").textContent;
      navigator.clipboard.writeText(code).then(() => {
        const toast = document.getElementById("copyToast");
        toast.textContent = "Ready-to-use AEM HTML + Schema.org JSON-LD copied to clipboard!";
        toast.style.display = "block";
        setTimeout(() => { toast.style.display = "none"; }, 2500);
      });
    }

    function copySchemaOnly() {
      const schemaScript = `<script type="application/ld+json">
${window.currentSchemaString || ""}
<\/script>`;
      navigator.clipboard.writeText(schemaScript).then(() => {
        const toast = document.getElementById("copyToast");
        toast.textContent = "Complete Schema.org JSON-LD copied! Ready to test on validator.schema.org";
        toast.style.display = "block";
        setTimeout(() => { 
          toast.style.display = "none"; 
          toast.textContent = "Ready-to-use AEM HTML + Schema.org JSON-LD copied to clipboard!";
        }, 3000);
      });
    }

    function toggleCodeDrawer() {
      const d = document.getElementById("codeDrawer");
      d.classList.toggle("open");
    }

    // Global Floating Tooltip Positioning (Smart Placement above-right of cursor)
    function positionTooltip(e, tip) {
      const tipWidth = tip.offsetWidth || 190;
      const tipHeight = tip.offsetHeight || 65;
      let left = e.clientX + 14;
      let top = e.clientY - tipHeight - 10;
      if (left + tipWidth > window.innerWidth - 12) {
        left = e.clientX - tipWidth - 14;
      }
      if (top < 10) {
        top = e.clientY + 18;
      }
      tip.style.left = left + "px";
      tip.style.top = top + "px";
      tip.style.transform = "none";
    }

    

export function getSectors() {
  const list = (DB.WACC_Values || []).map(d => d.Sector_name_EN).filter(Boolean);
  return [...new Set(list)].sort();
}

export function getChartDetails(category, templateId, sector) {
  let title = "";
  let subtitle = "";
  let renderedHtml = "";

  const templateObj = (TEMPLATES[category] || []).find(t => t.id === templateId) || TEMPLATES[category]?.[0];
  const activeTemplateId = templateObj ? templateObj.id : templateId;

  switch (activeTemplateId) {
    case "wacc_band_over_time":
      title = `${sector} - Weighted average cost of capital over time`;
      subtitle = "Range of WACC (Teal Band) and Median of WACC (Navy Line) over quarters";
      renderedHtml = renderWaccBandOverTime(sector);
      break;
    case "wacc_params_table":
      title = `${sector} - Weighted average cost of capital as at 30/09/2026`;
      subtitle = "Detailed financial parameter breakdown (Cost of Equity & Cost of Debt)";
      renderedHtml = renderWaccParamsTable(sector);
      break;
    case "wacc_countries_table":
      title = `${sector} - Origin of all companies included in the entire database`;
      subtitle = "Number of analyzed companies grouped by country of origin";
      renderedHtml = renderCountriesTable("WACC_Countries", sector);
      break;
    case "wacc_subindustries_table":
      title = `${sector} - Sub-sectors included in the entire database`;
      subtitle = "Granular industry breakdown and sample count";
      renderedHtml = renderSubIndustriesTable("WACC_SubIndustries", sector);
      break;
    case "wacc_full_grid":
      title = `${sector} - Complete Cost of Capital Dashboard`;
      subtitle = "Comprehensive multi-component view for Cost of Capital";
      renderedHtml = renderFullWaccGrid(sector);
      break;
    case "multiples_columns_over_time":
      title = `${sector} - Average multiples over time`;
      subtitle = "Dual column chart: Range of EBITDA (Navy) & EBIT (Cyan) multiples";
      renderedHtml = renderMultiplesColumnsOverTime(sector);
      break;
    case "multiples_forecast_bars":
      title = `${sector} - Average multiples as at 30/09/2026`;
      subtitle = "Horizontal range comparisons: Actual (2026), +1Y Estimate (2027), +2Y Estimate (2028)";
      renderedHtml = renderMultiplesForecastBars(sector);
      break;
    case "multiples_countries_table":
      title = `${sector} - Origin of all companies (Multiples Database)`;
      subtitle = "Companies count by country";
      renderedHtml = renderCountriesTable("Multiples_Countries", sector);
      break;
    case "multiples_subindustries_table":
      title = `${sector} - Sub-sectors included (Multiples Database)`;
      subtitle = "Sub-industries breakdown";
      renderedHtml = renderSubIndustriesTable("Multiples_SubIndustries", sector);
      break;
    case "multiples_full_grid":
      title = `${sector} - Complete Multiples Dashboard`;
      subtitle = "Multi-component view with columns, forecast bars, and origin tables";
      renderedHtml = renderFullMultiplesGrid(sector);
      break;
    case "mrp_3line_trend":
      title = "Total rate of return, risk-free rate and market risk premium for Germany over time";
      subtitle = "Historical 3-line trend from Q3 2024 to Q3 2026";
      renderedHtml = renderMrp3LineTrend();
      break;
    case "mrp_tenure_step_curve":
      title = "Current risk-free rates";
      subtitle = "Risk-free rate (rounded) step curve by Tenure (1 to 30 years)";
      renderedHtml = renderTenureStepCurve();
      break;
    case "mrp_full_page":
      title = "Market risk premium as at 30/09/2026";
      subtitle = "The market risk premium for Germany proposed by KPMG as at 30/09/2026 is 5.25%.";
      renderedHtml = renderFullMrpPage();
      break;
    case "crp_rating_lines":
      title = "Country risk premium over time for countries with BBB rating codes";
      subtitle = "Trends across BBB-, BBB, and BBB+ ratings";
      renderedHtml = renderCrpRatingLines();
      break;
    case "crp_countries_table":
      title = "Country risk premium for selected countries at current reporting date";
      subtitle = "6 Months, 1 Year, and 2 Years tenor spreads";
      renderedHtml = renderSelectedCountriesCrpTable();
      break;
    case "crp_full_page":
      title = "Country risk premia as at 30/09/2026";
      subtitle = "Average country risk premium for BBB rating is 1.10%";
      renderedHtml = renderFullCrpPage();
      break;
    case "ov_wacc_horiz":
      title = "Current weighted average cost of capital (WACC)";
      subtitle = "Horizontal range bars across all 13 industries";
      renderedHtml = renderOverviewWaccHoriz();
      break;
    case "ov_multiples_horiz":
      title = "Current Industry Multiple Ranges";
      subtitle = "Horizontal dual range bars (EBITDA & EBIT) across all industries";
      renderedHtml = renderOverviewMultiplesHoriz();
      break;
    case "ov_mrp_trend":
      title = "Market Risk Premium Trend";
      subtitle = "Quarterly trend over the last 2 years";
      renderedHtml = renderMrp3LineTrend();
      break;
    case "ov_crp_bars":
      title = "Current country risk premium per rating";
      subtitle = "Stepped floating range bars (AA to CCC)";
      renderedHtml = renderOverviewCrpBars();
      break;
    case "ov_full_grid":
      title = "Cost of Capital & Multiples Overview Dashboard";
      subtitle = "Complete Executive Overview Dashboard";
      renderedHtml = renderFullOverviewGrid();
      break;
    default:
      title = "Select Template";
      subtitle = "";
      renderedHtml = "<p>Please select a template</p>";
  }

  return { title, subtitle, renderedHtml, templateObj };
}

export function generateAemSnippetForReact(renderedMarkup, chartTitle, templateId, sector, templateObj) {
  const detailedObservations = buildDetailedObservations(templateId, sector);

  const fullSchemaJson = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": chartTitle,
    "description": `${chartTitle} structured dataset published via KPMG Atlas.`,
    "creator": {
      "@type": "Organization",
      "name": "KPMG Deal Advisory"
    },
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": `https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium${templateObj ? templateObj.ep : ""}`
    },
    "hasPart": detailedObservations
  };

  const schemaString = JSON.stringify(fullSchemaJson, null, 2);

  const snippet = `<!-- KPMG Atlas Component: ${chartTitle} -->
<!-- Ready to paste into AEM Embed / Custom HTML Component -->
<div class="kpmg-atlas-chart-container" style="position:relative; max-width:100%; font-family:Inter, Arial, sans-serif; background:#fff; padding:0;">
  <style>
    .kpmg-atlas-chart-container h3 { font-size:16px; font-family:inherit; }
    .kpmg-atlas-chart-container .atlas-table { width:100%; border-collapse:collapse; font-size:13px; }
    .kpmg-atlas-chart-container .atlas-table th { text-align:left; padding:5px; font-size:11.5px; font-weight:700; color:#666666; letter-spacing:0.5px; text-transform:uppercase; border-bottom:1.5px solid #CBD5E1; }
    .kpmg-atlas-chart-container .atlas-table td { padding:5px; border-bottom:1px solid #F1F5F9; color:#333; font-weight:400; }
    .kpmg-atlas-chart-container .atlas-table .num-col { text-align:right; font-weight:400; color:#333; }
  </style>
  ${renderedMarkup}
  <style>
    .mrp-col .hover-dot, .crp-col .hover-dot { opacity: 0; transition: opacity 0.15s ease; }
    .mrp-col:hover .hover-dot, .crp-col:hover .hover-dot { opacity: 1 !important; }
    .tenure-pt .tenure-glow { opacity: 0; transition: opacity 0.15s ease; }
    .tenure-pt:hover .tenure-glow { opacity: 0.35 !important; }
    .tenure-pt:hover .tenure-diamond { filter: drop-shadow(0 0 3px rgba(253, 52, 156, 0.8)); }
  </style>
  <div class="kpmg-chart-tooltip" style="position:fixed; display:none; background:rgba(15,23,42,0.88); color:#fff; padding:8px 14px; border-radius:6px; font-family:Inter, Arial, sans-serif; font-size:12px; line-height:1.45; pointer-events:none; z-index:9999999; box-shadow:0 8px 24px rgba(0,0,0,0.35); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.15); transform:translate(-50%, -125%); white-space:nowrap;"></div>
  <script>
  (function() {
    var c = document.currentScript.closest(".kpmg-atlas-chart-container");
    if (!c) return;
    var tip = c.querySelector(".kpmg-chart-tooltip");
    c.addEventListener("mousemove", function(e) {
      var t = e.target.closest("[data-tooltip]");
      if (t && tip) {
        tip.innerHTML = t.getAttribute("data-tooltip");
        tip.style.display = "block";
        var tipW = tip.offsetWidth || 190;
        var tipH = tip.offsetHeight || 65;
        var left = e.clientX + 14;
        var top = e.clientY - tipH - 10;
        if (left + tipW > window.innerWidth - 12) {
          left = e.clientX - tipW - 14;
        }
        if (top < 10) {
          top = e.clientY + 18;
        }
        tip.style.left = left + "px";
        tip.style.top = top + "px";
        tip.style.transform = "none";
      } else if (tip) {
        tip.style.display = "none";
      }
    });
    c.addEventListener("mouseleave", function() {
      if (tip) tip.style.display = "none";
    });
  })();
  <\/script>
</div>

<!-- Full Schema.org Dataset Metadata for SEO & AI Crawlers (Complete Observations Data) -->
<script type="application/ld+json">
${schemaString}
<\/script>
`;

  return { snippet, schemaString };
}

export { TEMPLATES };
