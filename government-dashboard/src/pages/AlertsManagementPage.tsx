import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { diseaseService } from '../core/api/diseaseService';
import { AlertsFilterBar } from '../components/alerts/AlertsFilterBar';
import { OperationalAlertCard } from '../components/alerts/OperationalAlertCard';
import { OperationalPriorityQueueCard } from '../components/alerts/OperationalPriorityQueueCard';
import { Siren, RefreshCw, AlertTriangle, ShieldAlert, ShieldCheck, Download, MapPin } from 'lucide-react';
import { isAlertInScope, isOutbreakInScope, isStatewide, downloadCsv } from '../core/utils/scopeFilter';
import { Button } from '../components/ui/Button';

interface AlertsManagementPageProps {
  onNavigateToOutbreak?: (outbreakId: string) => void;
  onNavigateToMap?: () => void;
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
}

export const AlertsManagementPage: React.FC<AlertsManagementPageProps> = ({
  onNavigateToOutbreak,
  onNavigateToMap,
  selectedScope = 'Maharashtra (Statewide)',
  onScopeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedEventType, setSelectedEventType] = useState('ALL');

  // Fetch real operational alerts
  const {
    data: alerts = [],
    isLoading: isAlertsLoading,
    isRefetching: isAlertsRefetching,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['operationalAlerts'],
    queryFn: diseaseService.listOperationalAlerts,
    refetchInterval: 30000,
  });

  // Fetch active outbreaks for the Priority Queue
  const { data: outbreaks = [] } = useQuery({
    queryKey: ['outbreaksList', 'ACTIVE'],
    queryFn: () => diseaseService.listOutbreaks('ACTIVE'),
    refetchInterval: 30000,
  });

  // Filtered Alerts with scope
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedScope && !isAlertInScope(a, selectedScope)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchDisease = a.diseaseName.toLowerCase().includes(q);
        const matchLocation = a.locationName.toLowerCase().includes(q);
        const matchWhy = a.whyItMatters.toLowerCase().includes(q);
        if (!matchTitle && !matchDisease && !matchLocation && !matchWhy) {
          return false;
        }
      }
      if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) {
        return false;
      }
      if (selectedEventType !== 'ALL' && a.eventType !== selectedEventType) {
        return false;
      }
      return true;
    });
  }, [alerts, searchQuery, selectedSeverity, selectedEventType]);


  const scopedOutbreaks = useMemo(() => {
    return outbreaks.filter((o) => isOutbreakInScope(o, selectedScope));
  }, [outbreaks, selectedScope]);

  const handleExportAlerts = () => {
    const rows = filteredAlerts.map((a) => [
      a.id,
      a.title,
      a.severity,
      a.eventType,
      a.diseaseName,
      a.locationName,
      a.compositeRiskScore ?? '',
      a.status,
      a.detectedAt || '',
    ]);
    downloadCsv(
      'PashuSathi_Operational_Alerts_' + selectedScope.replace(/\s+/g, '_'),
      ['Alert ID', 'Title', 'Severity', 'Event Type', 'Disease', 'Location', 'Composite Risk', 'Status', 'Triggered At'],
      rows
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSeverity('ALL');
    setSelectedEventType('ALL');
  };

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH').length;
  const immunityGapCount = alerts.filter((a) => a.eventType === 'IMMUNITY_GAP_OVERLAP').length;
  const confirmedCount = alerts.filter((a) => a.eventType === 'CONFIRMED_CASE_CLUSTER').length;

  return (
    <div className="space-y-4 select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[6px] border border-[#E1E6EC] shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-[#B7301F]" />
            <h1 className="text-base font-bold text-[#101826] tracking-tight">
              Operational Alerts & Critical Surveillance Events
            </h1>
          </div>
          <p className="text-xs text-[#526074] mt-0.5 font-mono">
            Deterministic surveillance anomaly triggers, multi-signal threshold breaches, and statutory bio-containment advisories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedScope && !isStatewide(selectedScope) && (
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-[#E4EDF6] text-[#1E5C97] border border-[#BED2E8] rounded-[4px] text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Scope: <strong>{selectedScope}</strong> ({filteredAlerts.length} Alerts)</span>
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
            onClick={handleExportAlerts}
            className="font-mono text-xs text-[#101826]"
            title="Export filtered alerts sitrep as CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#1E5C97]" />
            <span>Export Alerts (CSV)</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetchAlerts()}
            disabled={isAlertsRefetching}
            className="font-mono text-xs text-[#526074]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isAlertsRefetching ? 'animate-spin' : ''}`} />
            <span>{isAlertsRefetching ? 'Evaluating Stream...' : 'Refresh Alerts'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#B7301F]" />
            <span>Critical Threat Events</span>
          </span>
          <div className="text-xl font-bold font-mono text-[#B7301F] mt-1">
            {criticalCount}
          </div>
          <span className="text-[10px] font-mono text-[#526074]">Score ≥ 80 or Critical Risk</span>
        </div>

        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <Siren className="w-3 h-3 text-[#D97B1F]" />
            <span>High Priority Alerts</span>
          </span>
          <div className="text-xl font-bold font-mono text-[#D97B1F] mt-1">
            {highCount}
          </div>
          <span className="text-[10px] font-mono text-[#526074]">Actionable Escalations</span>
        </div>

        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#1E5C97]" />
            <span>Immunity Deficit Overlaps</span>
          </span>
          <div className="text-xl font-bold font-mono text-[#1E5C97] mt-1">
            {immunityGapCount}
          </div>
          <span className="text-[10px] font-mono text-[#526074]">Vaccination Gap ≥ 50%</span>
        </div>

        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#2E6930]" />
            <span>Lab Confirmed Clusters</span>
          </span>
          <div className="text-xl font-bold font-mono text-[#2E6930] mt-1">
            {confirmedCount}
          </div>
          <span className="text-[10px] font-mono text-[#526074]">Verified Transmission</span>
        </div>
      </div>

      {/* Operational Priority Queue */}
      <OperationalPriorityQueueCard
        outbreaks={scopedOutbreaks}
        onSelectOutbreak={onNavigateToOutbreak}
      />

      {/* Filter Bar */}
      <AlertsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedEventType={selectedEventType}
        onEventTypeChange={setSelectedEventType}
        onReset={handleResetFilters}
      />

      {/* Alerts List */}
      {isAlertsLoading ? (
        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-8 text-center text-xs font-mono text-[#526074]">
          <div className="w-6 h-6 border-2 border-[#1E5C97] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Evaluating multi-signal surveillance anomaly streams...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-8 text-center text-xs font-mono text-[#526074]">
          No operational alerts matching active filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <OperationalAlertCard
              key={alert.id}
              alert={alert}
              onNavigateToOutbreak={onNavigateToOutbreak}
              onNavigateToMap={onNavigateToMap}
            />
          ))}
        </div>
      )}
    </div>
  );
};
