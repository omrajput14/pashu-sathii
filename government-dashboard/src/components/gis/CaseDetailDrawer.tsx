import React, { useEffect } from 'react';
import { X, Tag, MapPin, Calendar, User, FileText } from 'lucide-react';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CaseDetailDrawerProps {
  report: DiseaseReportResponse | null;
  onClose: () => void;
}

export const CaseDetailDrawer: React.FC<CaseDetailDrawerProps> = ({ report, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!report) return null;

  const isConfirmed = report.diagnosisStatus === 'CONFIRMED';

  return (
    <div
      className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white border-l border-[#E1E6EC] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      data-testid="case-detail-drawer"
      role="dialog"
      aria-labelledby="case-dossier-title"
    >
      {/* Header */}
      <div className="p-4 bg-[#0E1A2B] text-white border-b border-[#1B2B40] flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#1E5C97] text-white font-semibold">
              FIELD SURVEILLANCE REPORT
            </span>
            <span className="text-xs font-mono text-[#9FB1C4]">
              #{report.id.substring(0, 8)}
            </span>
          </div>
          <h2 id="case-dossier-title" className="text-base font-bold tracking-tight text-white font-mono">
            {report.diseaseName}
          </h2>
          <p className="text-[11px] text-[#9FB1C4] mt-0.5 font-mono">
            Tag: {report.tagNumber || 'UNTAGGED LIVESTOCK'} {report.animalName ? `(${report.animalName})` : ''}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-[#9FB1C4] hover:text-white hover:bg-[#1B2B40] rounded-[2px] transition-colors focus:outline-none"
          aria-label="Close Case Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {/* Verification Status */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#526074] uppercase block">
              Diagnosis Status
            </span>
            <div className="mt-1">
              <Badge variant={isConfirmed ? 'confirmed' : 'suspected'}>
                <span
                  className={`w-1.5 h-1.5 ${
                    isConfirmed ? 'bg-[#B7301F] rounded-none' : 'border border-[#D97B1F] rounded-full'
                  }`}
                />
                <span>{report.diagnosisStatus}</span>
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-[#526074] uppercase block">
              Confidence Source
            </span>
            <span className="text-xs font-mono font-bold text-[#101826] mt-1 block">
              {report.diagnosisConfidenceSource || 'FARMER_REPORT'}
            </span>
          </div>
        </div>

        {/* GPS Coordinates & Map Location */}
        <div className="p-3 bg-white border border-[#E1E6EC] rounded-[4px]">
          <div className="flex items-center gap-1.5 text-[#526074] mb-1 font-mono uppercase text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-[#1E5C97]" />
            <span>Telemetry Coordinates</span>
          </div>
          <p className="text-xs font-mono font-bold text-[#101826]">
            {report.latitude ? `${report.latitude.toFixed(5)}°N, ${report.longitude.toFixed(5)}°E` : 'Coordinates Unavailable'}
          </p>
        </div>

        {/* Timestamp & Metadata */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-white border border-[#E1E6EC] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#526074] mb-1 font-mono uppercase text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span>Reported At</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#101826] block">
              {report.createdAt
                ? new Date(report.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </span>
            <span className="text-[10px] font-mono text-[#526074] block mt-0.5">
              {report.createdAt
                ? new Date(report.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }) + ' IST'
                : ''}
            </span>
          </div>

          <div className="p-2.5 bg-white border border-[#E1E6EC] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#526074] mb-1 font-mono uppercase text-[11px]">
              <User className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span>Report Source</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#101826] block">
              {report.reportSource || 'DIRECT'}
            </span>
            <span className="text-[10px] font-mono text-[#526074] block mt-0.5 truncate">
              {report.reportedByName || 'Registered Field User'}
            </span>
          </div>
        </div>

        {/* Clinical Notes */}
        {report.notes && (
          <div className="p-3 bg-white border border-[#E1E6EC] rounded-[4px]">
            <div className="flex items-center gap-1.5 text-[#526074] mb-1 font-mono uppercase text-[11px]">
              <FileText className="w-3.5 h-3.5 text-[#1E5C97]" />
              <span>Clinical / Field Notes</span>
            </div>
            <p className="text-xs text-[#101826] leading-relaxed bg-[#F8FAFC] p-2 rounded border border-[#E1E6EC]">
              {report.notes}
            </p>
          </div>
        )}

        {/* Animal Tag ID */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex items-center justify-between text-xs font-mono">
          <span className="text-[#526074] flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#1E5C97]" />
            <span>Animal UUID:</span>
          </span>
          <span className="font-semibold text-[#101826]">
            {report.animalId ? report.animalId.substring(0, 12) + '...' : 'N/A'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#FAFBFC] border-t border-[#E1E6EC] flex items-center justify-end">
        <Button variant="secondary" size="sm" onClick={onClose} className="font-mono text-xs">
          <span>Close Report</span>
        </Button>
      </div>
    </div>
  );
};
