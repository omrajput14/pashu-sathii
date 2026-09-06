import React from 'react';
import { Flame, CheckCircle2, HelpCircle, AlertOctagon, IndianRupee, Info } from 'lucide-react';
import { OutbreakStatisticsResponse } from '../../core/types/outbreak.types';
import { DiseaseAnalyticsResponse, EconomicImpactResponse } from '../../core/types/analytics.types';

interface KpiStripProps {
  stats?: OutbreakStatisticsResponse;
  analytics?: DiseaseAnalyticsResponse;
  economicImpact?: EconomicImpactResponse | null;
  isLoading?: boolean;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ stats, analytics, economicImpact, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 animate-pulse" data-testid="kpi-strip-loading">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-white border border-[#E1E6EC] rounded-[6px] p-3.5" />
        ))}
      </div>
    );
  }

  const hasStats = Boolean(stats);
  const hasAnalytics = Boolean(analytics && analytics.reportsByConfidenceSource);

  const totalActive = hasStats ? stats!.activeOutbreaks : null;
  const highRisk = hasStats ? stats!.highRiskOutbreaks : null;
  const resolved = hasStats ? stats!.resolvedOutbreaks : null;
  const totalMortalities = (analytics?.totalMortalityReports != null)
    ? analytics.totalMortalityReports
    : (stats?.totalMortalities ?? null);
  const vetMortalities = (analytics?.vetConfirmedMortalityCount != null)
    ? analytics.vetConfirmedMortalityCount
    : (stats?.vetConfirmedMortalities ?? 0);
  const farmerMortalities = (analytics?.farmerReportedMortalityCount != null)
    ? analytics.farmerReportedMortalityCount
    : 0;

  // Real data only: Vet + Lab confirmed reports from reportsByConfidenceSource
  const confirmedCount = hasAnalytics
    ? (analytics!.reportsByConfidenceSource.VETERINARIAN ?? 0) +
      (analytics!.reportsByConfidenceSource.LAB_CONFIRMED ?? 0)
    : null;

  // Real data only: AI verified + Government preliminary reports from reportsByConfidenceSource
  const suspectedCount = hasAnalytics
    ? (analytics!.reportsByConfidenceSource.AI_VERIFIED ?? 0) +
      (analytics!.reportsByConfidenceSource.GOVERNMENT ?? 0)
    : null;

  // Real authoritative backend economic aggregate (Phase 4B)
  const hasSufficientEconomicData = Boolean(
    economicImpact?.hasSufficientData &&
    economicImpact?.formattedValue &&
    (economicImpact?.eligibleAnimalsCount ?? 0) > 0
  );
  const economicValue = hasSufficientEconomicData
    ? economicImpact!.formattedValue!
    : 'Insufficient data';
  const economicSubValue = hasSufficientEconomicData
    ? `${economicImpact!.eligibleAnimalsCount.toLocaleString()} Susceptible Animals Protected`
    : 'Zero eligible animals';

  const kpis = [
    {
      title: 'ACTIVE OUTBREAK CLUSTERS',
      value: totalActive !== null ? totalActive : '—',
      subValue: highRisk !== null ? `${highRisk} High/Critical Severity` : 'Data unavailable',
      icon: Flame,
      iconColor: 'text-[#D97B1F]',
      badgeColor: (highRisk ?? 0) > 0 ? 'bg-[#FEF3E8] text-[#D97B1F] border-[#F9D7B5]' : 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]',
      badgeText: (highRisk ?? 0) > 0 ? 'SURVEILLANCE ACTIVE' : 'NORMAL',
      tooltip: 'Active spatial clusters under automated surveillance',
    },
    {
      title: 'STATEWIDE INCOME PROTECTED',
      value: economicValue,
      subValue: economicSubValue,
      icon: IndianRupee,
      iconColor: 'text-[#1E5C97]',
      badgeColor: hasSufficientEconomicData ? 'bg-[#EDF7F0] text-[#1E5C97] border-[#B7D0E8]' : 'bg-[#F4F6F8] text-[#526074] border-[#D0D7DE]',
      badgeText: 'MODELED ESTIMATE',
      tooltip: economicImpact?.methodology || 'Modeled estimate based on registered livestock and early-detection outcomes; not an audited financial measure.',
      isEconomic: true,
    },
    {
      title: 'CONFIRMED DIAGNOSES',
      value: confirmedCount !== null ? confirmedCount : '—',
      subValue: confirmedCount !== null ? (vetMortalities > 0 ? `Verified Cases & ${vetMortalities} Vet Mortalities` : 'Verified by Licensed Vets / Lab') : 'Data unavailable',
      icon: CheckCircle2,
      iconColor: 'text-[#B7301F]',
      badgeColor: 'bg-[#FBEBEB] text-[#B7301F] border-[#F5C2C7]',
      badgeText: 'VERIFIED',
      tooltip: 'Laboratory and licensed veterinarian confirmed cases',
    },
    {
      title: 'SUSPECTED / UNVERIFIED',
      value: suspectedCount !== null ? suspectedCount : '—',
      subValue: suspectedCount !== null ? (farmerMortalities > 0 ? `Triage Queue & ${farmerMortalities} Mortality Reports` : 'Farmer Reports & AI Scans') : 'Data unavailable',
      icon: HelpCircle,
      iconColor: 'text-[#C9A227]',
      badgeColor: 'bg-[#FDF8E7] text-[#C9A227] border-[#F4E5A8]',
      badgeText: 'TRIAGE QUEUE',
      tooltip: 'Farmer reports and automated AI screenings pending field vet validation',
    },
    {
      title: 'CRITICAL THREAT PERIMETERS',
      value: highRisk !== null ? highRisk : '—',
      subValue: (resolved != null) ? (totalMortalities !== null ? `${resolved} Contained | ${totalMortalities} Mortalities Recorded` : `${resolved} Clusters Contained to Date`) : 'Data unavailable',
      icon: AlertOctagon,
      iconColor: 'text-[#6E1423]',
      badgeColor: (highRisk ?? 0) > 0 ? 'bg-[#FBEBEB] text-[#6E1423] border-[#F5C2C7]' : 'bg-[#EDF7F0] text-[#3E7C4A] border-[#BFE4C9]',
      badgeText: (highRisk ?? 0) > 0 ? 'BIO-CONTAINMENT' : 'CLEAR',
      tooltip: 'High and Critical severity quarantine perimeters requiring containment',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5" data-testid="kpi-strip">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 flex flex-col justify-between shadow-subtle hover:border-[#C7D0DB] transition-colors"
            title={kpi.tooltip}
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-mono uppercase font-semibold text-[#526074] tracking-wider flex items-center gap-1">
                {kpi.title}
                {kpi.isEconomic && (
                  <span title={kpi.tooltip} className="cursor-help text-[#1E5C97]">
                    <Info className="w-3 h-3 inline" />
                  </span>
                )}
              </span>
              <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
            </div>

            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-[#101826] tabular-nums">
                {kpi.value}
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] border font-medium uppercase ${kpi.badgeColor}`}>
                {kpi.badgeText}
              </span>
            </div>

            <div className="text-[11px] text-[#526074] flex items-center justify-between border-t border-[#F1F4F8] pt-1.5">
              <span>{kpi.subValue}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
