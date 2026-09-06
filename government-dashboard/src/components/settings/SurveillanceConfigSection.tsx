import React from 'react';
import { SurveillanceConfig } from '../../core/types/system.types';
import { Badge } from '../ui/Badge';
import { Layers, PieChart, ShieldAlert, Sliders } from 'lucide-react';

interface SurveillanceConfigSectionProps {
  surveillance: SurveillanceConfig | null;
}

export const SurveillanceConfigSection: React.FC<SurveillanceConfigSectionProps> = ({
  surveillance,
}) => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-sm font-bold font-mono text-[#101826] uppercase">
            Multi-Signal Risk Engine Configuration
          </h2>
        </div>
        <Badge variant="outline" size="sm" className="font-mono text-[#1E5C97] border-[#1E5C97]">
          READ-ONLY BACKEND DATA
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Risk Signal Weights */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#E1E6EC]">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
              <PieChart className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span>Composite Signal Decomposition</span>
            </div>
            <span className="text-[10px] font-mono text-[#526074]">100% Normalized</span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-[#526074]">
            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-[#E1E6EC]">
              <span>Spatial-Temporal Cluster Density</span>
              <strong className="text-[#101826]">
                {surveillance ? `${(surveillance.weightCluster * 100).toFixed(1)}% (0.40)` : '40.0%'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-[#E1E6EC]">
              <span>Meteorological Vector Suitability</span>
              <strong className="text-[#101826]">
                {surveillance ? `${(surveillance.weightWeather * 100).toFixed(1)}% (0.20)` : '20.0%'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-[#E1E6EC]">
              <span>Historical Cluster Recurrence</span>
              <strong className="text-[#101826]">
                {surveillance ? `${(surveillance.weightHistory * 100).toFixed(1)}% (0.20)` : '20.0%'}
              </strong>
            </div>

            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-[#E1E6EC]">
              <span>Herd Vaccination Immunity Gap</span>
              <strong className="text-[#101826]">
                {surveillance ? `${(surveillance.weightVaccination * 100).toFixed(1)}% (0.20)` : '20.0%'}
              </strong>
            </div>
          </div>
        </div>

        {/* Risk Thresholds & Multipliers */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#E1E6EC]">
            <div className="flex items-center gap-1.5 font-bold font-mono text-[#101826]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#D97B1F]" />
              <span>Risk Classification Boundaries</span>
            </div>
            <span className="text-[10px] font-mono text-[#526074]">0–100 Scale</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 bg-white rounded border border-[#E1E6EC]">
              <span className="block text-[#93A1B0] text-[10px]">LOW SEVERITY</span>
              <strong className="text-[#3E7C4A]">
                &lt; {surveillance?.lowThreshold ?? 30} pts
              </strong>
            </div>

            <div className="p-2 bg-white rounded border border-[#E1E6EC]">
              <span className="block text-[#93A1B0] text-[10px]">MEDIUM SEVERITY</span>
              <strong className="text-[#1E5C97]">
                {surveillance?.lowThreshold ?? 30} – {(surveillance?.mediumThreshold ?? 55) - 1} pts
              </strong>
            </div>

            <div className="p-2 bg-white rounded border border-[#E1E6EC]">
              <span className="block text-[#93A1B0] text-[10px]">HIGH SEVERITY</span>
              <strong className="text-[#D97B1F]">
                {surveillance?.mediumThreshold ?? 55} – {(surveillance?.highThreshold ?? 80) - 1} pts
              </strong>
            </div>

            <div className="p-2 bg-white rounded border border-[#E1E6EC]">
              <span className="block text-[#93A1B0] text-[10px]">CRITICAL OUTBREAK</span>
              <strong className="text-[#B7301F]">
                ≥ {surveillance?.highThreshold ?? 80} pts
              </strong>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#526074] border-t border-[#E1E6EC]">
            <span>Case Multipliers:</span>
            <span>
              Confirmed: <strong className="text-[#101826]">{surveillance?.confirmedCaseMultiplier ?? 1.0}x</strong> ·
              Suspected: <strong className="text-[#101826]">{surveillance?.suspectedCaseMultiplier ?? 0.4}x</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="p-2 bg-[#F1F4F8] border border-[#E1E6EC] rounded text-[10px] font-mono text-[#526074] flex items-center gap-1.5">
        <Sliders className="w-3.5 h-3.5 text-[#1E5C97] shrink-0" />
        <span>Surveillance weights and classification thresholds are statically managed in backend deployment configuration (`vetra.disease.risk-engine`). Direct frontend mutation is disabled.</span>
      </div>
    </div>
  );
};
