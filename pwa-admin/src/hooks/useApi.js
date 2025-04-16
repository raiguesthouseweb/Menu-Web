import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for making API requests with authentication
 * @returns {Object} API methods and state
 */
export function useApi() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get server URL from localStorage
      const serverUrl = localStorage.getItem('serverUrl') || window.location.origin;
      const url = endpoint.startsWith('http') ? endpoint : `${serverUrl}${endpoint}`;
      
      // Add auth header if user is logged in
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      if (user) {
        headers['X-User-ID'] = user.id.toString();
      }
      
      // Process request body
      let body = options.body;
      if (body && typeof body === 'object' && !(body instanceof FormData)) {
        body = JSON.stringify(body);
      }
      
      // Make the request
      const response = await fetch(url, {
        ...options,
        headers,
        body
      });
      
      // Handle non-ok responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      // Parse response
      const data = await response.json().catch(() => ({}));
      
      return data;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  /**
   * Get data from API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  const get = useCallback((endpoint, options = {}) => {
    return request(endpoint, { method: 'GET', ...options });
  }, [request]);
  
  /**
   * Post data to API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  const post = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, { method: 'POST', body: data, ...options });
  }, [request]);
  
  /**
   * Update data using PUT
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  const put = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, { method: 'PUT', body: data, ...options });
  }, [request]);
  
  /**
   * Update data using PATCH
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  const patch = useCallback((endpoint, data, options = {}) => {
    return request(endpoint, { method: 'PATCH', body: data, ...options });
  }, [request]);
  
  /**
   * Delete data
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  const del = useCallback((endpoint, options = {}) => {
    return request(endpoint, { method: 'DELETE', ...options });
  }, [request]);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    patch,
    del
  };
}