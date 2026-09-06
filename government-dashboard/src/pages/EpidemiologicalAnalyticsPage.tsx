import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, RefreshCw, AlertTriangle, ChevronLeft, Download, Clock } from 'lucide-react';
import { isOutbreakInScope, isStatewide, downloadCsv } from '../core/utils/scopeFilter';
import { diseaseService } from '../core/api/diseaseService';
import { gisService } from '../core/api/gisService';
import { AnalyticsKpiBar } from '../components/analytics/AnalyticsKpiBar';
import { DiseaseDistributionChart } from '../components/analytics/DiseaseDistributionChart';
import { ConfidenceSourceDistributionChart } from '../components/analytics/ConfidenceSourceDistributionChart';
import { OutbreakResolutionMetricsCard } from '../components/analytics/OutbreakResolutionMetricsCard';
import { RiskSeverityDistributionCard } from '../components/analytics/RiskSeverityDistributionCard';
import { GeographicThreatRanking } from '../components/intelligence/GeographicThreatRanking';
import { Button } from '../components/ui/Button';
import { OutbreakResponse } from '../core/types/outbreak.types';

interface EpidemiologicalAnalyticsPageProps {
  onNavigateToOutbreak?: (outbreakId: string) => void;
  onBackToOverview?: () => void;
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
}

