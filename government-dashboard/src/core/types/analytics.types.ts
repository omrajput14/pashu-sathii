import { DiagnosisConfidenceSource } from './disease.types';

export interface DiseaseAnalyticsResponse {
  totalOutbreaks: number;
  activeOutbreaks: number;
  resolvedOutbreaks: number;
  highRiskOutbreaks: number;
  averageResolutionTimeHours: number;
  diseaseDistribution: Record<string, number>;
  mostCommonDiseases: string[];
  reportsByConfidenceSource: Record<DiagnosisConfidenceSource, number>;
  totalMortalityReports?: number;
  farmerReportedMortalityCount?: number;
  vetConfirmedMortalityCount?: number;
}

export interface EconomicImpactResponse {
  modeledSavings: number | null;
  formattedValue: string | null;
  unit: string;
  label: string;
  isModeled: boolean;
  hasSufficientData: boolean;
  eligibleAnimalsCount: number;
  statusMessage: string;
  methodology: string;
  methodologyVersion: string;
  scope: string;
}
