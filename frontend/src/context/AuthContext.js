import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
//const API_URL = 'http://20.40.57.81:8080'; // Add API URL configuration
const API_URL = 'http://localhost:8080'; // Add API URL configuration

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    // Call backend logout endpoint
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const validateSession = useCallback(async (token) => {
    try {
      console.log('🔍 Validating session...');
      const response = await fetch(`${API_URL}/api/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Session valid - user authenticated');
        return userData;
      } else {
        console.log('❌ Session invalid or expired');
        return null;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          console.log('📋 Found stored user and token, validating session...');
          const userData = await validateSession(token);
          
          if (userData) {
            console.log('✅ Session validation successful - staying logged in');
            setUser(userData);
          } else {
            console.log('❌ Session validation failed - logging out');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          console.log('📋 No stored user or token found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [validateSession]);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 