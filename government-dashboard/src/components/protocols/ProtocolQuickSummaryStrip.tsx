import React from 'react';
import { BookOpen, ShieldAlert, AlertTriangle, Flame } from 'lucide-react';
import { DiseaseProtocolRecord } from '../../core/types/protocol.types';
import { OutbreakResponse } from '../../core/types/outbreak.types';

interface ProtocolQuickSummaryStripProps {
  protocols: DiseaseProtocolRecord[];
  outbreaks: OutbreakResponse[];
  isLoading?: boolean;
}

export const ProtocolQuickSummaryStrip: React.FC<ProtocolQuickSummaryStripProps> = ({
  protocols,
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

  const totalCount = protocols.length;
  const reportableCount = protocols.filter((p) => p.isReportable === true).length;
  const zoonoticCount = protocols.filter((p) => p.isZoonotic === true).length;

  const activeOutbreakDiseases = Array.from(
    new Set(outbreaks.filter((o) => o.status !== 'RESOLVED').map((o) => o.diseaseName.toLowerCase()))
  );
  const activeCorrelatedCount = protocols.filter((p) =>
    activeOutbreakDiseases.includes(p.diseaseName.toLowerCase())
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {/* 1. Total Registered SOPs */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526074]">
            Registered Pathogens
          </span>
          <div className="w-6 h-6 rounded bg-[#EBF5FB] text-[#1E5C97] flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-[#101826]">{totalCount}</span>
          <span className="text-[10px] font-mono text-[#526074]">Pathogen Profiles</span>
        </div>
        <p className="text-[10px] text-[#526074] mt-1 font-mono">
          Status: <strong className="text-[#1E5C97]">REFERENCE_CONTENT</strong>
        </p>
      </div>

      {/* 2. Statutory Reportable Mandates */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526074]">
            Notifiable / Reportable
          </span>
          <div className="w-6 h-6 rounded bg-[#FBEBEB] text-[#B7301F] flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-[#101826]">{reportableCount}</span>
          <span className="text-[10px] font-mono text-[#526074]">of {totalCount} Pathogens</span>
        </div>
        <p className="text-[10px] text-[#526074] mt-1 font-mono">Recorded in Disease Registry</p>
      </div>

      {/* 3. Zoonotic Public Health Alerts */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526074]">
            Zoonotic Potential
          </span>
          <div className="w-6 h-6 rounded bg-[#FEF3E8] text-[#D97B1F] flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-[#101826]">{zoonoticCount}</span>
          <span className="text-[10px] font-mono text-[#526074]">Human Transmission Risk</span>
        </div>
        <p className="text-[10px] text-[#526074] mt-1 font-mono">Recorded in Disease Registry</p>
      </div>

      {/* 4. Active Outbreaks Correlated */}
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-3.5 shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#526074]">
            Active Outbreak Clusters
          </span>
          <div className="w-6 h-6 rounded bg-[#EDF7F0] text-[#3E7C4A] flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-[#101826]">{activeCorrelatedCount}</span>
          <span className="text-[10px] font-mono text-[#526074]">Pathogens Active</span>
        </div>
        <p className="text-[10px] text-[#526074] mt-1 font-mono">Correlated from Surveillance Feed</p>
      </div>
    </div>
  );
};
