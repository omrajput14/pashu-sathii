import React from 'react';
import { PathogenCoverageDto } from '../../core/types/vaccination.types';
import { Badge } from '../ui/Badge';
import { Activity } from 'lucide-react';

interface PathogenCoverageGridProps {
  pathogens: PathogenCoverageDto[];
}

export const PathogenCoverageGrid: React.FC<PathogenCoverageGridProps> = ({ pathogens }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ADEQUATE':
        return <Badge variant="success" size="sm">ADEQUATE (≥80%)</Badge>;
      case 'DEFICIT':
        return <Badge variant="warning" size="sm">DEFICIT (50-79%)</Badge>;
      case 'CRITICAL_GAP':
      default:
        return <Badge variant="danger" size="sm">CRITICAL GAP (&lt;50%)</Badge>;
    }
  };

  const getProgressBarColor = (coverage: number) => {
    if (coverage >= 80) return 'bg-[#2E6930]';
    if (coverage >= 50) return 'bg-[#D97B1F]';
    return 'bg-[#B7301F]';
  };

  if (!pathogens || pathogens.length === 0) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-6 text-center text-xs font-mono text-[#526074]">
        No pathogen vaccination profiles recorded in active livestock registry.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs select-none">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
            Pathogen-Specific Vaccination Coverage vs Target Coverage
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          Target Coverage: <strong className="text-[#101826]">80.0%</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {pathogens.map((p) => {
          return (
            <div
              key={p.diseaseName}
              className="p-3.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-[#101826] text-xs leading-tight">
                    {p.diseaseName}
                  </h3>
                  {getStatusBadge(p.status)}
                </div>

                <div className="flex items-baseline justify-between font-mono text-[11px] text-[#526074] mt-2 mb-1">
                  <span>
                    Vaccinated: <strong className="text-[#101826]">{p.vaccinatedCount}</strong> / {p.eligibleCount}
                  </span>
                  <span className="font-bold text-[#101826] text-xs">
                    {p.coveragePercentage.toFixed(1)}%
                  </span>
                </div>

                {/* Progress Bar with 80% Target Marker */}
                <div className="relative w-full h-2.5 bg-[#E1E6EC] rounded-[2px] overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(p.coveragePercentage)} transition-all duration-300`}
                    style={{ width: `${Math.min(100, p.coveragePercentage)}%` }}
                  />
                  {/* 80% Target Marker Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#101826]"
                    style={{ left: '80%' }}
                    title="Target Coverage: 80%"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#526074] mt-2.5 pt-2 border-t border-[#E1E6EC]">
                <span>Immunity Gap: <strong className="text-[#B7301F]">{p.immunityGapPercentage.toFixed(1)}%</strong></span>
                <span>Target: 80.0%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
