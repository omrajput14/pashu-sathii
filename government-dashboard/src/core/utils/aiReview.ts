import { AIScreeningResponse } from '../types/disease.types';

export type AiReviewTone = 'pending' | 'escalated' | 'confirmed' | 'rejected';

/** What happened to an AI scan, from its status (not veterinarianVerified, which is also true on rejection). */
export function aiReviewState(
  s: Pick<AIScreeningResponse, 'status' | 'verifiedByVetName' | 'triagedByName' | 'reviewNotes' | 'triageNotes'>,
): { label: string; tone: AiReviewTone; detail?: string } {
  switch (s.status) {
    case 'VERIFIED':
      return { label: 'Confirmed by vet', tone: 'confirmed', detail: s.verifiedByVetName ?? undefined };
    case 'REJECTED':
      return {
        label: 'Rejected',
        tone: 'rejected',
        detail: [s.verifiedByVetName, s.reviewNotes].filter(Boolean).join(': ') || undefined,
      };
    case 'ESCALATED':
      return {
        label: 'Escalated by para-vet',
        tone: 'escalated',
        detail: [s.triagedByName, s.triageNotes].filter(Boolean).join(': ') || undefined,
      };
    default:
      return { label: 'Awaiting field check', tone: 'pending' };
  }
}

export const AI_REVIEW_BADGE: Record<AiReviewTone, string> = {
  pending: 'bg-[#FEF3E8] text-[#D97B1F] border-[#FADCC0]',
  escalated: 'bg-[#E4EDF6] text-[#1E5C97] border-[#C4D6EA]',
  confirmed: 'bg-[#EDF7F0] text-[#1B806A] border-[#C2E7DA]',
  rejected: 'bg-[#FBEBEB] text-[#B7301F] border-[#F5C2C7]',
};

/** One step in how a case was reviewed. */
export interface ReviewStep {
  label: string;
  detail?: string;
  tone: AiReviewTone | 'ai' | 'report';
}

/**
 * How a case got its status: AI reading -> para-vet field check -> vet decision for AI-scan cases,
 * or who reported it for field reports. "Confirmed" only ever comes from a vet.
 */
export function reviewSteps(
  report: { aiScanId: string | null; diagnosisStatus: string; reportedByName?: string | null; reportSource?: string | null },
  scan?: AIScreeningResponse,
): ReviewStep[] {
  if (!report.aiScanId || !scan) {
    const who = report.reportedByName || 'field user';
    const steps: ReviewStep[] = [
      { label: report.reportSource === 'VETERINARIAN' ? `Vet report: ${who}` : `Reported by ${who}`, tone: 'report' },
    ];
    if (report.diagnosisStatus === 'CONFIRMED') steps.push({ label: 'Confirmed', tone: 'confirmed' });
    return steps;
  }
  const pct = scan.confidenceScore != null ? ` ${Math.round(Number(scan.confidenceScore) * 100)}%` : '';
  const steps: ReviewStep[] = [{ label: `AI${pct}`, detail: scan.preliminaryDiagnosis, tone: 'ai' }];
  if (scan.triagedByName) {
    steps.push({ label: `Field-checked by ${scan.triagedByName}`, detail: scan.triageNotes ?? undefined, tone: 'escalated' });
  }
  if (scan.status === 'VERIFIED') {
    steps.push({ label: `Confirmed by ${scan.verifiedByVetName || 'a vet'}`, tone: 'confirmed' });
  } else if (scan.status === 'REJECTED') {
    steps.push({ label: `Ruled out by ${scan.verifiedByVetName || 'a vet'}`, detail: scan.reviewNotes ?? undefined, tone: 'rejected' });
  } else if (scan.status === 'ESCALATED') {
    steps.push({ label: 'Waiting for a vet', tone: 'pending' });
  }
  return steps;
}
