import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsPage } from '../pages/SettingsPage';
import { systemService } from '../core/api/systemService';
import { diseaseService } from '../core/api/diseaseService';
import { SystemConfigurationResponse } from '../core/types/system.types';
import { DiseaseMetadata } from '../core/types/disease.types';
import { UserProfileDto } from '../core/types/auth.types';

const mockUser: UserProfileDto = {
  id: 'usr-gov-001',
  fullName: 'Dr. Suresh Patil (State Surveillance Director)',
  phone: '+919876543210',
  email: 'suresh.patil@vetra.gov.in',
  role: 'GOVERNMENT_OFFICER',
  state: 'Maharashtra',
  district: 'Pune',
  active: true,
  preferredLanguage: 'en',
};

vi.mock('../core/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isGovernmentAuthorized: true,
    isLoading: false,
  }),
}));

vi.mock('../core/api/systemService', () => ({
  systemService: {
    getSystemConfiguration: vi.fn(),
    getHealthStatus: vi.fn(),
  },
}));

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    getDiseaseRegistry: vi.fn(),
  },
}));

const mockSystemConfig: SystemConfigurationResponse = {
  surveillance: {
    weightCluster: 0.40,
    weightWeather: 0.20,
    weightHistory: 0.20,
    weightVaccination: 0.20,
    lowThreshold: 30,
    mediumThreshold: 55,
    highThreshold: 80,
    confirmedCaseMultiplier: 1.0,
    suspectedCaseMultiplier: 0.4,
  },
  weather: {
    provider: 'Open-Meteo Meteorological API',
    enabled: true,
    cacheTtlMinutes: 30,
    timeoutSeconds: 3,
    connectTimeoutSeconds: 2,
    apiEndpoint: 'https://api.open-meteo.com/v1/forecast',
  },
  alerts: {
    epidemiologicalRiskThreshold: 80,
    operationalPriorityFormula: '0.50 * Risk + 0.30 * VacGap + 0.20 * Velocity',
    evaluationMode: 'Dynamic Deterministic Derivation (Read-Only)',
  },
  system: {
    serviceName: 'vetra-backend',
    environment: 'dev',
    version: '0.12.5.0',
    databaseEngine: 'PostgreSQL 16 + PostGIS 3.4 (Hibernate Spatial)',
    connectionPool: 'VetraHikariPool (Max: 20, MinIdle: 5)',
    securityStandard: 'Stateless 256-bit JWT (HMAC-SHA256)',
    auditTelemetry: 'Micrometer + OpenTelemetry Distributed Tracing',
  },
};

const mockRegistry: DiseaseMetadata[] = [
  {
    diseaseName: 'Foot and Mouth Disease',
    severity: 'HIGH',
    zoonotic: false,
    reportable: true,
    mortality: 'MEDIUM',
    defaultRadiusKm: 25.0,
    minimumCases: 3,
    evaluationWindowHours: 48,
    vaccineAvailable: true,
  },
  {
    diseaseName: 'Anthrax',
    severity: 'CRITICAL',
    zoonotic: true,
    reportable: true,
    mortality: 'VERY_HIGH',
    defaultRadiusKm: 30.0,
    minimumCases: 1,
    evaluationWindowHours: 24,
    vaccineAvailable: true,
  },
];

