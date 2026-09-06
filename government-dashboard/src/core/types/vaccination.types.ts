export interface PathogenCoverageDto {
  diseaseName: string;
  vaccinatedCount: number;
  eligibleCount: number;
  coveragePercentage: number;
  immunityGapPercentage: number;
  targetCoveragePercentage: number;
  status: 'ADEQUATE' | 'DEFICIT' | 'CRITICAL_GAP';
}

export interface ZoneVaccinationGapDto {
  outbreakId: string;
  zoneName: string;
  diseaseName: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  totalAnimals: number;
  vaccinatedAnimals: number;
  coveragePercentage: number;
  immunityGapPercentage: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PriorityImmunityDeficitZoneDto {
  outbreakId: string;
  zoneName: string;
  primaryDisease: string;
  immunityGapPercentage: number;
  outbreakRiskScore: number;
  operationalPriority: 'URGENT_RING_VACCINATION' | 'ELEVATED_SURVEILLANCE' | 'ROUTINE_MONITORING';
  recommendedAction: string;
}

export interface VaccinationAnalyticsResponse {
  totalRegisteredLivestock: number;
  totalVaccinatedLivestock: number;
  totalUnvaccinatedLivestock: number;
  overallCoveragePercentage: number;
  overallImmunityGapPercentage: number;
  pathogenCoverage: PathogenCoverageDto[];
  zoneVaccinationGaps: ZoneVaccinationGapDto[];
  priorityDeficitZones: PriorityImmunityDeficitZoneDto[];
}
