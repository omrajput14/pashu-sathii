import React, { useState } from 'react';
import { DiseaseReportResponse, Page } from '../../core/types/disease.types';
import { Check, Copy, ChevronLeft, ChevronRight, FileText, MapPin, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface FieldReportsLedgerTableProps {
  pageData?: Page<DiseaseReportResponse>;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectReport: (report: DiseaseReportResponse) => void;
}

export const FieldReportsLedgerTable: React.FC<FieldReportsLedgerTableProps> = ({
  pageData,
  isLoading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectReport,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getConfidenceBadgeVariant = (source: string) => {
    switch (source) {
      case 'LAB_CONFIRMED':
        return 'success';
      case 'VETERINARIAN':
      case 'GOVERNMENT':
        return 'info';
      case 'AI_VERIFIED':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-8 text-center text-xs font-mono text-[#526074]">
        <div className="w-6 h-6 border-2 border-[#1E5C97] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading operational disease surveillance ledger...</span>
      </div>
    );
  }

  const reports = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 1;

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden text-xs">
      {/* Table Title Bar */}
      <div className="px-4 py-3 border-b border-[#E1E6EC] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1E5C97]" />
          <span className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
            Field Surveillance Ledger
          </span>
          <span className="text-[11px] font-mono text-[#526074]">
            ({totalElements} Total Records)
          </span>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#526074]">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-[#C7D0DB] rounded-[3px] text-xs font-mono text-[#101826] focus:outline-none focus:border-[#1E5C97]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Semantic Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" role="table">
          <thead>
            <tr className="bg-[#F1F4F8] border-b border-[#E1E6EC] text-[11px] font-mono uppercase tracking-wider text-[#526074]">
              <th scope="col" className="py-2.5 px-3 font-semibold">Report ID</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Reported At</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Disease Condition</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Animal / Tag</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Diagnosis Status</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Verification Pipeline</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Centroid GPS</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Reporter</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E6EC]">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs font-mono text-[#526074]">
                  No disease surveillance reports found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const isConfirmed = report.diagnosisStatus === 'CONFIRMED';
                return (
                  <tr
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    {/* Report ID + Copy */}
                    <td className="py-2.5 px-3 font-mono text-[11px] font-medium text-[#101826]">
                      <div className="flex items-center gap-1">
                        <span>{report.id.substring(0, 8)}...</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(report.id, e)}
                          title="Copy Full Report UUID"
                          className="p-0.5 text-[#526074] hover:text-[#1E5C97] rounded transition-colors"
                        >
                          {copiedId === report.id ? (
                            <Check className="w-3 h-3 text-[#2E6930]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                      {formatDate(report.createdAt)}
                    </td>

                    {/* Disease Name */}
                    <td className="py-2.5 px-3 font-bold text-[#101826]">
                      {report.diseaseName}
                    </td>

                    {/* Animal Tag */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#1E5C97]">
                      <div>{report.tagNumber || '—'}</div>
                      {report.animalName && (
                        <div className="text-[10px] text-[#526074]">{report.animalName}</div>
                      )}
                    </td>

                    {/* Dual-Coded Diagnosis Status */}
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-[#B7301F] font-bold">
                          <span>■</span>
                          <span>CONFIRMED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#D97B1F] font-semibold">
                          <span>◇</span>
                          <span>SUSPECTED</span>
                        </span>
                      )}
                    </td>

                    {/* Confidence Source */}
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <Badge
                        variant={getConfidenceBadgeVariant(report.diagnosisConfidenceSource)}
                        size="sm"
                      >
                        {report.diagnosisConfidenceSource}
                      </Badge>
                    </td>

                    {/* GPS Coordinates */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#1E5C97]" />
                        <span>
                          {report.latitude.toFixed(3)}, {report.longitude.toFixed(3)}
                        </span>
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074] max-w-[130px] truncate">
                      {report.reportedByName || '—'}
                    </td>

                    {/* Action: Inspect */}
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(report);
                        }}
                        className="font-mono text-[11px] py-1 px-2"
                      >
                        <Eye className="w-3 h-3 mr-1 text-[#1E5C97]" />
                        <span>Inspect</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-[#E1E6EC] flex items-center justify-between bg-[#F8FAFC] text-xs font-mono text-[#526074]">
        <div>
          Showing page <span className="font-bold text-[#101826]">{currentPage + 1}</span> of{' '}
          <span className="font-bold text-[#101826]">{totalPages}</span> ({totalElements} items)
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="font-mono text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
            <span>Previous</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
            className="font-mono text-xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
