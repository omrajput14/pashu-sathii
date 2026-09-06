import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../core/context/AuthContext';
import { systemService } from '../core/api/systemService';
import { diseaseService } from '../core/api/diseaseService';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { SystemStatusSection } from '../components/settings/SystemStatusSection';
import { SurveillanceConfigSection } from '../components/settings/SurveillanceConfigSection';
import { WeatherConfigSection } from '../components/settings/WeatherConfigSection';
import { AlertConfigSection } from '../components/settings/AlertConfigSection';
import { DiseaseRegistryConfigSection } from '../components/settings/DiseaseRegistryConfigSection';
import { ProtocolConfigSection } from '../components/settings/ProtocolConfigSection';
import { AccessAuditSection } from '../components/settings/AccessAuditSection';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface SettingsPageProps {
  selectedScope?: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  selectedScope = 'Maharashtra (Statewide)',
}) => {
  const { user } = useAuth();

  // 1. Fetch System & Surveillance Configuration
  const {
    data: configData,
    isLoading: isConfigLoading,
    isError: isConfigError,
    error: configError,
    isRefetching: isConfigRefetching,
    refetch: refetchConfig,
    dataUpdatedAt: configUpdatedAt,
  } = useQuery({
    queryKey: ['systemConfiguration'],
    queryFn: systemService.getSystemConfiguration,
    staleTime: 60000,
  });

  // 2. Fetch Health Status
  const {
    data: healthData,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['systemHealthStatus'],
    queryFn: systemService.getHealthStatus,
    staleTime: 30000,
  });

  // 3. Fetch Disease Registry Single Source of Truth
  const {
    data: registryData = [],
    isLoading: isRegistryLoading,
    refetch: refetchRegistry,
  } = useQuery({
    queryKey: ['diseaseRegistrySettings'],
    queryFn: diseaseService.getDiseaseRegistry,
    staleTime: 60000,
  });

  const handleRefreshAll = () => {
    refetchConfig();
    refetchHealth();
    refetchRegistry();
  };

  const formattedUpdatedAt = useMemo(() => {
    if (!configUpdatedAt) return 'Synced';
    return new Date(configUpdatedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [configUpdatedAt]);

  if (isConfigError) {
    return (
      <div className="space-y-4 select-none pb-12">
        <SettingsHeader
          selectedScope={selectedScope}
          formattedUpdatedAt="Error"
          isRefetching={isConfigRefetching}
          onRefresh={handleRefreshAll}
        />

        <div className="bg-white border border-[#F5C2C7] rounded-[6px] p-8 text-center shadow-subtle space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FBEBEB] text-[#B7301F] flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-block mb-2">
              <Badge variant="danger" size="sm" className="font-mono">
                CONFIGURATION / SERVICE UNAVAILABLE
              </Badge>
            </div>
            <h2 className="text-base font-bold font-mono text-[#101826]">
              Unable to load system configuration from backend.
            </h2>
            <p className="text-xs text-[#526074] mt-1 font-mono max-w-lg mx-auto leading-relaxed">
              The backend configuration service (/api/v1/system/configuration) is unreachable or returned an error ({String(configError)}). Please check server connectivity.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleRefreshAll}
              disabled={isConfigRefetching}
              className="font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isConfigRefetching ? 'animate-spin' : ''}`} />
              <span>{isConfigRefetching ? 'Reconnecting...' : 'Retry Connection'}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none pb-12">
      {/* 1. Header */}
      <SettingsHeader
        selectedScope={selectedScope}
        formattedUpdatedAt={formattedUpdatedAt}
        isRefetching={isConfigRefetching}
        onRefresh={handleRefreshAll}
      />

      {/* 2. Section A: System Status & Infrastructure */}
      <SystemStatusSection
        system={configData?.system || null}
        healthStatus={healthData?.status || (isConfigLoading ? 'SYNCING' : 'UP')}
      />

      {/* 3. Section B: Surveillance & Multi-Signal Risk Engine Configuration */}
      <SurveillanceConfigSection
        surveillance={configData?.surveillance || null}
      />

      {/* 4. Section C: Meteorological Service Configuration */}
      <WeatherConfigSection
        weather={configData?.weather || null}
      />

      {/* 5. Section D: Operational Alert Engine Configuration */}
      <AlertConfigSection
        alerts={configData?.alerts || null}
      />

      {/* 6. Section E: Disease Registry Configuration */}
      <DiseaseRegistryConfigSection
        registry={registryData || []}
        isLoading={isRegistryLoading}
      />

      {/* 7. Section F: Departmental Protocol & Statutory Document Configuration */}
      <ProtocolConfigSection />

      {/* 8. Section G: Access Scope & Observability Telemetry */}
      <AccessAuditSection
        user={user}
        system={configData?.system || null}
      />
    </div>
  );
};
