import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { diseaseService } from '../core/api/diseaseService';
import { VaccinationKpiStrip } from '../components/vaccination/VaccinationKpiStrip';
import { PathogenCoverageGrid } from '../components/vaccination/PathogenCoverageGrid';
import { PriorityDeficitRankingCard } from '../components/vaccination/PriorityDeficitRankingCard';
import { ZoneVaccinationGapTable } from '../components/vaccination/ZoneVaccinationGapTable';
import { CampaignSummaryCards } from '../components/vaccination/CampaignSummaryCards';
import { VaccinationCampaignsTable } from '../components/vaccination/VaccinationCampaignsTable';
import { LaunchCampaignModal } from '../components/vaccination/LaunchCampaignModal';
import { PriorityImmunityDeficitZoneDto, ZoneVaccinationGapDto } from '../core/types/vaccination.types';
import { CreateVaccinationCampaignRequest, CampaignPriority } from '../core/types/campaign.types';
import { Syringe, RefreshCw, Info, Plus, Download, MapPin } from 'lucide-react';
import { isZoneInScope, isStatewide, downloadCsv } from '../core/utils/scopeFilter';
import { Button } from '../components/ui/Button';

interface VaccinationIntelligencePageProps {
  onNavigateToOutbreak?: (outbreakId: string) => void;
  selectedScope?: string;
  onScopeChange?: (scope: string) => void;
}

