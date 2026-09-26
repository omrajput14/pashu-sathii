import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  Filter,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { gisService } from '../core/api/gisService';
import { diseaseService, ContainmentResult } from '../core/api/diseaseService';
import { OutbreakResponse, OutbreakRiskScore, OutbreakStatus } from '../core/types/outbreak.types';
import { DiseaseReportResponse } from '../core/types/disease.types';
import { RISK_CONFIG } from '../core/theme/tokens';
import { useDataFreshness } from '../core/hooks/useDataFreshness';
import { DataFreshnessBanner } from '../components/ui/DataFreshnessBanner';
import { OutbreakHeaderCard } from '../components/intelligence/OutbreakHeaderCard';
import { FourSignalRiskDecomposition } from '../components/intelligence/FourSignalRiskDecomposition';
import { ConfirmedVsSuspectedAnalysis } from '../components/intelligence/ConfirmedVsSuspectedAnalysis';
import { OutbreakEpidemiologicalTimeline } from '../components/intelligence/OutbreakEpidemiologicalTimeline';
import { ContributingReportsLedger } from '../components/intelligence/ContributingReportsLedger';
import { OutbreakComparisonMatrix } from '../components/intelligence/OutbreakComparisonMatrix';
import { GeographicThreatRanking } from '../components/intelligence/GeographicThreatRanking';
import { CaseDetailDrawer } from '../components/gis/CaseDetailDrawer';
import { Button } from '../components/ui/Button';
import { isOutbreakInScope, isStatewide, downloadCsv } from '../core/utils/scopeFilter';
import { Download, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface OutbreakIntelligencePageProps {
  initialOutbreakId?: string | null;
  onNavigateToMap?: (outbreakId?: string) => void;
  onBackToOverview?: () => void;
  onSelectOutbreakId?: (outbreakId: string | null) => void;
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
}

export const OutbreakIntelligencePage: React.FC<OutbreakIntelligencePageProps> = ({
  initialOutbreakId,
  onNavigateToMap,
  onBackToOverview,
  onSelectOutbreakId,
  selectedScope = 'Maharashtra (Statewide)',
  onScopeChange,
}) => {
  const [containmentModalOpen, setContainmentModalOpen] = useState(false);
  const [containmentResult, setContainmentResult] = useState<ContainmentResult | null>(null);
  const [containmentError, setContainmentError] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [plannedDoses, setPlannedDoses] = useState(500);

  const deployContainment = async () => {
    if (!selectedOutbreak) return;
    setDeploying(true);
    setContainmentError(null);
    try {
      const result = await diseaseService.deployContainment(selectedOutbreak.id, { plannedDoses });
      setContainmentResult(result);
      setContainmentModalOpen(false);
    } catch (err: any) {
      setContainmentError(err?.response?.data?.message || err?.message || 'Could not deploy containment');
    } finally {
      setDeploying(false);
    }
  };
  const [selectedOutbreakId, setSelectedOutbreakId] = useState<string | null>(initialOutbreakId || null);
  const [diseaseFilter, setDiseaseFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | OutbreakRiskScore>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OutbreakStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedReport, setInspectedReport] = useState<DiseaseReportResponse | null>(null);

  // Sync initialOutbreakId prop
  useEffect(() => {
    if (initialOutbreakId) {
      setSelectedOutbreakId(initialOutbreakId);
    }
  }, [initialOutbreakId]);

  // 1. Fetch All Active / Filtered Outbreak Clusters
  const outbreaksQuery = useQuery({
    queryKey: ['intelligenceOutbreaks', statusFilter],
    queryFn: () => gisService.getOutbreaks(statusFilter === 'ALL' ? undefined : statusFilter),
    refetchInterval: 30000,
  });
  const {
    data: allOutbreaks = [],
    isLoading: isLoadingOutbreaks,
    isError: isErrorOutbreaks,
    refetch: refetchOutbreaks,
  } = outbreaksQuery;

  // Only the cluster list polls; the detail and report queries below are gated on
  // a selection and are not expected to refresh on their own.
  const freshness = useDataFreshness([outbreaksQuery]);

  // 2. Fetch Selected Outbreak Details (if selected)
  const {
    data: activeOutbreakDetail,
  } = useQuery({
    queryKey: ['outbreakDetail', selectedOutbreakId],
    queryFn: () => (selectedOutbreakId ? diseaseService.getOutbreak(selectedOutbreakId) : Promise.resolve(null)),
    enabled: Boolean(selectedOutbreakId),
  });

  // 3. Fetch Contributing Reports for Selected Outbreak
  const {
    data: contributingReports = [],
    isLoading: isLoadingReports,
  } = useQuery({
    queryKey: ['outbreakReports', selectedOutbreakId],
    queryFn: () => (selectedOutbreakId ? gisService.getReportsForOutbreak(selectedOutbreakId) : Promise.resolve([])),
    enabled: Boolean(selectedOutbreakId),
  });

  // Extract unique disease names for filter dropdown
  const availableDiseases = useMemo(() => {
    const set = new Set<string>();
    allOutbreaks.forEach((o) => set.add(o.diseaseName));
    return Array.from(set).sort();
  }, [allOutbreaks]);

  // Apply filters including administrative scope
  const filteredOutbreaks = useMemo(() => {
    return allOutbreaks.filter((o) => {
      if (selectedScope && !isOutbreakInScope(o, selectedScope)) return false;
      if (diseaseFilter !== 'ALL' && o.diseaseName !== diseaseFilter) return false;
      if (riskFilter !== 'ALL' && o.riskScore !== riskFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchDisease = o.diseaseName.toLowerCase().includes(query);
        const matchId = o.id.toLowerCase().includes(query);
        if (!matchDisease && !matchId) return false;
      }
      return true;
    });
  }, [allOutbreaks, diseaseFilter, riskFilter, searchQuery]);

  const selectedOutbreak = useMemo(() => {
    if (!selectedOutbreakId) return null;
    return activeOutbreakDetail || allOutbreaks.find((o) => o.id === selectedOutbreakId) || null;
  }, [selectedOutbreakId, activeOutbreakDetail, allOutbreaks]);

  const handleSelectOutbreak = (outbreak: OutbreakResponse) => {
    setSelectedOutbreakId(outbreak.id);
    onSelectOutbreakId?.(outbreak.id);
  };

  const handleClearSelection = () => {
    setSelectedOutbreakId(null);
    onSelectOutbreakId?.(null);
  };

  return (
    <div className="space-y-5" data-testid="outbreak-intelligence-page">
      <DataFreshnessBanner freshness={freshness} subject="outbreak intelligence" />

      {/* Top Header Command Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E6EC] rounded-[6px] px-4 py-3 shadow-subtle">
        <div className="flex items-center gap-3">
          {onBackToOverview && !selectedOutbreak && (
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
                Outbreak Intelligence & Deep Dossier Analysis
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#FEF3E8] text-[#D97B1F] text-[10px] font-mono font-bold">
                <Flame className="w-3 h-3 text-[#D97B1F]" />
                <span>MultiSignalRiskEngine</span>
              </span>
            </div>
            <p className="text-xs text-[#526074] mt-0.5 font-mono">
              Spatial Clusters · 4-Signal Multi-Signal Breakdown · Traceable Field Case Logs
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedScope && !isStatewide(selectedScope) && (
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-[#E4EDF6] text-[#1E5C97] border border-[#BED2E8] rounded-[4px] text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Scope: <strong>{selectedScope}</strong></span>
              {onScopeChange && (
                <button
                  onClick={() => onScopeChange('Maharashtra (Statewide)')}
                  className="ml-1 text-[10px] underline font-bold hover:text-[#101826]"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              downloadCsv(
                'PashuSathi_Outbreaks_' + selectedScope.replace(/\s+/g, '_'),
                ['Cluster ID', 'Disease', 'Severity', 'Risk Score', 'Composite Score', 'Latitude', 'Longitude', 'Radius (km)', 'Affected Cases', 'Status', 'Updated At'],
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
                  o.updatedAt,
                ])
              );
            }}
            className="font-mono text-xs text-[#101826]"
            title="Export filtered outbreak intelligence as CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#1E5C97]" />
            <span>Export Dossiers (CSV)</span>
          </Button>

          {selectedOutbreak && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setContainmentResult(null);
                setContainmentModalOpen(true);
              }}
              className="font-mono text-xs bg-[#B7301F] hover:bg-[#922417] text-white border-none"
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              <span>Deploy Containment Protocol</span>
            </Button>
          )}

          <button
            onClick={() => refetchOutbreaks()}
            disabled={isLoadingOutbreaks}
            className="p-1.5 text-[#526074] hover:text-[#1E5C97] hover:bg-[#E4EDF6] rounded-[3px] border border-[#E1E6EC] transition-colors disabled:opacity-40"
            title="Refresh Outbreak Intelligence"
            aria-label="Refresh Outbreak Intelligence"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOutbreaks ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Containment Protocol Active Confirmation Toast */}
      {containmentResult && (
        <div className="bg-[#EDF7F0] border border-[#BFE4C9] p-3 rounded-[6px] text-xs font-mono text-[#2E6930] flex items-center justify-between shadow-subtle animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2E6930] shrink-0" />
            <span>
              <strong>CONTAINMENT DEPLOYED:</strong> {containmentResult.campaignNote}
              {containmentResult.campaignName ? ` (${containmentResult.campaignName})` : ''} Advisory pushed to{' '}
              {containmentResult.farmersNotified} farmer(s) within ±{Math.round(containmentResult.radiusKm)} km and{' '}
              {containmentResult.vetsNotified} vet(s) within 50 km; {containmentResult.paraVetsNotified ?? 0} para-vet(s) called to run the vaccination drive.
            </span>
          </div>
          <button onClick={() => setContainmentResult(null)} className="text-[10px] underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Containment Directive Modal */}
      {containmentModalOpen && selectedOutbreak && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] border border-[#C7D0DB] shadow-2xl max-w-lg w-full p-5 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-[#E1E6EC] pb-3">
              <div className="flex items-center gap-2 text-[#B7301F]">
                <ShieldAlert className="w-5 h-5" />
                <h2 className="text-sm font-bold text-[#101826] uppercase">Deploy Containment</h2>
              </div>
              <button onClick={() => setContainmentModalOpen(false)} className="text-[#526074] hover:text-[#101826] text-sm">✕</button>
            </div>

            <div className="space-y-2 text-[#526074]">
              <p><strong className="text-[#101826]">Target Outbreak:</strong> {selectedOutbreak.diseaseName} ({selectedOutbreak.id})</p>
              <p><strong className="text-[#101826]">Operational Buffer:</strong> ±{selectedOutbreak.radiusKm} km containment perimeter</p>
              <p><strong className="text-[#101826]">Risk Level:</strong> <span className="text-[#B7301F] font-bold">{selectedOutbreak.riskScore} ({selectedOutbreak.compositeRiskScore ?? 'N/A'}/100)</span></p>
              <div className="bg-[#F8FAFC] border border-[#E1E6EC] p-3 rounded space-y-1 text-[11px]">
                <div className="font-bold text-[#101826] mb-1">This will:</div>
                <div>1. Launch a ring-vaccination campaign for this outbreak (or reuse the one already open)</div>
                <div>2. Push an advisory to every registered farmer within ±{selectedOutbreak.radiusKm} km</div>
                <div>3. Push a containment notice to vets within 50 km</div>
                <div>4. Call approved para-vets nearby to run the drive and record each dose</div>
              </div>
              <label className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-[#101826] font-bold">Planned vaccine doses</span>
                <input
                  type="number"
                  min={1}
                  value={plannedDoses}
                  onChange={(e) => setPlannedDoses(Math.max(1, Number(e.target.value) || 1))}
                  className="w-28 px-2 py-1 border border-[#C7D0DB] rounded text-right"
                />
              </label>
              {containmentError && <p className="text-[#B7301F] text-[11px]">{containmentError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E1E6EC]">
              <Button variant="secondary" size="sm" onClick={() => setContainmentModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-[#B7301F] hover:bg-[#922417] text-white border-none"
                disabled={deploying}
                onClick={deployContainment}
              >
                {deploying ? 'Deploying…' : 'Confirm & Deploy'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {isErrorOutbreaks ? (
        <div className="p-8 bg-white border border-[#F5C2C7] rounded-[6px] text-center text-xs font-mono text-[#6E1423]">
          <AlertTriangle className="w-8 h-8 mx-auto text-[#6E1423] mb-2" />
          <p className="font-bold text-sm">Failed to Ingest Outbreak Intelligence Data</p>
          <p className="text-[#526074] mt-1">Unable to connect to Outbreak Intelligence endpoints.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetchOutbreaks()}
            className="mt-3 font-mono"
          >
            Retry Telemetry Ingestion
          </Button>
        </div>
      ) : selectedOutbreak ? (
        /* SINGLE OUTBREAK DEEP DIVE VIEW */
        <div className="space-y-5">
          {/* Header Card */}
          <OutbreakHeaderCard
            outbreak={selectedOutbreak}
            onBackToList={handleClearSelection}
            onViewOnMap={(id) => onNavigateToMap?.(id)}
          />

          {/* 4-Signal Multi-Signal Decomposition */}
          <FourSignalRiskDecomposition outbreak={selectedOutbreak} />

          {/* Confirmed vs Suspected & Diagnostics Verification */}
          <ConfirmedVsSuspectedAnalysis reports={contributingReports} />

          {/* Epidemiological Case Progression Timeline */}
          <OutbreakEpidemiologicalTimeline reports={contributingReports} />

          {/* Traceable Contributing Reports Ledger */}
          <ContributingReportsLedger
            reports={contributingReports}
            isLoading={isLoadingReports}
            onInspectReport={(report) => setInspectedReport(report)}
          />
        </div>
      ) : (
        /* ALL OUTBREAKS COMPARISON & THREAT MATRIX VIEW */
        <div className="space-y-5">
          {/* Filter Toolbar */}
          <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3 shadow-subtle flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#101826] uppercase pr-2 border-r border-[#E1E6EC]">
                <Filter className="w-3.5 h-3.5 text-[#1E5C97]" />
                <span>Filters</span>
              </div>

              {/* Disease */}
              <div className="flex items-center gap-1">
                <label className="text-[11px] font-mono text-[#526074]">Disease:</label>
                <select
                  value={diseaseFilter}
                  onChange={(e) => setDiseaseFilter(e.target.value)}
                  className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded px-2 py-1 text-[#101826] focus:outline-none focus:border-[#1E5C97]"
                >
                  <option value="ALL">All Diseases</option>
                  {availableDiseases.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Risk Level */}
              <div className="flex items-center gap-1">
                <label className="text-[11px] font-mono text-[#526074]">Risk Level:</label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value as 'ALL' | OutbreakRiskScore)}
                  className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded px-2 py-1 text-[#101826] focus:outline-none focus:border-[#1E5C97]"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">CRITICAL ({RISK_CONFIG.CRITICAL.scoreRangeLabel})</option>
                  <option value="HIGH">HIGH ({RISK_CONFIG.HIGH.scoreRangeLabel})</option>
                  <option value="MEDIUM">MEDIUM ({RISK_CONFIG.MEDIUM.scoreRangeLabel})</option>
                  <option value="LOW">LOW ({RISK_CONFIG.LOW.scoreRangeLabel})</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1">
                <label className="text-[11px] font-mono text-[#526074]">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'ALL' | OutbreakStatus)}
                  className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded px-2 py-1 text-[#101826] focus:outline-none focus:border-[#1E5C97]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CONTAINED">CONTAINED</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#526074] absolute left-2 top-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cluster ID or disease..."
                  className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded pl-7 pr-2 py-1 text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] w-52"
                />
              </div>

              <div className="text-[11px] font-mono bg-[#E4EDF6] text-[#1E5C97] px-2.5 py-1 rounded font-semibold border border-[#BED2E8]">
                {filteredOutbreaks.length} Visible
              </div>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <OutbreakComparisonMatrix
            outbreaks={filteredOutbreaks}
            onSelectOutbreak={handleSelectOutbreak}
          />

          {/* Geographic Threat Hierarchy */}
          <GeographicThreatRanking
            outbreaks={filteredOutbreaks}
            onSelectOutbreak={handleSelectOutbreak}
          />
        </div>
      )}

      {/* Case Detail Modal / Drawer */}
      <CaseDetailDrawer
        report={inspectedReport}
        onClose={() => setInspectedReport(null)}
      />
    </div>
  );
};
