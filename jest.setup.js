import '@testing-library/jest-dom'

// Mock localStorage for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

global.localStorage = localStorageMock

// Mock console.warn for cleaner test output
global.console = {
  ...console,
  warn: jest.fn(),
}