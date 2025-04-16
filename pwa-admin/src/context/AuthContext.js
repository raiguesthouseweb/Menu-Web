import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the authentication context
export const AuthContext = createContext();

// Create the auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have auth data in local storage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setError('Failed to restore authentication state');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the server URL from local storage or use a default
      const serverUrl = localStorage.getItem('serverUrl') || window.location.origin;
      
      // Call the API to authenticate
      const response = await fetch(`${serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const userData = await response.json();
      
      // Save auth data to local storage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.id.toString());
      localStorage.setItem('serverUrl', serverUrl);
      
      // Save auth data to IndexedDB for service worker access
      await saveAuthDataToIndexedDB({
        userId: userData.id.toString(),
        serverUrl
      });
      
      // Update state
      setUser(userData);
      
      // Initialize notification permissions
      if ('Notification' in window) {
        Notification.requestPermission();
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear IndexedDB auth data
    clearAuthDataFromIndexedDB();
    
    setUser(null);
  };

  // Set server URL function
  const setServerUrl = (url) => {
    localStorage.setItem('serverUrl', url);
    
    // Update IndexedDB
    if (user) {
      saveAuthDataToIndexedDB({
        userId: user.id.toString(),
        serverUrl: url
      });
    }
  };

  // Helper function to save auth data to IndexedDB for service worker access
  const saveAuthDataToIndexedDB = async (data) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('rai-admin-db', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains('auth')) {
          db.createObjectStore('auth', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['auth'], 'readwrite');
        const store = transaction.objectStore('auth');
        
        const storeRequest = store.put({
          id: 'auth-data',
          ...data,
          timestamp: new Date().toISOString()
        });
        
        storeRequest.onsuccess = () => resolve();
        storeRequest.onerror = () => reject(new Error('Failed to save auth data to IndexedDB'));
      };
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    });
  };

  // Helper function to clear auth data from IndexedDB
  const clearAuthDataFromIndexedDB = async () => {
    return new Promise((resolve) => {
      const request = indexedDB.open('rai-admin-db', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        
        if (db.objectStoreNames.contains('auth')) {
          const transaction = db.transaction(['auth'], 'readwrite');
          const store = transaction.objectStore('auth');
          
          store.delete('auth-data');
        }
        
        resolve();
      };
      
      request.onerror = () => resolve(); // Resolve anyway to prevent blocking
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      setServerUrl,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};