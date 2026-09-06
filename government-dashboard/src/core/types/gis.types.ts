import { OutbreakRiskScore, OutbreakStatus } from './outbreak.types';
import { DiseaseReportResponse, DiagnosisStatus, DiagnosisConfidenceSource } from './disease.types';

/** RFC 7946 GeoJSON Geometry */
export interface GeoJsonGeometry {
  type: 'Point' | 'Polygon' | 'MultiPolygon';
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

/** RFC 7946 GeoJSON Feature Properties for Outbreak Clusters */
export interface OutbreakFeatureProperties {
  id: string;
  diseaseName: string;
  severity: string;
  status: OutbreakStatus;
  riskScore: OutbreakRiskScore;
  trend: string;
  radiusKm: number;
  affectedReportsCount: number;
  [key: string]: unknown;
}

/** Administrative Boundary Hierarchy Level */
export type AdministrativeLevel = 'STATE' | 'DISTRICT' | 'TALUKA';

/** RFC 7946 GeoJSON Feature Properties for Administrative Boundaries */
export interface AdministrativeFeatureProperties {
  boundaryId: string;
  state: string;
  district: string | null;
  taluka: string | null;
  name: string;
  level: 'ADM1' | 'ADM2' | 'ADM3';
  administrativeLevel: AdministrativeLevel;
  source: string;
  [key: string]: unknown;
}

/** RFC 7946 GeoJSON Feature */
export interface GeoJsonFeature<P = OutbreakFeatureProperties> {
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties: P;
}

/** RFC 7946 GeoJSON FeatureCollection */
export interface GeoJsonFeatureCollection<P = OutbreakFeatureProperties> {
  type: 'FeatureCollection';
  features: GeoJsonFeature<P>[];
}

/** Normalized Spatial Heatmap Point */
export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensityWeight: number; // 0.0 to 1.0
  caseCount: number;
  diseaseName: string;
}

/** GIS Map Viewport State */
export interface MapViewport {
  center: [number, number]; // [lat, lng]
  zoom: number;
}

/** GIS Surveillance Filters */
export interface GisFilterState {
  disease: string; // 'ALL' or specific disease name
  riskLevel: 'ALL' | OutbreakRiskScore; // 'ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  status: 'ALL' | OutbreakStatus; // 'ALL', 'ACTIVE', 'MONITORING', 'RESOLVED'
  diagnosisStatus: 'ALL' | DiagnosisStatus; // 'ALL', 'CONFIRMED', 'SUSPECTED'
  confidenceSource: 'ALL' | DiagnosisConfidenceSource;
  showOutbreakBuffers: boolean;
  showConfirmedCases: boolean;
  showSuspectedCases: boolean;
  showAiScreenings: boolean;
  showHeatmap: boolean;
  showStateBoundary: boolean;
  showDistrictBoundaries: boolean;
  showTalukaBoundaries: boolean;
  searchQuery: string;
  district: string; // 'ALL' or District name (e.g. Pune, Satara, Solapur)
}

/** Default initial filter values */
export const DEFAULT_GIS_FILTERS: GisFilterState = {
  disease: 'ALL',
  riskLevel: 'ALL',
  status: 'ACTIVE',
  diagnosisStatus: 'ALL',
  confidenceSource: 'ALL',
  showOutbreakBuffers: true,
  showConfirmedCases: true,
  showSuspectedCases: true,
  showAiScreenings: true,
  showHeatmap: false,
  showStateBoundary: true,
  showDistrictBoundaries: true,
  showTalukaBoundaries: false,
  searchQuery: '',
  district: 'ALL',
};

/** Spatial Case Point */
export interface CasePointFeature {
  id: string;
  report: DiseaseReportResponse;
  latitude: number;
  longitude: number;
  isConfirmed: boolean;
  diseaseName: string;
}
