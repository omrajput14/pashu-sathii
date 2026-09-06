import React from 'react';
import { FileSpreadsheet, ExternalLink } from 'lucide-react';
import { DiseaseReportResponse, Page } from '../../core/types/disease.types';
import { Badge } from '../ui/Badge';

interface RecentSurveillanceTableProps {
  reportsPage?: Page<DiseaseReportResponse>;
  isLoading?: boolean;
  onInspectReport?: (report: DiseaseReportResponse) => void;
}

export const RecentSurveillanceTable: React.FC<RecentSurveillanceTableProps> = ({
  reportsPage,
  isLoading,
  onInspectReport,
}) => {
  const reports = reportsPage?.content || [];

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden" data-testid="recent-surveillance-table">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E1E6EC] bg-[#FAFBFC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            RECENT SURVEILLANCE TELEMETRY & FIELD REPORTS
          </h2>
        </div>
        <span className="text-xs font-mono text-[#526074]">
          {reportsPage?.totalElements ? `${reportsPage.totalElements} Total Logs` : 'Live Telemetry'}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E1E6EC] bg-[#F6F8FA] text-[#526074] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Timestamp</th>
              <th className="py-2.5 px-3 font-semibold">Report ID</th>
              <th className="py-2.5 px-3 font-semibold">Livestock Tag</th>
              <th className="py-2.5 px-4 font-semibold">Suspected Disease</th>
              <th className="py-2.5 px-3 font-semibold">Diagnosis Status</th>
              <th className="py-2.5 px-3 font-semibold">Confidence Source</th>
              <th className="py-2.5 px-3 font-semibold">GPS Coordinates</th>
              <th className="py-2.5 px-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E6EC] font-normal text-[#101826]">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-3.5 px-4">
                    <div className="h-4 bg-[#F6F8FA] rounded w-full" />
                  </td>
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#526074]">
                  <p className="font-medium text-xs">No recent field reports ingested</p>
                  <p className="text-[11px] text-[#93A1B0] mt-0.5">Surveillance listening for incoming farmer and veterinary reports</p>
                </td>
              </tr>
            ) : (
              reports.map((r) => {
                const isConfirmed = r.diagnosisStatus === 'CONFIRMED';
                const formattedTime = r.createdAt
                  ? new Date(r.createdAt).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                  : '—';

                return (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-[#526074] whitespace-nowrap">
                      {formattedTime}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#1E5C97] font-semibold">
                      #{r.id.substring(0, 8)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#101826]">
                      {r.tagNumber || 'UNTAGGED'}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#101826]">
                      {r.diseaseName}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={isConfirmed ? 'confirmed' : 'suspected'}>
                        <span
                          className={`w-1.5 h-1.5 ${isConfirmed ? 'bg-[#B7301F] rounded-none' : 'border border-[#D97B1F] rounded-full'}`}
                        />
                        <span>{r.diagnosisStatus}</span>
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                      {r.diagnosisConfidenceSource || 'FARMER_REPORT'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074] whitespace-nowrap">
                      {r.latitude ? `${r.latitude.toFixed(3)}°, ${r.longitude.toFixed(3)}°` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onInspectReport?.(r)}
                        className="p-1 text-[#526074] hover:text-[#1E5C97] hover:bg-[#E4EDF6] rounded-[2px] transition-colors focus:outline-none"
                        title="Inspect Report Dossier"
                        aria-label={`Inspect report ${r.id}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
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
