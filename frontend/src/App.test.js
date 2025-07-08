import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = mockLocalStorage;

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

test('renders login page when not authenticated', async () => {
  // Given
  mockLocalStorage.getItem.mockReturnValue(null);
  fetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
  });

  // When
  render(<App />);

  // Then
  await waitFor(() => {
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue your adventure')).toBeInTheDocument();
  });
});
