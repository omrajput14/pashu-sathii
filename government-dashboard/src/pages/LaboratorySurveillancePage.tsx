import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { diseaseService } from '../core/api/diseaseService';
import { DiseaseReportResponse } from '../core/types/disease.types';
import { LabsSummaryStrip } from '../components/labs/LabsSummaryStrip';
import { DiagnosticSourceDistributionCard } from '../components/labs/DiagnosticSourceDistributionCard';
import { LabOutbreakCorrelationCard } from '../components/labs/LabOutbreakCorrelationCard';
import { LabsFilterBar } from '../components/labs/LabsFilterBar';
import { LaboratoryConfirmationTable } from '../components/labs/LaboratoryConfirmationTable';
import { FutureLimsIntegrationPanel } from '../components/labs/FutureLimsIntegrationPanel';
import { CaseDetailDrawer } from '../components/gis/CaseDetailDrawer';
import { FlaskConical, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LaboratorySurveillancePageProps {
  inspectedReportId?: string | null;
  onNavigateToOutbreak?: (outbreakId: string) => void;
  onNavigateToMap?: () => void;
  selectedScope?: string;
}

export const LaboratorySurveillancePage: React.FC<LaboratorySurveillancePageProps> = ({
  inspectedReportId,
  onNavigateToOutbreak,
  selectedScope = 'Maharashtra (Statewide)',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<DiseaseReportResponse | null>(null);

  // 1. Fetch surveillance reports
  const {
    data: reportsPage,
    isLoading: isReportsLoading,
    isError: isReportsError,
    error: reportsError,
    isRefetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['labSurveillanceReports'],
    queryFn: () => diseaseService.listReports(0, 100, 'createdAt,desc'),
    refetchInterval: 30000,
  });

  // 2. Fetch active outbreaks
  const { data: outbreaks = [], isLoading: isOutbreaksLoading } = useQuery({
    queryKey: ['activeOutbreaksForLabs'],
    queryFn: () => diseaseService.listOutbreaks(),
    refetchInterval: 30000,
  });

  // 3. Fetch disease registry for filter options
  const { data: registry = [] } = useQuery({
    queryKey: ['diseaseRegistry'],
    queryFn: diseaseService.getDiseaseRegistry,
  });

  const reports = useMemo(() => reportsPage?.content || [], [reportsPage]);

  // Handle inspectedReportId param
  React.useEffect(() => {
    if (inspectedReportId && reports.length > 0) {
      const match = reports.find((r) => r.id === inspectedReportId);
      if (match) {
        setSelectedReport(match);
      }
    }
  }, [inspectedReportId, reports]);

  const diseaseList = useMemo(() => {
    if (registry.length > 0) {
      return registry.map((r) => r.diseaseName);
    }
    const fromReports = reports.map((r) => r.diseaseName);
    return Array.from(new Set(fromReports));
  }, [registry, reports]);

  // Client-side filtering
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchTag = r.tagNumber?.toLowerCase().includes(q) || false;
        const matchAnimal = r.animalName?.toLowerCase().includes(q) || false;
        const matchDisease = r.diseaseName.toLowerCase().includes(q);
        const matchReporter = r.reportedByName?.toLowerCase().includes(q) || false;
        const matchNotes = r.notes?.toLowerCase().includes(q) || false;

        if (!matchId && !matchTag && !matchAnimal && !matchDisease && !matchReporter && !matchNotes) {
          return false;
        }
      }

      // Disease Filter
      if (selectedDisease !== 'ALL' && r.diseaseName !== selectedDisease) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL' && r.diagnosisStatus !== selectedStatus) {
        return false;
      }

      // Confidence Source Filter
      if (selectedConfidence !== 'ALL' && r.diagnosisConfidenceSource !== selectedConfidence) {
        return false;
      }

      return true;
    });
  }, [reports, searchQuery, selectedDisease, selectedStatus, selectedConfidence]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDisease('ALL');
    setSelectedStatus('ALL');
    setSelectedConfidence('ALL');
  };

  const formattedUpdatedAt = useMemo(() => {
    if (!dataUpdatedAt) return 'Pending sync';
    const secondsAgo = Math.floor((Date.now() - dataUpdatedAt) / 1000);
    if (secondsAgo < 10) return 'Just now';
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  }, [dataUpdatedAt]);

  if (isReportsError) {
    return (
      <div className="bg-white border border-[#F5C2C7] rounded-[6px] p-6 text-center text-xs font-mono space-y-3">
        <AlertCircle className="w-8 h-8 text-[#B7301F] mx-auto" />
        <h2 className="text-sm font-bold text-[#B7301F]">
          FAILED TO INGEST LABORATORY SURVEILLANCE TELEMETRY
        </h2>
        <p className="text-[#526074]">
          {(reportsError as Error)?.message || 'An error occurred while communicating with the PASHU SATHI API gateway.'}
        </p>
        <Button variant="primary" size="sm" onClick={() => refetch()} className="font-mono">
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Retry Gateway Connection</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[6px] border border-[#E1E6EC] shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#1E5C97]" />
            <h1 className="text-base font-bold text-[#101826] tracking-tight">
              Laboratory Surveillance & Diagnostic Intelligence
            </h1>
          </div>
          <p className="text-xs text-[#526074] mt-0.5 font-mono">
            Statewide diagnostic confirmation ledger, assay confidence breakdown, and future LIMS integration bridge.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#526074] bg-[#F8FAFC] px-2.5 py-1 rounded border border-[#E1E6EC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C4A] animate-pulse" />
            <span>Scope: <strong className="text-[#101826]">{selectedScope}</strong></span>
            <span>·</span>
            <span>Synced: <strong className="text-[#101826]">{formattedUpdatedAt}</strong></span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="font-mono text-xs text-[#526074]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Syncing...' : 'Refresh Records'}</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <LabsSummaryStrip
        reports={reports}
        outbreaks={outbreaks}
        isLoading={isReportsLoading || isOutbreaksLoading}
      />

      {/* Diagnostic Source Distribution & Active Lab Outbreak Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DiagnosticSourceDistributionCard reports={reports} />
        <LabOutbreakCorrelationCard
          outbreaks={outbreaks}
          reports={reports}
          onNavigateToOutbreak={onNavigateToOutbreak}
        />
      </div>

      {/* Filter and Search Bar */}
      <LabsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDisease={selectedDisease}
        onDiseaseChange={setSelectedDisease}
        diseaseList={diseaseList}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedConfidence={selectedConfidence}
        onConfidenceChange={setSelectedConfidence}
        onResetFilters={handleResetFilters}
        totalFiltered={filteredReports.length}
      />

      {/* Laboratory Confirmation Operational Ledger */}
      <LaboratoryConfirmationTable
        reports={filteredReports}
        outbreaks={outbreaks}
        onSelectReport={setSelectedReport}
        onNavigateToOutbreak={onNavigateToOutbreak}
        isLoading={isReportsLoading}
      />

      {/* Future LIMS Integration Specification Panel */}
      <FutureLimsIntegrationPanel />

      {/* Detailed Case Inspection Drawer */}
      <CaseDetailDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};
