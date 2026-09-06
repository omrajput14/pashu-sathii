import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Activity,
  CloudSun,
  History,
  ShieldCheck,
  FileText,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { gisService } from '../../core/api/gisService';
import { RiskBadge } from '../ui/RiskBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface OutbreakDossierDrawerProps {
  outbreak: OutbreakResponse | null;
  onClose: () => void;
  onNavigateToIntelligence?: (outbreakId: string) => void;
  onInspectReport?: (reportId: string) => void;
}

export const OutbreakDossierDrawer: React.FC<OutbreakDossierDrawerProps> = ({
  outbreak,
  onClose,
  onNavigateToIntelligence,
  onInspectReport,
}) => {
  // Listen for Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch contributing surveillance reports for this specific cluster
  const { data: reports = [], isLoading: isLoadingReports } = useQuery({
    queryKey: ['outbreakReports', outbreak?.id],
    queryFn: () => (outbreak ? gisService.getReportsForOutbreak(outbreak.id) : Promise.resolve([])),
    enabled: Boolean(outbreak?.id),
  });

  if (!outbreak) return null;

  const breakdown = outbreak.riskBreakdown;
  const isCritical = outbreak.riskScore === "CRITICAL";

  return (
    <div
      className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white border-l border-[#E1E6EC] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      data-testid="outbreak-dossier-drawer"
      role="dialog"
      aria-labelledby="dossier-title"
    >
      {/* Header */}
      <div className="p-4 bg-[#0E1A2B] text-white border-b border-[#1B2B40] flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#1E5C97] text-white font-semibold">
              EPIDEMIOLOGICAL DOSSIER
            </span>
            <span className="text-xs font-mono text-[#9FB1C4]">
              #{outbreak.id.substring(0, 8)}
            </span>
          </div>
          <h2 id="dossier-title" className="text-base font-bold tracking-tight text-white font-mono">
            {outbreak.diseaseName}
          </h2>
          <p className="text-[11px] text-[#9FB1C4] mt-0.5 font-mono">
            Centroid: {outbreak.centerLatitude.toFixed(4)}°N, {outbreak.centerLongitude.toFixed(4)}°E (±{outbreak.radiusKm} km)
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-[#9FB1C4] hover:text-white hover:bg-[#1B2B40] rounded-[2px] transition-colors focus:outline-none"
          aria-label="Close Outbreak Dossier"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body: Scrollable Dossier Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Core Risk Banner */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#526074] block font-medium">
              Multi-Signal Risk Assessment
            </span>
            <div className="mt-1 flex items-center gap-2">
              <RiskBadge
                level={outbreak.riskScore}
                score={outbreak.compositeRiskScore}
                size="md"
              />
              <span className="text-xs font-mono font-semibold text-[#101826]">
                {outbreak.severity || 'HIGH'} SEVERITY
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono uppercase text-[#526074] block font-medium">
              Cluster State
            </span>
            <div className="mt-1">
              <Badge variant={outbreak.status === 'ACTIVE' ? 'confirmed' : 'default'}>
                {outbreak.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Spatial & Temporal Metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-white border border-[#E1E6EC] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#526074] mb-1">
              <Radio className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span className="text-[11px] font-mono uppercase font-semibold">Affected Reports</span>
            </div>
            <span className="text-lg font-bold font-mono text-[#101826] tabular-nums">
              {outbreak.affectedReportsCount} Cases
            </span>
            <span className="text-[10px] text-[#526074] block mt-0.5 font-mono">
              Window: {outbreak.evaluationWindowHours ?? 72}h
            </span>
          </div>

          <div className="p-2.5 bg-white border border-[#E1E6EC] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#526074] mb-1">
              <Clock className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span className="text-[11px] font-mono uppercase font-semibold">Latest Incident</span>
            </div>
            <span className="text-xs font-bold font-mono text-[#101826] block truncate">
              {outbreak.lastCaseReportedAt
                ? new Date(outbreak.lastCaseReportedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }) + ' IST'
                : 'Recent'}
            </span>
            <span className="text-[10px] text-[#526074] block mt-0.5 font-mono truncate">
              {outbreak.lastCaseReportedAt
                ? new Date(outbreak.lastCaseReportedAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>

        {/* 4-Signal Multi-Signal Risk Engine Breakdown */}
        <div className="border border-[#E1E6EC] rounded-[4px] bg-white overflow-hidden">
          <div className="px-3 py-2 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase text-[#101826]">
              4-Signal Multi-Signal Breakdown
            </h3>
            <span className="text-[10px] font-mono text-[#526074]">MultiSignalRiskEngine</span>
          </div>

          <div className="p-3 space-y-3">
            {/* Signal 1: Cluster Velocity */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1 text-[#101826] font-medium">
                  <Activity className="w-3 h-3 text-[#1E5C97]" />
                  <span>1. Cluster Velocity & Density</span>
                </span>
                <span className="font-bold tabular-nums">
                  {breakdown?.clusterScore != null ? Math.round(breakdown.clusterScore) : '—'}/100
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F4F8] rounded-full overflow-hidden">
                <div
                  className={`h-full ${isCritical ? 'bg-[#6E1423]' : 'bg-[#D97B1F]'}`}
                  style={{ width: `${Math.min(100, Math.max(0, breakdown?.clusterScore ?? 0))}%` }}
                />
              </div>
            </div>

            {/* Signal 2: Weather Risk */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1 text-[#101826] font-medium">
                  <CloudSun className="w-3 h-3 text-[#1E5C97]" />
                  <span>2. Vector & Climate Conditions</span>
                </span>
                <span className="font-bold tabular-nums">
                  {breakdown?.weatherScore != null ? Math.round(breakdown.weatherScore) : '—'}/100
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F4F8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1E5C97]"
                  style={{ width: `${Math.min(100, Math.max(0, breakdown?.weatherScore ?? 0))}%` }}
                />
              </div>
              {(breakdown?.weatherTemperature != null || breakdown?.weatherHumidity != null) && (
                <p className="text-[10px] font-mono text-[#526074] mt-1">
                  Temp: {breakdown.weatherTemperature?.toFixed(1) ?? '—'}°C · Humidity: {breakdown.weatherHumidity?.toFixed(0) ?? '—'}% · Precip: {breakdown.weatherPrecipitation?.toFixed(1) ?? 0}mm
                </p>
              )}
            </div>

            {/* Signal 3: Historical Precedent */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1 text-[#101826] font-medium">
                  <History className="w-3 h-3 text-[#1E5C97]" />
                  <span>3. Historical Precedent & Endemicity</span>
                </span>
                <span className="font-bold tabular-nums">
                  {breakdown?.historyScore != null ? Math.round(breakdown.historyScore) : '—'}/100
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F4F8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C9A227]"
                  style={{ width: `${Math.min(100, Math.max(0, breakdown?.historyScore ?? 0))}%` }}
                />
              </div>
            </div>

            {/* Signal 4: Vaccination Coverage Gap */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1 text-[#101826] font-medium">
                  <ShieldCheck className="w-3 h-3 text-[#1E5C97]" />
                  <span>4. Vaccination Immunity Gap</span>
                </span>
                <span className="font-bold tabular-nums">
                  {breakdown?.vaccinationGapScore != null ? Math.round(breakdown.vaccinationGapScore) : '—'}/100
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F4F8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3E7C4A]"
                  style={{ width: `${Math.min(100, Math.max(0, breakdown?.vaccinationGapScore ?? 0))}%` }}
                />
              </div>
              {breakdown?.vaccinationCoveragePct != null && (
                <p className="text-[10px] font-mono text-[#526074] mt-1">
                  Block Vaccination Rate: {breakdown.vaccinationCoveragePct.toFixed(1)}% (Target: ≥80.0%)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Explainable Risk Analysis & Recommended Action */}
        {(breakdown?.riskExplanation || breakdown?.recommendedAction) && (
          <div className="p-3 bg-[#FAFBFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
            {breakdown.riskExplanation && (
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase text-[#526074] block">
                  Epidemiological Risk Synthesis
                </span>
                <p className="text-xs text-[#101826] mt-0.5 leading-relaxed">
                  {breakdown.riskExplanation}
                </p>
              </div>
            )}

            {breakdown.recommendedAction && (
              <div className="pt-2 border-t border-[#E1E6EC]">
                <span className="text-[10px] font-mono font-semibold uppercase text-[#1E5C97] block">
                  Statutory Containment Directive
                </span>
                <p className="text-xs text-[#101826] mt-0.5 leading-relaxed font-medium">
                  {breakdown.recommendedAction}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contributing Field Reports List */}
        <div className="border border-[#E1E6EC] rounded-[4px] bg-white overflow-hidden">
          <div className="px-3 py-2 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1E5C97]" />
              <h3 className="text-xs font-mono font-semibold uppercase text-[#101826]">
                Contributing Reports ({reports.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#526074]">
              {isLoadingReports ? 'Loading...' : 'Audited Telemetry'}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-[#E1E6EC]">
            {isLoadingReports ? (
              <div className="p-3 text-center text-[#526074] font-mono text-[11px] animate-pulse">
                Fetching field surveillance reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="p-3 text-center text-[#526074] font-mono text-[11px]">
                No detailed field reports attached to this cluster ID.
              </div>
            ) : (
              reports.map((r) => (
                <div
                  key={r.id}
                  className="p-2.5 hover:bg-[#F8FAFC] transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[#101826]">
                        {r.tagNumber || 'UNTAGGED'}
                      </span>
                      <span
                        className={`w-2 h-2 ${
                          r.diagnosisStatus === 'CONFIRMED'
                            ? 'bg-[#B7301F] rounded-none'
                            : 'border border-[#D97B1F] rounded-full'
                        }`}
                        title={r.diagnosisStatus}
                      />
                      <span className="text-[11px] font-mono text-[#526074]">
                        {r.diagnosisConfidenceSource}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[#93A1B0] mt-0.5">
                      {r.latitude ? `${r.latitude.toFixed(3)}°, ${r.longitude.toFixed(3)}°` : '—'} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => onInspectReport?.(r.id)}
                    className="p-1 text-[#526074] hover:text-[#1E5C97] hover:bg-[#E4EDF6] rounded-[2px]"
                    title="Inspect Individual Report"
                    aria-label={`Inspect report ${r.id}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-[#FAFBFC] border-t border-[#E1E6EC] flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="font-mono text-xs"
        >
          <span>Close Dossier</span>
        </Button>

        {onNavigateToIntelligence && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateToIntelligence(outbreak.id)}
            className="font-mono text-xs"
          >
            <span>Full Outbreak Intelligence</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
