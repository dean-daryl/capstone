import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Must import after mocking localStorage
const { default: apiClient } = await import('./apiClient.js');

describe('apiClient', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('has the correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
  });

  it('has request and response interceptors', () => {
    expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
    expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
  });

  it('request interceptor adds auth header when token exists', async () => {
    localStorageMock.getItem.mockReturnValue('test-jwt-token');

    const config = { headers: {} };
    const handler = apiClient.interceptors.request.handlers[0];
    const result = await handler.fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
  });

  it('request interceptor skips auth header when no token', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const config = { headers: {} };
    const handler = apiClient.interceptors.request.handlers[0];
    const result = await handler.fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
