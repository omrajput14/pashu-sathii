import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse } from '../types/auth.types';
import {
  mockAdminUser,
  
  mockAuthResponse,
  mockOutbreakStatistics,
  mockOutbreaks,
  mockDiseaseAnalytics,
  mockReports,
  mockOutbreaksGeoJson,
  mockHeatmapData,
  mockDistricts,
  mockDiseaseRegistry,
  mockVaccinationAnalytics,
  mockOperationalAlerts,
  mockSystemConfiguration,
} from './mockData';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.vetra.co.in/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

export const isDemoMode = (): boolean => {
  return localStorage.getItem('vetra_demo_mode') === 'true';
};

export const setDemoMode = (enabled: boolean): void => {
  if (enabled) {
    localStorage.setItem('vetra_demo_mode', 'true');
  } else {
    localStorage.removeItem('vetra_demo_mode');
  }
};

export function getMockResponseForUrl(url: string, _method = 'get', postData?: any): any {
  const cleanUrl = url.replace(/^[a-z]+:\/\/[^/]+/i, '').replace(/^\/api\/v1/, '');

  if (cleanUrl.includes('/auth/login')) {
    const id = postData?.identifier || 'admin';
    return mockAuthResponse(id);
  }
  if (cleanUrl.includes('/auth/me')) {
    const saved = localStorage.getItem('vetra_gov_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return mockAdminUser;
  }
  if (cleanUrl.includes('/auth/vets')) {
    return [];
  }
  if (cleanUrl.includes('/disease/outbreaks/statistics')) {
    return mockOutbreakStatistics;
  }
  if (cleanUrl.includes('/disease/outbreaks/high-risk')) {
    return mockOutbreaks.filter((o) => o.riskScore === 'CRITICAL' || o.riskScore === 'HIGH');
  }
  if (cleanUrl.includes('/disease/outbreaks/geojson')) {
    return mockOutbreaksGeoJson;
  }
  if (cleanUrl.includes('/disease/outbreaks/heatmap')) {
    return mockHeatmapData;
  }
  if (cleanUrl.match(/\/disease\/outbreaks\/[^/]+\/reports/)) {
    return mockReports;
  }
  if (cleanUrl.match(/\/disease\/outbreaks\/[a-zA-Z0-9_-]+/)) {
    const parts = cleanUrl.split('/');
    const id = parts[parts.length - 1];
    return mockOutbreaks.find((o) => o.id === id) || mockOutbreaks[0];
  }
  if (cleanUrl.includes('/disease/outbreaks')) {
    return mockOutbreaks;
  }
  if (cleanUrl.includes('/disease/analytics')) {
    return mockDiseaseAnalytics;
  }
  if (cleanUrl.includes('/disease/reports')) {
    return {
      content: mockReports,
      totalElements: mockReports.length,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };
  }
  if (cleanUrl.includes('/disease/registry')) {
    return mockDiseaseRegistry;
  }
  if (cleanUrl.includes('/disease/vaccination/analytics')) {
    return mockVaccinationAnalytics;
  }
  if (cleanUrl.includes('/disease/alerts')) {
    return mockOperationalAlerts;
  }
  if (cleanUrl.includes('/geo/boundaries')) {
    return mockOutbreaksGeoJson;
  }
  if (cleanUrl.includes('/geo/districts')) {
    return mockDistricts;
  }
  if (cleanUrl.includes('/geo/talukas')) {
    return ['Baramati', 'Koregaon', 'Madha', 'Rahuri', 'Haveli', 'Shirur'];
  }
  if (cleanUrl.includes('/system/configuration')) {
    return mockSystemConfiguration;
  }
  if (cleanUrl.includes('/actuator/health') || cleanUrl.includes('/readiness')) {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  return { message: 'Mock response fallback' };
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token or intercept if demo mode active
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('vetra_gov_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Refresh & Transparent Offline/Firewall Fallback
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. Handle 401 Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('vetra_gov_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('vetra_gov_access_token');
        localStorage.removeItem('vetra_gov_user');
        window.dispatchEvent(new Event('vetra_auth_logout'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<AuthResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;

        localStorage.setItem('vetra_gov_access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('vetra_gov_refresh_token', newRefreshToken);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('vetra_gov_access_token');
        localStorage.removeItem('vetra_gov_refresh_token');
        localStorage.removeItem('vetra_gov_user');
        window.dispatchEvent(new Event('vetra_auth_logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Automatic Offline / Campus Firewall Fallback Interception
    const isNetworkOrFirewallError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.response?.status === 0 ||
      // 403 Forbidden is a valid RBAC rejection and must not be masked as a network error
      error.response?.status === 502 ||
      error.response?.status === 503 ||
      isDemoMode();

        // Phase 4A Strict Requirement: Never silently fall back to synthetic data for vaccination campaigns in production
    if ((originalRequest?.url?.includes('/vaccination/campaigns') || originalRequest?.url?.includes('/dashboard/economic-impact')) && !isDemoMode()) {
      return Promise.reject(error);
    }

    if (isNetworkOrFirewallError && originalRequest?.url) {
      console.warn(`[PASHU SATHI Client] Live backend unreachable (Campus Firewall / Network). Engaging offline fallback for: ${originalRequest.url}`);
      let parsedPostData;
      if (originalRequest.data) {
        try {
          parsedPostData = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest.data;
        } catch {
          parsedPostData = undefined;
        }
      }
      const mockData = getMockResponseForUrl(
        originalRequest.url,
        originalRequest.method,
        parsedPostData
      );

      const syntheticResponse: AxiosResponse = {
        data: {
          success: true,
          message: 'OFFLINE_FIREWALL_FALLBACK_DATA',
          data: mockData,
          timestamp: new Date().toISOString(),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: originalRequest,
      };

      return Promise.resolve(syntheticResponse);
    }

    return Promise.reject(error);
  }
);
