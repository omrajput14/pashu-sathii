import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { diseaseService } from '../core/api/diseaseService';
import { DiseaseReportResponse } from '../core/types/disease.types';
import { FieldReportsFilterBar } from '../components/reports/FieldReportsFilterBar';
import { FieldReportsLedgerTable } from '../components/reports/FieldReportsLedgerTable';
import { AIScreeningsLedgerTable } from '../components/reports/AIScreeningsLedgerTable';
import { CaseDetailDrawer } from '../components/gis/CaseDetailDrawer';
import { FileSpreadsheet, RefreshCw, Sparkles, Activity, Download, MapPin } from 'lucide-react';
import { isReportInScope, isStatewide, getScopeConfig, downloadCsv } from '../core/utils/scopeFilter';
import { Button } from '../components/ui/Button';

interface FieldSurveillanceReportsPageProps {
  inspectedReportId?: string | null;
  onNavigateToOutbreak?: (outbreakId: string) => void;
  onNavigateToMap?: () => void;
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
}

export const FieldSurveillanceReportsPage: React.FC<FieldSurveillanceReportsPageProps> = ({
  inspectedReportId,
  selectedScope = 'Maharashtra (Statewide)',
  onScopeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'clinical' | 'ai_screenings'>('clinical');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<DiseaseReportResponse | null>(null);




  // 1. Fetch paginated clinical disease reports
  const {
    data: pageData,
    isLoading: isLoadingReports,
    isRefetching: isRefetchingReports,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['fieldReports', currentPage, pageSize],
    queryFn: () => diseaseService.listReports(currentPage, pageSize, 'createdAt,desc'),
    refetchInterval: 30000,
  });

  // Auto-select inspected report when provided via navigation
  React.useEffect(() => {
    if (inspectedReportId && pageData?.content) {
      const match = pageData.content.find((r) => r.id === inspectedReportId);
      if (match) setSelectedReport(match);
    }
  }, [inspectedReportId, pageData]);

  // 2. Fetch paginated AI preliminary screenings
  const {
    data: aiPageData,
    isLoading: isLoadingAI,
    isRefetching: isRefetchingAI,
    refetch: refetchAI,
  } = useQuery({
    queryKey: ['aiScreeningsPage', currentPage, pageSize],
    queryFn: () => diseaseService.listAIScreeningsPaginated(currentPage, pageSize),
    refetchInterval: 30000,
  });

  // 3. Fetch disease registry for filter dropdown
  const { data: registry = [] } = useQuery({
    queryKey: ['diseaseRegistry'],
    queryFn: diseaseService.getDiseaseRegistry,
  });

  const diseaseList = useMemo(() => {
    if (registry.length > 0) {
      return registry.map((r) => r.diseaseName);
    }
    const fromReports = (pageData?.content || []).map((r) => r.diseaseName);
    return Array.from(new Set(fromReports));
  }, [registry, pageData]);

  // Client-side filtration for clinical disease reports
  const filteredPageData = useMemo(() => {
    if (!pageData) return undefined;
    const content = pageData.content.filter((r) => {
      if (selectedScope && !isReportInScope(r, selectedScope)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchTag = r.tagNumber?.toLowerCase().includes(q) || false;
        const matchDisease = r.diseaseName.toLowerCase().includes(q);
        const matchReporter = r.reportedByName?.toLowerCase().includes(q) || false;
        const matchNotes = r.notes?.toLowerCase().includes(q) || false;
        if (!matchId && !matchTag && !matchDisease && !matchReporter && !matchNotes) {
          return false;
        }
      }
      if (selectedDisease !== 'ALL' && r.diseaseName !== selectedDisease) {
        return false;
      }
      if (selectedStatus !== 'ALL' && r.diagnosisStatus !== selectedStatus) {
        return false;
      }
      if (selectedConfidence !== 'ALL' && r.diagnosisConfidenceSource !== selectedConfidence) {
        return false;
      }
      return true;
    });

    return {
      ...pageData,
      content,
      totalElements:
        searchQuery || selectedDisease !== 'ALL' || selectedStatus !== 'ALL' || selectedConfidence !== 'ALL'
          ? content.length
          : pageData.totalElements,
    };
  }, [pageData, searchQuery, selectedDisease, selectedStatus, selectedConfidence]);

  // Client-side filtration for AI preliminary screenings
  const filteredAIPageData = useMemo(() => {
    if (!aiPageData) return undefined;
    const content = aiPageData.content.filter((s) => {
      if (selectedScope && !isStatewide(selectedScope)) {
        const sc = getScopeConfig(selectedScope);
        const sDist = (s.district || '').toLowerCase();
        const sTal = (s.taluka || '').toLowerCase();
        const matches = sc.keywords.some((kw) => sDist.includes(kw) || sTal.includes(kw)) || sDist === sc.district.toLowerCase();
        if (!matches) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = s.id.toLowerCase().includes(q);
        const matchTag = s.tagNumber?.toLowerCase().includes(q) || false;
        const matchDisease = s.preliminaryDiagnosis.toLowerCase().includes(q);
        const matchAnimal = s.animalName?.toLowerCase().includes(q) || false;
        const matchDistrict = s.district?.toLowerCase().includes(q) || false;
        if (!matchId && !matchTag && !matchDisease && !matchAnimal && !matchDistrict) {
          return false;
        }
      }
      if (selectedDisease !== 'ALL' && s.preliminaryDiagnosis !== selectedDisease) {
        return false;
      }
      return true;
    });

    return {
      ...aiPageData,
      content,
      totalElements: searchQuery || selectedDisease !== 'ALL' ? content.length : aiPageData.totalElements,
    };
  }, [aiPageData, searchQuery, selectedDisease]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDisease('ALL');
    setSelectedStatus('ALL');
    setSelectedConfidence('ALL');
    setCurrentPage(0);
  };

  const handleSelectReport = (report: DiseaseReportResponse) => {
    setSelectedReport(report);
  };


  const handleExportCsv = () => {
    if (activeTab === 'clinical') {
      const rows = (filteredPageData?.content || []).map((r) => [
        r.id,
        r.tagNumber || '',
        r.diseaseName,
        r.diagnosisStatus,
        r.diagnosisConfidenceSource,
        r.reportedByName || '',
        r.latitude || '',
        r.longitude || '',
        r.notes || '',
        r.createdAt,
      ]);
      downloadCsv(
        'PashuSathi_Clinical_Reports_' + selectedScope.replace(/\s+/g, '_'),
        ['Report ID', 'Animal Tag', 'Disease Name', 'Status', 'Confidence Source', 'Reporter', 'Latitude', 'Longitude', 'Clinical Notes', 'Reported At'],
        rows
      );
    } else {
      const rows = (filteredAIPageData?.content || []).map((s) => [
        s.id,
        s.tagNumber || '',
        s.species || '',
        s.preliminaryDiagnosis,
        s.confidenceScore ? `${(s.confidenceScore * 100).toFixed(1)}%` : '',
        s.district || '',
        s.taluka || '',
        s.status || '',
        s.createdAt,
      ]);
      downloadCsv(
        'PashuSathi_AI_Screenings_' + selectedScope.replace(/\s+/g, '_'),
        ['Scan ID', 'Animal Tag', 'Species', 'Preliminary Diagnosis', 'Confidence', 'District', 'Taluka', 'Verification Status', 'Screened At'],
        rows
      );
    }
  };

  const isRefetching = activeTab === 'clinical' ? isRefetchingReports : isRefetchingAI;
  const handleRefetch = () => {
    if (activeTab === 'clinical') {
      refetchReports();
    } else {
      refetchAI();
    }
  };

  // KPIs derived from actual backend records
  const allReports = pageData?.content || [];
  const confirmedCount = allReports.filter((r) => r.diagnosisStatus === 'CONFIRMED').length;
  const suspectedCount = allReports.filter((r) => r.diagnosisStatus === 'SUSPECTED').length;
  const aiScreenings = aiPageData?.content || [];
  const pendingAiCount = aiScreenings.filter((s) => !s.veterinarianVerified).length;

  return (
    <div className="space-y-4 select-none pb-12">
      {/* Header & Refresh Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[6px] border border-[#E1E6EC] shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#1E5C97]" />
            <h1 className="text-base font-bold text-[#101826] tracking-tight">
              Field Surveillance Operations & Clinical Reports
            </h1>
          </div>
          <p className="text-xs text-[#526074] mt-0.5 font-mono">
            Statewide field surveillance telemetry, clinical case filings, and AI preliminary early-warning signals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F6F8FA] border border-[#C7D0DB] p-0.5 rounded-[4px]">
            <button
              onClick={() => {
                setActiveTab('clinical');
                setCurrentPage(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-[3px] transition-colors ${
                activeTab === 'clinical'
                  ? 'bg-white text-[#101826] font-semibold shadow-subtle'
                  : 'text-[#526074] hover:text-[#101826]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span>Clinical Reports</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ai_screenings');
                setCurrentPage(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-[3px] transition-colors ${
                activeTab === 'ai_screenings'
                  ? 'bg-white text-[#101826] font-semibold shadow-subtle'
                  : 'text-[#526074] hover:text-[#101826]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>AI Preliminary Signals</span>
              {aiPageData && (
                <span className="text-[10px] bg-[#EDE9FE] text-[#6366F1] font-bold px-1.5 py-0.2 rounded-full">
                  {aiPageData.totalElements}
                </span>
              )}
            </button>
          </div>

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
            onClick={handleExportCsv}
            className="font-mono text-xs text-[#101826]"
            title="Export filtered reports as CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#1E5C97]" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefetch}
            disabled={isRefetching}
            className="font-mono text-xs text-[#526074]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Polling...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* High-Level Operational Summary Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold">
            Total Clinical Reports
          </span>
          <div className="text-xl font-bold font-mono text-[#101826] mt-1">
            {pageData?.totalElements ?? '—'}
          </div>
          <span className="text-[10px] font-mono text-[#526074]">Veterinarian / Lab Filings</span>
        </div>

        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <span className="text-[#B7301F]">■</span>
            <span>Verified Confirmed Cases</span>
          </span>
          <div className="text-xl font-bold font-mono text-[#B7301F] mt-1">
            {confirmedCount}
          </div>
          <span className="text-[10px] font-mono text-[#526074]">Lab/Vet Confirmed</span>
        </div>

        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <span className="text-[#D97B1F]">◇</span>
            <span>Suspected / Field Triage</span>
          </span>
          <div className="text-xl font-bold font-mono text-[#D97B1F] mt-1">
            {suspectedCount}
          </div>
          <span className="text-[10px] font-mono text-[#526074]">Provisional Reports</span>
        </div>

        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle">
          <span className="text-[10px] font-mono uppercase text-[#6366F1] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#6366F1]" />
            <span>AI Signals Awaiting Vet</span>
          </span>
          <div className="text-xl font-bold font-mono text-[#6366F1] mt-1">
            {pendingAiCount}
          </div>
          <span className="text-[10px] font-mono text-[#526074]">Early-Warning Screenings</span>
        </div>
      </div>

      {/* Filter Bar */}
      <FieldReportsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDisease={selectedDisease}
        onDiseaseChange={setSelectedDisease}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedConfidence={selectedConfidence}
        onConfidenceChange={setSelectedConfidence}
        diseaseList={diseaseList}
        onReset={handleResetFilters}
      />

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'clinical' ? (
        <FieldReportsLedgerTable
          pageData={filteredPageData}
          isLoading={isLoadingReports}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(0);
          }}
          onSelectReport={handleSelectReport}
        />
      ) : (
        <AIScreeningsLedgerTable
          pageData={filteredAIPageData}
          isLoading={isLoadingAI}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(0);
          }}
        />
      )}

      {/* Case Detail Inspection Drawer */}
      <CaseDetailDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};
