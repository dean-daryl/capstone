import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./apiClient.js', () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from './apiClient.js';
import { login, signup } from './authService.js';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls POST /auth/login with credentials', async () => {
      const mockResponse = {
        data: { status: true, data: { token: 'jwt', firstName: 'John' } },
      };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await login({ username: 'test@example.com', password: 'pass' });

      expect(apiClient.post).toHaveBeenCalledWith('auth/login', {
        username: 'test@example.com',
        password: 'pass',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('throws on failure', async () => {
      apiClient.post.mockRejectedValue(new Error('Network error'));

      await expect(login({ username: 'x', password: 'y' })).rejects.toThrow('Network error');
    });
  });

  describe('signup', () => {
    it('calls POST /auth/signup with credentials', async () => {
      const mockResponse = { data: { status: true } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await signup({ email: 'new@example.com', password: 'pass' });

      expect(apiClient.post).toHaveBeenCalledWith('auth/signup', {
        email: 'new@example.com',
        password: 'pass',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});
