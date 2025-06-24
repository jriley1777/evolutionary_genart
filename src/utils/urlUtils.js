/**
 * URL utilities for managing fullscreen mode and other query parameters
 */

/**
 * Get the current fullscreen state from URL query parameters
 * @returns {boolean} True if fullscreen mode is active
 */
export const getFullscreenState = () => {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('sz') === 'fullscreen';
};

/**
 * Create a fullscreen URL for a specific sketch
 * @param {string} baseUrl - The base URL (e.g., current location)
 * @param {string} sketchSlug - The sketch slug
 * @returns {string} The fullscreen URL
 */
export const createFullscreenUrl = (baseUrl, sketchSlug) => {
  const url = new URL(baseUrl);
  url.pathname = `/sketch/${sketchSlug}`;
  url.searchParams.set('sz', 'fullscreen');
  return url.toString();
};

/**
 * Remove fullscreen parameter from current URL
 * @returns {string} The URL without fullscreen parameter
 */
export const removeFullscreenFromUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const url = new URL(window.location);
  url.searchParams.delete('sz');
  return url.toString();
};

/**
 * Add fullscreen parameter to current URL
 * @returns {string} The URL with fullscreen parameter
 */
export const addFullscreenToUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const url = new URL(window.location);
  url.searchParams.set('sz', 'fullscreen');
  return url.toString();
};

/**
 * Toggle fullscreen parameter in current URL
 * @returns {string} The toggled URL
 */
export const toggleFullscreenInUrl = () => {
  if (typeof window === 'undefined') return '';
  
  const url = new URL(window.location);
  if (url.searchParams.get('sz') === 'fullscreen') {
    url.searchParams.delete('sz');
  } else {
    url.searchParams.set('sz', 'fullscreen');
  }
  return url.toString();
}; 