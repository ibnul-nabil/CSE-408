import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Use the global mocks from setupTests.js
const mockLocalStorage = global.mockLocalStorage;

// Test component to access AuthContext
const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.username : 'no-user'}</div>
      <button data-testid="login-btn" onClick={() => login({ username: 'testuser', id: 1 }, 'test-token')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  // Store console spies
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    // Set up console spies to suppress logs during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Clear all mocks before each test
    jest.clearAllMocks();
    fetch.mockClear();
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  afterEach(() => {
    // Restore console
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Basic functionality', () => {
    it('should render the page with initial state', async () => {
      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Then - wait for loading to complete and check initial state
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
        expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
      });
    });

    it('should handle login button click', async () => {
      // When
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Click login button
      act(() => {
        screen.getByTestId('login-btn').click();
      });

      // Then - user should be logged in
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      });

      // Should store credentials in localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ username: 'testuser', id: 1 }));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    });

    it('should handle logout button click', async () => {
      // Given - user is logged in
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial render and login
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      act(() => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      });

      // When - click logout button
      act(() => {
        screen.getByTestId('logout-btn').click();
      });

      // Then - user should be logged out
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      // Should clear credentials from localStorage
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Given
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // When & Then
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
}); 