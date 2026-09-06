import React, { useMemo } from 'react';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { Calendar } from 'lucide-react';

interface OutbreakEpidemiologicalTimelineProps {
  reports: DiseaseReportResponse[];
}

interface DailyBucket {
  dateStr: string;
  displayDate: string;
  total: number;
  confirmed: number;
  suspected: number;
}

export const OutbreakEpidemiologicalTimeline: React.FC<OutbreakEpidemiologicalTimelineProps> = ({
  reports,
}) => {
  const timelineData = useMemo(() => {
    const buckets: Record<string, DailyBucket> = {};

    reports.forEach((r) => {
      if (!r.createdAt) return;
      const dateObj = new Date(r.createdAt);
      const dateKey = dateObj.toISOString().split('T')[0];
      const displayDate = dateObj.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });

      if (!buckets[dateKey]) {
        buckets[dateKey] = {
          dateStr: dateKey,
          displayDate,
          total: 0,
          confirmed: 0,
          suspected: 0,
        };
      }

      buckets[dateKey].total++;
      if (r.diagnosisStatus === 'CONFIRMED') {
        buckets[dateKey].confirmed++;
      } else {
        buckets[dateKey].suspected++;
      }
    });

    const sortedBuckets = Object.values(buckets).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    const maxDayCount = Math.max(1, ...sortedBuckets.map((b) => b.total));

    return {
      buckets: sortedBuckets,
      maxDayCount,
      totalCount: reports.length,
    };
  }, [reports]);

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="outbreak-epidemiological-timeline"
    >
      <div className="px-5 py-3.5 bg-[#FAFBFC] border-b border-[#E1E6EC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            Epidemiological Case Chronology & Daily Progression
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#526074]">
          Case Velocity Stream
        </span>
      </div>

      <div className="p-5 space-y-4">
        {timelineData.buckets.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-[#526074]">
            No temporal incident timestamps attached to this outbreak cluster.
          </div>
        ) : (
          <div>
            {/* Visual Column / Bar Chart of Daily Incident Progression */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-[#526074] flex items-center justify-between mb-1">
                <span>Daily Case Submissions (Confirmed vs Suspected)</span>
                <span>Peak: {timelineData.maxDayCount} Cases/Day</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {timelineData.buckets.map((bucket) => {
                  const confirmedHeightPct = (bucket.confirmed / timelineData.maxDayCount) * 100;
                  const suspectedHeightPct = (bucket.suspected / timelineData.maxDayCount) * 100;

                  return (
                    <div
                      key={bucket.dateStr}
                      className="p-2.5 bg-[#F8FAFC] border border-[#E1E6EC] rounded flex flex-col justify-between text-center"
                    >
                      <span className="text-[11px] font-mono font-semibold text-[#101826] block">
                        {bucket.displayDate}
                      </span>

                      {/* Stacked Visual Bar */}
                      <div className="h-16 w-full flex items-end justify-center my-2 gap-1 px-2">
                        <div
                          className="w-1/2 bg-[#B7301F] rounded-t-[2px] transition-all"
                          style={{ height: `${Math.max(8, confirmedHeightPct)}%` }}
                          title={`Confirmed: ${bucket.confirmed}`}
                        />
                        <div
                          className="w-1/2 bg-[#D97B1F] rounded-t-[2px] transition-all opacity-80"
                          style={{ height: `${Math.max(8, suspectedHeightPct)}%` }}
                          title={`Suspected: ${bucket.suspected}`}
                        />
                      </div>

                      <div className="text-[10px] font-mono flex items-center justify-center gap-1.5 text-[#526074]">
                        <span className="text-[#B7301F] font-bold">{bucket.confirmed}■</span>
                        <span>/</span>
                        <span className="text-[#D97B1F] font-bold">{bucket.suspected}◇</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accessibility Descriptive Summary */}
            <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded text-xs font-mono text-[#526074]">
              <span className="font-semibold text-[#101826]">Surveillance Velocity Log: </span>
              Active across {timelineData.buckets.length} daily reporting window(s) totaling {timelineData.totalCount} reports.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
