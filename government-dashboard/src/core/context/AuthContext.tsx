import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfileDto, LoginRequest } from '../types/auth.types';
import { authService } from '../api/authService';

interface AuthContextType {
  user: UserProfileDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGovernmentAuthorized: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileDto | null>(() => {
    const saved = localStorage.getItem('vetra_gov_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Strict role checking: Only GOVERNMENT_OFFICER and ADMINISTRATOR are authorized for the Command Center
  const isGovernmentAuthorized = Boolean(
    user && (user.role === 'GOVERNMENT_OFFICER' || user.role === 'ADMINISTRATOR')
  );

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('vetra_gov_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
      localStorage.setItem('vetra_gov_user', JSON.stringify(profile));
    } catch {
      setUser(null);
      localStorage.removeItem('vetra_gov_access_token');
      localStorage.removeItem('vetra_gov_refresh_token');
      localStorage.removeItem('vetra_gov_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();

    const handleExternalLogout = () => {
      setUser(null);
    };

    window.addEventListener('vetra_auth_logout', handleExternalLogout);
    return () => window.removeEventListener('vetra_auth_logout', handleExternalLogout);
  }, [refreshProfile]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(credentials);
      // Validate role before committing session to storage
      if (
        authData.user.role !== 'GOVERNMENT_OFFICER' &&
        authData.user.role !== 'ADMINISTRATOR'
      ) {
        throw new Error(
          'Access Denied: The Government Surveillance Command Center is restricted to authorized Government Officers and Administrators. Veterinarians and Farmers must use their dedicated mobile applications.'
        );
      }

      localStorage.setItem('vetra_gov_access_token', authData.accessToken);
      localStorage.setItem('vetra_gov_refresh_token', authData.refreshToken);
      localStorage.setItem('vetra_gov_user', JSON.stringify(authData.user));
      setUser(authData.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('vetra_gov_refresh_token') || '';
    await authService.logout(refreshToken);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isGovernmentAuthorized,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
