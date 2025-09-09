// Utility to get the correct API base URL based on environment
export const getApiBaseUrl = () => {
  const isProduction = window.location.hostname === 'itsamisha.github.io';
  return isProduction 
    ? 'https://fixpoint-ajtz.onrender.com'
    : (process.env.REACT_APP_API_URL || 'http://localhost:8080');
};

// Helper for WebSocket URLs
export const getWebSocketUrl = () => {
  const baseUrl = getApiBaseUrl();
  return baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
};

// Helper for image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/${imagePath}`;
};

export default getApiBaseUrl;
