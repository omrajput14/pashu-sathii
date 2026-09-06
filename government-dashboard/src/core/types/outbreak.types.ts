import { OutbreakRiskScore, OutbreakStatus } from '../theme/tokens';
export type { OutbreakRiskScore, OutbreakStatus };

export interface RiskBreakdownResponse {
  clusterScore: number;
  weatherScore: number;
  historyScore: number;
  vaccinationGapScore: number;
  weatherTemperature: number | null;
  weatherHumidity: number | null;
  weatherPrecipitation: number | null;
  vaccinationCoveragePct: number | null;
  riskExplanation: string | null;
  recommendedAction: string | null;
}

export interface OutbreakResponse {
  id: string;
  diseaseName: string;
  severity: string;
  status: OutbreakStatus;
  riskScore: OutbreakRiskScore;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  affectedReportsCount: number;
  mortalityCount?: number;
  vetConfirmedMortalityCount?: number;
  farmerReportedMortalityCount?: number;
  evaluationWindowHours: number;
  lastCaseReportedAt: string;
  createdAt: string;
  updatedAt: string;
  compositeRiskScore: number;
  riskBreakdown: RiskBreakdownResponse | null;
}

export interface OutbreakStatisticsResponse {
  totalOutbreaks: number;
  activeOutbreaks: number;
  resolvedOutbreaks: number;
  highRiskOutbreaks: number;
  totalMortalities?: number;
  vetConfirmedMortalities?: number;
}
