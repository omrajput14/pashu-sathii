import React from 'react';
import { Search, RotateCcw, Filter, FlaskConical } from 'lucide-react';
import { Button } from '../ui/Button';

interface LabsFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedDisease: string;
  onDiseaseChange: (val: string) => void;
  diseaseList: string[];
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedConfidence: string;
  onConfidenceChange: (val: string) => void;
  onResetFilters: () => void;
  totalFiltered: number;
}

export const LabsFilterBar: React.FC<LabsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedDisease,
  onDiseaseChange,
  diseaseList,
  selectedStatus,
  onStatusChange,
  selectedConfidence,
  onConfidenceChange,
  onResetFilters,
  totalFiltered,
}) => {
  const isLabOnlyActive = selectedConfidence === 'LAB_CONFIRMED';

  const handleToggleLabOnly = () => {
    if (isLabOnlyActive) {
      onConfidenceChange('ALL');
    } else {
      onConfidenceChange('LAB_CONFIRMED');
    }
  };

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3 shadow-subtle text-xs space-y-3">
      {/* Search and Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#93A1B0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Report ID, Animal Tag, Disease, Reporter Name, or Clinical Notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] font-mono text-xs text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] transition-colors"
            aria-label="Search laboratory reports"
          />
        </div>

        {/* Quick Filter: Lab Confirmed Only */}
        <div className="flex items-center gap-2">
          <Button
            variant={isLabOnlyActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleToggleLabOnly}
            className="font-mono text-xs whitespace-nowrap"
          >
            <FlaskConical className="w-3.5 h-3.5 mr-1" />
            <span>{isLabOnlyActive ? 'Showing: LAB_CONFIRMED Only' : 'Filter: LAB_CONFIRMED'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onResetFilters}
            className="font-mono text-xs text-[#526074]"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Structured Facet Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E1E6EC]">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#526074]">
          <Filter className="w-3.5 h-3.5 text-[#1E5C97]" />
          <span>FACETS:</span>
        </div>

        {/* Disease Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="disease-filter" className="text-[11px] font-mono text-[#526074]">
            Pathogen:
          </label>
          <select
            id="disease-filter"
            value={selectedDisease}
            onChange={(e) => onDiseaseChange(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] px-2 py-1 font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
          >
            <option value="ALL">All Diseases</option>
            {diseaseList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Diagnosis Status Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="status-filter" className="text-[11px] font-mono text-[#526074]">
            Diagnosis Status:
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] px-2 py-1 font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="SUSPECTED">SUSPECTED</option>
          </select>
        </div>

        {/* Confidence Source Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="confidence-filter" className="text-[11px] font-mono text-[#526074]">
            Confidence Source:
          </label>
          <select
            id="confidence-filter"
            value={selectedConfidence}
            onChange={(e) => onConfidenceChange(e.target.value)}
            className="bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] px-2 py-1 font-mono text-xs text-[#101826] focus:outline-none focus:border-[#1E5C97]"
          >
            <option value="ALL">All Confidence Sources</option>
            <option value="LAB_CONFIRMED">LAB_CONFIRMED</option>
            <option value="VETERINARIAN">VETERINARIAN</option>
            <option value="AI_VERIFIED">AI_VERIFIED</option>
            <option value="GOVERNMENT">GOVERNMENT</option>
          </select>
        </div>

        {/* Count */}
        <span className="ml-auto text-[11px] font-mono text-[#526074]">
          Matching: <strong className="text-[#101826]">{totalFiltered}</strong> records
        </span>
      </div>
    </div>
  );
};
