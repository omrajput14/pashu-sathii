import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../core/context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { authService } from '../core/api/authService';

vi.mock('../core/api/authService', () => ({
  authService: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('Authentication Flow & Government Role Verification', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the Government login screen with institutional branding', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('PASHU SATHI GOVERNMENT COMMAND PORTAL')).toBeInTheDocument();
    expect(screen.getByText('Surveillance Command Station')).toBeInTheDocument();
    expect(screen.getByLabelText(/Officer Identifier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Security Password/i)).toBeInTheDocument();
  });

  it('submits login credentials for GOVERNMENT_OFFICER and saves session', async () => {
    const mockAuthResponse = {
      accessToken: 'test-jwt-token-xyz',
      refreshToken: 'test-refresh-token-abc',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 'gov-user-1',
        email: 'officer.pune@dahd.gov.in',
        phone: '+919876543210',
        role: 'GOVERNMENT_OFFICER' as const,
        active: true,
        preferredLanguage: 'en',
        fullName: 'Dr. Vikram Patil',
      },
    };

    (authService.login as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockAuthResponse);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/Officer Identifier/i), {
      target: { value: 'officer.pune@dahd.gov.in' },
    });
    fireEvent.change(screen.getByLabelText(/Security Password/i), {
      target: { value: 'Password@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Authenticate & Access Command Center/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        identifier: 'officer.pune@dahd.gov.in',
        password: 'Password@123',
      });
      expect(localStorage.getItem('vetra_gov_access_token')).toBe('test-jwt-token-xyz');
    });
  });

  it('denies access if authenticated user role is FARMER or VETERINARIAN', async () => {
    const mockVetResponse = {
      accessToken: 'test-vet-token',
      refreshToken: 'test-vet-refresh',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 'vet-user-1',
        email: 'dr.vet@clinic.com',
        phone: '+919876543211',
        role: 'VETERINARIAN' as const,
        active: true,
        preferredLanguage: 'en',
        fullName: 'Dr. Ramesh Vet',
      },
    };

    (authService.login as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockVetResponse);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/Officer Identifier/i), {
      target: { value: 'dr.vet@clinic.com' },
    });
    fireEvent.change(screen.getByLabelText(/Security Password/i), {
      target: { value: 'Password@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Authenticate & Access Command Center/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Access Denied/i);
      expect(localStorage.getItem('vetra_gov_access_token')).toBeNull();
    });
  });
});
