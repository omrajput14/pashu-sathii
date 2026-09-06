import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { campaignService } from '../../core/api/campaignService';
import { Syringe, Activity, CheckCircle, Target } from 'lucide-react';

export const CampaignSummaryCards: React.FC = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['vaccinationCampaignStatistics'],
    queryFn: campaignService.getStatistics,
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white border border-[#E1E6EC] rounded-[6px] animate-pulse p-3" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {/* Total Campaigns */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#526074] uppercase tracking-wider">
            Total Campaigns
          </div>
          <div className="text-xl font-bold text-[#101826] mt-0.5 font-mono">
            {stats.totalCampaigns}
          </div>
          <div className="text-[10px] text-[#526074] font-mono mt-0.5">
            {stats.plannedCampaigns} planned · {stats.completedCampaigns} completed
          </div>
        </div>
        <div className="p-2.5 bg-[#F1F5F9] text-[#1E5C97] rounded">
          <Target className="w-5 h-5" />
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#526074] uppercase tracking-wider flex items-center gap-1.5">
            <span>Active Operations</span>
            {stats.activeCampaigns > 0 && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
            )}
          </div>
          <div className="text-xl font-bold text-[#101826] mt-0.5 font-mono">
            {stats.activeCampaigns}
          </div>
          <div className="text-[10px] text-green-700 font-mono mt-0.5">
            Field teams deployed
          </div>
        </div>
        <div className="p-2.5 bg-green-50 text-green-600 rounded">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* Planned Doses */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#526074] uppercase tracking-wider">
            Total Planned Doses
          </div>
          <div className="text-xl font-bold text-[#101826] mt-0.5 font-mono">
            {stats.totalPlannedDoses.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#526074] font-mono mt-0.5">
            Statewide allocation
          </div>
        </div>
        <div className="p-2.5 bg-[#EFF6FF] text-[#1E5C97] rounded">
          <Syringe className="w-5 h-5" />
        </div>
      </div>

      {/* Administered Doses & Progress */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono text-[#526074] uppercase tracking-wider">
            Administered Doses
          </div>
          <div className="text-xl font-bold text-[#101826] mt-0.5 font-mono">
            {stats.totalAdministeredDoses.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#526074] font-mono mt-0.5">
            {stats.overallProgressPercentage.toFixed(1)}% target achieved
          </div>
        </div>
        <div className="p-2.5 bg-[#F0FDF4] text-[#16A34A] rounded">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
