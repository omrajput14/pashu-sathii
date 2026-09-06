export type CampaignStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type CampaignPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface VaccinationCampaignDto {
  id: string;
  campaignName: string;
  diseaseName: string;
  targetDistrict: string;
  targetTaluka?: string | null;
  targetLivestockCount: number;
  plannedDoses: number;
  administeredDoses: number;
  coverageProgressPercentage: number;
  priority: CampaignPriority;
  status: CampaignStatus;
  startDate: string;
  endDate?: string | null;
  outbreakId?: string | null;
  createdById: string;
  createdByName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaccinationCampaignRequest {
  campaignName: string;
  diseaseName: string;
  targetDistrict: string;
  targetTaluka?: string | null;
  targetLivestockCount?: number | null;
  plannedDoses: number;
  priority?: CampaignPriority;
  startDate: string;
  endDate?: string | null;
  outbreakId?: string | null;
  notes?: string | null;
}

export interface UpdateCampaignStatusRequest {
  status: CampaignStatus;
  notes?: string | null;
}

export interface CampaignStatisticsDto {
  totalCampaigns: number;
  plannedCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  cancelledCampaigns: number;
  totalPlannedDoses: number;
  totalAdministeredDoses: number;
  overallProgressPercentage: number;
}

export interface VaccinationCampaignAuditLogDto {
  id: string;
  campaignId: string;
  performedById: string;
  performedByName?: string | null;
  action: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CampaignListParams {
  status?: CampaignStatus;
  district?: string;
  page?: number;
  size?: number;
}
