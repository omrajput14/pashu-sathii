import React from 'react';
import { DiseaseProtocolRecord } from '../../core/types/protocol.types';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  BookOpen,
  AlertTriangle,
  ShieldAlert,
  Flame,
  ArrowRight,
  MapPin,
  Clock,
  Activity,
} from 'lucide-react';

interface ProtocolCatalogCardProps {
  protocol: DiseaseProtocolRecord;
  outbreaks: OutbreakResponse[];
  onSelectProtocol: (protocol: DiseaseProtocolRecord) => void;
  onNavigateToOutbreak?: (outbreakId: string) => void;
}

export const ProtocolCatalogCard: React.FC<ProtocolCatalogCardProps> = ({
  protocol,
  outbreaks,
  onSelectProtocol,
  onNavigateToOutbreak,
}) => {
  // Check if any active outbreak matches this disease
  const matchingOutbreak = outbreaks.find(
    (o) => o.status !== 'RESOLVED' && o.diseaseName.toLowerCase() === protocol.diseaseName.toLowerCase()
  );

  const renderSeverityBadge = (severity: string | null) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="danger" size="sm">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">HIGH SEVERITY</Badge>;
      case 'MEDIUM':
        return <Badge variant="info" size="sm">MEDIUM</Badge>;
      case 'LOW':
        return <Badge variant="neutral" size="sm">LOW SEVERITY</Badge>;
      default:
        return <Badge variant="neutral" size="sm">SEVERITY UNCONFIGURED</Badge>;
    }
  };

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle flex flex-col justify-between hover:border-[#1E5C97] transition-colors select-none text-xs">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
          <Badge variant="outline" size="sm" className="font-mono text-[#1E5C97] border-[#1E5C97]">
            REFERENCE_CONTENT
          </Badge>

          <div className="flex items-center gap-1.5">
            {renderSeverityBadge(protocol.severity)}
            {protocol.isZoonotic === true && (
              <span title="Zoonotic Public Health Alert">
                <Badge variant="danger" size="sm">
                  <AlertTriangle className="w-3 h-3 text-[#B7301F]" />
                  <span>ZOONOTIC</span>
                </Badge>
              </span>
            )}
          </div>
        </div>

        {/* Title and Category */}
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[#101826] font-mono leading-snug">
            {protocol.diseaseName}
          </h2>
          <p className="text-[11px] font-mono text-[#526074] mt-0.5">
            {protocol.category || 'Livestock Pathogen (Disease Registry)'}
          </p>
        </div>

        {/* Surveillance Parameters Matrix */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] mb-3 text-[10px] font-mono text-[#526074]">
          <div>
            <span className="block text-[#93A1B0]">Radius:</span>
            <span className="font-bold text-[#101826] flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-[#1E5C97]" />
              {protocol.surveillanceRadiusKm != null ? `±${protocol.surveillanceRadiusKm.toFixed(0)} km` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="block text-[#93A1B0]">Cluster Min:</span>
            <span className="font-bold text-[#101826] flex items-center gap-0.5">
              <Activity className="w-3 h-3 text-[#1E5C97]" />
              {protocol.minimumClusterCases != null ? `${protocol.minimumClusterCases} Cases` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="block text-[#93A1B0]">Window:</span>
            <span className="font-bold text-[#101826] flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-[#1E5C97]" />
              {protocol.evaluationWindowHours != null ? `${protocol.evaluationWindowHours}h` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Species & Status Information */}
        <div className="space-y-1.5 mb-3 text-[11px] font-mono text-[#526074]">
          <div>
            <span>Species: </span>
            <strong className="text-[#101826]">
              {protocol.susceptibleSpecies || 'Not configured in registry'}
            </strong>
          </div>

          <div>
            <span>Reportable: </span>
            <strong className="text-[#101826]">
              {protocol.isReportable != null ? (protocol.isReportable ? 'Yes (Mandatory)' : 'No') : 'Unconfigured'}
            </strong>
          </div>
        </div>
      </div>

      {/* Active Outbreak & Footer Actions */}
      <div className="pt-3 border-t border-[#E1E6EC] space-y-2">
        {matchingOutbreak ? (
          <div className="p-2 bg-[#FEF3E8] border border-[#FAD8B6] rounded-[4px] flex items-center justify-between text-[11px] font-mono text-[#D97B1F]">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#D97B1F] animate-pulse" />
              <span>
                <strong>Active Cluster Detected</strong> ({matchingOutbreak.riskScore})
              </span>
            </div>
            {onNavigateToOutbreak && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToOutbreak(matchingOutbreak.id);
                }}
                className="text-[#1E5C97] hover:underline font-bold text-[10px]"
              >
                View Cluster →
              </button>
            )}
          </div>
        ) : (
          <div className="text-[10px] font-mono text-[#93A1B0] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>No active outbreak clusters detected</span>
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSelectProtocol(protocol)}
          className="w-full font-mono text-xs text-[#101826] justify-between"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#1E5C97]" />
            <span>Open Protocol Reference</span>
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#526074]" />
        </Button>
      </div>
    </div>
  );
};
