/**
 * API Configuration
 * 
 * The API base URL is determined by:
 * 1. VITE_API_URL environment variable (set in Vercel or .env file)
 * 2. Default fallback to production backend
 * 3. Local development fallback
 */

const getApiBaseUrl = (): string => {
  // Helper function to normalize URL (ensure it has protocol)
  const normalizeUrl = (url: string): string => {
    // Remove any trailing slashes
    url = url.trim().replace(/\/+$/, '');

    // If URL doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      console.warn('[API Config] URL missing protocol, adding https://');
      url = `https://${url}`;
    }

    return url;
  };

  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    const envUrl = import.meta.env.VITE_API_URL.trim();
    console.log('[API Config] Using VITE_API_URL from environment (raw):', envUrl);
    const normalizedUrl = normalizeUrl(envUrl);
    console.log('[API Config] Using VITE_API_URL from environment (normalized):', normalizedUrl);
    return normalizedUrl;
  }

  // Production backend domain
  const defaultUrl = 'https://riserbackend-production.up.railway.app';
  // const defaultUrl = 'http://127.0.0.1:8000';
  console.log('[API Config] Using default production URL:', defaultUrl);
  console.log('[API Config] VITE_API_URL not set, falling back to:', defaultUrl);
  return defaultUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL on initialization
console.log('[API Config] ==========================================');
console.log('[API Config] API Base URL Initialized:', API_BASE_URL);
console.log('[API Config] Environment:', import.meta.env.MODE);
console.log('[API Config] VITE_API_URL set:', !!import.meta.env.VITE_API_URL);
if (import.meta.env.VITE_API_URL) {
  console.log('[API Config] VITE_API_URL value:', import.meta.env.VITE_API_URL);
}
console.log('[API Config] ==========================================');

/**
 * Helper function to log API request details
 * @param endpoint - The API endpoint (e.g., '/api/dashboard')
 * @param method - HTTP method (e.g., 'GET', 'POST')
 */
export const logApiRequest = (endpoint: string, method: string = 'GET') => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`[API Request] ${method} ${endpoint}`);
  console.log(`[API Request] Base URL:`, API_BASE_URL);
  console.log(`[API Request] Full URL:`, fullUrl);
  return fullUrl;
};

