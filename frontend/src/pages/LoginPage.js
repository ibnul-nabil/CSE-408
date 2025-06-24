import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const API_URL = 'http://20.40.57.81:8080'; // Add API URL configuration

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up logic
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            email: `${formData.username}@email.com`
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Sign up successful, switch to login
          setIsSignUp(false);
          setFormData({ username: '', password: '', confirmPassword: '' });
          setError('Account created successfully! Please login.');
        } else {
          setError(data.message || 'Sign up failed');
        }
      } else {
        // Login logic
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Use AuthContext to login
          login(data.user, data.token);
          
          // Navigate to profile page (no ID in URL)
          navigate('/profile');
        } else {
          setError(data.message || 'Invalid username or password');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ username: '', password: '', confirmPassword: '' });
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Join Tourify to start your journey' : 'Sign in to continue your adventure'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="toggle-btn" 
              onClick={toggleMode}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 