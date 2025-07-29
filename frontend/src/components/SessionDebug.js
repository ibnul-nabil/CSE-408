import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_URL;

const SessionDebug = () => {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');

  const testSessionValidation = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    setDebugInfo(`Testing session validation...
Token: ${token ? 'Present' : 'Missing'}
Stored User: ${storedUser ? 'Present' : 'Missing'}
Current User State: ${user ? 'Logged In' : 'Not Logged In'}
Loading: ${loading}`);

    if (token) {
      try {
        const response = await fetch(`${API_URL}/api/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        setDebugInfo(prev => prev + `
Validation Response: ${response.status} ${response.statusText}
Response Data: ${JSON.stringify(result, null, 2)}`);
      } catch (error) {
        setDebugInfo(prev => prev + `
Validation Error: ${error.message}`);
      }
    }
  };

  if (!user) return null; // Only show when logged in

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#f0f0f0',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4>Session Debug</h4>
      <button onClick={testSessionValidation} style={{ marginBottom: '10px' }}>
        Test Session
      </button>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
        {debugInfo}
      </pre>
    </div>
  );
};

export default SessionDebug; 