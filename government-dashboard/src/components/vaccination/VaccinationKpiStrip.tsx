import React from 'react';
import { VaccinationAnalyticsResponse } from '../../core/types/vaccination.types';
import { Syringe, ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

interface VaccinationKpiStripProps {
  data?: VaccinationAnalyticsResponse;
  isLoading: boolean;
}

export const VaccinationKpiStrip: React.FC<VaccinationKpiStripProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle animate-pulse">
            <div className="h-3 w-24 bg-[#E1E6EC] rounded mb-2" />
            <div className="h-6 w-16 bg-[#E1E6EC] rounded" />
          </div>
        ))}
      </div>
    );
  }

  const total = data?.totalRegisteredLivestock ?? 0;
  const vaccinated = data?.totalVaccinatedLivestock ?? 0;
  const unvaccinated = data?.totalUnvaccinatedLivestock ?? 0;
  const coverage = data?.overallCoveragePercentage ?? 0.0;
  const gap = data?.overallImmunityGapPercentage ?? 100.0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs select-none">
      {/* Metric 1: Total Registered Livestock */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
          <Syringe className="w-3 h-3 text-[#1E5C97]" />
          <span>Registered Livestock</span>
        </span>
        <div className="text-xl font-bold font-mono text-[#101826] mt-1">
          {total}
        </div>
        <span className="text-[10px] font-mono text-[#526074]">Active Registry Census</span>
      </div>

      {/* Metric 2: Active Immunized Animals */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#2E6930]" />
          <span>Vaccinated Livestock</span>
        </span>
        <div className="text-xl font-bold font-mono text-[#2E6930] mt-1">
          {vaccinated} <span className="text-xs font-normal text-[#526074]">({coverage.toFixed(1)}%)</span>
        </div>
        <span className="text-[10px] font-mono text-[#526074]">Valid Non-Expired Records</span>
      </div>

      {/* Metric 3: Overall Immunity Gap */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-[#B7301F]" />
          <span>Overall Immunity Gap</span>
        </span>
        <div className="text-xl font-bold font-mono text-[#B7301F] mt-1">
          {gap.toFixed(1)}% <span className="text-xs font-normal text-[#526074]">({unvaccinated} head)</span>
        </div>
        <span className="text-[10px] font-mono text-[#526074]">Susceptible Livestock</span>
      </div>

      {/* Metric 4: Target Coverage Deficit */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
          <AlertOctagon className="w-3 h-3 text-[#D97B1F]" />
          <span>Target Coverage</span>
        </span>
        <div className="text-xl font-bold font-mono text-[#D97B1F] mt-1">
          80.0% <span className="text-xs font-normal text-[#526074]">Target</span>
        </div>
        <span className="text-[10px] font-mono text-[#526074]">
          {coverage >= 80.0 ? 'Optimal Protection' : `Deficit: ${(80.0 - coverage).toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
};
