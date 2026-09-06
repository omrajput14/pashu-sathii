import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface AlertsFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSeverity: string;
  onSeverityChange: (s: string) => void;
  selectedEventType: string;
  onEventTypeChange: (e: string) => void;
  onReset: () => void;
}

export const AlertsFilterBar: React.FC<AlertsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedEventType,
  onEventTypeChange,
  onReset,
}) => {
  const isFiltered =
    searchQuery.trim() !== '' || selectedSeverity !== 'ALL' || selectedEventType !== 'ALL';

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 mb-4 shadow-subtle text-xs select-none">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#526074]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search alerts by disease, sector location, or rationale..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[#F8FAFC] border border-[#C7D0DB] rounded-[4px] text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] focus:ring-1 focus:ring-[#1E5C97]"
            aria-label="Search operational alerts"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-semibold text-[#526074]">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => onSeverityChange(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#C7D0DB] rounded-[4px] font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              aria-label="Filter by alert severity"
            >
              <option value="ALL">All Severity Levels</option>
              <option value="CRITICAL">Critical Threats</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium / Monitored</option>
              <option value="LOW">Low / Routine</option>
            </select>
          </div>

          {/* Event Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-semibold text-[#526074]">Trigger:</span>
            <select
              value={selectedEventType}
              onChange={(e) => onEventTypeChange(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#C7D0DB] rounded-[4px] font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              aria-label="Filter by event trigger type"
            >
              <option value="ALL">All Event Triggers</option>
              <option value="CRITICAL_OUTBREAK_DETECTED">Critical Outbreaks</option>
              <option value="IMMUNITY_GAP_OVERLAP">Immunity Deficit Overlaps</option>
              <option value="RAPID_VELOCITY_ESCALATION">Velocity Escalations</option>
              <option value="CONFIRMED_CASE_CLUSTER">Verified Lab/Vet Cases</option>
            </select>
          </div>

          {/* Reset */}
          {isFiltered && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              className="font-mono text-xs text-[#526074]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
