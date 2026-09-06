import React from 'react';
import { WeatherConfig } from '../../core/types/system.types';
import { Badge } from '../ui/Badge';
import { CloudRain, ShieldCheck, Clock, Globe } from 'lucide-react';

interface WeatherConfigSectionProps {
  weather: WeatherConfig | null;
}

export const WeatherConfigSection: React.FC<WeatherConfigSectionProps> = ({
  weather,
}) => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-sm font-bold font-mono text-[#101826] uppercase">
            Meteorological Weather Service Integration
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="font-mono text-[#1E5C97] border-[#1E5C97]">
            READ-ONLY BACKEND DATA
          </Badge>
          <Badge variant={weather?.enabled ? 'success' : 'neutral'} size="sm" className="font-mono">
            {weather?.enabled ? 'INTEGRATION ACTIVE' : 'DISABLED'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px] font-mono">
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <span className="block text-[#93A1B0] text-[10px]">EXTERNAL PROVIDER</span>
          <strong className="text-[#101826] text-xs block">
            {weather?.provider || 'Open-Meteo Meteorological API'}
          </strong>
          <span className="text-[10px] text-[#526074]">Global High-Resolution Forecast</span>
        </div>

        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <span className="block text-[#93A1B0] text-[10px]">CACHE DURATION (TTL)</span>
          <strong className="text-[#101826] text-xs flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#1E5C97]" />
            {weather?.cacheTtlMinutes ?? 30} Minutes
          </strong>
          <span className="text-[10px] text-[#526074]">In-Memory Concurrent Cache</span>
        </div>

        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <span className="block text-[#93A1B0] text-[10px]">NETWORK TIMEOUTS</span>
          <strong className="text-[#101826] text-xs block">
            {weather?.timeoutSeconds ?? 3}s Read · {weather?.connectTimeoutSeconds ?? 2}s Connect
          </strong>
          <span className="text-[10px] text-[#526074]">Resilience Circuit Protected</span>
        </div>

        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <span className="block text-[#93A1B0] text-[10px]">PROXY ARCHITECTURE</span>
          <strong className="text-[#3E7C4A] text-xs flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3E7C4A]" />
            Backend Isolated
          </strong>
          <span className="text-[10px] text-[#526074]">No Direct Client Queries</span>
        </div>
      </div>

      <div className="p-2 bg-[#F1F4F8] border border-[#E1E6EC] rounded text-[10px] font-mono text-[#526074] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#1E5C97]" />
          <span>API Base URL: <strong className="text-[#101826]">{weather?.apiEndpoint || 'https://api.open-meteo.com/v1/forecast'}</strong> (Consumed exclusively via Spring Boot WeatherService)</span>
        </div>
      </div>
    </div>
  );
};
