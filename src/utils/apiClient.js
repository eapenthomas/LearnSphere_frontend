// Centralized API client for LearnSphere Frontend
// This ensures consistent API URL usage across all components

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://learnsphere-backend-d57a.onrender.com';

// Helper function to get full API endpoint URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Helper function for API requests with consistent error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function for JSON API requests
export const apiJsonRequest = async (endpoint, options = {}) => {
  const response = await apiRequest(endpoint, options);
  return response.json();
};

// Export the base URL for direct use when needed
export { API_BASE_URL };
