/**
 * API Configuration
 * 
 * The API base URL is determined by:
 * 1. VITE_API_URL environment variable (set in Vercel or .env file)
 * 2. Default fallback to production backend
 * 3. Local development fallback
 */

const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production backend domain
  return 'https://riserbackend-production.up.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL in development (not in production)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

