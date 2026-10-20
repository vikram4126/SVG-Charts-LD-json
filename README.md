# KPMG Atlas | SVG Chart & Schema.org JSON-LD Studio

This repository provides two complete implementations of the KPMG Chart & Schema.org Studio:

---

## 1. Vanilla JS Version (`vanilla-js/`)
Zero dependencies, 100% self-contained HTML file.

- **Open Studio**: Double-click [vanilla-js/index.html](file:///Users/vikram/Desktop/Antigravity/SVG-charts/vanilla-js/index.html) in any browser.
- **Sync Live API Data**:
  ```bash
  node vanilla-js/sync.js
  # Or with custom API URL:
  node vanilla-js/sync.js "https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium"
  ```

---

## 2. React Version (`react-app/`)
Modern React 19 + Vite web application with interactive reactive state, instant switching, and live code generator.

- **Start Development Server**:
  ```bash
  cd react-app
  npm run dev
  ```
- **Build for Production**:
  ```bash
  cd react-app
  npm run build
  ```
- **Sync Live API Data**:
  ```bash
  cd react-app
  npm run sync
  # Or:
  node sync.js "https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium"
  ```

---

### Features Across Both Versions:
- **Clean Centered Header**: `API to SVG+LD_Json`
- **KPMG Brand Colors**:
  - Blue Primary: `#00338D`
  - Blue Pacific: `#00b8f5`
  - Purple: `#7213ea`
  - Pink: `#fd349c`
  - Table & Body Text: `#666666`, regular weight (`400`)
- **Side-by-Side Complete Pages**: MRP 3-line trend & Tenure step curve side-by-side.
- **Interactive Tooltips**: Smart placement above-right of cursor.
- **Self-Contained AEM Snippets**: Inline SVG + `<script type="application/ld+json">` dataset metadata ready for AEM.
