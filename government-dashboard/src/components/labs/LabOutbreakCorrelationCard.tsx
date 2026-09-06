import React from 'react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { DiseaseReportResponse } from '../../core/types/disease.types';
import { isReportInsideOutbreak } from '../../core/utils/geoUtils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ArrowRight, FlaskConical, MapPin, Layers } from 'lucide-react';

interface LabOutbreakCorrelationCardProps {
  outbreaks: OutbreakResponse[];
  reports: DiseaseReportResponse[];
  onNavigateToOutbreak?: (outbreakId: string) => void;
}

export const LabOutbreakCorrelationCard: React.FC<LabOutbreakCorrelationCardProps> = ({
  outbreaks,
  reports,
  onNavigateToOutbreak,
}) => {
  const labReports = reports.filter((r) => r.diagnosisConfidenceSource === 'LAB_CONFIRMED');

  // Correlate outbreaks containing lab-confirmed cases using exact Haversine distance and outbreak radiusKm
  const correlatedOutbreaks = outbreaks
    .filter((o) => o.status !== 'RESOLVED')
    .map((o) => {
      const matchingLabCases = labReports.filter(
        (r) =>
          r.diseaseName === o.diseaseName &&
          isReportInsideOutbreak(
            r.latitude,
            r.longitude,
            o.centerLatitude,
            o.centerLongitude,
            o.radiusKm
          )
      );

      return {
        outbreak: o,
        labCaseCount: matchingLabCases.length,
      };
    })
    .filter((item) => item.labCaseCount > 0)
    .sort((a, b) => (b.outbreak.compositeRiskScore ?? 0) - (a.outbreak.compositeRiskScore ?? 0));

  if (correlatedOutbreaks.length === 0) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs">
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#E1E6EC]">
          <Layers className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
            Lab-Correlated Outbreak Clusters
          </h2>
        </div>
        <p className="text-[#526074] font-mono text-[11px]">
          No active outbreak clusters currently contain loaded laboratory-confirmed (LAB_CONFIRMED) cases within their containment radius.
          Active containment zones are currently being driven by clinical veterinary reports and spatial clustering.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#E1E6EC] gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1E5C97]" />
          <div>
            <h2 className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
              Lab-Correlated Outbreak Clusters
            </h2>
            <p className="text-[10px] font-mono text-[#526074] mt-0.5">
              Active disease containment zones verified with laboratory diagnostic assay evidence (Haversine radius matching).
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#526074] shrink-0">
          {correlatedOutbreaks.length} Verified {correlatedOutbreaks.length === 1 ? 'Cluster' : 'Clusters'}
        </span>
      </div>

      <div className="space-y-3">
        {correlatedOutbreaks.map(({ outbreak: o, labCaseCount }) => (
          <div
            key={o.id}
            className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#1E5C97] transition-colors"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-[#101826] text-xs font-mono">{o.diseaseName}</h3>
                <Badge
                  variant={
                    o.riskScore === 'CRITICAL'
                      ? 'danger'
                      : o.riskScore === 'HIGH'
                      ? 'warning'
                      : 'info'
                  }
                  size="sm"
                >
                  RISK: {o.compositeRiskScore != null ? `${o.compositeRiskScore}/100` : o.riskScore}
                </Badge>
                <Badge variant="info" size="sm">
                  <FlaskConical className="w-3 h-3 text-[#1E5C97]" />
                  <span>
                    {labCaseCount} {labCaseCount === 1 ? 'Lab Case' : 'Lab Cases'}
                  </span>
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#526074]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#1E5C97]" />
                  <span>
                    Lat {o.centerLatitude.toFixed(2)}, Lng {o.centerLongitude.toFixed(2)} (Radius: {o.radiusKm}km)
                  </span>
                </span>
                <span>·</span>
                <span>
                  Total Cases: <strong className="text-[#101826]">{o.affectedReportsCount ?? 'N/A'}</strong>
                </span>
              </div>
            </div>

            {onNavigateToOutbreak && (
              <div className="shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateToOutbreak(o.id)}
                  className="font-mono text-xs"
                >
                  <span>Open Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#1E5C97]" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