describe('SettingsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders settings title, runtime status, and all operational sections', async () => {
    vi.mocked(systemService.getSystemConfiguration).mockResolvedValue(mockSystemConfig);
    vi.mocked(systemService.getHealthStatus).mockResolvedValue({ status: 'UP' });
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);

    renderWithProviders(<SettingsPage />);

    expect(
      screen.getByText('System Configuration & Operational Telemetry')
    ).toBeInTheDocument();

    await waitFor(() => {
      // System Runtime
      expect(screen.getByText(/System Runtime & Infrastructure/i)).toBeInTheDocument();
      expect(screen.getByText(/STATUS: UP/i)).toBeInTheDocument();
      expect(screen.getByText(/PostgreSQL 16 \+ PostGIS 3\.4/)).toBeInTheDocument();

      // Surveillance Engine
      expect(screen.getByText(/Multi-Signal Risk Engine Configuration/i)).toBeInTheDocument();
      expect(screen.getByText(/40\.0%/)).toBeInTheDocument();
      expect(screen.getAllByText(/20\.0%/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('≥ 80 pts')).toBeInTheDocument();

      // Weather Integration
      expect(screen.getByText(/Meteorological Weather Service Integration/i)).toBeInTheDocument();
      expect(screen.getByText('Open-Meteo Meteorological API')).toBeInTheDocument();
      expect(screen.getByText(/30 Minutes/)).toBeInTheDocument();
      expect(screen.getByText('INTEGRATION ACTIVE')).toBeInTheDocument();

      // Operational Alerts
      expect(screen.getByText(/Operational Alert Derivation & Priority Parameters/i)).toBeInTheDocument();
      expect(screen.getByText(/Composite Risk ≥ 80 pts/)).toBeInTheDocument();

      // Disease Registry
      expect(screen.getByText(/Disease Registry Parameters/i)).toBeInTheDocument();
      expect(screen.getByText('Foot and Mouth Disease')).toBeInTheDocument();
      expect(screen.getByText('Anthrax')).toBeInTheDocument();

      // Departmental Protocol Configuration
      expect(screen.getByText(/Departmental Protocol & Statutory Document Configuration/i)).toBeInTheDocument();
      expect(screen.getByText('CONFIGURATION REQUIRED')).toBeInTheDocument();
      expect(
        screen.getByText('Authoritative protocol configuration is not currently connected.')
      ).toBeInTheDocument();

      // Access Scope & Audit
      expect(screen.getByText(/Access Scope & Observability Telemetry/i)).toBeInTheDocument();
      expect(screen.getByText('Dr. Suresh Patil (State Surveillance Director)')).toBeInTheDocument();
      expect(screen.getByText('Pune, Maharashtra')).toBeInTheDocument();
      expect(screen.getByText('100% SAMPLED')).toBeInTheDocument();
    });
  });

  it('renders explicit error state when backend configuration fails', async () => {
    vi.mocked(systemService.getSystemConfiguration).mockRejectedValue(
      new Error('Connection refused')
    );
    vi.mocked(systemService.getHealthStatus).mockResolvedValue({ status: 'DOWN' });
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue([]);

    renderWithProviders(<SettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load system configuration from backend.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('CONFIGURATION / SERVICE UNAVAILABLE')
      ).toBeInTheDocument();
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();
    });
  });

  it('never exposes sensitive secrets, passwords, or JWT keys in the DOM', async () => {
    vi.mocked(systemService.getSystemConfiguration).mockResolvedValue(mockSystemConfig);
    vi.mocked(systemService.getHealthStatus).mockResolvedValue({ status: 'UP' });
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);

    const { container } = renderWithProviders(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/System Runtime & Infrastructure/i)).toBeInTheDocument();
    });

    const htmlContent = container.innerHTML.toLowerCase();
    expect(htmlContent).not.toContain('vetra-production-grade-jwt-secret');
    expect(htmlContent).not.toContain('db_password');
    expect(htmlContent).not.toContain('vetra_dev_password');
    expect(htmlContent).not.toContain('secret_access_key');
    expect(htmlContent).not.toContain('private_key');
  });

  it('operates in strict read-only mode without editable form inputs', async () => {
    vi.mocked(systemService.getSystemConfiguration).mockResolvedValue(mockSystemConfig);
    vi.mocked(systemService.getHealthStatus).mockResolvedValue({ status: 'UP' });
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue(mockRegistry);

    const { container } = renderWithProviders(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/System Runtime & Infrastructure/i)).toBeInTheDocument();
    });

    // Check that no editable input/textarea fields exist for altering weights or thresholds
    const inputs = container.querySelectorAll('input[type="text"], input[type="number"], textarea');
    expect(inputs.length).toBe(0);
  });
});
