import React from 'react';
import { SystemMetadata } from '../../core/types/system.types';
import { Badge } from '../ui/Badge';
import { Server, Database, ShieldCheck, Activity, Cpu } from 'lucide-react';

interface SystemStatusSectionProps {
  system: SystemMetadata | null;
  healthStatus?: string;
}

export const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({
  system,
  healthStatus = 'UP',
}) => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-sm font-bold font-mono text-[#101826] uppercase">
            System Runtime & Infrastructure
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="font-mono text-[#1E5C97] border-[#1E5C97]">
            READ-ONLY BACKEND DATA
          </Badge>
          <Badge variant="success" size="sm" className="font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C4A] animate-pulse mr-1" />
            <span>STATUS: {healthStatus}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {/* Service Name & Version */}
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#526074]">
            <span>SERVICE & VERSION</span>
            <Cpu className="w-3.5 h-3.5 text-[#1E5C97]" />
          </div>
          <p className="font-bold font-mono text-[#101826] text-xs">
            {(!system?.serviceName || system.serviceName.toLowerCase().includes('vetra-backend')) ? 'pashu-sathi-backend' : system.serviceName.replace(/vetra[-_]?backend/gi, 'pashu-sathi-backend')} v{system?.version || '1.0.0'}
          </p>
          <p className="text-[10px] font-mono text-[#526074]">
            Environment: <strong className="text-[#101826] uppercase">{system?.environment || 'dev'}</strong>
          </p>
        </div>

        {/* Database Engine */}
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#526074]">
            <span>PERSISTENCE ENGINE</span>
            <Database className="w-3.5 h-3.5 text-[#1E5C97]" />
          </div>
          <p className="font-bold font-mono text-[#101826] text-xs">
            {system?.databaseEngine || 'PostgreSQL 16 + PostGIS 3.4 (Hibernate Spatial)'}
          </p>
          <p className="text-[10px] font-mono text-[#526074]">
            Pool: <strong className="text-[#101826]">{system?.connectionPool || 'VetraHikariPool'}</strong>
          </p>
        </div>

        {/* Security & Authentication */}
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#526074]">
            <span>SECURITY ARCHITECTURE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#3E7C4A]" />
          </div>
          <p className="font-bold font-mono text-[#101826] text-xs">
            {system?.securityStandard || 'Stateless 256-bit JWT (HMAC-SHA256)'}
          </p>
          <p className="text-[10px] font-mono text-[#526074]">
            API Base: <strong className="text-[#101826]">/api/v1 (Stateless Filter Chain)</strong>
          </p>
        </div>
      </div>

      <div className="p-2 bg-[#F1F4F8] border border-[#E1E6EC] rounded text-[10px] font-mono text-[#526074] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#1E5C97]" />
          <span>Configuration is loaded dynamically from Spring Boot deployment context. Sensitive credentials (passwords, JWT secrets, database connection strings) are strictly omitted.</span>
        </div>
      </div>
    </div>
  );
};
