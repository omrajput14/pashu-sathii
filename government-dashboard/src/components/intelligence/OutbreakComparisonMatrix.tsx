import React, { useState, useMemo } from 'react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { RiskBadge } from '../ui/RiskBadge';
import { Badge } from '../ui/Badge';
import { ArrowUpDown, ExternalLink, ShieldAlert } from 'lucide-react';

interface OutbreakComparisonMatrixProps {
  outbreaks: OutbreakResponse[];
  onSelectOutbreak: (outbreak: OutbreakResponse) => void;
}

type SortField = 'risk' | 'cases' | 'radius' | 'disease' | 'time';

export const OutbreakComparisonMatrix: React.FC<OutbreakComparisonMatrixProps> = ({
  outbreaks,
  onSelectOutbreak,
}) => {
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedOutbreaks = useMemo(() => {
    return [...outbreaks].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'risk':
          cmp = (a.compositeRiskScore ?? 0) - (b.compositeRiskScore ?? 0);
          break;
        case 'cases':
          cmp = a.affectedReportsCount - b.affectedReportsCount;
          break;
        case 'radius':
          cmp = a.radiusKm - b.radiusKm;
          break;
        case 'disease':
          cmp = a.diseaseName.localeCompare(b.diseaseName);
          break;
        case 'time':
          cmp = (a.lastCaseReportedAt || '').localeCompare(b.lastCaseReportedAt || '');
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [outbreaks, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="outbreak-comparison-matrix"
    >
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Active Outbreak Clusters Comparison Matrix
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          {outbreaks.length} Active Threats
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E1E6EC] bg-[#F6F8FA] text-[#526074] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Cluster ID</th>
              <th
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#101826]"
                onClick={() => toggleSort('disease')}
              >
                <div className="flex items-center gap-1">
                  <span>Disease</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#101826]"
                onClick={() => toggleSort('risk')}
              >
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#101826]"
                onClick={() => toggleSort('cases')}
              >
                <div className="flex items-center gap-1">
                  <span>Cases</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#101826]"
                onClick={() => toggleSort('radius')}
              >
                <div className="flex items-center gap-1">
                  <span>Radius</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Centroid GPS</th>
              <th
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#101826]"
                onClick={() => toggleSort('time')}
              >
                <div className="flex items-center gap-1">
                  <span>Latest Report</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E6EC] font-normal text-[#101826]">
            {sortedOutbreaks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#526074]">
                  No active outbreak clusters to compare.
                </td>
              </tr>
            ) : (
              sortedOutbreaks.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-[#F8FAFC] transition-colors focus-within:bg-[#F1F4F8]"
                >
                  <td className="py-2.5 px-4 font-mono text-[11px] text-[#1E5C97] font-semibold">
                    #{o.id.substring(0, 8)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#101826]">
                    {o.diseaseName}
                  </td>
                  <td className="py-2.5 px-3">
                    <RiskBadge level={o.riskScore} score={o.compositeRiskScore} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#101826] tabular-nums">
                    {o.affectedReportsCount}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#526074]">
                    ±{o.radiusKm} km
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                    {o.centerLatitude.toFixed(3)}°, {o.centerLongitude.toFixed(3)}°
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                    {o.lastCaseReportedAt
                      ? new Date(o.lastCaseReportedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
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
                      aria-label={`Inspect outbreak dossier for ${o.diseaseName} #${o.id.substring(0, 8)}`}
                    >
                      <span>Deep Dossier</span>
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