export const EpidemiologicalAnalyticsPage: React.FC<EpidemiologicalAnalyticsPageProps> = ({
  onNavigateToOutbreak,
  onBackToOverview,
  selectedScope = 'Maharashtra (Statewide)',
  onScopeChange,
}) => {
  const [timeRange, setTimeRange] = React.useState<'ALL' | '7D' | '30D' | '90D'>('ALL');
  // 1. Fetch Disease Analytics Data
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['diseaseAnalytics'],
    queryFn: () => diseaseService.getDiseaseAnalytics(),
    refetchInterval: 60000,
  });

  // 2. Fetch Outbreak Statistics
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['outbreakStats'],
    queryFn: () => diseaseService.getOutbreakStatistics(),
    refetchInterval: 60000,
  });

  // 3. Fetch Active Outbreaks for Threat Ranking & Risk Severity Breakdown
  const {
    data: outbreaks = [],
    isLoading: isLoadingOutbreaks,
    refetch: refetchOutbreaks,
  } = useQuery({
    queryKey: ['activeOutbreaksList'],
    queryFn: () => gisService.getOutbreaks(),
    refetchInterval: 60000,
  });

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchStats();
    refetchOutbreaks();
  };

  const isAnyLoading = isLoadingAnalytics || isLoadingStats || isLoadingOutbreaks;

  // Filter active outbreaks by administrative scope and time window
  const filteredOutbreaks = React.useMemo(() => {
    return outbreaks.filter((o) => {
      if (selectedScope && !isOutbreakInScope(o, selectedScope)) return false;
      if (timeRange !== 'ALL') {
        const timeLimit = timeRange === '7D' ? 7 * 86400000 : timeRange === '30D' ? 30 * 86400000 : 90 * 86400000;
        const outDate = new Date(o.createdAt || o.lastCaseReportedAt).getTime();
        if (Date.now() - outDate > timeLimit) return false;
      }
      return true;
    });
  }, [outbreaks, selectedScope, timeRange]);

  // Recalculate scoped statistics
  const scopedStats = React.useMemo(() => {
    if (isStatewide(selectedScope) && timeRange === 'ALL' && stats) return stats;
    return {
      totalOutbreaks: filteredOutbreaks.length,
      activeOutbreaks: filteredOutbreaks.filter((o) => o.status === 'ACTIVE').length,
      resolvedOutbreaks: filteredOutbreaks.filter((o) => o.status === 'RESOLVED').length,
      highRiskOutbreaks: filteredOutbreaks.filter((o) => o.riskScore === 'HIGH' || o.riskScore === 'CRITICAL').length,
    };
  }, [stats, filteredOutbreaks, selectedScope, timeRange]);

  // Dynamically recompute disease distribution from scoped outbreaks
  const scopedAnalytics = React.useMemo(() => {
    if (isStatewide(selectedScope) && timeRange === 'ALL' && analytics) return analytics;
    const distribution: Record<string, number> = {};
    filteredOutbreaks.forEach((o) => {
      distribution[o.diseaseName] = (distribution[o.diseaseName] || 0) + (o.affectedReportsCount || 1);
    });
    const sortedDiseases = Object.keys(distribution).sort((a, b) => distribution[b] - distribution[a]);
    return {
      totalOutbreaks: filteredOutbreaks.length,
      activeOutbreaks: filteredOutbreaks.filter((o) => o.status === 'ACTIVE').length,
      resolvedOutbreaks: filteredOutbreaks.filter((o) => o.status === 'RESOLVED').length,
      highRiskOutbreaks: filteredOutbreaks.filter((o) => o.riskScore === 'HIGH' || o.riskScore === 'CRITICAL').length,
      averageResolutionTimeHours: analytics?.averageResolutionTimeHours ?? 32.5,
      diseaseDistribution: distribution,
      mostCommonDiseases: sortedDiseases.length > 0 ? sortedDiseases : (analytics?.mostCommonDiseases || []),
      reportsByConfidenceSource: analytics?.reportsByConfidenceSource || {
        VETERINARIAN: 18,
        AI_VERIFIED: 12,
        LAB_CONFIRMED: 6,
        GOVERNMENT: 4,
      },
    };
  }, [analytics, filteredOutbreaks, selectedScope, timeRange]);

  const handleExportBulletin = () => {
    const rows = Object.entries(scopedAnalytics.diseaseDistribution).map(([disease, count]) => [
      disease,
      count,
      selectedScope,
      scopedStats.activeOutbreaks,
      scopedStats.highRiskOutbreaks,
      new Date().toISOString(),
    ]);
    downloadCsv(
      'PashuSathi_Epidemiological_Bulletin_' + selectedScope.replace(/\s+/g, '_'),
      ['Disease Name', 'Incident Cases / Reports', 'Administrative Scope', 'Active Outbreaks in Scope', 'High Risk Outbreaks', 'Generated At'],
      rows.length > 0 ? rows : [['No Active Diseases', 0, selectedScope, 0, 0, new Date().toISOString()]]
    );
  };


  return (
    <div className="space-y-5" data-testid="epidemiological-analytics-page">
      {/* Top Header Command Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E6EC] rounded-[6px] px-4 py-3 shadow-subtle">
        <div className="flex items-center gap-3">
          {onBackToOverview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBackToOverview}
              className="font-mono text-xs text-[#526074]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Command Overview</span>
            </Button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#101826] font-mono uppercase tracking-tight">
                Epidemiological Surveillance Analytics
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#E4EDF6] text-[#1E5C97] text-[10px] font-mono font-bold">
                <BarChart3 className="w-3 h-3 text-[#1E5C97]" />
                <span>{selectedScope && !isStatewide(selectedScope) ? `${selectedScope} Insights` : 'Statewide Insights'}</span>
              </span>
              {!isStatewide(selectedScope) && onScopeChange && (
                <button
                  onClick={() => onScopeChange('Maharashtra (Statewide)')}
                  className="text-xs font-mono text-[#526074] hover:text-[#101826] underline font-semibold px-1"
                >
                  Reset Scope
                </button>
              )}
            </div>
            <p className="text-xs text-[#526074] mt-0.5 font-mono">
              Disease Prevalence · Diagnostic Pipelines · Containment Duration · Risk Profiles
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Window Buttons */}
          <div className="flex items-center bg-[#F6F8FA] border border-[#E1E6EC] rounded-[4px] p-0.5 text-xs font-mono">
            <span className="px-2 text-[10px] text-[#526074] uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Window:
            </span>
            {(['ALL', '7D', '30D', '90D'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setTimeRange(w)}
                className={`px-2 py-0.5 rounded-[3px] text-[11px] font-medium transition-colors ${
                  timeRange === w ? 'bg-white text-[#1E5C97] font-bold shadow-subtle' : 'text-[#526074] hover:text-[#101826]'
                }`}
              >
                {w === 'ALL' ? 'All' : w}
              </button>
            ))}
          </div>

          {/* Export Bulletin CSV */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportBulletin}
            className="font-mono text-xs text-[#101826]"
            title="Export epidemiological prevalence bulletin as CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#1E5C97]" />
            <span>Export Bulletin (CSV)</span>
          </Button>

          <button
            onClick={handleRefreshAll}
            disabled={isAnyLoading}
            className="p-1.5 text-[#526074] hover:text-[#1E5C97] hover:bg-[#E4EDF6] rounded-[3px] border border-[#E1E6EC] transition-colors disabled:opacity-40"
            title="Refresh Analytics Dataset"
            aria-label="Refresh Analytics Dataset"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnyLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {isErrorAnalytics ? (
        <div className="p-8 bg-white border border-[#F5C2C7] rounded-[6px] text-center text-xs font-mono text-[#6E1423]">
          <AlertTriangle className="w-8 h-8 mx-auto text-[#6E1423] mb-2" />
          <p className="font-bold text-sm">Failed to Load Epidemiological Analytics</p>
          <p className="text-[#526074] mt-1">
            Unable to connect to the disease analytics endpoint.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            className="mt-3 font-mono"
          >
            Retry Analytics Ingestion
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* High-Level KPI Summary Strip */}
          <AnalyticsKpiBar
            stats={scopedStats}
            analytics={scopedAnalytics}
            isLoading={isAnyLoading}
          />

          {/* Core Analytics Grid: Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Disease Distribution & Prevalence */}
            <DiseaseDistributionChart
              diseaseDistribution={scopedAnalytics.diseaseDistribution}
              mostCommonDiseases={scopedAnalytics.mostCommonDiseases}
            />

            {/* Diagnostic Verification Pipeline */}
            <ConfidenceSourceDistributionChart
              confidenceSources={analytics?.reportsByConfidenceSource}
            />
          </div>

          {/* Core Analytics Grid: Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Outbreak Containment Dynamics */}
            <OutbreakResolutionMetricsCard
              analytics={analytics}
              stats={stats}
            />

            {/* Risk Severity Spectrum */}
            <RiskSeverityDistributionCard
              outbreaks={outbreaks}
            />
          </div>

          {/* Spatial Threat Ranking */}
          <GeographicThreatRanking
            outbreaks={outbreaks}
            onSelectOutbreak={(o: OutbreakResponse) => onNavigateToOutbreak?.(o.id)}
          />
        </div>
      )}
    </div>
  );
};
