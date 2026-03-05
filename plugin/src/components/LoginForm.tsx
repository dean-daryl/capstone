import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Text } from '@mantine/core';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://89.167.119.247';
const isChromeExtension = typeof chrome !== 'undefined' && !!chrome.storage?.local;

interface LoginFormProps {
  onLoginSuccess: (token: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();

      if (data.status && data.data?.token) {
        if (isChromeExtension) {
          chrome.storage.local.set({ authToken: data.data.token, userId: data.data.userId });
        } else {
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('userId', data.data.userId);
        }
        onLoginSuccess(data.data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xs">
        <TextInput
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="sm"
        />
        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          size="sm"
        />
        {error && (
          <Text size="xs" c="red">
            {error}
          </Text>
        )}
        <Button type="submit" loading={isLoading} fullWidth size="sm">
          Log in
        </Button>
      </Stack>
    </form>
  );
};
