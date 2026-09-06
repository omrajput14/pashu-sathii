import { DiseaseMetadata } from './disease.types';

export type ProtocolStatus = 'REFERENCE_CONTENT' | 'CONFIGURATION_REQUIRED';

export type ProtocolDataClassification = 'EXISTING_PROJECT_DATA' | 'DERIVED_FROM_EXISTING_DATA' | 'CONFIGURATION_REQUIRED';

export interface ProtocolSection {
  id: string;
  title: string;
  classification: ProtocolDataClassification;
  content: string | null;
  bullets?: string[];
  isConfigured: boolean;
}

export interface DiseaseProtocolRecord {
  diseaseName: string;
  status: ProtocolStatus;
  metadata: DiseaseMetadata;
  category: string | null;
  severity: string | null;
  isZoonotic: boolean | null;
  isReportable: boolean | null;
  mortality: string | null;
  surveillanceRadiusKm: number | null;
  minimumClusterCases: number | null;
  evaluationWindowHours: number | null;
  susceptibleSpecies: string | null;
  transmissionMode: string | null;
  vaccineAvailable: boolean | null;
  sections: ProtocolSection[];
  source: string;
  lastUpdated: string;
}
