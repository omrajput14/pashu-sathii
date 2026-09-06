import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Map as MapIcon, Maximize2, Download, MapPin, Clock } from 'lucide-react';
import { isOutbreakInScope, isReportInScope, isStatewide, downloadCsv } from '../core/utils/scopeFilter';
import { OutbreakStatisticsResponse } from '../core/types/outbreak.types';
import { diseaseService } from '../core/api/diseaseService';
import { KpiStrip } from '../components/overview/KpiStrip';
import { PriorityAlertRail } from '../components/overview/PriorityAlertRail';
import { RecentSurveillanceTable } from '../components/overview/RecentSurveillanceTable';
import { SurveillanceMap } from '../components/gis/SurveillanceMap';
import { OutbreakResponse } from '../core/types/outbreak.types';
import { DEFAULT_GIS_FILTERS } from '../core/types/gis.types';

interface CommandOverviewPageProps {
  onNavigateToMap?: () => void;
  onSelectOutbreak?: (outbreak: OutbreakResponse) => void;
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
}

export const CommandOverviewPage: React.FC<CommandOverviewPageProps> = ({
  onNavigateToMap,
  onSelectOutbreak,
  selectedScope = 'Maharashtra (Statewide)',
  onScopeChange,
}) => {
  const [selectedOutbreakId, setSelectedOutbreakId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'ALL' | '24H' | '7D' | '30D'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH_CRITICAL'>('ALL');

  // Query 1: Outbreak Statistics
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['outbreakStats'],
    queryFn: diseaseService.getOutbreakStatistics,
    refetchInterval: 30000,
  });

  // Query 2: Active Outbreak List
  const {
    data: outbreaks = [],
    isLoading: isLoadingOutbreaks,
    error: outbreaksError,
    refetch: refetchOutbreaks,
  } = useQuery({
    queryKey: ['outbreaks'],
    queryFn: () => diseaseService.listOutbreaks(),
    refetchInterval: 30000,
  });

  // Query 3: Disease Analytics Summary
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['diseaseAnalytics'],
    queryFn: diseaseService.getDiseaseAnalytics,
    refetchInterval: 30000,
  });

  // Query 4: Recent Field Surveillance Reports
  const {
    data: reportsPage,
    isLoading: isLoadingReports,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['recentReports'],
    queryFn: () => diseaseService.listReports(0, 10),
    refetchInterval: 30000,
  });

  // Query 5: Authoritative Statewide Economic Impact (Phase 4B)
  const {
    data: economicImpact,
    isLoading: isLoadingEconomic,
    refetch: refetchEconomic,
  } = useQuery({
    queryKey: ['statewideEconomicImpact'],
    queryFn: () => (diseaseService.getEconomicImpact ? diseaseService.getEconomicImpact() : Promise.resolve(null)),
    refetchInterval: 60000,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchOutbreaks();
    refetchAnalytics();
    refetchReports();
    refetchEconomic();
  };

  const handleOutbreakClick = (outbreak: OutbreakResponse) => {
    setSelectedOutbreakId(outbreak.id);
    if (onSelectOutbreak) {
      onSelectOutbreak(outbreak);
    }
  };

  const hasAnyError = Boolean(statsError || outbreaksError || reportsError);

  // Dynamic scope and time-range filtration
  const filteredOutbreaks = React.useMemo(() => {
    return outbreaks.filter((o) => {
      if (selectedScope && !isOutbreakInScope(o, selectedScope)) return false;
      if (severityFilter === 'HIGH_CRITICAL' && o.riskScore !== 'HIGH' && o.riskScore !== 'CRITICAL') {
        return false;
      }
      if (timeRange !== 'ALL') {
        const timeLimit = timeRange === '24H' ? 24 * 3600000 : timeRange === '7D' ? 7 * 86400000 : 30 * 86400000;
        const outDate = new Date(o.createdAt || o.lastCaseReportedAt).getTime();
        if (Date.now() - outDate > timeLimit) return false;
      }
      return true;
    });
  }, [outbreaks, selectedScope, severityFilter, timeRange]);

  // Dynamically recalculate scoped KPI stats
  const scopedStats: OutbreakStatisticsResponse | undefined = React.useMemo(() => {
    if (isStatewide(selectedScope) && timeRange === 'ALL' && severityFilter === 'ALL' && stats) {
      return stats;
    }
    return {
      totalOutbreaks: filteredOutbreaks.length,
      activeOutbreaks: filteredOutbreaks.filter((o) => o.status === 'ACTIVE').length,
      resolvedOutbreaks: filteredOutbreaks.filter((o) => o.status === 'RESOLVED').length,
      highRiskOutbreaks: filteredOutbreaks.filter((o) => o.riskScore === 'HIGH' || o.riskScore === 'CRITICAL').length,
    };
  }, [stats, filteredOutbreaks, selectedScope, timeRange, severityFilter]);

  // Filter recent field reports by scope
  const scopedReports = React.useMemo(() => {
    const raw = reportsPage?.content || [];
    return raw.filter((r) => isReportInScope(r, selectedScope));
  }, [reportsPage, selectedScope]);

  const scopedReportsPage = React.useMemo(() => {
    if (!reportsPage) return undefined;
    return {
      ...reportsPage,
      content: scopedReports,
      totalElements: isStatewide(selectedScope) ? reportsPage.totalElements : scopedReports.length,
    };
  }, [reportsPage, scopedReports, selectedScope]);

  const handleExportSitRep = () => {
    downloadCsv(
      'PashuSathi_SitRep_' + selectedScope.replace(/\s+/g, '_'),
      ['Outbreak ID', 'Disease Name', 'Severity', 'Risk Score', 'Composite Score', 'Latitude', 'Longitude', 'Radius (km)', 'Affected Cases', 'Status', 'Last Reported'],
      filteredOutbreaks.map((o) => [
        o.id,
        o.diseaseName,
        o.severity,
        o.riskScore,
        o.compositeRiskScore ?? '',
        o.centerLatitude,
        o.centerLongitude,
        o.radiusKm,
        o.affectedReportsCount,
        o.status,
        o.lastCaseReportedAt,
      ])
    );
  };

  return (
    <div className="space-y-5" data-testid="command-overview-page">
      {/* Page Title & Operational Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#E1E6EC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#101826] tracking-tight">
              Statewide Epidemiological Surveillance Command Overview
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-[#E4EDF6] text-[#1E5C97] rounded-[2px] font-semibold">
              TACTICAL DASHBOARD
            </span>
          </div>
          <p className="text-xs text-[#526074] mt-0.5">
            Automated spatial-temporal cluster analysis, multi-signal threat scores, and field report ingestion.
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#1E5C97] bg-white border border-[#C7D0DB] hover:bg-[#F6F8FA] rounded-[4px] transition-colors self-start sm:self-auto focus:outline-none"
          title="Refresh All Telemetry"
          aria-label="Refresh Surveillance Telemetry"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* Backend API Error Banner (if any API is unreachable) */}
      {hasAnyError && (
        <div
          className="p-3.5 bg-[#FBEBEB] border border-[#F5C2C7] rounded-[4px] text-xs text-[#6E1423] flex items-start justify-between gap-2"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold font-mono uppercase">Telemetry Ingestion Notice</p>
              <p className="mt-0.5 text-[#526074]">
                One or more disease endpoints are operating with cached parameters or initializing connection to the Spring Boot cluster engine.
              </p>
            </div>
          </div>
          <button
            onClick={handleRefreshAll}
            className="text-xs font-semibold underline text-[#6E1423] hover:opacity-80"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Interactive Scope & Filter Quick-Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white border border-[#E1E6EC] p-3 rounded-[6px] shadow-subtle">
        {/* Active Scope Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E4EDF6] text-[#1E5C97] border border-[#BED2E8] rounded-[4px] text-xs font-mono font-medium">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Scope: <strong className="font-bold">{selectedScope}</strong> ({filteredOutbreaks.length} Clusters)</span>
          </div>
          {!isStatewide(selectedScope) && onScopeChange && (
            <button
              onClick={() => onScopeChange('Maharashtra (Statewide)')}
              className="text-xs font-mono text-[#526074] hover:text-[#101826] underline font-semibold px-1"
            >
              Reset to Statewide
            </button>
          )}
        </div>

        {/* Filters & Export Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Time Range Filter Buttons */}
          <div className="flex items-center bg-[#F6F8FA] border border-[#E1E6EC] rounded-[4px] p-0.5">
            <span className="px-2 text-[10px] text-[#526074] uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time:
            </span>
            {(['ALL', '24H', '7D', '30D'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2 py-0.5 rounded-[3px] text-[11px] font-medium transition-colors ${timeRange === t ? 'bg-white text-[#1E5C97] font-bold shadow-subtle' : 'text-[#526074] hover:text-[#101826]'}`}
              >
                {t === 'ALL' ? 'All Time' : t}
              </button>
            ))}
          </div>

          {/* Severity Quick Chip */}
          <button
            onClick={() => setSeverityFilter(prev => prev === 'ALL' ? 'HIGH_CRITICAL' : 'ALL')}
            className={`px-2.5 py-1 rounded-[4px] border text-[11px] font-medium transition-colors ${severityFilter === 'HIGH_CRITICAL' ? 'bg-[#FBEBEB] text-[#6E1423] border-[#F5C2C7] font-bold' : 'bg-[#F6F8FA] text-[#526074] border-[#E1E6EC] hover:bg-[#F1F4F8]'}`}
          >
            {severityFilter === 'HIGH_CRITICAL' ? '● High / Crit Only' : '○ All Severity'}
          </button>

          {/* SitRep CSV Export */}
          <button
            onClick={handleExportSitRep}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-[#101826] border border-[#C7D0DB] hover:bg-[#F6F8FA] rounded-[4px] font-semibold transition-colors shadow-subtle"
            title="Export current filtered SitRep as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#1E5C97]" />
            <span>Export SitRep (CSV)</span>
          </button>
        </div>
      </div>

      {/* 1. Tactical Operational KPI Strip */}
      <KpiStrip
        stats={scopedStats}
        analytics={analytics}
        economicImpact={economicImpact}
        isLoading={isLoadingStats || isLoadingAnalytics || isLoadingEconomic}
      />

      {/* 2. Split Main Operations: Live GIS Surface (65%) & Priority Alert Rail (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 flex flex-col bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E1E6EC] bg-[#FAFBFC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-[#1E5C97]" />
              <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
                Live PostGIS Surveillance Map
              </h2>
              <span className="text-[10px] font-mono bg-[#E4EDF6] text-[#1E5C97] px-1.5 py-0.5 rounded-[2px] font-bold">
                {filteredOutbreaks.length} Active Clusters
              </span>
            </div>

            <button
              onClick={onNavigateToMap}
              className="flex items-center gap-1 text-xs font-mono text-[#1E5C97] hover:text-[#164A7C] font-semibold focus:outline-none"
              title="Open Full-Screen GIS Surveillance Map"
            >
              <span>Full Screen Map</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Map Surface */}
          <div className="flex-1 min-h-[380px] p-2">
            <SurveillanceMap
              outbreaks={filteredOutbreaks}
              reports={scopedReports}
              scope={selectedScope}
              filters={DEFAULT_GIS_FILTERS}
              selectedOutbreakId={selectedOutbreakId}
              onSelectOutbreak={handleOutbreakClick}
              height="380px"
              isCompact={true}
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <PriorityAlertRail
            outbreaks={filteredOutbreaks}
            isLoading={isLoadingOutbreaks}
            onSelectOutbreak={handleOutbreakClick}
          />
        </div>
      </div>

      {/* 3. High-Density Operational Field Surveillance Table */}
      <RecentSurveillanceTable
        reportsPage={scopedReportsPage}
        isLoading={isLoadingReports}
      />
    </div>
  );
};
