/**
 * API Client Configuration
 * 
 * Axios-based HTTP client for communicating with the PulseVote backend API.
 * Includes authentication token handling and automatic error management.
 * 
 * Features:
 * - Automatic JWT token attachment to requests
 * - Token expiration handling with automatic logout
 * - Request/response interceptors for error handling
 * - Configurable base URL and timeout
 * 
 * @author PulseVote Team
 * @version 1.0.0
 */

import axios from 'axios';

/**
 * Create Axios instance with default configuration
 * 
 * Base configuration for all API requests including:
 * - Base URL from environment variables or default
 * - Request timeout of 10 seconds
 * - Credentials support for CORS
 */
const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

/**
 * Request interceptor to add authentication token
 * 
 * Automatically attaches JWT token from localStorage to all requests
 * if the token exists. This ensures authenticated requests work seamlessly.
 */
API.interceptors.request.use(
  config => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // Add Bearer token to Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

/**
 * Response interceptor to handle authentication errors
 * 
 * Automatically handles 401 (Unauthorized) responses by:
 * - Removing expired/invalid token from localStorage
 * - Redirecting user to login page
 */
API.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      // Remove invalid token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default API;