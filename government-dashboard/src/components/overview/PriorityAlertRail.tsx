import React from 'react';
import { Clock, ShieldAlert, ArrowUpRight, ChevronRight } from 'lucide-react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { RiskBadge } from '../ui/RiskBadge';

interface PriorityAlertRailProps {
  outbreaks: OutbreakResponse[];
  isLoading?: boolean;
  onSelectOutbreak?: (outbreak: OutbreakResponse) => void;
}

export const PriorityAlertRail: React.FC<PriorityAlertRailProps> = ({
  outbreaks,
  isLoading,
  onSelectOutbreak,
}) => {
  if (isLoading) {
    return (
      <div
        className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 space-y-3 shadow-subtle"
        data-testid="priority-alert-rail"
      >
        <div className="h-4 bg-[#F6F8FA] rounded w-1/2 animate-pulse" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#F6F8FA] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Filter top priority threats
  const priorityOutbreaks = outbreaks.slice(0, 4);

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] flex flex-col h-full shadow-subtle"
      data-testid="priority-alert-rail"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E1E6EC] bg-[#FAFBFC] rounded-t-[6px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#6E1423]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            PRIORITY INTERVENTION QUEUE
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-[#E4EDF6] text-[#1E5C97] px-1.5 py-0.5 rounded-[2px] font-medium">
          {priorityOutbreaks.length} Active
        </span>
      </div>

      {/* Alert Stream */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[460px]">
        {priorityOutbreaks.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#526074]">
            <p className="font-medium">No active high-risk alerts</p>
            <p className="text-[11px] text-[#93A1B0] mt-1">All district perimeters within baseline parameters</p>
          </div>
        ) : (
          priorityOutbreaks.map((ob) => {
            const isCritical = ob.riskScore === 'CRITICAL';
            const leftStripeColor = isCritical
              ? 'border-l-[#6E1423] bg-[#FCF7F7]'
              : ob.riskScore === 'HIGH'
              ? 'border-l-[#D97B1F] bg-[#FFFBF7]'
              : 'border-l-[#C9A227] bg-[#FFFCF4]';

            const timeString = ob.createdAt
              ? new Date(ob.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              : 'Recent';

            return (
              <div
                key={ob.id}
                className={`p-3 border border-[#E1E6EC] border-l-4 ${leftStripeColor} rounded-[4px] hover:border-[#C7D0DB] transition-all text-left flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <RiskBadge level={ob.riskScore} score={ob.compositeRiskScore} size="sm" />
                    <span className="font-semibold text-xs text-[#101826]">{ob.diseaseName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#526074] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeString}
                  </span>
                </div>

                <div className="text-[11px] text-[#526074] space-y-0.5">
                  <p className="font-mono text-[#101826]">
                    Centroid: {ob.centerLatitude.toFixed(3)}° N, {ob.centerLongitude.toFixed(3)}° E · Radius: {ob.radiusKm} km
                  </p>
                  <p className="line-clamp-2 text-[#526074]">
                    {ob.riskBreakdown?.riskExplanation || `${ob.affectedReportsCount} livestock reports contributing to cluster.`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#E1E6EC]">
                  <span className="text-[10px] font-mono font-medium text-[#1E5C97]">
                    {ob.riskBreakdown?.recommendedAction ? 'Action Recommended' : 'Routine Monitoring'}
                  </span>
                  <button
                    onClick={() => onSelectOutbreak?.(ob)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E5C97] hover:text-[#164A7C] focus:outline-none"
                    aria-label={`Inspect ${ob.diseaseName} cluster`}
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#E1E6EC] bg-[#FAFBFC] rounded-b-[6px]">
        <button className="w-full text-xs font-semibold text-[#1E5C97] hover:text-[#164A7C] text-center py-1 flex items-center justify-center gap-1">
          <span>View Complete Alert Audit Log</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
