import React, { useEffect, useRef } from 'react';
import { DiseaseProtocolRecord } from '../../core/types/protocol.types';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  X,
  BookOpen,
  AlertTriangle,
  Flame,
  Shield,
  Layers,
  Syringe,
  FlaskConical,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ProtocolDetailDrawerProps {
  protocol: DiseaseProtocolRecord | null;
  outbreaks: OutbreakResponse[];
  onClose: () => void;
  onNavigateToOutbreak?: (outbreakId: string) => void;
}

export const ProtocolDetailDrawer: React.FC<ProtocolDetailDrawerProps> = ({
  protocol,
  outbreaks,
  onClose,
  onNavigateToOutbreak,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!protocol) return null;

  const matchingOutbreak = outbreaks.find(
    (o) => o.status !== 'RESOLVED' && o.diseaseName.toLowerCase() === protocol.diseaseName.toLowerCase()
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end animate-fade-in select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="protocol-drawer-title"
      data-testid="protocol-detail-drawer"
    >
      <div
        ref={drawerRef}
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#E1E6EC]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0E1A2B] text-white border-b border-[#1B2B40] flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant="outline" size="sm" className="text-white border-white/30 font-mono">
                REFERENCE_CONTENT
              </Badge>

              {protocol.severity && (
                <Badge
                  variant={
                    protocol.severity === 'CRITICAL'
                      ? 'danger'
                      : protocol.severity === 'HIGH'
                      ? 'warning'
                      : 'info'
                  }
                  size="sm"
                >
                  {protocol.severity}
                </Badge>
              )}

              {protocol.isZoonotic === true && (
                <Badge variant="danger" size="sm">
                  <AlertTriangle className="w-3 h-3 text-[#B7301F]" />
                  <span>ZOONOTIC RISK</span>
                </Badge>
              )}

              {protocol.isReportable === true && (
                <Badge variant="neutral" size="sm">
                  <span>NOTIFIABLE MANDATE</span>
                </Badge>
              )}
            </div>

            <h2 id="protocol-drawer-title" className="text-base font-bold font-mono text-white">
              {protocol.diseaseName}
            </h2>
            <p className="text-[11px] font-mono text-[#93A1B0] mt-0.5">
              {protocol.category || 'Livestock Pathogen (Disease Registry)'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#93A1B0] hover:text-white p-1 rounded transition-colors"
            aria-label="Close protocol details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 flex-1 text-xs">
          {/* Active Outbreak Alert Callout */}
          {matchingOutbreak && (
            <div className="p-3 bg-[#FEF3E8] border border-[#FAD8B6] rounded-[4px] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold font-mono text-[#D97B1F]">
                  <Flame className="w-4 h-4 text-[#D97B1F] animate-pulse" />
                  <span>ACTIVE OUTBREAK CLUSTER IN JURISDICTION</span>
                </div>
                <Badge variant="danger" size="sm">
                  RISK: {matchingOutbreak.riskScore} ({matchingOutbreak.compositeRiskScore ?? 'N/A'}/100)
                </Badge>
              </div>

              <p className="text-[11px] font-mono text-[#526074]">
                An active containment zone is currently defined around Lat {matchingOutbreak.centerLatitude.toFixed(2)},
                Lng {matchingOutbreak.centerLongitude.toFixed(2)} (Radius: ±{matchingOutbreak.radiusKm} km).
              </p>

              {onNavigateToOutbreak && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onNavigateToOutbreak(matchingOutbreak.id);
                  }}
                  className="font-mono text-xs"
                >
                  <span>Open Live Outbreak Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          )}

          {/* Section 1: Surveillance Parameters */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E1E6EC]">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
                <Layers className="w-4 h-4 text-[#1E5C97]" />
                <span>1. Epidemiological Surveillance Parameters</span>
              </div>
              <Badge variant="info" size="sm" className="text-[9px]">
                EXISTING_PROJECT_DATA
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-[#526074]">
              <div className="p-2 bg-white rounded border border-[#E1E6EC]">
                <span className="block text-[#93A1B0] text-[10px]">Surveillance Radius</span>
                <strong className="text-[#101826]">
                  {protocol.surveillanceRadiusKm != null ? `±${protocol.surveillanceRadiusKm.toFixed(0)} km` : 'Not configured'}
                </strong>
              </div>

              <div className="p-2 bg-white rounded border border-[#E1E6EC]">
                <span className="block text-[#93A1B0] text-[10px]">Cluster Trigger</span>
                <strong className="text-[#101826]">
                  {protocol.minimumClusterCases != null ? `${protocol.minimumClusterCases} Cases` : 'Not configured'}
                </strong>
              </div>

              <div className="p-2 bg-white rounded border border-[#E1E6EC]">
                <span className="block text-[#93A1B0] text-[10px]">Time Window</span>
                <strong className="text-[#101826]">
                  {protocol.evaluationWindowHours != null ? `${protocol.evaluationWindowHours} Hours` : 'Not configured'}
                </strong>
              </div>

              <div className="p-2 bg-white rounded border border-[#E1E6EC]">
                <span className="block text-[#93A1B0] text-[10px]">Mortality Rating</span>
                <strong className="text-[#101826]">{protocol.mortality || 'Not configured'}</strong>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#526074] pt-1">
              <strong>Susceptible Species:</strong> {protocol.susceptibleSpecies || 'Not configured in registry'}
            </div>
            <div className="text-[11px] font-mono text-[#526074]">
              <strong>Primary Transmission:</strong> {protocol.transmissionMode || 'Not configured in registry'}
            </div>
          </div>

          {/* Section 2: Clinical Recognition */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E1E6EC]">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
                <BookOpen className="w-4 h-4 text-[#1E5C97]" />
                <span>2. Field Syndromic Recognition</span>
              </div>
              <Badge variant="outline" size="sm" className="text-[#526074] text-[9px]">
                CONFIGURATION_REQUIRED
              </Badge>
            </div>

            <p className="text-[11px] font-mono text-[#526074] leading-relaxed">
              Protocol content not configured. Authoritative departmental SOP required for clinical recognition criteria.
            </p>
          </div>

          {/* Section 3: Biosecurity & Containment Guidance */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E1E6EC]">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
                <Shield className="w-4 h-4 text-[#1E5C97]" />
                <span>3. Containment & Biosecurity Guidance</span>
              </div>
              <Badge variant="outline" size="sm" className="text-[#526074] text-[9px]">
                CONFIGURATION_REQUIRED
              </Badge>
            </div>

            <p className="text-[11px] font-mono text-[#526074] leading-relaxed">
              Protocol content not configured. Authoritative departmental standard operating procedure required.
            </p>

            {protocol.surveillanceRadiusKm != null && (
              <div className="p-2 bg-white rounded border border-[#E1E6EC] text-[11px] font-mono text-[#526074]">
                <strong className="text-[#101826]">Spatial Reference:</strong> PASHU SATHI surveillance engine evaluates an operational radius of ±{protocol.surveillanceRadiusKm.toFixed(0)} km.
              </div>
            )}
          </div>

          {/* Section 4: Vaccination & Immunization */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E1E6EC]">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
                <Syringe className="w-4 h-4 text-[#1E5C97]" />
                <span>4. Vaccination & Immunization</span>
              </div>
              <Badge variant="outline" size="sm" className="text-[#526074] text-[9px]">
                CONFIGURATION_REQUIRED
              </Badge>
            </div>

            <p className="text-[11px] font-mono text-[#526074] leading-relaxed">
              Protocol content not configured. Authoritative departmental vaccination schedule required.
            </p>

            {protocol.vaccineAvailable != null && (
              <div className="p-2 bg-white rounded border border-[#E1E6EC] text-[11px] font-mono text-[#526074]">
                <strong className="text-[#101826]">Vaccine Status in Registry:</strong> {protocol.vaccineAvailable ? 'Available / Recorded' : 'Not recorded in registry'}
              </div>
            )}
          </div>

          {/* Section 5: Laboratory Escalation */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E1E6EC]">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
                <FlaskConical className="w-4 h-4 text-[#1E5C97]" />
                <span>5. Diagnostic Escalation & Laboratory Confirmation</span>
              </div>
              <Badge variant="success" size="sm" className="text-[9px]">
                DERIVED_FROM_EXISTING_DATA
              </Badge>
            </div>

            <ul className="space-y-1.5 text-[11px] font-mono text-[#526074] list-disc list-inside">
              <li>Field clinical observations are recorded under VETERINARIAN confidence source.</li>
              <li>Biological laboratory assay results update confidence source to LAB_CONFIRMED.</li>
              <li>Chain of custody preserves Animal Tag Number and GPS coordinates.</li>
            </ul>
          </div>

          {/* Section 6: Statutory Orders & Gazette Configuration */}
          <div className="p-3 bg-[#FFF9F5] border border-[#FAD8B6] rounded-[4px] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#FAD8B6]">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[#D97B1F]">
                <Lock className="w-4 h-4 text-[#D97B1F]" />
                <span>6. Departmental Gazette & Statutory Orders</span>
              </div>
              <Badge variant="outline" size="sm" className="text-[#D97B1F] border-[#D97B1F] text-[9px]">
                CONFIGURATION_REQUIRED
              </Badge>
            </div>

            <p className="text-[11px] font-mono text-[#526074] leading-relaxed">
              Protocol content not configured. Official departmental gazette circular numbers and statutory legal orders must be uploaded through the administrative configuration panel.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E1E6EC] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#526074]">
            <Info className="w-4 h-4 text-[#1E5C97] shrink-0" />
            <span>
              <strong>Operational Disclaimer:</strong> Reference framework only — authoritative departmental protocol
              configuration required. This interface is a decision-support reference and does not constitute an autonomous statutory quarantine order.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E1E6EC]">
            <span className="text-[10px] font-mono text-[#93A1B0]">
              Source: {protocol.source}
            </span>
            <Button variant="secondary" size="sm" onClick={onClose} className="font-mono text-xs">
              Close Reference
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
