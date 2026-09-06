import React, { useMemo } from 'react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { MapPin } from 'lucide-react';
import { RiskBadge } from '../ui/RiskBadge';

interface GeographicThreatRankingProps {
  outbreaks: OutbreakResponse[];
  onSelectOutbreak: (outbreak: OutbreakResponse) => void;
}

export const GeographicThreatRanking: React.FC<GeographicThreatRankingProps> = ({
  outbreaks,
  onSelectOutbreak,
}) => {
  // Sort by highest risk score and affected cases
  const rankedOutbreaks = useMemo(() => {
    return [...outbreaks].sort((a, b) => {
      const scoreDiff = (b.compositeRiskScore ?? 0) - (a.compositeRiskScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return b.affectedReportsCount - a.affectedReportsCount;
    });
  }, [outbreaks]);

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="geographic-threat-ranking"
    >
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Geographic Spatial Threat Hierarchy
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          Ranked by Composite Score
        </span>
      </div>

      <div className="p-4 space-y-2.5">
        {rankedOutbreaks.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-[#526074]">
            No active threat perimeters recorded.
          </div>
        ) : (
          rankedOutbreaks.map((o, idx) => (
            <div
              key={o.id}
              onClick={() => onSelectOutbreak(o)}
              className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] hover:border-[#1E5C97] hover:bg-[#F1F4F8] rounded-[4px] cursor-pointer transition-all flex items-center justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectOutbreak(o)}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-[#E4EDF6] text-[#1E5C97] font-mono font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#101826]">{o.diseaseName}</span>
                    <span className="text-[10px] font-mono text-[#526074]">#{o.id.substring(0, 8)}</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#526074] mt-0.5">
                    Centroid: {o.centerLatitude.toFixed(3)}°N, {o.centerLongitude.toFixed(3)}°E · Buffer: ±{o.radiusKm} km · {o.affectedReportsCount} Cases
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RiskBadge level={o.riskScore} score={o.compositeRiskScore} size="sm" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
