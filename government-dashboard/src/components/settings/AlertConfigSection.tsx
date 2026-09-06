import React from 'react';
import { AlertConfig } from '../../core/types/system.types';
import { Badge } from '../ui/Badge';
import { BellRing, ShieldCheck, Flame, ListOrdered } from 'lucide-react';

interface AlertConfigSectionProps {
  alerts: AlertConfig | null;
}

export const AlertConfigSection: React.FC<AlertConfigSectionProps> = ({
  alerts,
}) => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-sm font-bold font-mono text-[#101826] uppercase">
            Operational Alert Derivation & Priority Parameters
          </h2>
        </div>
        <Badge variant="outline" size="sm" className="font-mono text-[#1E5C97] border-[#1E5C97]">
          READ-ONLY BACKEND DATA
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono">
        {/* Derivation Architecture */}
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#526074]">
            <span>ALERT ENGINE MODE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#3E7C4A]" />
          </div>
          <strong className="text-[#101826] text-xs block">
            {alerts?.evaluationMode || 'Dynamic Deterministic Derivation'}
          </strong>
          <p className="text-[10px] text-[#526074]">
            Stateless projection with deterministic ID hashing (Idempotent polling).
          </p>
        </div>

        {/* Critical Threshold */}
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#526074]">
            <span>EPIDEMIOLOGICAL TRIGGER</span>
            <Flame className="w-3.5 h-3.5 text-[#B7301F]" />
          </div>
          <strong className="text-[#B7301F] text-xs block">
            Composite Risk ≥ {alerts?.epidemiologicalRiskThreshold ?? 80} pts
          </strong>
          <p className="text-[10px] text-[#526074]">
            Automatic immediate priority alert dispatch to state surveillance officer.
          </p>
        </div>

        {/* Operational Priority Formula */}
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#526074]">
            <span>OPERATIONAL PRIORITY SCORE</span>
            <ListOrdered className="w-3.5 h-3.5 text-[#1E5C97]" />
          </div>
          <strong className="text-[#101826] text-xs block">
            {alerts?.operationalPriorityFormula || '0.50 * Risk + 0.30 * VacGap + 0.20 * Velocity'}
          </strong>
          <p className="text-[10px] text-[#526074]">
            Operational triage ranking for logistics and veterinary deployment.
          </p>
        </div>
      </div>

      <div className="p-2 bg-[#F1F4F8] border border-[#E1E6EC] rounded text-[10px] font-mono text-[#526074]">
        <strong>Distinction:</strong> Multi-Signal Risk Score evaluates medical & biological outbreak severity. Operational Priority Score ranks operational queue urgency for veterinary field response.
      </div>
    </div>
  );
};
