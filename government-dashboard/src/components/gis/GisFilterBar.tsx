import React from 'react';
import { Filter, RotateCcw, Layers, MapPin, Search } from 'lucide-react';
import { GisFilterState } from '../../core/types/gis.types';
import { OutbreakRiskScore, OutbreakStatus } from '../../core/types/outbreak.types';
import { RISK_CONFIG } from '../../core/theme/tokens';
import { Button } from '../ui/Button';

interface GisFilterBarProps {
  filters: GisFilterState;
  onFilterChange: (updated: Partial<GisFilterState>) => void;
  onResetFilters: () => void;
  availableDiseases: string[];
  availableDistricts?: string[];
  totalVisibleCount: number;
}

export const GisFilterBar: React.FC<GisFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableDiseases,
  availableDistricts = [],
  totalVisibleCount,
}) => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3 shadow-subtle flex flex-col gap-2.5">
      {/* Top Filter Row: Dropdowns & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#101826] uppercase pr-2 border-r border-[#E1E6EC]">
            <Filter className="w-3.5 h-3.5 text-[#1E5C97]" />
            <span>GIS Filters</span>
          </div>

          {/* Disease Filter */}
          <div className="flex items-center gap-1">
            <label htmlFor="disease-filter" className="text-[11px] font-mono text-[#526074]">Disease:</label>
            <select
              id="disease-filter"
              value={filters.disease}
              onChange={(e) => onFilterChange({ disease: e.target.value })}
              className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded-[3px] px-2 py-1 text-[#101826] focus:outline-none focus:border-[#1E5C97]"
            >
              <option value="ALL">All Diseases</option>
              {availableDiseases.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1">
            <label htmlFor="risk-filter" className="text-[11px] font-mono text-[#526074]">Risk:</label>
            <select
              id="risk-filter"
              value={filters.riskLevel}
              onChange={(e) => onFilterChange({ riskLevel: e.target.value as 'ALL' | OutbreakRiskScore })}
              className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded-[3px] px-2 py-1 text-[#101826] focus:outline-none focus:border-[#1E5C97]"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">CRITICAL ({RISK_CONFIG.CRITICAL.scoreRangeLabel})</option>
              <option value="HIGH">HIGH ({RISK_CONFIG.HIGH.scoreRangeLabel})</option>
              <option value="MEDIUM">MEDIUM ({RISK_CONFIG.MEDIUM.scoreRangeLabel})</option>
              <option value="LOW">LOW ({RISK_CONFIG.LOW.scoreRangeLabel})</option>
            </select>
          </div>

          {/* Cluster Status Filter */}
          <div className="flex items-center gap-1">
            <label htmlFor="status-filter" className="text-[11px] font-mono text-[#526074]">Status:</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value as 'ALL' | OutbreakStatus })}
              className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded-[3px] px-2 py-1 text-[#101826] focus:outline-none focus:border-[#1E5C97]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MONITORING">MONITORING</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          {/* Administrative Geography / District — SOURCED DYNAMICALLY FROM GEOJSON PROPERTIES */}
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#526074]" />
            <label htmlFor="district-filter" className="text-[11px] font-mono text-[#526074]">District:</label>
            <select
              id="district-filter"
              value={filters.district}
              onChange={(e) => onFilterChange({ district: e.target.value })}
              className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded-[3px] px-2 py-1 text-[#101826] focus:outline-none focus:border-[#1E5C97]"
            >
              <option value="ALL">Maharashtra (Statewide)</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#526074] absolute left-2 top-2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Search cluster or tag..."
              className="text-xs font-mono bg-[#F6F8FA] border border-[#C7D0DB] rounded-[3px] pl-7 pr-2 py-1 text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] w-44"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-[11px] font-mono text-[#526074] hover:text-[#101826]"
            title="Reset Filters to Default"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span>Reset</span>
          </Button>

          <div className="text-[11px] font-mono bg-[#E4EDF6] text-[#1E5C97] px-2 py-1 rounded-[2px] font-semibold border border-[#BED2E8]">
            {totalVisibleCount} Visible
          </div>
        </div>
      </div>

      {/* Bottom Row: Layer Checkbox Controls */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#E1E6EC] text-xs font-mono text-[#526074]">
        <div className="flex items-center gap-1.5 text-[#101826] font-semibold">
          <Layers className="w-3.5 h-3.5 text-[#1E5C97]" />
          <span>Active Layers:</span>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#101826]">
          <input
            type="checkbox"
            checked={filters.showOutbreakBuffers}
            onChange={(e) => onFilterChange({ showOutbreakBuffers: e.target.checked })}
            className="rounded border-[#C7D0DB] text-[#1E5C97] focus:ring-0"
          />
          <span>Cluster Risk Buffers</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#101826]">
          <input
            type="checkbox"
            checked={filters.showConfirmedCases}
            onChange={(e) => onFilterChange({ showConfirmedCases: e.target.checked })}
            className="rounded border-[#C7D0DB] text-[#1E5C97] focus:ring-0"
          />
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-[#B7301F]" />
            <span>Confirmed Cases</span>
          </span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#101826]">
          <input
            type="checkbox"
            checked={filters.showSuspectedCases}
            onChange={(e) => onFilterChange({ showSuspectedCases: e.target.checked })}
            className="rounded border-[#C7D0DB] text-[#1E5C97] focus:ring-0"
          />
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-[#E67E22]" />
            <span>Suspected Cases</span>
          </span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#101826]">
          <input
            type="checkbox"
            checked={filters.showAiScreenings}
            onChange={(e) => onFilterChange({ showAiScreenings: e.target.checked })}
            className="rounded border-[#C7D0DB] text-[#6366F1] focus:ring-0"
          />
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#6366F1]" />
            <span>AI Preliminary Signals</span>
          </span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#101826]">
          <input
            type="checkbox"
            checked={filters.showHeatmap}
            onChange={(e) => onFilterChange({ showHeatmap: e.target.checked })}
            className="rounded border-[#C7D0DB] text-[#1E5C97] focus:ring-0"
          />
          <span>Spatial Intensity (KDE)</span>
        </label>

        <div className="h-3 w-[1px] bg-[#E1E6EC]" />

        {/* Administrative Boundary Layer Toggles */}
        <div className="flex items-center gap-1.5 text-[#101826] font-semibold">
          <span>Boundaries:</span>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#101826]">
          <input
            type="checkbox"
            checked={filters.showStateBoundary}
            onChange={(e) => onFilterChange({ showStateBoundary: e.target.checked })}
            className="rounded border-[#C7D0DB] text-[#1E5C97] focus:ring-0"
          />
          <span className="text-[#1E5C97] font-medium">State</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#101826]">
          <input
            type="checkbox"
            checked={filters.showDistrictBoundaries}
            onChange={(e) => onFilterChange({ showDistrictBoundaries: e.target.checked })}
            className="rounded border-[#C7D0DB] text-[#1E5C97] focus:ring-0"
          />
          <span className="text-[#475569] font-medium">Districts</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-[#101826]">
          <input
            type="checkbox"
            checked={filters.showTalukaBoundaries}
            onChange={(e) => onFilterChange({ showTalukaBoundaries: e.target.checked })}
            className="rounded border-[#C7D0DB] text-[#1E5C97] focus:ring-0"
          />
          <span className="text-[#64748B] font-medium">Talukas</span>
        </label>
      </div>
    </div>
  );
};
