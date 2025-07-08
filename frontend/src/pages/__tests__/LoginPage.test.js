import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginPage from '../LoginPage';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock environment variable
process.env.REACT_APP_URL = 'http://localhost:8080';

// Helper function to render LoginPage with required providers
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage Frontend Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    mockNavigate.mockClear();
    // Mock console to suppress debug logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ✅ COMPONENT RENDERING TESTS
  describe('Component Rendering', () => {
    it('should render login form by default', () => {
      renderLoginPage();
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to continue your adventure')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    });

    it('should render signup form when toggled', () => {
      renderLoginPage();
      
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByText('Join Tourify to start your journey')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should have proper form elements with required attributes', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  // ✅ UI STATE CHANGES TESTS
  describe('UI State Changes', () => {
    it('should toggle between login and signup modes', () => {
      renderLoginPage();
      
      // Initially in login mode
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.queryByLabelText('Confirm Password')).not.toBeInTheDocument();
      
      // Toggle to signup
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      
      // Toggle back to login
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.queryByLabelText('Confirm Password')).not.toBeInTheDocument();
    });

    it('should clear form data when toggling modes', () => {
      renderLoginPage();
      
      // Fill in login form
      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpass' } });
      
      // Toggle to signup
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      
      // Form should be cleared
      expect(screen.getByLabelText('Username')).toHaveValue('');
      expect(screen.getByLabelText('Password')).toHaveValue('');
    });

    it('should show loading state during form submission', async () => {
      renderLoginPage();
      
      // Mock a delayed API response
      fetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ user: { id: 1, username: 'testuser' }, token: 'token123' })
          }), 100)
        )
      );

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpass' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Should show loading state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled();
    });

    it('should clear error when user starts typing', async () => {
      renderLoginPage();
      
      // Trigger an error first by submitting invalid form
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      // Wait for error to appear, then type to clear it
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
      
      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser2' } });
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });
  });

  // ✅ FORM SUBMISSION TESTS
  describe('Form Submission', () => {
    it('should submit login form with correct data', async () => {
      renderLoginPage();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          user: { id: 1, username: 'testuser' }, 
          token: 'token123' 
        })
      });

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpass'
          })
        });
      });
    });

    it('should submit signup form with correct data', async () => {
      renderLoginPage();
      
      // Switch to signup mode
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Account created successfully' })
      });

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'newpass' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'newpass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'newuser',
            password: 'newpass',
            email: 'newuser@email.com'
          })
        });
      });
    });

    it('should validate password confirmation in signup', async () => {
      renderLoginPage();
      
      // Switch to signup mode
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password1' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password2' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
      
      // Should not make API call
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // ✅ ERROR MESSAGE DISPLAY TESTS
  describe('Error Message Display', () => {
    it('should display error message on failed login', async () => {
      renderLoginPage();
      
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid username or password' })
      });

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'wronguser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      });
    });

    it('should display error message on failed signup', async () => {
      renderLoginPage();
      
      // Switch to signup mode
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Username already exists' })
      });

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'existinguser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

      await waitFor(() => {
        expect(screen.getByText('Username already exists')).toBeInTheDocument();
      });
    });

    it('should display network error message', async () => {
      renderLoginPage();
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display success message after successful signup', async () => {
      renderLoginPage();
      
      // Switch to signup mode
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Account created successfully' })
      });

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

      await waitFor(() => {
        expect(screen.getByText('Account created successfully! Please login.')).toBeInTheDocument();
        // Should switch back to login mode
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });
  });

  // ✅ NAVIGATION/ROUTING TESTS
  describe('Navigation/Routing', () => {
    it('should navigate to profile page on successful login', async () => {
      renderLoginPage();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          user: { id: 1, username: 'testuser' }, 
          token: 'token123' 
        })
      });

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
      });
    });

    it('should not navigate on failed login', async () => {
      renderLoginPage();
      
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'wronguser' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
}); 