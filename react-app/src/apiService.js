/**
 * API Data Service for KPMG Atlas Charts
 * Handles fetching live data from custom API URLs, proxying, and validating responses.
 */

export const ENDPOINTS = [
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

export const ENDPOINT_DESCRIPTIONS = {
  WACC_Values: 'Cost of Capital (WACC) Values by Sector & Date',
  WACC_Countries: 'Country Breakdown for WACC Companies',
  WACC_SubIndustries: 'Sub-Industries Breakdown for WACC',
  Multiples_Values: 'Valuation Multiples (EBIT, EBITDA, etc.)',
  Multiples_Countries: 'Country Breakdown for Multiples Companies',
  Multiples_SubIndustries: 'Sub-Industries Breakdown for Multiples',
  MRP_BZ: 'Market Risk Premium & Base Rate Over Time',
  BZ_CreditSpread: 'Credit Spread & Base Rate per Tenure/Rating',
  LRP_AverageOverTime: 'Country Risk Premium (LRP) Over Time',
  LRP_SelectedCountries: 'Country Risk Premium for Selected Countries',
  LRP_AverageLRPs: 'Average Country Risk Premium by Rating'
};

export const DEFAULT_BASE_URL = 'https://live.kpmg-apps.de/DPS_Freemium_API/rest/Freemium';

/**
 * Fetch a single endpoint with fallback strategies (Dev proxy -> Direct fetch)
 */
export async function fetchEndpointData(baseUrl, endpointName) {
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const targetUrl = `${cleanBase}/${endpointName}`;

  // 1. If running under Vite dev server, use the local proxy to bypass browser CORS completely
  const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '';
  if (isDev) {
    try {
      const proxyUrl = `/api-fetch?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) || (json && typeof json === 'object')) {
          return { success: true, data: json, url: targetUrl, method: 'dev-proxy' };
        }
      }
    } catch (e) {
      console.warn(`Dev proxy attempt failed for ${endpointName}, trying direct:`, e);
    }
  }

  // 2. Direct fetch (works if the API server has Access-Control-Allow-Origin: * or same-origin)
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, data: json, url: targetUrl, method: 'direct' };
    } else {
      return { success: false, error: `HTTP ${res.status} ${res.statusText}`, url: targetUrl };
    }
  } catch (err) {
    // 3. Check for typical CORS / Network error
    const isCorsError = err.name === 'TypeError' || err.message.toLowerCase().includes('fetch');
    return {
      success: false,
      isCors: isCorsError,
      error: isCorsError
        ? `Browser CORS restriction: The server at ${new URL(targetUrl).hostname} did not send 'Access-Control-Allow-Origin' header.`
        : err.message,
      url: targetUrl
    };
  }
}

/**
 * Fetch all 11 endpoints from a base URL sequentially with progress reporting
 */
export async function fetchAllEndpoints(baseUrl, onProgress) {
  const results = {};
  const errors = [];
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');

  for (let i = 0; i < ENDPOINTS.length; i++) {
    const ep = ENDPOINTS[i];
    if (onProgress) {
      onProgress({
        index: i + 1,
        total: ENDPOINTS.length,
        endpoint: ep,
        status: 'fetching'
      });
    }

    const res = await fetchEndpointData(cleanBase, ep);
    if (res.success && res.data) {
      results[ep] = res.data;
      if (onProgress) {
        onProgress({
          index: i + 1,
          total: ENDPOINTS.length,
          endpoint: ep,
          status: 'success',
          count: Array.isArray(res.data) ? res.data.length : Object.keys(res.data).length,
          method: res.method
        });
      }
    } else {
      errors.push({ endpoint: ep, error: res.error, isCors: res.isCors, url: res.url });
      if (onProgress) {
        onProgress({
          index: i + 1,
          total: ENDPOINTS.length,
          endpoint: ep,
          status: 'error',
          error: res.error,
          isCors: res.isCors
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    data: results,
    errors,
    endpointsFetched: Object.keys(results).length,
    totalEndpoints: ENDPOINTS.length
  };
}

/**
 * Validate imported or pasted JSON data
 */
export function validateDatabaseJson(json) {
  if (!json || typeof json !== 'object') {
    return { valid: false, error: 'Input must be a valid JSON object.' };
  }

  // Check if it's a full DB (has at least one recognized endpoint key)
  const matchedEndpoints = ENDPOINTS.filter(ep => Array.isArray(json[ep]));
  if (matchedEndpoints.length > 0) {
    const counts = {};
    matchedEndpoints.forEach(ep => {
      counts[ep] = json[ep].length;
    });
    return {
      valid: true,
      isFullDb: true,
      matchedEndpoints,
      counts
    };
  }

  // Check if it's an array for a single endpoint
  if (Array.isArray(json)) {
    return {
      valid: true,
      isSingleEndpoint: true,
      count: json.length
    };
  }

  return {
    valid: false,
    error: `JSON does not match expected structure. Expected object containing keys like ${ENDPOINTS.slice(0, 3).join(', ')}, etc.`
  };
}
