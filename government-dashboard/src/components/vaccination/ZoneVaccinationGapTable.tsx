import React from 'react';
import { ZoneVaccinationGapDto } from '../../core/types/vaccination.types';
import { RiskBadge } from '../ui/RiskBadge';
import { OutbreakRiskScore } from '../../core/theme/tokens';
import { MapPin, ArrowRight, ShieldAlert, Syringe } from 'lucide-react';
import { Button } from '../ui/Button';

interface ZoneVaccinationGapTableProps {
  zones: ZoneVaccinationGapDto[];
  onSelectOutbreak?: (outbreakId: string) => void;
  onLaunchRingCampaign?: (zone: ZoneVaccinationGapDto) => void;
}

export const ZoneVaccinationGapTable: React.FC<ZoneVaccinationGapTableProps> = ({
  zones,
  onSelectOutbreak,
  onLaunchRingCampaign,
}) => {
  if (!zones || zones.length === 0) {
    return (
      <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-6 text-center text-xs font-mono text-[#526074]">
        No active outbreak cluster perimeters currently tracked for regional vaccination gap correlation.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden text-xs select-none">
      <div className="px-4 py-3 border-b border-[#E1E6EC] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#1E5C97]" />
          <span className="font-bold text-[#101826] font-mono uppercase tracking-wider text-xs">
            Regional Outbreak Zones & Spatial Immunity Gaps
          </span>
          <span className="text-[11px] font-mono text-[#526074]">
            ({zones.length} Monitored Zones)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" role="table">
          <thead>
            <tr className="bg-[#F1F4F8] border-b border-[#E1E6EC] text-[11px] font-mono uppercase tracking-wider text-[#526074]">
              <th scope="col" className="py-2.5 px-3 font-semibold">Outbreak Zone</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Target Pathogen</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Centroid Coordinates</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Perimeter Radius</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Zone Livestock</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Coverage %</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Immunity Gap</th>
              <th scope="col" className="py-2.5 px-3 font-semibold">Risk Level</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E6EC]">
            {zones.map((zone) => (
              <tr
                key={zone.outbreakId}
                className="hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Zone Name */}
                <td className="py-2.5 px-3 font-bold text-[#101826] max-w-[200px] truncate">
                  {zone.zoneName}
                </td>

                {/* Disease */}
                <td className="py-2.5 px-3 text-[#526074]">
                  {zone.diseaseName}
                </td>

                {/* GPS */}
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#1E5C97]" />
                    <span>{zone.latitude.toFixed(2)}, {zone.longitude.toFixed(2)}</span>
                  </div>
                </td>

                {/* Radius */}
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#526074]">
                  ±{zone.radiusKm} km
                </td>

                {/* Livestock Counts */}
                <td className="py-2.5 px-3 font-mono text-[11px]">
                  <strong className="text-[#101826]">{zone.vaccinatedAnimals}</strong> / {zone.totalAnimals} head
                </td>

                {/* Coverage % */}
                <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#101826]">
                  {zone.coveragePercentage.toFixed(1)}%
                </td>

                {/* Immunity Gap % */}
                <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#B7301F]">
                  {zone.immunityGapPercentage.toFixed(1)}%
                </td>

                {/* Risk Level */}
                <td className="py-2.5 px-3">
                  <RiskBadge level={zone.riskLevel as OutbreakRiskScore} size="sm" />
                </td>

                {/* Action */}
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onLaunchRingCampaign?.(zone)}
                      className="font-mono text-[11px] py-1 px-2 bg-[#1E5C97] text-white hover:bg-[#154370]"
                    >
                      <Syringe className="w-3 h-3 mr-1 text-white" />
                      <span>Launch Ring</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectOutbreak?.(zone.outbreakId)}
                      className="font-mono text-[11px] py-1 px-2"
                    >
                      <span>View Cluster</span>
                      <ArrowRight className="w-3 h-3 ml-1 text-[#1E5C97]" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
