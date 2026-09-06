import React, { useMemo } from 'react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { OperationalPriorityItem } from '../../core/types/alerts.types';
import { Badge } from '../ui/Badge';
import { ArrowRight, Layers } from 'lucide-react';
import { Button } from '../ui/Button';

interface OperationalPriorityQueueCardProps {
  outbreaks: OutbreakResponse[];
  onSelectOutbreak?: (outbreakId: string) => void;
}

export const OperationalPriorityQueueCard: React.FC<OperationalPriorityQueueCardProps> = ({
  outbreaks,
  onSelectOutbreak,
}) => {
  const priorityItems = useMemo<OperationalPriorityItem[]>(() => {
    return outbreaks
      .filter((o) => o.status !== 'RESOLVED')
      .map((o) => {
        const hasRisk = o.compositeRiskScore != null;
        const hasGap = o.riskBreakdown?.vaccinationGapScore != null;
        const hasCases = o.affectedReportsCount != null;

        const riskScore = hasRisk ? o.compositeRiskScore! : null;
        const vacGap = hasGap ? o.riskBreakdown!.vaccinationGapScore! : null;
        const cases = hasCases ? o.affectedReportsCount! : null;

        // Deterministic Operational Priority Triage Calculation (No fabricated fallbacks):
        let priorityScore = 0;
        let explanation = '';

        if (hasRisk && hasGap) {
          priorityScore = riskScore! * 0.5 + vacGap! * 0.3 + Math.min((cases ?? 0) * 4, 20);
          explanation = `Triage ranking derived from Multi-Signal Risk (${riskScore}/100 × 50%) + Vaccination Gap Score (${vacGap!.toFixed(0)}/100 × 30%) + Case Volume (${cases ?? 0} cases × 4, max 20).`;
        } else if (hasRisk) {
          priorityScore = riskScore! * 0.7 + Math.min((cases ?? 0) * 4, 30);
          explanation = `Triage ranking derived from Multi-Signal Risk (${riskScore}/100 × 70%) + Case Volume (${cases ?? 0} cases, max 30). Vaccination gap data unavailable.`;
        } else if (hasCases) {
          priorityScore = Math.min(cases! * 10, 50);
          explanation = `Triage ranking derived from Raw Case Count (${cases} cases). Multi-signal risk score unavailable.`;
        } else {
          priorityScore = 0;
          explanation = 'Insufficient surveillance telemetry for priority scoring.';
        }

        priorityScore = Math.min(100, Math.max(0, priorityScore));

        let priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        if (priorityScore >= 75) priorityLevel = 'CRITICAL';
        else if (priorityScore >= 50) priorityLevel = 'HIGH';
        else if (priorityScore >= 30) priorityLevel = 'MEDIUM';
        else priorityLevel = 'LOW';

        return {
          id: o.id,
          title: `Action Priority: ${o.diseaseName} Cluster`,
          diseaseName: o.diseaseName,
          location: `Lat ${o.centerLatitude.toFixed(2)}, Lng ${o.centerLongitude.toFixed(2)} (±${o.radiusKm}km)`,
          priorityLevel,
          operationalPriorityScore: Math.round(priorityScore * 10) / 10,
          compositeRiskScore: riskScore,
          vaccinationGapScore: vacGap,
          caseCount: cases,
          formulaExplanation: explanation,
          recommendedAction:
            o.riskBreakdown?.recommendedAction ||
            'No recommendation available from surveillance telemetry.',
          outbreakId: o.id,
        };
      })
      .sort((a, b) => b.operationalPriorityScore - a.operationalPriorityScore);
  }, [outbreaks]);

  if (priorityItems.length === 0) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-6 text-center text-xs font-mono text-[#526074]">
        No active operational priorities requiring urgent field intervention.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#E1E6EC] gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1E5C97]" />
          <div>
            <h2 className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
              Operational Priority Queue — Field Intervention & Dispatch Ranking
            </h2>
            <p className="text-[10px] font-mono text-[#526074] mt-0.5">
              Operational triage ranking for logistical resource allocation. Multi-signal epidemiological risk score (0–100) ≠ Clinical Probability.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#526074] shrink-0">
          {priorityItems.length} Actionable Situations Ranked
        </span>
      </div>

      <div className="space-y-3">
        {priorityItems.slice(0, 5).map((item, idx) => (
          <div
            key={item.id}
            className="p-3.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#1E5C97] transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1E5C97] text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#101826] text-xs">
                    {item.diseaseName}
                  </h3>
                  <Badge
                    variant={
                      item.priorityLevel === 'CRITICAL'
                        ? 'danger'
                        : item.priorityLevel === 'HIGH'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  >
                    OPERATIONAL TRIAGE: {item.operationalPriorityScore.toFixed(1)}/100
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#526074]">
                  <span>Sector: <strong className="text-[#101826]">{item.location}</strong></span>
                  <span>·</span>
                  <span>
                    Multi-Signal Risk:{' '}
                    {item.compositeRiskScore != null ? (
                      <strong className="text-[#101826]">{item.compositeRiskScore}/100</strong>
                    ) : (
                      <span className="text-[#526074] italic">N/A</span>
                    )}
                  </span>
                  <span>·</span>
                  <span>
                    Vaccination Gap Score:{' '}
                    {item.vaccinationGapScore != null ? (
                      <strong className="text-[#B7301F]">{item.vaccinationGapScore.toFixed(1)}/100</strong>
                    ) : (
                      <span className="text-[#526074] italic">N/A</span>
                    )}
                  </span>
                  <span>·</span>
                  <span>
                    Cases:{' '}
                    {item.caseCount != null ? (
                      <strong className="text-[#101826]">{item.caseCount}</strong>
                    ) : (
                      <span className="text-[#526074] italic">N/A</span>
                    )}
                  </span>
                </div>

                <div className="mt-2 text-[10px] font-mono text-[#526074] bg-white border border-[#E1E6EC] rounded p-2">
                  <strong className="text-[#1E5C97]">Triage Rationale:</strong> {item.formulaExplanation}
                </div>

                <div className="mt-1 text-[10px] font-mono text-[#526074] bg-[#F1F4F8] border border-[#E1E6EC] rounded p-2">
                  <strong className="text-[#101826]">Action Guidance:</strong> {item.recommendedAction}
                </div>
              </div>
            </div>

            <div className="shrink-0 self-end md:self-center">
              {item.outbreakId && onSelectOutbreak && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectOutbreak(item.outbreakId!)}
                  className="font-mono text-xs whitespace-nowrap"
                >
                  <span>Open Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#1E5C97]" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
