import React from 'react';
import { PriorityImmunityDeficitZoneDto } from '../../core/types/vaccination.types';
import { Badge } from '../ui/Badge';
import { ArrowRight, Siren, Syringe } from 'lucide-react';
import { Button } from '../ui/Button';

interface PriorityDeficitRankingCardProps {
  priorityZones: PriorityImmunityDeficitZoneDto[];
  onSelectOutbreak?: (outbreakId: string) => void;
  onLaunchRingCampaign?: (zone: PriorityImmunityDeficitZoneDto) => void;
}

export const PriorityDeficitRankingCard: React.FC<PriorityDeficitRankingCardProps> = ({
  priorityZones,
  onSelectOutbreak,
  onLaunchRingCampaign,
}) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT_RING_VACCINATION':
        return <Badge variant="danger" size="sm">URGENT RING VACCINATION</Badge>;
      case 'ELEVATED_SURVEILLANCE':
        return <Badge variant="warning" size="sm">ELEVATED SURVEILLANCE</Badge>;
      case 'ROUTINE_MONITORING':
      default:
        return <Badge variant="neutral" size="sm">ROUTINE MONITORING</Badge>;
    }
  };

  if (!priorityZones || priorityZones.length === 0) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-6 text-center text-xs font-mono text-[#526074]">
        No high-deficit priority vaccination zones identified across current active surveillance sectors.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs select-none">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <Siren className="w-4 h-4 text-[#B7301F]" />
          <h2 className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
            Operational Priority Ranking — Immunity Deficit vs Outbreak Risk
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          Deterministic Ranking: Risk Score + Immunity Gap
        </span>
      </div>

      <div className="space-y-3">
        {priorityZones.map((zone, idx) => (
          <div
            key={zone.outbreakId}
            className="p-3.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#1E5C97] transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#E4EDF6] text-[#1E5C97] font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#101826] text-xs">
                    {zone.zoneName}
                  </h3>
                  {getPriorityBadge(zone.operationalPriority)}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#526074] mt-1">
                  <span>
                    Primary Pathogen: <strong className="text-[#101826]">{zone.primaryDisease}</strong>
                  </span>
                  <span>
                    Immunity Gap: <strong className="text-[#B7301F]">{zone.immunityGapPercentage.toFixed(1)}%</strong>
                  </span>
                  <span>
                    Cluster Risk: <strong className="text-[#101826]">{zone.outbreakRiskScore.toFixed(1)}/100</strong>
                  </span>
                </div>
                <p className="text-[11px] text-[#101826] bg-[#FFFFFF] border border-[#E1E6EC] rounded p-2 mt-2 leading-relaxed font-mono">
                  <strong>Guidance:</strong> {zone.recommendedAction}
                </p>
              </div>
            </div>

            <div className="shrink-0 self-end md:self-center flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onLaunchRingCampaign?.(zone)}
                className="font-mono text-xs whitespace-nowrap bg-[#1E5C97] text-white hover:bg-[#154370]"
              >
                <Syringe className="w-3.5 h-3.5 mr-1 text-white" />
                <span>Launch Ring Campaign</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectOutbreak?.(zone.outbreakId)}
                className="font-mono text-xs whitespace-nowrap"
              >
                <span>Inspect Cluster</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#1E5C97]" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
