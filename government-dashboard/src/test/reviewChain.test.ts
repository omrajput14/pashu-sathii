import { describe, expect, it } from 'vitest';
import { reviewSteps } from '../core/utils/aiReview';

const scan = (over: Record<string, unknown>) =>
  ({
    id: 's1', preliminaryDiagnosis: 'Lumpy Skin Disease', confidenceScore: 0.82, status: 'COMPLETED',
    triagedByName: null, triageNotes: null, verifiedByVetName: null, reviewNotes: null, ...over,
  }) as any;

describe('reviewSteps', () => {
  it('AI scan field-checked by a para-vet and confirmed by a vet', () => {
    const steps = reviewSteps(
      { aiScanId: 's1', diagnosisStatus: 'CONFIRMED' },
      scan({ status: 'VERIFIED', triagedByName: 'Ganesh Kale', triageNotes: 'Nodules', verifiedByVetName: 'Dr. Anjali' }),
    );
    expect(steps.map((s) => s.label)).toEqual(['AI 82%', 'Field-checked by Ganesh Kale', 'Confirmed by Dr. Anjali']);
  });

  it('escalated scan waits for a vet; a para-vet never confirms', () => {
    const steps = reviewSteps({ aiScanId: 's1', diagnosisStatus: 'SUSPECTED' }, scan({ status: 'ESCALATED', triagedByName: 'Ganesh Kale' }));
    expect(steps.map((s) => s.label)).toEqual(['AI 82%', 'Field-checked by Ganesh Kale', 'Waiting for a vet']);
  });

  it('field report without an AI scan shows who reported it', () => {
    const steps = reviewSteps({ aiScanId: null, diagnosisStatus: 'CONFIRMED', reportedByName: 'Dr. Vikas', reportSource: 'VETERINARIAN' });
    expect(steps.map((s) => s.label)).toEqual(['Vet report: Dr. Vikas', 'Confirmed']);
  });
});
