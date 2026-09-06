import React, { useState, useMemo } from 'react';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { Badge } from '../ui/Badge';
import { FileText, Search, ExternalLink, Filter } from 'lucide-react';

interface ContributingReportsLedgerProps {
  reports: DiseaseReportResponse[];
  isLoading?: boolean;
  onInspectReport: (report: DiseaseReportResponse) => void;
}

export const ContributingReportsLedger: React.FC<ContributingReportsLedgerProps> = ({
  reports,
  isLoading,
  onInspectReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'SUSPECTED'>('ALL');

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'ALL' && r.diagnosisStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTag = r.tagNumber?.toLowerCase().includes(query);
        const matchName = r.animalName?.toLowerCase().includes(query);
        const matchNotes = r.notes?.toLowerCase().includes(query);
        const matchReporter = r.reportedByName?.toLowerCase().includes(query);
        if (!matchTag && !matchName && !matchNotes && !matchReporter) return false;
      }
      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="contributing-reports-ledger"
    >
      {/* Header with Search & Filter */}
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Contributing Field Surveillance Reports ({reports.length})
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#526074]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'CONFIRMED' | 'SUSPECTED')}
              className="text-xs font-mono bg-white border border-[#C7D0DB] rounded px-2 py-1 text-[#101826] focus:outline-none focus:border-[#1E5C97]"
              aria-label="Filter reports by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">■ Confirmed Only</option>
              <option value="SUSPECTED">◇ Suspected Only</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3 h-3 text-[#526074] absolute left-2 top-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tag or reporter..."
              className="text-xs font-mono bg-white border border-[#C7D0DB] rounded pl-7 pr-2 py-1 text-[#101826] placeholder-[#93A1B0] focus:outline-none focus:border-[#1E5C97] w-44"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E1E6EC] bg-[#F6F8FA] text-[#526074] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Report ID</th>
              <th className="py-2.5 px-3 font-semibold">Tag Number</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold">Confidence Source</th>
              <th className="py-2.5 px-3 font-semibold">Coordinates GPS</th>
              <th className="py-2.5 px-3 font-semibold">Reported At</th>
              <th className="py-2.5 px-3 font-semibold">Clinical Notes</th>
              <th className="py-2.5 px-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E6EC] font-normal text-[#101826]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#526074] font-mono text-xs animate-pulse">
                  Loading contributing field reports...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#526074] font-mono text-xs">
                  No field reports match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map((r) => {
                const isConfirmed = r.diagnosisStatus === 'CONFIRMED';
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-[#F8FAFC] transition-colors focus-within:bg-[#F1F4F8]"
                  >
                    <td className="py-2.5 px-4 font-mono text-[11px] text-[#1E5C97] font-semibold">
                      #{r.id.substring(0, 8)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#101826]">
                      {r.tagNumber || 'UNTAGGED'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={isConfirmed ? 'confirmed' : 'suspected'}>
                        <span
                          className={`w-1.5 h-1.5 ${
                            isConfirmed ? 'bg-[#B7301F] rounded-none' : 'border border-[#D97B1F] rounded-full'
                          }`}
                        />
                        <span>{r.diagnosisStatus}</span>
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#101826]">
                      {r.diagnosisConfidenceSource || 'FIELD'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                      {r.latitude ? `${r.latitude.toFixed(4)}°, ${r.longitude.toFixed(4)}°` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          }) + ' ' + new Date(r.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[#526074] max-w-xs truncate" title={r.notes || ''}>
                      {r.notes || 'No notes attached.'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onInspectReport(r)}
                        className="p-1 text-[#526074] hover:text-[#1E5C97] hover:bg-[#E4EDF6] rounded-[2px] transition-colors font-mono text-[11px] inline-flex items-center gap-1"
                        aria-label={`Inspect report ${r.id}`}
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
