import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Map as MapIcon,
  Table,
  Radio,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronLeft,
} from 'lucide-react';
import { gisService } from '../core/api/gisService';
import { OutbreakResponse } from '../core/types/outbreak.types';
import { DiseaseReportResponse } from '../core/types/disease.types';
import { DEFAULT_GIS_FILTERS, GisFilterState } from '../core/types/gis.types';
import { GisFilterBar } from '../components/gis/GisFilterBar';
import { SurveillanceMap } from '../components/gis/SurveillanceMap';
import { OutbreakDossierDrawer } from '../components/gis/OutbreakDossierDrawer';
import { CaseDetailDrawer } from '../components/gis/CaseDetailDrawer';
import { OutbreakAccessibleListView } from '../components/gis/OutbreakAccessibleListView';
import { Button } from '../components/ui/Button';
import { isOutbreakInScope, isReportInScope, getScopeConfig, isStatewide, downloadCsv } from '../core/utils/scopeFilter';
import { Download, MapPin } from 'lucide-react';

interface SurveillanceMapPageProps {
  onBackToOverview?: () => void;
  onNavigateToIntelligence?: (outbreakId: string) => void;
  initialSelectedOutbreakId?: string | null;
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
}

export const SurveillanceMapPage: React.FC<SurveillanceMapPageProps> = ({
  onBackToOverview,
  onNavigateToIntelligence,
  initialSelectedOutbreakId,
  selectedScope,
  onScopeChange,
}) => {
  const [filters, setFilters] = useState<GisFilterState>(DEFAULT_GIS_FILTERS);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [selectedOutbreak, setSelectedOutbreak] = useState<OutbreakResponse | null>(null);
  const [selectedReport, setSelectedReport] = useState<DiseaseReportResponse | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  // Synchronize administrative scope from top bar with district filter
  React.useEffect(() => {
    if (!selectedScope || isStatewide(selectedScope)) {
      setFilters((prev) => ({ ...prev, district: 'ALL' }));
    } else {
      const cfg = getScopeConfig(selectedScope);
      setFilters((prev) => ({ ...prev, district: cfg.district }));
    }
  }, [selectedScope]);


  // 1. Fetch Outbreak Clusters from Backend
  const {
    data: allOutbreaks = [],
    isLoading: isLoadingOutbreaks,
    isError: isErrorOutbreaks,
    refetch: refetchOutbreaks,
  } = useQuery({
    queryKey: ['gisOutbreaks', filters.status],
    queryFn: async () => {
      const data = await gisService.getOutbreaks(
        filters.status === 'ALL' ? undefined : filters.status
      );
      setLastRefreshedAt(new Date());
      return data;
    },
    refetchInterval: 30000,
  });

  // 2. Fetch Recent Surveillance Reports for Point Overlays
  const { data: reportsPage } = useQuery({
    queryKey: ['gisReports'],
    queryFn: () => gisService.getRecentReports(0, 100),
    refetchInterval: 30000,
  });

  // 2b. Fetch AI Preliminary Screenings for GIS Point Overlays
  const { data: rawAiScreenings = [] } = useQuery({
    queryKey: ['aiScreenings'],
    queryFn: () => gisService.getAIScreenings(),
    refetchInterval: 30000,
  });

  // 3. Fetch Spatial Heatmap KDE Points (if toggled)
  const { data: heatmapPoints = [] } = useQuery({
    queryKey: ['gisHeatmap'],
    queryFn: gisService.getHeatmapData,
    enabled: filters.showHeatmap,
  });

  // 4. Fetch Real Administrative Boundaries GeoJSON from Backend
  const { data: boundaries } = useQuery({
    queryKey: ['gisBoundaries', filters.district],
    queryFn: async () => {
      if (typeof gisService.getAdministrativeBoundaries !== 'function') {
        return { type: 'FeatureCollection' as const, features: [] };
      }
      return gisService.getAdministrativeBoundaries(
        'ALL',
        filters.district === 'ALL' ? undefined : filters.district
      );
    },
    staleTime: Infinity, // Administrative boundaries are stable static geometry
  });

  // 5. Fetch Dynamic Available District Names directly from Backend Dataset
  const { data: dynamicDistricts = [] } = useQuery({
    queryKey: ['geoDistricts'],
    queryFn: async () => {
      if (typeof gisService.getDistricts === 'function') {
        return gisService.getDistricts();
      }
      return [];
    },
    staleTime: Infinity,
  });

  // Dynamic District List derived from Backend API or GeoJSON properties (Zero hardcoded constants)
  const availableDistricts = useMemo(() => {
    if (dynamicDistricts && dynamicDistricts.length > 0) {
      return dynamicDistricts;
    }
    if (boundaries && boundaries.features) {
      const set = new Set<string>();
      boundaries.features.forEach((f) => {
        if (f.properties?.district) {
          set.add(f.properties.district);
        } else if (f.properties?.administrativeLevel === 'DISTRICT' && f.properties?.name) {
          set.add(f.properties.name);
        }
      });
      return Array.from(set).sort();
    }
    return [];
  }, [dynamicDistricts, boundaries]);

  // Extract Unique Diseases from Loaded Data for Filter Dropdown
  const availableDiseases = useMemo(() => {
    const set = new Set<string>();
    allOutbreaks.forEach((o) => set.add(o.diseaseName));
    (reportsPage?.content || []).forEach((r) => set.add(r.diseaseName));
    return Array.from(set).sort();
  }, [allOutbreaks, reportsPage]);

  // Set initial selected outbreak if passed as prop
  React.useEffect(() => {
    if (initialSelectedOutbreakId && allOutbreaks.length > 0) {
      const match = allOutbreaks.find((o) => o.id === initialSelectedOutbreakId);
      if (match) setSelectedOutbreak(match);
    }
  }, [initialSelectedOutbreakId, allOutbreaks]);

  // 6. Apply Client Filter Predicates to Outbreaks with Scope Filtering
  const filteredOutbreaks = useMemo(() => {
    return allOutbreaks.filter((o) => {
      if (selectedScope && !isOutbreakInScope(o, selectedScope)) return false;
      if (filters.disease !== 'ALL' && o.diseaseName !== filters.disease) return false;
      if (filters.riskLevel !== 'ALL' && o.riskScore !== filters.riskLevel) return false;
      if (filters.status !== 'ALL' && o.status !== filters.status) return false;
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchDisease = o.diseaseName.toLowerCase().includes(query);
        const matchId = o.id.toLowerCase().includes(query);
        if (!matchDisease && !matchId) return false;
      }
      return true;
    });
  }, [allOutbreaks, filters]);

  // 6b. Apply Filter Predicates to AI Screenings
  const filteredAiScreenings = useMemo(() => {
    return rawAiScreenings.filter((s) => {
      if (selectedScope && !isStatewide(selectedScope)) {
        const sc = getScopeConfig(selectedScope);
        const sDist = (s.district || '').toLowerCase();
        const sTal = (s.taluka || '').toLowerCase();
        const matchesScope = sc.keywords.some(kw => sDist.includes(kw) || sTal.includes(kw));
        if (!matchesScope && sDist !== sc.district.toLowerCase()) return false;
      }
      if (filters.disease !== 'ALL' && s.preliminaryDiagnosis !== filters.disease) return false;
      if (filters.district !== 'ALL' && s.district !== filters.district) return false;
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchDisease = s.preliminaryDiagnosis.toLowerCase().includes(query);
        const matchTag = s.tagNumber?.toLowerCase().includes(query);
        const matchDistrict = s.district?.toLowerCase().includes(query);
        if (!matchDisease && !matchTag && !matchDistrict) return false;
      }
      return true;
    });
  }, [rawAiScreenings, filters]);

  // 7. Apply Client Filter Predicates to Field Reports
  const filteredReports = useMemo(() => {
    const rawReports = reportsPage?.content || [];
    return rawReports.filter((r) => {
      if (selectedScope && !isReportInScope(r, selectedScope)) return false;
      if (filters.disease !== 'ALL' && r.diseaseName !== filters.disease) return false;
      if (filters.diagnosisStatus !== 'ALL' && r.diagnosisStatus !== filters.diagnosisStatus)
        return false;
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchDisease = r.diseaseName.toLowerCase().includes(query);
        const matchTag = r.tagNumber?.toLowerCase().includes(query);
        if (!matchDisease && !matchTag) return false;
      }
      return true;
    });
  }, [reportsPage, filters]);

  const handleFilterUpdate = (updated: Partial<GisFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_GIS_FILTERS);
  };

  return (
    <div className="space-y-4" data-testid="surveillance-map-page">
      {/* Top Page Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E1E6EC] rounded-[6px] px-4 py-3 shadow-subtle">
        <div className="flex items-center gap-3">
          {onBackToOverview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBackToOverview}
              className="font-mono text-xs text-[#526074]"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Overview
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#E4EDF6] flex items-center justify-center text-[#1E5C97]">
              <MapIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#101826] leading-tight">
                  Live GIS Epidemiological Surveillance Map
                </h1>
                <span className="text-[10px] font-mono font-semibold bg-[#E4EDF6] text-[#1E5C97] px-1.5 py-0.5 rounded border border-[#BED2E8]">
                  PostGIS RFC 7946 Stream
                </span>
              </div>
              <p className="text-xs text-[#526074] font-mono">
                Statewide spatial cluster tracking · WGS84 GeoJSON vectors · Administrative boundary layers
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F6F8FA] border border-[#C7D0DB] p-0.5 rounded-[4px]">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-[3px] transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-[#101826] font-semibold shadow-subtle'
                  : 'text-[#526074] hover:text-[#101826]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Spatial Map View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-[3px] transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-[#101826] font-semibold shadow-subtle'
                  : 'text-[#526074] hover:text-[#101826]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Accessible Table (WCAG)</span>
            </button>
          </div>

          {selectedScope && !isStatewide(selectedScope) && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#E4EDF6] text-[#1E5C97] border border-[#BED2E8] rounded-[4px] text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Scope: <strong>{selectedScope}</strong> ({filteredOutbreaks.length} Clusters)</span>
              {onScopeChange && (
                <button
                  onClick={() => onScopeChange('Maharashtra (Statewide)')}
                  className="ml-1.5 text-[10px] underline font-bold hover:text-[#101826]"
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
                'PashuSathi_GIS_Outbreaks_' + (selectedScope || 'Statewide').replace(/\s+/g, '_'),
                ['Outbreak ID', 'Disease Name', 'Severity', 'Risk Score', 'Composite Score', 'Latitude', 'Longitude', 'Radius (km)', 'Affected Cases', 'Status'],
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
                ])
              );
            }}
            className="font-mono text-xs text-[#526074]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Export GIS (CSV)</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetchOutbreaks()}
            className="font-mono text-xs text-[#526074]"
            title="Force refresh live telemetry"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* GIS Operational Filter Bar with Dynamically Sourced Districts */}
      <GisFilterBar
        filters={filters}
        onFilterChange={handleFilterUpdate}
        onResetFilters={handleResetFilters}
        availableDiseases={availableDiseases}
        availableDistricts={availableDistricts}
        totalVisibleCount={filteredOutbreaks.length}
      />

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <div className="relative">
          {isLoadingOutbreaks ? (
            <div className="w-full h-[620px] bg-white border border-[#E1E6EC] rounded-[6px] flex flex-col items-center justify-center gap-3 font-mono text-xs text-[#526074]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#1E5C97]" />
              <span>Loading spatial epidemiological vectors...</span>
            </div>
          ) : isErrorOutbreaks ? (
            <div className="w-full h-[620px] bg-white border border-[#F5C2C7] rounded-[6px] flex flex-col items-center justify-center gap-3 font-mono text-xs text-[#B7301F] p-6 text-center">
              <AlertTriangle className="w-8 h-8" />
              <strong className="text-sm">Failed to Ingest Spatial Outbreak Telemetry</strong>
              <p className="text-[#526074] max-w-md">
                Unable to establish connection with PostGIS outbreak detection cluster. Verify service readiness or retry ingestion.
              </p>
              <Button size="sm" onClick={() => refetchOutbreaks()}>
                Retry Ingestion
              </Button>
            </div>
          ) : (
            <SurveillanceMap
              outbreaks={filteredOutbreaks}
              reports={filteredReports}
              aiScreenings={filteredAiScreenings}
              heatmapPoints={heatmapPoints}
              boundaries={boundaries}
              filters={filters}
              selectedOutbreakId={selectedOutbreak?.id}
              onSelectOutbreak={(o) => setSelectedOutbreak(o)}
              onSelectReport={(r) => setSelectedReport(r)}
              height="620px"
              scope={selectedScope}
            />
          )}
        </div>
      ) : (
        <OutbreakAccessibleListView
          outbreaks={filteredOutbreaks}
          onSelectOutbreak={(o) => setSelectedOutbreak(o)}
        />
      )}

      {/* Informational GIS Legend Footer */}
      <div className="bg-[#F6F8FA] border border-[#E1E6EC] rounded-[4px] px-3.5 py-2.5 text-xs font-mono text-[#526074] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#1E5C97]" />
          <span>
            <strong>Spatial Scope:</strong> Real administrative boundary GeoJSON active (State, Districts, Talukas) via <code className="text-[#1E5C97]">/api/v1/geo/boundaries</code>.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#93A1B0]">
          <Radio className="w-3 h-3 text-[#1B806A] animate-pulse" />
          <span>Telemetry Stream: Synchronized {lastRefreshedAt.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Outbreak Dossier Drawer (Right Sidebar) */}
      <OutbreakDossierDrawer
        outbreak={selectedOutbreak}
        onClose={() => setSelectedOutbreak(null)}
        onNavigateToIntelligence={onNavigateToIntelligence}
      />

      {/* Case Point Detail Drawer (Right Sidebar) */}
      <CaseDetailDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};
