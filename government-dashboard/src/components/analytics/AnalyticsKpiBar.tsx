import React from 'react';
import { Flame, Clock, ShieldAlert, CheckSquare } from 'lucide-react';
import { OutbreakStatisticsResponse } from '../../core/types/outbreak.types';
import { DiseaseAnalyticsResponse } from '../../core/types/analytics.types';

interface AnalyticsKpiBarProps {
  stats?: OutbreakStatisticsResponse;
  analytics?: DiseaseAnalyticsResponse;
  isLoading?: boolean;
}

export const AnalyticsKpiBar: React.FC<AnalyticsKpiBarProps> = ({
  stats,
  analytics,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse" data-testid="analytics-kpi-bar-loading">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-[#E1E6EC] rounded-[6px] p-3.5" />
        ))}
      </div>
    );
  }

  const activeCount = stats?.activeOutbreaks ?? analytics?.activeOutbreaks ?? null;
  const highRiskCount = stats?.highRiskOutbreaks ?? analytics?.highRiskOutbreaks ?? null;
  const avgResolution = analytics?.averageResolutionTimeHours ?? null;
  const totalOutbreaks = stats?.totalOutbreaks ?? analytics?.totalOutbreaks ?? null;
  const resolvedOutbreaks = stats?.resolvedOutbreaks ?? analytics?.resolvedOutbreaks ?? null;

  const verifiedCases = analytics?.reportsByConfidenceSource
    ? (analytics.reportsByConfidenceSource.VETERINARIAN ?? 0) +
      (analytics.reportsByConfidenceSource.LAB_CONFIRMED ?? 0)
    : null;

  const cards = [
    {
      title: 'ACTIVE OUTBREAK CLUSTERS',
      value: activeCount !== null ? activeCount : '—',
      subValue: totalOutbreaks !== null ? `${totalOutbreaks} Total Lifetime Outbreaks` : 'Data unavailable',
      icon: Flame,
      color: 'text-[#D97B1F]',
      badge: (activeCount ?? 0) > 0 ? 'ACTIVE SURVEILLANCE' : 'MONITORING',
      badgeColor: (activeCount ?? 0) > 0 ? 'bg-[#FEF3E8] text-[#D97B1F] border-[#F9D7B5]' : 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]',
    },
    {
      title: 'HIGH/CRITICAL THREATS',
      value: highRiskCount !== null ? highRiskCount : '—',
      subValue: (highRiskCount ?? 0) > 0 ? 'Priority Bio-Containment Active' : 'No Critical Alerts',
      icon: ShieldAlert,
      color: 'text-[#6E1423]',
      badge: (highRiskCount ?? 0) > 0 ? 'BIO-CONTAINMENT' : 'NORMAL',
      badgeColor: (highRiskCount ?? 0) > 0 ? 'bg-[#FBEBEB] text-[#6E1423] border-[#F5C2C7]' : 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]',
    },
    {
      title: 'AVG CONTAINMENT DURATION',
      value: avgResolution !== null ? `${Math.round(avgResolution)}h` : '—',
      subValue: resolvedOutbreaks !== null ? `${resolvedOutbreaks} Clusters Contained` : 'Data unavailable',
      icon: Clock,
      color: 'text-[#1E5C97]',
      badge: 'HISTORICAL AVERAGE',
      badgeColor: 'bg-[#E4EDF6] text-[#1E5C97] border-[#BED2E8]',
    },
    {
      title: 'VERIFIED CLINICAL CASES',
      value: verifiedCases !== null ? verifiedCases : '—',
      subValue: 'Confirmed by Licensed Vets/Lab',
      icon: CheckSquare,
      color: 'text-[#3E7C4A]',
      badge: 'VERIFIED TELEMETRY',
      badgeColor: 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" data-testid="analytics-kpi-bar">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 flex flex-col justify-between shadow-subtle hover:border-[#C7D0DB] transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-mono uppercase font-semibold text-[#526074] tracking-wider">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>

            <div className="my-2 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-[#101826] tabular-nums">
                {card.value}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E1E6EC] text-[11px] font-mono">
              <span className="text-[#526074] truncate">{card.subValue}</span>
              <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] border font-bold ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
