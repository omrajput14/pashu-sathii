export interface OperationalAlertResponse {
  id: string;
  eventType: 'CRITICAL_OUTBREAK_DETECTED' | 'IMMUNITY_GAP_OVERLAP' | 'CASE_VOLUME_ESCALATION' | 'LAB_CONFIRMED_CLUSTER' | string;
  title: string;
  diseaseName: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  compositeRiskScore: number | null;
  vaccinationGapScore: number | null;
  affectedCasesCount: number | null;
  detectedAt: string;
  source: string;
  status: string;
  whyItMatters: string;
  recommendedNextStep: string;
  relatedOutbreakId: string | null;
  relatedReportId: string | null;
}

export interface OperationalPriorityItem {
  id: string;
  title: string;
  diseaseName: string;
  location: string;
  priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  operationalPriorityScore: number;
  compositeRiskScore: number | null;
  vaccinationGapScore: number | null;
  caseCount: number | null;
  formulaExplanation: string;
  recommendedAction: string;
  outbreakId?: string;
  reportId?: string;
}
