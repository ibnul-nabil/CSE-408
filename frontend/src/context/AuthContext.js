import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_URL;

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
        const logoutUrl = `${API_URL}/api/auth/logout`;
        console.log('Logout URL:', logoutUrl); // Debug log
        
        await fetch(logoutUrl, {
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
      const validateUrl = `${API_URL}/api/auth/validate`;
      console.log('Validate URL:', validateUrl); // Debug log

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(validateUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Session valid - user authenticated:', userData);
        return userData;
      } else {
        console.log('❌ Session invalid or expired');
        return null;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('⏰ Session validation timeout - proceeding without validation');
      } else {
        console.error('Session validation error:', error);
      }
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
          
          // Try to parse stored user first as fallback
          let parsedUser = null;
          try {
            parsedUser = JSON.parse(storedUser);
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
          
          const userData = await validateSession(token);
          
          if (userData) {
            console.log('✅ Session validation successful - staying logged in');
            setUser(userData);
          } else if (parsedUser) {
            console.log('⚠️ Session validation failed but using stored user as fallback');
            setUser(parsedUser);
          } else {
            console.log('❌ Session validation failed and no valid stored user - logging out');
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
        // If there's an error but we have stored user, use it as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('🔄 Using stored user as fallback due to initialization error');
            setUser(parsedUser);
          } catch (e) {
            console.error('Failed to parse stored user as fallback:', e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
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