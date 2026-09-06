import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface FieldReportsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDisease: string;
  onDiseaseChange: (disease: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedConfidence: string;
  onConfidenceChange: (confidence: string) => void;
  diseaseList: string[];
  onReset: () => void;
}

export const FieldReportsFilterBar: React.FC<FieldReportsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedDisease,
  onDiseaseChange,
  selectedStatus,
  onStatusChange,
  selectedConfidence,
  onConfidenceChange,
  diseaseList,
  onReset,
}) => {
  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedDisease !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedConfidence !== 'ALL';

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 mb-4 shadow-subtle text-xs select-none">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Text Search */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#526074]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Report ID, animal tag, reporter, or clinical notes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[#F8FAFC] border border-[#C7D0DB] rounded-[4px] text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] focus:ring-1 focus:ring-[#1E5C97]"
            aria-label="Search disease reports"
          />
        </div>

        {/* Right: Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Disease Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-semibold text-[#526074]">Disease:</span>
            <select
              value={selectedDisease}
              onChange={(e) => onDiseaseChange(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#C7D0DB] rounded-[4px] font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              aria-label="Filter by disease name"
            >
              <option value="ALL">All Monitored Diseases</option>
              {diseaseList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (CONFIRMED vs SUSPECTED) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-semibold text-[#526074]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#C7D0DB] rounded-[4px] font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              aria-label="Filter by diagnosis status"
            >
              <option value="ALL">All Diagnosis Statuses</option>
              <option value="CONFIRMED">■ Confirmed Only</option>
              <option value="SUSPECTED">◇ Suspected / Field Triage</option>
            </select>
          </div>

          {/* Confidence Source Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-semibold text-[#526074]">Source:</span>
            <select
              value={selectedConfidence}
              onChange={(e) => onConfidenceChange(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#C7D0DB] rounded-[4px] font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              aria-label="Filter by diagnostic confidence source"
            >
              <option value="ALL">All Verification Pipelines</option>
              <option value="VETERINARIAN">Veterinarian Exam</option>
              <option value="LAB_CONFIRMED">Reference Lab Confirmation</option>
              <option value="AI_VERIFIED">AI Provisional Triage</option>
              <option value="GOVERNMENT">Government Health Audit</option>
            </select>
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              className="font-mono text-xs text-[#526074] hover:text-[#101826]"
              title="Reset all active filters"
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
