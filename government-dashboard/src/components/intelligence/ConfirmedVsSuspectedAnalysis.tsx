import React, { useMemo } from 'react';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { CheckSquare, AlertTriangle, Stethoscope, FlaskConical, Bot, Building2 } from 'lucide-react';

interface ConfirmedVsSuspectedAnalysisProps {
  reports: DiseaseReportResponse[];
}

export const ConfirmedVsSuspectedAnalysis: React.FC<ConfirmedVsSuspectedAnalysisProps> = ({
  reports,
}) => {
  const analysis = useMemo(() => {
    let confirmed = 0;
    let suspected = 0;
    const byConfidence: Record<string, number> = {
      VETERINARIAN: 0,
      LAB_CONFIRMED: 0,
      AI_VERIFIED: 0,
      GOVERNMENT: 0,
    };

    reports.forEach((r) => {
      if (r.diagnosisStatus === 'CONFIRMED') {
        confirmed++;
      } else {
        suspected++;
      }

      const src = r.diagnosisConfidenceSource || 'FARMER_REPORT';
      if (byConfidence[src] !== undefined) {
        byConfidence[src]++;
      }
    });

    const total = reports.length;
    const confirmedPct = total > 0 ? (confirmed / total) * 100 : 0;
    const suspectedPct = total > 0 ? (suspected / total) * 100 : 0;

    return {
      total,
      confirmed,
      suspected,
      confirmedPct,
      suspectedPct,
      byConfidence,
    };
  }, [reports]);

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="confirmed-vs-suspected-analysis"
    >
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
        <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
          Diagnosis Status & Verification Pipeline
        </h2>
        <span className="text-[11px] font-mono text-[#526074]">
          {analysis.total} Contributing Case Logs
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Comparison Ratio Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Confirmed Diagnoses */}
          <div className="p-4 bg-[#FDF7F7] border border-[#F5C2C7] rounded-[4px] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#6E1423]">
                <span className="inline-block w-2.5 h-2.5 bg-[#B7301F]" aria-hidden="true" />
                <span>CONFIRMED DIAGNOSES</span>
              </div>
              <p className="text-[11px] text-[#526074] mt-1">
                Verified via Licensed Field Veterinarian clinical examination or Laboratory assay.
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-[#6E1423] tabular-nums">
                  {analysis.confirmed}
                </span>
                <span className="text-xs font-mono text-[#526074]">
                  ({analysis.confirmedPct.toFixed(1)}% of total cluster)
                </span>
              </div>
            </div>
            <CheckSquare className="w-5 h-5 text-[#B7301F] shrink-0" />
          </div>

          {/* Suspected Diagnoses */}
          <div className="p-4 bg-[#FFFBF7] border border-[#F9D7B5] rounded-[4px] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#D97B1F]">
                <span className="inline-block w-2.5 h-2.5 border-2 border-[#D97B1F] rotate-45" aria-hidden="true" />
                <span>SUSPECTED / PRELIMINARY</span>
              </div>
              <p className="text-[11px] text-[#526074] mt-1">
                Unverified direct farmer symptom reports or provisional computer-vision scans.
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-[#D97B1F] tabular-nums">
                  {analysis.suspected}
                </span>
                <span className="text-xs font-mono text-[#526074]">
                  ({analysis.suspectedPct.toFixed(1)}% triage queue)
                </span>
              </div>
            </div>
            <AlertTriangle className="w-5 h-5 text-[#D97B1F] shrink-0" />
          </div>
        </div>

        {/* Diagnostic Confidence Breakdown */}
        <div className="pt-2">
          <h3 className="text-xs font-mono uppercase font-semibold text-[#526074] mb-2.5">
            Diagnostic Confidence Sources
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded">
              <div className="flex items-center gap-1.5 text-[#526074] mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-[#1E5C97]" />
                <span className="font-semibold">VETERINARIAN</span>
              </div>
              <span className="text-lg font-bold text-[#101826] tabular-nums">
                {analysis.byConfidence.VETERINARIAN}
              </span>
              <span className="text-[10px] text-[#526074] block mt-0.5">Clinical Examination</span>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded">
              <div className="flex items-center gap-1.5 text-[#526074] mb-1">
                <FlaskConical className="w-3.5 h-3.5 text-[#3E7C4A]" />
                <span className="font-semibold">LAB CONFIRMED</span>
              </div>
              <span className="text-lg font-bold text-[#101826] tabular-nums">
                {analysis.byConfidence.LAB_CONFIRMED}
              </span>
              <span className="text-[10px] text-[#526074] block mt-0.5">PCR / ELISA / Serology</span>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded">
              <div className="flex items-center gap-1.5 text-[#526074] mb-1">
                <Bot className="w-3.5 h-3.5 text-[#D97B1F]" />
                <span className="font-semibold">AI VERIFIED</span>
              </div>
              <span className="text-lg font-bold text-[#101826] tabular-nums">
                {analysis.byConfidence.AI_VERIFIED}
              </span>
              <span className="text-[10px] text-[#526074] block mt-0.5">Provisional Edge Scan</span>
            </div>

            <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded">
              <div className="flex items-center gap-1.5 text-[#526074] mb-1">
                <Building2 className="w-3.5 h-3.5 text-[#101826]" />
                <span className="font-semibold">GOVERNMENT</span>
              </div>
              <span className="text-lg font-bold text-[#101826] tabular-nums">
                {analysis.byConfidence.GOVERNMENT}
              </span>
              <span className="text-[10px] text-[#526074] block mt-0.5">Official Surveillance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
