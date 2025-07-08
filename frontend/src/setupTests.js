// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Simple localStorage mock
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    // Helper method for tests
    __STORE__: store
  };
})();

// Set up localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Also set on global for environments that need it
global.localStorage = localStorageMock;

// Mock fetch globally
global.fetch = jest.fn();

// Export localStorage mock for tests
global.mockLocalStorage = localStorageMock;
