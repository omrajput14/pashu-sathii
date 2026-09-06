import { DiagnosisStatus } from '../theme/tokens';
export type { DiagnosisStatus };

export type DiagnosisConfidenceSource = 'AI_VERIFIED' | 'VETERINARIAN' | 'LAB_CONFIRMED' | 'GOVERNMENT';
export type DiseaseReportSource = 'FARMER_REPORT' | 'VET_CONSULTATION' | 'LAB_RESULT' | 'SURVEILLANCE_SURVEY';

export interface DiseaseReportResponse {
  id: string;
  animalId: string;
  tagNumber: string;
  animalName: string;
  medicalRecordId: string | null;
  aiScanId: string | null;
  reportedById: string;
  reportedByName: string;
  reportSource: DiseaseReportSource;
  diagnosisConfidenceSource: DiagnosisConfidenceSource;
  diseaseName: string;
  diagnosisStatus: DiagnosisStatus;
  latitude: number;
  longitude: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiseaseMetadata {
  id?: string;
  diseaseName: string;
  severity?: string;
  zoonotic?: boolean;
  reportable?: boolean;
  mortality?: string;
  defaultRadiusKm?: number;
  minimumCases?: number;
  evaluationWindowHours?: number;
  speciesAffected?: string;
  transmissionType?: string;
  seasonalPeakMonth?: string;
  vaccineAvailable?: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}


export interface AIScreeningResponse {
  id: string;
  animalId: string | null;
  tagNumber: string | null;
  animalName: string | null;
  species: string | null;
  preliminaryDiagnosis: string;
  confidenceScore: number | null;
  severity: string;
  status: string;
  veterinarianVerified: boolean;
  verifiedByUserId: string | null;
  verifiedByVetName: string | null;
  verifiedAt: string | null;
  source: string;
  latitude: number | null;
  longitude: number | null;
  district: string | null;
  taluka: string | null;
  state: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
