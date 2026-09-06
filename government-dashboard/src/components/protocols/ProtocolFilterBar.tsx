import React from 'react';
import { Search, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtocolFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedSeverity: string;
  onSeverityChange: (val: string) => void;
  selectedZoonotic: string;
  onZoonoticChange: (val: string) => void;
  selectedReportable: string;
  onReportableChange: (val: string) => void;
  onResetFilters: () => void;
}

export const ProtocolFilterBar: React.FC<ProtocolFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  selectedZoonotic,
  onZoonoticChange,
  selectedReportable,
  onReportableChange,
  onResetFilters,
}) => {
  const isZoonoticOnly = selectedZoonotic === 'ZOONOTIC';

  const handleToggleZoonotic = () => {
    if (isZoonoticOnly) {
      onZoonoticChange('ALL');
    } else {
      onZoonoticChange('ZOONOTIC');
    }
  };

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3 shadow-subtle text-xs space-y-3 select-none">
      {/* Search and Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#93A1B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Disease Name, Category, or Susceptible Species..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] font-mono text-xs text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] transition-colors"
            aria-label="Search biosecurity protocols"
          />
        </div>

        {/* Quick Filter: Zoonotic Threats */}
        <div className="flex items-center gap-2">
          <Button
            variant={isZoonoticOnly ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleToggleZoonotic}
            className="font-mono text-xs"
          >
            <AlertTriangle className={`w-3.5 h-3.5 mr-1 ${isZoonoticOnly ? 'text-white' : 'text-[#D97B1F]'}`} />
            <span>{isZoonoticOnly ? 'Showing Zoonotic Only' : 'Filter: Zoonotic'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onResetFilters}
            className="font-mono text-xs text-[#526074]"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Structured Facet Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E1E6EC]">
        {/* Severity */}
        <div>
          <label htmlFor="filter-severity" className="block text-[10px] font-mono uppercase text-[#93A1B0] mb-1">
            Severity Classification:
          </label>
          <select
            id="filter-severity"
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Zoonotic Status */}
        <div>
          <label htmlFor="filter-zoonotic" className="block text-[10px] font-mono uppercase text-[#93A1B0] mb-1">
            Zoonotic Status:
          </label>
          <select
            id="filter-zoonotic"
            value={selectedZoonotic}
            onChange={(e) => onZoonoticChange(e.target.value)}
            className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
          >
            <option value="ALL">All Transmission Modes</option>
            <option value="ZOONOTIC">ZOONOTIC (Human Risk)</option>
            <option value="NON_ZOONOTIC">Host-Specific Only</option>
          </select>
        </div>

        {/* Reporting Mandate */}
        <div>
          <label htmlFor="filter-reportable" className="block text-[10px] font-mono uppercase text-[#93A1B0] mb-1">
            Statutory Mandate:
          </label>
          <select
            id="filter-reportable"
            value={selectedReportable}
            onChange={(e) => onReportableChange(e.target.value)}
            className="w-full px-2 py-1 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
          >
            <option value="ALL">All Reporting Mandates</option>
            <option value="REPORTABLE">REPORTABLE / NOTIFIABLE</option>
            <option value="NON_REPORTABLE">NON-REPORTABLE</option>
          </select>
        </div>
      </div>
    </div>
  );
};
