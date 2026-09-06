import React from 'react';
import { Clock } from 'lucide-react';
import { DiseaseAnalyticsResponse } from '../../core/types/analytics.types';
import { OutbreakStatisticsResponse } from '../../core/types/outbreak.types';

interface OutbreakResolutionMetricsCardProps {
  analytics?: DiseaseAnalyticsResponse;
  stats?: OutbreakStatisticsResponse;
}

export const OutbreakResolutionMetricsCard: React.FC<OutbreakResolutionMetricsCardProps> = ({
  analytics,
  stats,
}) => {
  const active = stats?.activeOutbreaks ?? analytics?.activeOutbreaks ?? 0;
  const resolved = stats?.resolvedOutbreaks ?? analytics?.resolvedOutbreaks ?? 0;
  const total = stats?.totalOutbreaks ?? analytics?.totalOutbreaks ?? 0;
  const avgHours = analytics?.averageResolutionTimeHours ?? null;

  const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="outbreak-resolution-metrics-card"
    >
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Outbreak Containment & Resolution Dynamics
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          Bio-Containment Lifecycle
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Metric Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded text-center">
            <span className="text-[10px] font-mono uppercase text-[#526074] block">
              Active Outbreaks
            </span>
            <span className="text-xl font-mono font-bold text-[#D97B1F] block mt-1 tabular-nums">
              {active}
            </span>
            <span className="text-[10px] font-mono text-[#526074] block mt-0.5">
              Under Active Surveillance
            </span>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded text-center">
            <span className="text-[10px] font-mono uppercase text-[#526074] block">
              Resolved Outbreaks
            </span>
            <span className="text-xl font-mono font-bold text-[#3E7C4A] block mt-1 tabular-nums">
              {resolved}
            </span>
            <span className="text-[10px] font-mono text-[#526074] block mt-0.5">
              Containment Verified
            </span>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded text-center">
            <span className="text-[10px] font-mono uppercase text-[#526074] block">
              Avg Resolution Time
            </span>
            <span className="text-xl font-mono font-bold text-[#1E5C97] block mt-1 tabular-nums">
              {avgHours !== null ? `${Math.round(avgHours)}h` : '—'}
            </span>
            <span className="text-[10px] font-mono text-[#526074] block mt-0.5">
              Detection → Resolution
            </span>
          </div>
        </div>

        {/* Resolution Rate Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-[#101826]">Lifetime Resolution Index:</span>
            <span className="font-bold text-[#3E7C4A] tabular-nums">{resolutionRate.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-[#F1F4F8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3E7C4A] rounded-full transition-all"
              style={{ width: `${Math.max(2, resolutionRate)}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-[#526074] font-mono leading-relaxed bg-[#F8FAFC] p-3 rounded border border-[#E1E6EC]">
          Average resolution represents the temporal delta from automated cluster trigger until veterinary zero-case observation threshold is met.
        </p>
      </div>
    </div>
  );
};
