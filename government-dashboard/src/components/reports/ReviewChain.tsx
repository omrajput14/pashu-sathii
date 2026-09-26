import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { diseaseService } from '../../core/api/diseaseService';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { AI_REVIEW_BADGE, reviewSteps } from '../../core/utils/aiReview';

const STEP_BADGE: Record<string, string> = {
  ...AI_REVIEW_BADGE,
  ai: 'bg-[#EDE9FE] text-[#6366F1] border-[#DDD6FE]',
  report: 'bg-[#F6F8FA] text-[#526074] border-[#E1E6EC]',
};

/** How a case was reviewed: AI → para-vet field check → vet decision (or who reported it). */
export const ReviewChain: React.FC<{ report: DiseaseReportResponse; compact?: boolean }> = ({ report, compact }) => {
  const { data: scans = [] } = useQuery({
    queryKey: ['aiScreeningsAll'],
    queryFn: () => diseaseService.listAIScreenings(),
    enabled: !!report.aiScanId,
  });
  const scan = report.aiScanId ? scans.find((s) => s.id === report.aiScanId) : undefined;
  const steps = reviewSteps(report, scan);

  return (
    <div className={`flex flex-wrap items-center gap-1 ${compact ? 'mt-1' : ''}`} data-testid="review-chain">
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          {i > 0 && <ChevronRight className="w-3 h-3 text-[#93A1B0]" />}
          <span
            className={`inline-flex flex-col px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold ${STEP_BADGE[step.tone]}`}
            title={step.detail}
          >
            <span>{step.label}</span>
            {!compact && step.detail && <span className="font-normal normal-case">{step.detail}</span>}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};
