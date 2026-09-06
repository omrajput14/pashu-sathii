import React, { useMemo } from 'react';
import { ShieldCheck, Stethoscope, FlaskConical, Bot, Building2 } from 'lucide-react';

interface ConfidenceSourceDistributionChartProps {
  confidenceSources?: Record<string, number>;
}

export const ConfidenceSourceDistributionChart: React.FC<ConfidenceSourceDistributionChartProps> = ({
  confidenceSources = {},
}) => {
  const stats = useMemo(() => {
    const vet = confidenceSources.VETERINARIAN ?? 0;
    const lab = confidenceSources.LAB_CONFIRMED ?? 0;
    const ai = confidenceSources.AI_VERIFIED ?? 0;
    const gov = confidenceSources.GOVERNMENT ?? 0;
    const total = vet + lab + ai + gov;

    return {
      vet,
      lab,
      ai,
      gov,
      total,
      vetPct: total > 0 ? (vet / total) * 100 : 0,
      labPct: total > 0 ? (lab / total) * 100 : 0,
      aiPct: total > 0 ? (ai / total) * 100 : 0,
      govPct: total > 0 ? (gov / total) * 100 : 0,
    };
  }, [confidenceSources]);

  const sources = [
    {
      label: 'Licensed Field Veterinarians',
      code: 'VETERINARIAN',
      count: stats.vet,
      pct: stats.vetPct,
      color: 'bg-[#1E5C97]',
      icon: Stethoscope,
      description: 'Definitive clinical triage & physical examination',
    },
    {
      label: 'Clinical Lab Confirmations',
      code: 'LAB_CONFIRMED',
      count: stats.lab,
      pct: stats.labPct,
      color: 'bg-[#3E7C4A]',
      icon: FlaskConical,
      description: 'PCR / serology confirmation entered via clinical record (LIMS bridge planned)',
    },
    {
      label: 'AI Multimodal Vision Scans',
      code: 'AI_VERIFIED',
      count: stats.ai,
      pct: stats.aiPct,
      color: 'bg-[#D97B1F]',
      icon: Bot,
      description: 'Provisional automated symptom triage (Farmer app)',
    },
    {
      label: 'Official Government Surveillance',
      code: 'GOVERNMENT',
      count: stats.gov,
      pct: stats.govPct,
      color: 'bg-[#6E1423]',
      icon: Building2,
      description: 'State epidemiological field survey & audit teams',
    },
  ];

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 flex flex-col justify-between shadow-subtle text-xs"
      data-testid="confidence-source-chart"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1E5C97]" />
          <h3 className="font-bold text-[#101826] uppercase font-mono tracking-wider">
            Diagnostic Verification Pipelines
          </h3>
        </div>
        <span className="font-mono text-[11px] text-[#526074]">
          Total Diagnoses: <strong className="text-[#101826]">{stats.total}</strong>
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="py-4">
        <div className="w-full h-3 bg-[#F1F4F8] rounded-[2px] overflow-hidden flex">
          {stats.total > 0 ? (
            <>
              {stats.vetPct > 0 && (
                <div
                  className="bg-[#1E5C97] h-full transition-all duration-500"
                  style={{ width: `${stats.vetPct}%` }}
                  title={`Veterinarian: ${stats.vetPct.toFixed(1)}%`}
                />
              )}
              {stats.labPct > 0 && (
                <div
                  className="bg-[#3E7C4A] h-full transition-all duration-500"
                  style={{ width: `${stats.labPct}%` }}
                  title={`Lab Confirmed: ${stats.labPct.toFixed(1)}%`}
                />
              )}
              {stats.aiPct > 0 && (
                <div
                  className="bg-[#D97B1F] h-full transition-all duration-500"
                  style={{ width: `${stats.aiPct}%` }}
                  title={`AI Verified: ${stats.aiPct.toFixed(1)}%`}
                />
              )}
              {stats.govPct > 0 && (
                <div
                  className="bg-[#6E1423] h-full transition-all duration-500"
                  style={{ width: `${stats.govPct}%` }}
                  title={`Government: ${stats.govPct.toFixed(1)}%`}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-[#E1E6EC]" />
          )}
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sources.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.code}
              className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-[3px] bg-white border border-[#E1E6EC] text-[#526074]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-[#101826] text-[11px] leading-tight">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-[#526074] font-mono mt-0.5">
                    {s.description}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono shrink-0 pl-2">
                <div className="font-bold text-[#101826] text-xs">
                  {s.count}
                </div>
                <div className="text-[10px] text-[#526074]">
                  {s.pct.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
