import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            firstName: localStorage.getItem('firstName'),
            lastName: localStorage.getItem('lastName'),
            email: localStorage.getItem('email'),
            role: payload.role || localStorage.getItem('role'),
            id: localStorage.getItem('userId'),
          });
          setLoading(false);
          return;
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    }
    // No valid token — try auto-login (local mode)
    apiClient.get('auth/auto-login')
      .then((res) => {
        const data = res.data?.data;
        if (data?.token) {
          login(data);
        }
      })
      .catch(() => {
        // Not in local mode or backend down — user must login manually
      })
      .finally(() => setLoading(false));
  }, []);

  function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setUser(null);
    setToken(null);
  }

  function login(responseData) {
    const { token: newToken, firstName, lastName, email, role, userId } = responseData;
    localStorage.setItem('token', newToken);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    setToken(newToken);
    setUser({ firstName, lastName, email, role, id: userId });
  }

  function logout() {
    clearAuth();
    window.location.href = '/login';
  }

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
