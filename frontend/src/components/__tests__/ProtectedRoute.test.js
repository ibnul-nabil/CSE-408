import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

// Mock the AuthContext to control authentication state
const mockAuthContext = {
  user: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn()
};

jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => mockAuthContext
}));

// Test components
const TestProtectedComponent = () => <div data-testid="protected-content">Protected Content</div>;
const TestLoginComponent = () => <div data-testid="login-page">Login Page</div>;

const renderWithRouter = (component, { route = '/protected' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<TestLoginComponent />} />
        <Route path="/protected" element={component} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    // Reset mock auth context
    mockAuthContext.user = null;
    mockAuthContext.loading = false;
    mockAuthContext.login.mockClear();
    mockAuthContext.logout.mockClear();
  });

  describe('when user is authenticated', () => {
    it('should render protected content', () => {
      // Given - Set user as authenticated
      mockAuthContext.user = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockAuthContext.loading = false;

      // When
      renderWithRouter(
        <ProtectedRoute>
          <TestProtectedComponent />
        </ProtectedRoute>
      );

      // Then
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render multiple protected children', () => {
      // Given - Set user as authenticated
      mockAuthContext.user = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockAuthContext.loading = false;

      // When
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </ProtectedRoute>
      );

      // Then
      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });
  });

  describe('when user is not authenticated', () => {
    it('should redirect to login page', () => {
      // Given - No user (default state)
      mockAuthContext.user = null;
      mockAuthContext.loading = false;

      // When
      renderWithRouter(
        <ProtectedRoute>
          <TestProtectedComponent />
        </ProtectedRoute>
      );

      // Then
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should not render protected content when session is invalid', () => {
      // Given - Invalid session (no user)
      mockAuthContext.user = null;
      mockAuthContext.loading = false;

      // When
      renderWithRouter(
        <ProtectedRoute>
          <TestProtectedComponent />
        </ProtectedRoute>
      );

      // Then
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('when loading', () => {
    it('should show loading state', () => {
      // Given - Set loading state
      mockAuthContext.user = null;
      mockAuthContext.loading = true;

      // When
      renderWithRouter(
        <ProtectedRoute>
          <TestProtectedComponent />
        </ProtectedRoute>
      );

      // Then
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should show loading with proper styling and accessibility', () => {
      // Given - Set loading state
      mockAuthContext.user = null;
      mockAuthContext.loading = true;

      // When
      renderWithRouter(
        <ProtectedRoute>
          <TestProtectedComponent />
        </ProtectedRoute>
      );

      // Then
      const loadingElement = screen.getByText('Loading...');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
      
      const loadingDiv = loadingElement.parentElement;
      expect(loadingDiv).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty children', () => {
      // Given - No user
      mockAuthContext.user = null;
      mockAuthContext.loading = false;

      // When
      renderWithRouter(<ProtectedRoute />);

      // Then
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
      // Given - Set user as authenticated
      mockAuthContext.user = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockAuthContext.loading = false;

      // When
      renderWithRouter(
        <ProtectedRoute>
          <div data-testid="header">Header</div>
          <main data-testid="main">
            <section>
              <h1>Main Content</h1>
              <p>Some text</p>
            </section>
          </main>
          <footer data-testid="footer">Footer</footer>
        </ProtectedRoute>
      );

      // Then
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('main')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should handle network errors during authentication', () => {
      // Given - No user (simulating network error result)
      mockAuthContext.user = null;
      mockAuthContext.loading = false;

      // When
      renderWithRouter(
        <ProtectedRoute>
          <TestProtectedComponent />
        </ProtectedRoute>
      );

      // Then
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });
}); 