export const VaccinationIntelligencePage: React.FC<VaccinationIntelligencePageProps> = ({
  onNavigateToOutbreak,
  selectedScope = 'Maharashtra (Statewide)',
  onScopeChange,
}) => {
  const queryClient = useQueryClient();
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [initialCampaignData, setInitialCampaignData] = useState<Partial<CreateVaccinationCampaignRequest> | undefined>(undefined);

  const {
    data: vaccinationData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['vaccinationAnalytics'],
    queryFn: diseaseService.getVaccinationAnalytics,
    refetchInterval: 30000,
  });

  const handleLaunchCampaign = () => {
    setInitialCampaignData(undefined);
    setIsLaunchModalOpen(true);
  };

  const handleLaunchRingFromPriority = (zone: PriorityImmunityDeficitZoneDto) => {
    let district = 'Pune';
    if (zone.zoneName.toLowerCase().includes('satara')) district = 'Satara';
    else if (zone.zoneName.toLowerCase().includes('ahmednagar')) district = 'Ahmednagar';
    else if (zone.zoneName.toLowerCase().includes('solapur')) district = 'Solapur';
    else if (zone.zoneName.toLowerCase().includes('kolhapur')) district = 'Kolhapur';

    const prio: CampaignPriority = zone.operationalPriority === 'URGENT_RING_VACCINATION' ? 'CRITICAL' : 'HIGH';

    setInitialCampaignData({
      campaignName: `${zone.zoneName} Ring Vaccination Containment 2026`,
      diseaseName: zone.primaryDisease,
      targetDistrict: district,
      targetTaluka: zone.zoneName.split(' ')[0] || '',
      plannedDoses: 1500,
      priority: prio,
      outbreakId: zone.outbreakId,
      notes: `Targeted emergency ring vaccination initiated from priority deficit surveillance. Guidance: ${zone.recommendedAction}`,
    });
    setIsLaunchModalOpen(true);
  };

  const handleLaunchRingFromZone = (zone: ZoneVaccinationGapDto) => {
    let district = 'Pune';
    if (zone.zoneName.toLowerCase().includes('satara')) district = 'Satara';
    else if (zone.zoneName.toLowerCase().includes('ahmednagar')) district = 'Ahmednagar';
    else if (zone.zoneName.toLowerCase().includes('solapur')) district = 'Solapur';
    else if (zone.zoneName.toLowerCase().includes('kolhapur')) district = 'Kolhapur';

    const deficit = Math.max(0, zone.totalAnimals - zone.vaccinatedAnimals);
    const prio: CampaignPriority = zone.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH';

    setInitialCampaignData({
      campaignName: `${zone.zoneName} Ring Containment Operation`,
      diseaseName: zone.diseaseName,
      targetDistrict: district,
      targetTaluka: zone.zoneName.split(' ')[0] || '',
      targetLivestockCount: deficit > 0 ? deficit : zone.totalAnimals,
      plannedDoses: deficit > 0 ? deficit : 1000,
      priority: prio,
      outbreakId: zone.outbreakId,
      notes: `Ring campaign for perimeter radius ±${zone.radiusKm} km around cluster centroid (${zone.latitude.toFixed(2)}, ${zone.longitude.toFixed(2)}). Immunity gap: ${zone.immunityGapPercentage.toFixed(1)}%.`,
    });
    setIsLaunchModalOpen(true);
  };


  // Filter Priority Deficit Zones and Zone Gaps by Scope
  const scopedPriorityZones = React.useMemo(() => {
    const raw = vaccinationData?.priorityDeficitZones || [];
    if (isStatewide(selectedScope)) return raw;
    return raw.filter((z) => isZoneInScope(z.zoneName, selectedScope));
  }, [vaccinationData, selectedScope]);

  const scopedGaps = React.useMemo(() => {
    const raw = vaccinationData?.zoneVaccinationGaps || [];
    if (isStatewide(selectedScope)) return raw;
    return raw.filter((z) => isZoneInScope(z.zoneName, selectedScope));
  }, [vaccinationData, selectedScope]);

  const scopedVaccinationData = React.useMemo(() => {
    if (!vaccinationData) return undefined;
    if (isStatewide(selectedScope)) return vaccinationData;
    return {
      ...vaccinationData,
      priorityDeficitZones: scopedPriorityZones,
      zoneVaccinationGaps: scopedGaps,
    };
  }, [vaccinationData, scopedPriorityZones, scopedGaps, selectedScope]);

  const handleExportCoverageSitRep = () => {
    const rows = scopedGaps.map((z) => [
      z.zoneName,
      z.diseaseName,
      z.riskLevel,
      z.radiusKm,
      z.totalAnimals,
      z.vaccinatedAnimals,
      `${z.coveragePercentage.toFixed(1)}%`,
      `${z.immunityGapPercentage.toFixed(1)}%`,
    ]);
    downloadCsv(
      'PashuSathi_Vaccination_Coverage_' + selectedScope.replace(/\s+/g, '_'),
      ['Zone Name', 'Disease Pathogen', 'Risk Level', 'Radius (km)', 'Total Animals', 'Vaccinated', 'Coverage %', 'Immunity Gap %'],
      rows
    );
  };

  const handleCampaignSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['vaccinationCampaigns'] });
    queryClient.invalidateQueries({ queryKey: ['vaccinationCampaignStatistics'] });
    refetch();
  };

  return (
    <div className="space-y-5 select-none pb-12">
      {/* Institutional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[6px] border border-[#E1E6EC] shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-[#1E5C97]" />
            <h1 className="text-base font-bold text-[#101826] tracking-tight">
              Livestock Vaccination Intelligence & Regional Immunity Surveillance
            </h1>
          </div>
          <p className="text-xs text-[#526074] mt-0.5 font-mono">
            Statewide animal immunization coverage, pathogen protection deficits, and targeted vaccination campaign management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedScope && !isStatewide(selectedScope) && (
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-[#E4EDF6] text-[#1E5C97] border border-[#BED2E8] rounded-[4px] text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Scope: <strong>{selectedScope}</strong> ({scopedPriorityZones.length} Gap Zones)</span>
              {onScopeChange && (
                <button
                  onClick={() => onScopeChange('Maharashtra (Statewide)')}
                  className="ml-1 text-[10px] underline font-bold hover:text-[#101826]"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCoverageSitRep}
            className="font-mono text-xs text-[#101826]"
            title="Export vaccination coverage and gap sitrep as CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#1E5C97]" />
            <span>Export Coverage (CSV)</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="font-mono text-xs text-[#526074]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Polling...' : 'Refresh Telemetry'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleLaunchCampaign}
            className="bg-[#1E5C97] text-white hover:bg-[#154370] font-mono text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Launch Campaign</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <VaccinationKpiStrip data={scopedVaccinationData} isLoading={isLoading} />

      {/* Pathogen Specific Coverage Grid */}
      <PathogenCoverageGrid pathogens={vaccinationData?.pathogenCoverage || []} />

      {/* Campaign Summary Cards */}
      <CampaignSummaryCards />

      {/* Persisted Vaccination Campaigns Table */}
      <VaccinationCampaignsTable onOpenLaunchModal={handleLaunchCampaign} />

      {/* Priority Deficit Ranking */}
      <PriorityDeficitRankingCard
        priorityZones={scopedPriorityZones}
        onSelectOutbreak={onNavigateToOutbreak}
        onLaunchRingCampaign={handleLaunchRingFromPriority}
      />

      {/* Detailed Spatial Zone Breakdown Table */}
      <ZoneVaccinationGapTable
        zones={scopedGaps}
        onSelectOutbreak={onNavigateToOutbreak}
        onLaunchRingCampaign={handleLaunchRingFromZone}
      />

      {/* Methodological Context & Epidemiological Notice */}
      <div className="p-3.5 bg-[#F8FAFC] border border-[#BED2E8] rounded-[6px] text-xs font-mono text-[#526074] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#1E5C97] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#101826]">Epidemiological Methodological Note:</strong> Vaccination coverage reflects verified, non-expired clinical health records stored in the PASHU SATHI animal passport registry. Outbreak Risk is a spatial-temporal multi-signal index computed by the MultiSignalRiskEngine ($40\%$ cluster velocity, $20\%$ vector climate, $20\%$ endemic history, $20\%$ herd gap). Ring vaccination campaigns establish proactive immunization barriers around high-risk containment zones.
        </div>
      </div>

      {/* Modal Dialog for Launching Campaign */}
      <LaunchCampaignModal
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        onSuccess={handleCampaignSuccess}
        initialData={initialCampaignData}
      />
    </div>
  );
};
