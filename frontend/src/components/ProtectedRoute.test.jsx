import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

import ProtectedRoute from './ProtectedRoute';

function renderWithProviders(ui) {
  return render(
    <MantineProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </MantineProvider>
  );
}

describe('ProtectedRoute', () => {
  it('shows loader when loading', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, role: null, loading: true });

    renderWithProviders(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, role: 'STUDENT', loading: false });

    renderWithProviders(
      <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows 403 when role not allowed', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, role: 'STUDENT', loading: false });

    renderWithProviders(
      <ProtectedRoute allowedRoles={['ADMIN']}><div>Admin Only</div></ProtectedRoute>
    );

    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    expect(screen.getByText('403')).toBeInTheDocument();
  });

  it('renders when role is in allowedRoles', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, role: 'TEACHER', loading: false });

    renderWithProviders(
      <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
        <div>Teacher Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Teacher Content')).toBeInTheDocument();
  });
});
