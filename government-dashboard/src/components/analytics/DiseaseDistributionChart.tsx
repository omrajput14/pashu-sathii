import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

interface DiseaseDistributionChartProps {
  diseaseDistribution?: Record<string, number>;
  mostCommonDiseases?: string[];
}

export const DiseaseDistributionChart: React.FC<DiseaseDistributionChartProps> = ({
  diseaseDistribution = {},
  mostCommonDiseases,
}) => {
  const data = useMemo(() => {
    const entries = Object.entries(diseaseDistribution);
    const totalCases = entries.reduce((acc, [, count]) => acc + count, 0);

    const items = entries.map(([name, count]) => {
      const percentage = totalCases > 0 ? (count / totalCases) * 100 : 0;
      return { name, count, percentage };
    }).sort((a, b) => b.count - a.count);

    return {
      items,
      totalCases,
    };
  }, [diseaseDistribution]);

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="disease-distribution-chart"
    >
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Disease Prevalence & Spatial Distribution
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          {data.totalCases} Total Case Reports
        </span>
      </div>

      <div className="p-5 space-y-4">
        {data.items.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#526074]">
            No disease prevalence data currently available.
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((item, idx) => (
              <div key={item.name} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#526074] font-bold">#{idx + 1}</span>
                    <span className="font-semibold text-[#101826]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#101826] tabular-nums">{item.count} cases</span>
                    <span className="text-[11px] text-[#526074] tabular-nums w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full h-2 bg-[#F1F4F8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1E5C97] rounded-full transition-all"
                    style={{ width: `${Math.max(2, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}

            {mostCommonDiseases && mostCommonDiseases.length > 0 && (
              <div className="pt-2 border-t border-[#E1E6EC] text-[11px] font-mono text-[#526074]">
                Top Endemic Clusters: {mostCommonDiseases.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
