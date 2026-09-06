import React, { useState } from 'react';
import { AIScreeningResponse, Page } from '../../core/types/disease.types';
import { ChevronLeft, ChevronRight, Eye, Sparkles, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface AIScreeningsLedgerTableProps {
  pageData?: Page<AIScreeningResponse>;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSelectScreening?: (screening: AIScreeningResponse) => void;
}

export const AIScreeningsLedgerTable: React.FC<AIScreeningsLedgerTableProps> = ({
  pageData,
  isLoading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectScreening,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const screenings = pageData?.content || [];
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-12 flex flex-col items-center justify-center gap-3 font-mono text-xs text-[#526074]">
        <div className="w-6 h-6 border-2 border-[#1E5C97] border-t-transparent rounded-full animate-spin" />
        <span>Loading AI preliminary screening stream...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden flex flex-col">
      {/* Table Header / Title */}
      <div className="px-4 py-3 border-b border-[#E1E6EC] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#6366F1]" />
          <span className="text-xs font-mono font-bold text-[#101826] uppercase tracking-wider">
            AI Preliminary Screening Signals Ledger
          </span>
          <span className="text-[10px] font-mono bg-[#EDE9FE] text-[#6366F1] font-semibold px-2 py-0.5 rounded border border-[#DDD6FE]">
            Early-Warning Only · Non-Clinical
          </span>
        </div>
        <div className="text-xs font-mono text-[#526074]">
          Showing <strong className="text-[#101826]">{screenings.length}</strong> of{' '}
          <strong className="text-[#101826]">{totalElements}</strong> signals
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[#F6F8FA] border-b border-[#E1E6EC] text-[#526074] text-[11px] select-none uppercase">
              <th className="py-2.5 px-3 font-semibold">Scan / Date</th>
              <th className="py-2.5 px-3 font-semibold">Animal & Species</th>
              <th className="py-2.5 px-3 font-semibold">AI Preliminary Diagnosis</th>
              <th className="py-2.5 px-3 font-semibold">Confidence</th>
              <th className="py-2.5 px-3 font-semibold">Location (District)</th>
              <th className="py-2.5 px-3 font-semibold">Clinical Status</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E6EC]">
            {screenings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[#93A1B0]">
                  No AI preliminary screening records matching current filters.
                </td>
              </tr>
            ) : (
              screenings.map((s) => {
                const isVerified = s.veterinarianVerified;
                const confPct =
                  s.confidenceScore !== null && s.confidenceScore !== undefined
                    ? (s.confidenceScore * 100).toFixed(1)
                    : null;

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    onClick={() => onSelectScreening?.(s)}
                  >
                    {/* Scan ID & Date */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#101826]">
                        #{s.id.substring(0, 8)}
                      </div>
                      <div className="text-[10px] text-[#93A1B0]">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        {new Date(s.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Animal & Species */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#101826]">
                        {s.animalName || 'Unnamed'}
                      </div>
                      <div className="text-[10px] text-[#526074]">
                        Tag: <span className="text-[#101826] font-bold">{s.tagNumber || '—'}</span> · {s.species || 'CATTLE'}
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#101826]">
                          {s.preliminaryDiagnosis}
                        </span>
                      </div>
                      <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#EDE9FE] text-[#6366F1] border border-[#DDD6FE]">
                        AI PRELIMINARY SCREENING
                      </span>
                    </td>

                    {/* Confidence Score */}
                    <td className="py-3 px-3">
                      {confPct ? (
                        <div>
                          <div className="font-bold text-[#101826]">{confPct}%</div>
                          <div className="w-16 h-1.5 bg-[#E1E6EC] rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-[#6366F1] rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, Number(confPct)))}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#93A1B0]">—</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-[#101826]">
                        <MapPin className="w-3 h-3 text-[#526074]" />
                        <span>{s.district || 'Maharashtra'}</span>
                      </div>
                      {s.taluka && (
                        <div className="text-[10px] text-[#526074]">Taluka: {s.taluka}</div>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3 px-3">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#EDF7F0] text-[#1B806A] border border-[#C2E7DA]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified by Vet</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3E8] text-[#D97B1F] border border-[#FADCC0]">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Veterinary Verification</span>
                        </span>
                      )}
                    </td>

                    {/* Actions / Thumbnail */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {s.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(s.imageUrl)}
                            className="p-1 rounded text-[#526074] hover:text-[#101826] hover:bg-[#E1E6EC] transition-colors"
                            title="View Scan Image"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectScreening?.(s)}
                          className="text-[11px] font-mono text-[#1E5C97] hover:underline px-1.5 py-0.5"
                        >
                          Inspect
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-[#E1E6EC] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#526074]">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-[#C7D0DB] rounded px-1.5 py-0.5 text-xs text-[#101826] focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>
            Page <strong className="text-[#101826]">{currentPage + 1}</strong> of{' '}
            <strong className="text-[#101826]">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-1 h-7 w-7 flex items-center justify-center"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-1 h-7 w-7 flex items-center justify-center"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-[8px] p-4 max-w-lg w-full border border-[#E1E6EC] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E1E6EC]">
              <span className="font-mono text-xs font-bold text-[#101826]">
                AI Diagnostic Scan Image Preview
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-[#526074] hover:text-[#101826]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded overflow-hidden bg-black/5 flex items-center justify-center max-h-96">
              <img
                src={selectedImage}
                alt="AI Scan"
                className="max-h-96 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
