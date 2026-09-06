import React from 'react';
import { FlaskConical, AlertOctagon, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { isReportInsideOutbreak } from '../../core/utils/geoUtils';

interface LabsSummaryStripProps {
  reports: DiseaseReportResponse[];
  outbreaks: OutbreakResponse[];
  isLoading?: boolean;
}

export const LabsSummaryStrip: React.FC<LabsSummaryStripProps> = ({
  reports,
  outbreaks,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 bg-white border border-[#E1E6EC] rounded-[6px] p-3 animate-pulse flex flex-col justify-between"
          >
            <div className="h-3 w-24 bg-[#E1E6EC] rounded" />
            <div className="h-6 w-16 bg-[#E1E6EC] rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Real derivations from loaded telemetry (no fabricated defaults)
  const labConfirmedReports = reports.filter(
    (r) => r.diagnosisConfidenceSource === 'LAB_CONFIRMED'
  );
  const labConfirmedCount = labConfirmedReports.length;

  const distinctLabDiseases = Array.from(
    new Set(labConfirmedReports.map((r) => r.diseaseName))
  );

  const confirmedReportsTotal = reports.filter(
    (r) => r.diagnosisStatus === 'CONFIRMED'
  ).length;

  // Lab-confirmed outbreaks correlation using exact Haversine distance and containment radius
  const labConfirmedOutbreakCount = outbreaks.filter((o) => {
    return (
      o.status !== 'RESOLVED' &&
      labConfirmedReports.some(
        (r) =>
          r.diseaseName === o.diseaseName &&
          isReportInsideOutbreak(
            r.latitude,
            r.longitude,
            o.centerLatitude,
            o.centerLongitude,
            o.radiusKm
          )
      )
    );
  }).length;

  const labValidationRatio =
    confirmedReportsTotal > 0
      ? ((labConfirmedCount / confirmedReportsTotal) * 100).toFixed(1) + '%'
      : 'N/A';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Lab-Confirmed Cases in Loaded Set */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526074]">
            Lab-Confirmed Cases
          </span>
          <div className="w-6 h-6 rounded bg-[#EBF5FB] text-[#1E5C97] flex items-center justify-center">
            <FlaskConical className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-[#101826]">
            {labConfirmedCount}
          </span>
          <span className="text-[10px] font-mono text-[#526074]">
            of {reports.length} loaded records
          </span>
        </div>
        <p className="text-[10px] text-[#526074] mt-1 font-mono">
          Confidence: <strong className="text-[#1E5C97]">LAB_CONFIRMED</strong>
        </p>
      </div>

      {/* 2. Diseases with Lab Confirmation */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526074]">
            Lab-Verified Pathogens
          </span>
          <div className="w-6 h-6 rounded bg-[#EDF7F0] text-[#3E7C4A] flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-[#101826]">
            {distinctLabDiseases.length}
          </span>
          <span className="text-[10px] font-mono text-[#526074]">
            {distinctLabDiseases.length === 1 ? 'Pathogen (in loaded stream)' : 'Pathogens (in loaded stream)'}
          </span>
        </div>
        <p className="text-[10px] text-[#526074] mt-1 font-mono truncate">
          {distinctLabDiseases.length > 0
            ? distinctLabDiseases.join(', ')
            : 'No lab-verified pathogens in loaded stream'}
        </p>
      </div>

      {/* 3. Outbreaks with Lab Evidence */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526074]">
            Lab-Correlated Outbreaks
          </span>
          <div className="w-6 h-6 rounded bg-[#FEF3E8] text-[#D97B1F] flex items-center justify-center">
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-[#101826]">
            {labConfirmedOutbreakCount}
          </span>
          <span className="text-[10px] font-mono text-[#526074]">
            of {outbreaks.filter((o) => o.status !== 'RESOLVED').length} active clusters
          </span>
        </div>
        <p className="text-[10px] text-[#526074] mt-1 font-mono">
          Clusters with assay evidence (Haversine matched)
        </p>
      </div>

      {/* 4. Clinical Lab Confirmation Rate */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526074]">
            Lab Validation Ratio
          </span>
          <div className="w-6 h-6 rounded bg-[#F6F8FA] text-[#526074] flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-[#101826]">
            {labValidationRatio}
          </span>
          <span className="text-[10px] font-mono text-[#526074]">
            of loaded confirmed cases
          </span>
        </div>
        <p className="text-[10px] text-[#526074] mt-1 font-mono">
          {labConfirmedCount} Lab / {confirmedReportsTotal} Confirmed (Loaded Stream)
        </p>
      </div>
    </div>
  );
};
