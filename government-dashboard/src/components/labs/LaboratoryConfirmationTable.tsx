import React, { useState } from 'react';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { isReportInsideOutbreak } from '../../core/utils/geoUtils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  FlaskConical,
  Stethoscope,
  Cpu,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Flame,
} from 'lucide-react';

interface LaboratoryConfirmationTableProps {
  reports: DiseaseReportResponse[];
  outbreaks: OutbreakResponse[];
  onSelectReport: (report: DiseaseReportResponse) => void;
  onNavigateToOutbreak?: (outbreakId: string) => void;
  isLoading?: boolean;
}

export const LaboratoryConfirmationTable: React.FC<LaboratoryConfirmationTableProps> = ({
  reports,
  outbreaks,
  onSelectReport,
  onNavigateToOutbreak,
  isLoading,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  const totalPages = Math.ceil(reports.length / pageSize) || 1;
  const paginatedReports = reports.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Exact Haversine distance matching against outbreak center & containment radius
  const findAssociatedOutbreak = (report: DiseaseReportResponse) => {
    return outbreaks.find(
      (o) =>
        o.diseaseName === report.diseaseName &&
        o.status !== 'RESOLVED' &&
        isReportInsideOutbreak(
          report.latitude,
          report.longitude,
          o.centerLatitude,
          o.centerLongitude,
          o.radiusKm
        )
    );
  };

  const renderConfidenceBadge = (source: string) => {
    switch (source) {
      case 'LAB_CONFIRMED':
        return (
          <Badge variant="info" size="sm">
            <FlaskConical className="w-3 h-3 text-[#1E5C97]" />
            <span>LAB_CONFIRMED</span>
          </Badge>
        );
      case 'VETERINARIAN':
        return (
          <Badge variant="success" size="sm">
            <Stethoscope className="w-3 h-3 text-[#2E7D32]" />
            <span>VETERINARIAN</span>
          </Badge>
        );
      case 'AI_VERIFIED':
        return (
          <Badge variant="warning" size="sm">
            <Cpu className="w-3 h-3 text-[#6A1B9A]" />
            <span>AI_VERIFIED</span>
          </Badge>
        );
      case 'GOVERNMENT':
        return (
          <Badge variant="danger" size="sm">
            <Shield className="w-3 h-3 text-[#C62828]" />
            <span>GOVERNMENT</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            <span>{source || 'UNSPECIFIED'}</span>
          </Badge>
        );
    }
  };

  const renderStatusBadge = (status: string, source: string) => {
    const isConfirmed = status === 'CONFIRMED';
    const isLab = source === 'LAB_CONFIRMED';

    if (isConfirmed && isLab) {
      return (
        <Badge variant="confirmed" size="sm" className="border-[#1E5C97] bg-[#EBF5FB] text-[#1E5C97]">
          <span className="w-1.5 h-1.5 bg-[#1E5C97] rounded-none" />
          <span>CONFIRMED (LAB)</span>
        </Badge>
      );
    }

    if (isConfirmed) {
      return (
        <Badge variant="confirmed" size="sm">
          <span className="w-1.5 h-1.5 bg-[#B7301F] rounded-none" />
          <span>CONFIRMED</span>
        </Badge>
      );
    }

    return (
      <Badge variant="suspected" size="sm">
        <span className="w-1.5 h-1.5 border border-[#D97B1F] rounded-full" />
        <span>SUSPECTED</span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-8 text-center text-xs font-mono text-[#526074]">
        <div className="w-6 h-6 border-2 border-[#1E5C97] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>LOADING SURVEILLANCE & DIAGNOSTIC LEDGER...</span>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-8 text-center text-xs font-mono text-[#526074] space-y-2">
        <FlaskConical className="w-8 h-8 text-[#93A1B0] mx-auto" />
        <p className="font-bold text-[#101826] text-sm">
          No laboratory-confirmed surveillance records currently available for the selected filters.
        </p>
        <p className="text-[#526074] max-w-lg mx-auto leading-relaxed">
          Laboratory integration with external diagnostic systems (LIMS) is planned. Current surveillance records
          reflect field veterinary clinical diagnoses and syndromic intake.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs" aria-label="Laboratory Surveillance Records">
          <caption className="sr-only">
            Statewide laboratory surveillance records and diagnostic confirmation ledger
          </caption>
          <thead>
            <tr className="bg-[#0E1A2B] text-white border-b border-[#1B2B40] font-mono text-[11px]">
              <th scope="col" className="py-2.5 px-3 font-semibold">
                Report ID
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold">
                Disease
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold">
                Animal / Tag
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold">
                Diagnosis Status
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold">
                Confidence Source
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold">
                Location (Lat, Lng)
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold">
                Reported At
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold">
                Outbreak Association
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E6EC] font-mono">
            {paginatedReports.map((report) => {
              const outbreak = findAssociatedOutbreak(report);
              const isLab = report.diagnosisConfidenceSource === 'LAB_CONFIRMED';

              return (
                <tr
                  key={report.id}
                  className={`hover:bg-[#F1F4F8] transition-colors ${
                    isLab ? 'bg-[#F4F9FD]' : 'bg-white'
                  }`}
                >
                  {/* Report ID */}
                  <td className="py-2.5 px-3 text-[#1E5C97] font-bold">
                    <span title={report.id}>#{report.id.substring(0, 8)}</span>
                  </td>

                  {/* Disease */}
                  <td className="py-2.5 px-3">
                    <strong className="text-[#101826]">{report.diseaseName}</strong>
                  </td>

                  {/* Animal / Tag */}
                  <td className="py-2.5 px-3 text-[#526074]">
                    <span className="text-[#101826] font-bold">{report.tagNumber || 'UNTAGGED'}</span>
                    {report.animalName ? ` (${report.animalName})` : ''}
                  </td>

                  {/* Diagnosis Status */}
                  <td className="py-2.5 px-3">
                    {renderStatusBadge(report.diagnosisStatus, report.diagnosisConfidenceSource)}
                  </td>

                  {/* Confidence Source */}
                  <td className="py-2.5 px-3">
                    {renderConfidenceBadge(report.diagnosisConfidenceSource)}
                  </td>

                  {/* Location */}
                  <td className="py-2.5 px-3 text-[#526074]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#1E5C97] shrink-0" />
                      <span>
                        {report.latitude.toFixed(2)}, {report.longitude.toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Reported At */}
                  <td className="py-2.5 px-3 text-[#526074] whitespace-nowrap text-[11px]">
                    {new Date(report.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Outbreak Association */}
                  <td className="py-2.5 px-3">
                    {outbreak ? (
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            outbreak.riskScore === 'CRITICAL'
                              ? 'danger'
                              : outbreak.riskScore === 'HIGH'
                              ? 'warning'
                              : 'info'
                          }
                          size="sm"
                        >
                          <Flame className="w-3 h-3" />
                          <span>{outbreak.riskScore}</span>
                        </Badge>
                        {onNavigateToOutbreak && (
                          <button
                            onClick={() => onNavigateToOutbreak(outbreak.id)}
                            className="text-[#1E5C97] hover:underline text-[10px] font-bold"
                            title="Open Outbreak Dossier"
                          >
                            Dossier
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#93A1B0] text-[10px] italic">Isolated</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectReport(report)}
                        className="font-mono text-[11px] px-2 py-0.5"
                      >
                        <Eye className="w-3 h-3 mr-1 text-[#1E5C97]" />
                        <span>Inspect</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-[#F8FAFC] border-t border-[#E1E6EC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <span className="text-[#526074]">
          Showing {paginatedReports.length} of {reports.length} records in active stream (Page {currentPage + 1} of {totalPages})
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="font-mono text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            <span>Prev</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="font-mono text-xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
