import React from 'react';
import {
  Activity,
  CloudSun,
  History,
  ShieldCheck,
  Thermometer,
  Droplets,
  CloudRain,
  ShieldAlert,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { OutbreakResponse, RiskBreakdownResponse } from '../../core/types/outbreak.types';

interface FourSignalRiskDecompositionProps {
  outbreak: OutbreakResponse;
}

export const FourSignalRiskDecomposition: React.FC<FourSignalRiskDecompositionProps> = ({
  outbreak,
}) => {
  const breakdown: RiskBreakdownResponse | null = outbreak.riskBreakdown;
  const isCritical = outbreak.riskScore === 'CRITICAL';

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="four-signal-risk-decomposition"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Multi-Signal Risk Engine Decomposition (4-Signal Vector)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          Deterministic 0–100 Weighted Synthesis
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Signal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Signal 1: Cluster Strength & Velocity */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#101826]">
                  <Activity className="w-4 h-4 text-[#1E5C97]" />
                  <span>1. Cluster Velocity & Density</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#101826] tabular-nums">
                  {breakdown?.clusterScore != null ? Math.round(breakdown.clusterScore) : '—'} / 100
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#E1E6EC] rounded-full overflow-hidden mb-2.5">
                <div
                  className={`h-full ${isCritical ? 'bg-[#6E1423]' : 'bg-[#D97B1F]'}`}
                  style={{ width: `${Math.min(100, Math.max(0, breakdown?.clusterScore ?? 0))}%` }}
                />
              </div>

              <p className="text-xs text-[#526074] leading-relaxed">
                Spatial-temporal density based on {outbreak.affectedReportsCount} contributing field reports{outbreak.mortalityCount != null && outbreak.mortalityCount > 0 ? ` and ${outbreak.mortalityCount} animal mortality events (${outbreak.vetConfirmedMortalityCount ?? 0} vet-confirmed, ${outbreak.farmerReportedMortalityCount ?? 0} farmer-reported)` : ''} within {outbreak.radiusKm} km containment radius over a {outbreak.evaluationWindowHours ?? 72}h rolling evaluation window.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#E1E6EC] flex items-center justify-between text-[11px] font-mono text-[#526074]">
              <span>Weight: 40% (0.40)</span>
              <span>Case Velocity: {outbreak.affectedReportsCount} reports</span>
            </div>
          </div>

          {/* Signal 2: Environmental & Vector Climate */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#101826]">
                  <CloudSun className="w-4 h-4 text-[#1E5C97]" />
                  <span>2. Vector & Climate Conditions</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#101826] tabular-nums">
                  {breakdown?.weatherScore != null ? Math.round(breakdown.weatherScore) : '—'} / 100
                </span>
              </div>

              <div className="w-full h-2 bg-[#E1E6EC] rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-[#1E5C97]"
                  style={{ width: `${Math.min(100, Math.max(0, breakdown?.weatherScore ?? 0))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 my-2 text-xs font-mono">
                <div className="p-1.5 bg-white border border-[#E1E6EC] rounded flex items-center gap-1 text-[#526074]">
                  <Thermometer className="w-3.5 h-3.5 text-[#D97B1F]" />
                  <span>{breakdown?.weatherTemperature != null ? `${breakdown.weatherTemperature.toFixed(1)}°C` : '—'}</span>
                </div>
                <div className="p-1.5 bg-white border border-[#E1E6EC] rounded flex items-center gap-1 text-[#526074]">
                  <Droplets className="w-3.5 h-3.5 text-[#1E5C97]" />
                  <span>{breakdown?.weatherHumidity != null ? `${breakdown.weatherHumidity.toFixed(0)}%` : '—'}</span>
                </div>
                <div className="p-1.5 bg-white border border-[#E1E6EC] rounded flex items-center gap-1 text-[#526074]">
                  <CloudRain className="w-3.5 h-3.5 text-[#3E7C4A]" />
                  <span>{breakdown?.weatherPrecipitation != null ? `${breakdown.weatherPrecipitation.toFixed(1)}mm` : '0mm'}</span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#E1E6EC] flex items-center justify-between text-[11px] font-mono text-[#526074]">
              <span>Weight: 20% (0.20)</span>
              <span>Aerosol / Vector Index</span>
            </div>
          </div>

          {/* Signal 3: Historical Precedent & Endemicity */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#101826]">
                  <History className="w-4 h-4 text-[#1E5C97]" />
                  <span>3. Historical Precedent & Endemicity</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#101826] tabular-nums">
                  {breakdown?.historyScore != null ? Math.round(breakdown.historyScore) : '—'} / 100
                </span>
              </div>

              <div className="w-full h-2 bg-[#E1E6EC] rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-[#C9A227]"
                  style={{ width: `${Math.min(100, Math.max(0, breakdown?.historyScore ?? 0))}%` }}
                />
              </div>

              <p className="text-xs text-[#526074] leading-relaxed">
                Multi-year spatial clustering precedent and seasonal peak recurrence for {outbreak.diseaseName} in this geographic corridor.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#E1E6EC] flex items-center justify-between text-[11px] font-mono text-[#526074]">
              <span>Weight: 20% (0.20)</span>
              <span>Endemic Recurrence Model</span>
            </div>
          </div>

          {/* Signal 4: Vaccination Immunity Gap */}
          <div className="p-4 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#101826]">
                  <ShieldCheck className="w-4 h-4 text-[#1E5C97]" />
                  <span>4. Herd Immunity & Vaccination Gap</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#101826] tabular-nums">
                  {breakdown?.vaccinationGapScore != null ? Math.round(breakdown.vaccinationGapScore) : '—'} / 100
                </span>
              </div>

              <div className="w-full h-2 bg-[#E1E6EC] rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-[#3E7C4A]"
                  style={{ width: `${Math.min(100, Math.max(0, breakdown?.vaccinationGapScore ?? 0))}%` }}
                />
              </div>

              <div className="p-2 bg-white border border-[#E1E6EC] rounded text-xs font-mono text-[#101826] flex items-center justify-between my-1">
                <span>Block Coverage:</span>
                <strong className={breakdown?.vaccinationCoveragePct && breakdown.vaccinationCoveragePct < 70 ? 'text-[#B7301F]' : 'text-[#3E7C4A]'}>
                  {breakdown?.vaccinationCoveragePct != null ? `${breakdown.vaccinationCoveragePct.toFixed(1)}%` : 'Data unavailable'}
                </strong>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#E1E6EC] flex items-center justify-between text-[11px] font-mono text-[#526074]">
              <span>Weight: 20% (0.20)</span>
              <span>Target Threshold: ≥80.0%</span>
            </div>
          </div>
        </div>

        {/* Explainable Risk Synthesis & Statutory Recommendations */}
        <div className="p-4 bg-[#F8FAFC] border border-[#BED2E8] rounded-[4px] space-y-3">
          {breakdown?.riskExplanation && (
            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-[#526074] flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#1E5C97]" />
                <span>Epidemiological Risk Synthesis</span>
              </span>
              <p className="text-xs text-[#101826] leading-relaxed font-mono">
                {breakdown.riskExplanation}
              </p>
            </div>
          )}

          {breakdown?.recommendedAction && (
            <div className="pt-3 border-t border-[#E1E6EC]">
              <span className="text-[11px] font-mono uppercase font-bold text-[#1E5C97] flex items-center gap-1.5 mb-1">
                <FileCheck className="w-3.5 h-3.5 text-[#1E5C97]" />
                <span>Statutory Bio-Containment Guidance</span>
              </span>
              <p className="text-xs text-[#101826] font-medium leading-relaxed">
                {breakdown.recommendedAction}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
