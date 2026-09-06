import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import { SystemConfigurationResponse, HealthResponse } from '../types/system.types';
import axios from 'axios';

export const systemService = {
  /**
   * Retrieves non-sensitive, read-only system and surveillance configuration.
   * Requires GOVERNMENT_OFFICER or ADMINISTRATOR role.
   */
  getSystemConfiguration: async (): Promise<SystemConfigurationResponse> => {
    const response = await apiClient.get<ApiResponse<SystemConfigurationResponse>>(
      '/system/configuration'
    );
    return response.data.data;
  },

  /**
   * Checks backend service readiness via Spring Boot Actuator or readiness probe.
   * Target: https://api.vetra.co.in/actuator/health
   */
  getHealthStatus: async (): Promise<HealthResponse> => {
    const rootUrl = (apiClient.defaults.baseURL || 'https://api.vetra.co.in/api/v1').replace(/\/api\/v1\/?$/, '');
    try {
      const response = await axios.get(`${rootUrl}/actuator/health`, { timeout: 8000 });
      const status = response.data?.status || 'UP';
      return { status, timestamp: new Date().toISOString() };
    } catch {
      try {
        const fallback = await axios.get(`${rootUrl}/readiness`, { timeout: 8000 });
        const status = fallback.data?.data?.status || fallback.data?.status || 'READY';
        return { status, timestamp: fallback.data?.data?.timestamp || new Date().toISOString() };
      } catch {
        return { status: 'DEGRADED', timestamp: new Date().toISOString() };
      }
    }
  },
};
