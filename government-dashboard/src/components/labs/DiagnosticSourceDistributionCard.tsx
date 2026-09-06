import React from 'react';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { FlaskConical, Stethoscope, Cpu, Shield, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface DiagnosticSourceDistributionCardProps {
  reports: DiseaseReportResponse[];
}

export const DiagnosticSourceDistributionCard: React.FC<DiagnosticSourceDistributionCardProps> = ({
  reports,
}) => {
  const total = reports.length;

  const labCount = reports.filter((r) => r.diagnosisConfidenceSource === 'LAB_CONFIRMED').length;
  const vetCount = reports.filter((r) => r.diagnosisConfidenceSource === 'VETERINARIAN').length;
  const aiCount = reports.filter((r) => r.diagnosisConfidenceSource === 'AI_VERIFIED').length;
  const govtCount = reports.filter((r) => r.diagnosisConfidenceSource === 'GOVERNMENT').length;

  const labPct = total > 0 ? (labCount / total) * 100 : 0;
  const vetPct = total > 0 ? (vetCount / total) * 100 : 0;
  const aiPct = total > 0 ? (aiCount / total) * 100 : 0;
  const govtPct = total > 0 ? (govtCount / total) * 100 : 0;

  const sources = [
    {
      id: 'LAB_CONFIRMED',
      label: 'Diagnostic Laboratory Assay (LAB_CONFIRMED)',
      count: labCount,
      pct: labPct,
      icon: FlaskConical,
      barColor: 'bg-[#1E5C97]',
      badgeVariant: 'info' as const,
      description: 'Definitive molecular / serological confirmation registered on clinical record.',
    },
    {
      id: 'VETERINARIAN',
      label: 'Veterinary Field Diagnosis (VETERINARIAN)',
      count: vetCount,
      pct: vetPct,
      icon: Stethoscope,
      barColor: 'bg-[#2E7D32]',
      badgeVariant: 'success' as const,
      description: 'Physical clinical examination conducted by a registered veterinary doctor.',
    },
    {
      id: 'AI_VERIFIED',
      label: 'Automated AI Syndromic Scan (AI_VERIFIED)',
      count: aiCount,
      pct: aiPct,
      icon: Cpu,
      barColor: 'bg-[#6A1B9A]',
      badgeVariant: 'warning' as const,
      description: 'Computer-vision assisted preliminary screening from field image telemetry.',
    },
    {
      id: 'GOVERNMENT',
      label: 'Statutory Health Officer (GOVERNMENT)',
      count: govtCount,
      pct: govtPct,
      icon: Shield,
      barColor: 'bg-[#C62828]',
      badgeVariant: 'danger' as const,
      description: 'Direct administrative notification from Department of Animal Husbandry.',
    },
  ];

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#E1E6EC] gap-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#1E5C97]" />
          <div>
            <h2 className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
              Diagnostic Confidence Source Breakdown
            </h2>
            <p className="text-[10px] font-mono text-[#526074] mt-0.5">
              Empirical distribution across currently loaded surveillance stream ({total} records loaded).
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#526074] shrink-0">
          Source Breakdown (Loaded Telemetry Stream)
        </span>
      </div>

      {/* Progress Bars Stack */}
      <div className="space-y-3">
        {sources.map((src) => {
          const Icon = src.icon;
          return (
            <div key={src.id} className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-[#526074]" />
                  <span className="font-semibold text-[#101826] text-xs">{src.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={src.badgeVariant} size="sm">
                    {src.count} {src.count === 1 ? 'Record' : 'Records'}
                  </Badge>
                  <span className="font-mono font-bold text-xs text-[#101826]">
                    {src.pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full bg-[#E1E6EC] h-1.5 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full ${src.barColor} transition-all duration-300`}
                  style={{ width: `${Math.min(100, Math.max(0, src.pct))}%` }}
                />
              </div>

              <p className="text-[10px] font-mono text-[#526074]">{src.description}</p>
            </div>
          );
        })}
      </div>

      {/* Institutional Protocol Notice */}
      <div className="mt-3 p-2.5 bg-[#F1F4F8] border border-[#E1E6EC] rounded-[4px] flex items-start gap-2 text-[10px] font-mono text-[#526074]">
        <Info className="w-4 h-4 text-[#1E5C97] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#101826]">Institutional Distinction:</strong> A{' '}
          <span className="font-bold text-[#B7301F]">CONFIRMED</span> diagnosis status does not automatically imply
          laboratory verification unless the confidence source is explicitly{' '}
          <span className="font-bold text-[#1E5C97]">LAB_CONFIRMED</span>. AI Verification indicates automated visual
          triage and is strictly isolated from laboratory evidence. Metrics reflect the active surveillance stream.
        </div>
      </div>
    </div>
  );
};
