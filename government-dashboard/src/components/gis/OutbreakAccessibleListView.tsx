import React from 'react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { RiskBadge } from '../ui/RiskBadge';
import { Badge } from '../ui/Badge';
import { ExternalLink, Radio } from 'lucide-react';

interface OutbreakAccessibleListViewProps {
  outbreaks: OutbreakResponse[];
  onSelectOutbreak: (outbreak: OutbreakResponse) => void;
}

export const OutbreakAccessibleListView: React.FC<OutbreakAccessibleListViewProps> = ({
  outbreaks,
  onSelectOutbreak,
}) => {
  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="outbreak-accessible-list-view"
      aria-label="Accessible List of Active Spatial Clusters"
    >
      <div className="px-4 py-3 border-b border-[#E1E6EC] bg-[#FAFBFC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Spatial Outbreak Clusters Ledger (Accessible Table View)
          </h2>
        </div>
        <span className="text-xs font-mono text-[#526074]">
          {outbreaks.length} Active Clusters
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E1E6EC] bg-[#F6F8FA] text-[#526074] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Cluster ID</th>
              <th className="py-2.5 px-4 font-semibold">Disease Name</th>
              <th className="py-2.5 px-3 font-semibold">Severity / Risk Score</th>
              <th className="py-2.5 px-3 font-semibold">Centroid GPS</th>
              <th className="py-2.5 px-3 font-semibold">Radius</th>
              <th className="py-2.5 px-3 font-semibold">Cases</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E6EC] font-normal text-[#101826]">
            {outbreaks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#526074]">
                  No active outbreak clusters matching the current filter criteria.
                </td>
              </tr>
            ) : (
              outbreaks.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-[#F8FAFC] transition-colors focus-within:bg-[#F1F4F8]"
                >
                  <td className="py-2.5 px-4 font-mono text-[11px] text-[#1E5C97] font-semibold">
                    #{o.id.substring(0, 8)}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#101826]">
                    {o.diseaseName}
                  </td>
                  <td className="py-2.5 px-3">
                    <RiskBadge level={o.riskScore} score={o.compositeRiskScore} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                    {o.centerLatitude.toFixed(4)}°N, {o.centerLongitude.toFixed(4)}°E
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#101826]">
                    ±{o.radiusKm} km
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#101826]">
                    {o.affectedReportsCount}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={o.status === 'ACTIVE' ? 'confirmed' : 'default'}>
                      {o.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => onSelectOutbreak(o)}
                      className="p-1 text-[#526074] hover:text-[#1E5C97] hover:bg-[#E4EDF6] rounded-[2px] transition-colors font-mono text-[11px] inline-flex items-center gap-1"
                      aria-label={`Inspect outbreak dossier for ${o.diseaseName} in cluster ${o.id}`}
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
