import React, { useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { RISK_CONFIG } from '../../core/theme/tokens';

interface RiskSeverityDistributionCardProps {
  outbreaks: OutbreakResponse[];
}

export const RiskSeverityDistributionCard: React.FC<RiskSeverityDistributionCardProps> = ({
  outbreaks,
}) => {
  const counts = useMemo(() => {
    const map = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    outbreaks.forEach((o) => {
      if (o.riskScore && map[o.riskScore] !== undefined) {
        map[o.riskScore]++;
      }
    });

    const total = outbreaks.length;
    return {
      map,
      total,
    };
  }, [outbreaks]);

  const tiers = [
    { key: 'CRITICAL', conf: RISK_CONFIG.CRITICAL },
    { key: 'HIGH', conf: RISK_CONFIG.HIGH },
    { key: 'MEDIUM', conf: RISK_CONFIG.MEDIUM },
    { key: 'LOW', conf: RISK_CONFIG.LOW },
  ] as const;

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="risk-severity-distribution-card"
    >
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Risk Severity Spectrum (Multi-Signal Tiers)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          {counts.total} Spatial Clusters
        </span>
      </div>

      <div className="p-5 space-y-3.5">
        {counts.total === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#526074]">
            No outbreak cluster records available.
          </div>
        ) : (
          tiers.map(({ key, conf }) => {
            const count = counts.map[key];
            const pct = counts.total > 0 ? (count / counts.total) * 100 : 0;

            return (
              <div key={key} className="space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-[1px]"
                      style={{ backgroundColor: conf.color }}
                    />
                    <span className="font-bold text-[#101826]">{conf.label}</span>
                    <span className="text-[11px] text-[#526074]">({conf.scoreRangeLabel})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#101826] tabular-nums">{count} clusters</span>
                    <span className="text-[11px] text-[#526074] tabular-nums w-12 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#F1F4F8] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(2, pct)}%`,
                      backgroundColor: conf.color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
