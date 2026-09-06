import React from 'react';
import { UserProfileDto } from '../../core/types/auth.types';
import { SystemMetadata } from '../../core/types/system.types';
import { Badge } from '../ui/Badge';
import { UserCheck, Shield, Activity, Fingerprint } from 'lucide-react';

interface AccessAuditSectionProps {
  user: UserProfileDto | null;
  system: SystemMetadata | null;
}

export const AccessAuditSection: React.FC<AccessAuditSectionProps> = ({
  user,
  system,
}) => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-sm font-bold font-mono text-[#101826] uppercase">
            Access Scope & Observability Telemetry
          </h2>
        </div>
        <Badge variant="outline" size="sm" className="font-mono text-[#1E5C97] border-[#1E5C97]">
          AUTHENTICATED CONTEXT
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Authenticated Officer Scope */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#E1E6EC]">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
              <Shield className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span>Officer Identity & Role Authorization</span>
            </div>
            <Badge variant="success" size="sm" className="font-mono">
              AUTHORIZED
            </Badge>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-[#526074]">
            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-[#E1E6EC]">
              <span>Identity / Handle:</span>
              <strong className="text-[#101826]">
                {user?.fullName || user?.phone || user?.email || 'Authorized Officer'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-[#E1E6EC]">
              <span>Assigned Security Role:</span>
              <Badge variant="info" size="sm" className="font-mono">
                {user?.role || 'GOVERNMENT_OFFICER'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-[#E1E6EC]">
              <span>Surveillance Jurisdiction:</span>
              <strong className="text-[#101826]">
                {user?.district ? `${user.district}, ${user.state || 'Maharashtra'}` : user?.state || 'Maharashtra (Statewide Scope)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Audit & Observability Telemetry */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#E1E6EC]">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
              <Activity className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span>Audit Logging & Distributed Tracing</span>
            </div>
            <span className="text-[10px] font-mono text-[#3E7C4A] font-bold">100% SAMPLED</span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-[#526074]">
            <div className="p-1.5 bg-white rounded border border-[#E1E6EC]">
              <span className="text-[10px] text-[#93A1B0] block">AUDIT TELEMETRY FRAMEWORK</span>
              <strong className="text-[#101826] text-xs">
                {system?.auditTelemetry || 'Micrometer + OpenTelemetry Distributed Tracing'}
              </strong>
            </div>

            <div className="p-1.5 bg-white rounded border border-[#E1E6EC] flex items-center justify-between">
              <span>Trace Correlation:</span>
              <span className="flex items-center gap-1 text-[#101826] font-bold">
                <Fingerprint className="w-3 h-3 text-[#1E5C97]" /> W3C TraceContext
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 bg-[#F1F4F8] border border-[#E1E6EC] rounded text-[10px] font-mono text-[#526074]">
        All administrative queries, GIS spatial evaluations, and surveillance filter adjustments are logged with unique W3C trace identifiers and correlation IDs.
      </div>
    </div>
  );
};
