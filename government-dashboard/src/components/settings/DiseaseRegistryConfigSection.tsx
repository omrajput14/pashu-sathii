import React from 'react';
import { DiseaseMetadata } from '../../core/types/disease.types';
import { Badge } from '../ui/Badge';
import { BookOpen, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DiseaseRegistryConfigSectionProps {
  registry: DiseaseMetadata[];
  isLoading?: boolean;
}

export const DiseaseRegistryConfigSection: React.FC<DiseaseRegistryConfigSectionProps> = ({
  registry,
  isLoading,
}) => {
  return (
    <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-4 shadow-subtle text-xs space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-sm font-bold font-mono text-[#101826] uppercase">
            Disease Registry Parameters (Single Source of Truth)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="font-mono text-[#1E5C97] border-[#1E5C97]">
            READ-ONLY BACKEND DATA
          </Badge>
          <span className="text-[11px] font-mono text-[#526074]">
            {registry.length} Pathogens Configured
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-[#F8FAFC] border border-[#E1E6EC] rounded animate-pulse" />
          ))}
        </div>
      ) : registry.length > 0 ? (
        <div className="overflow-x-auto border border-[#E1E6EC] rounded-[4px]">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-[#F8FAFC] border-b border-[#E1E6EC] text-[#526074]">
              <tr>
                <th className="py-2 px-3 font-semibold">PATHOGEN NAME</th>
                <th className="py-2 px-2.5 font-semibold">SEVERITY</th>
                <th className="py-2 px-2.5 font-semibold">ZOONOTIC</th>
                <th className="py-2 px-2.5 font-semibold">NOTIFIABLE</th>
                <th className="py-2 px-2.5 font-semibold">RADIUS</th>
                <th className="py-2 px-2.5 font-semibold">CLUSTER MIN</th>
                <th className="py-2 px-2.5 font-semibold">WINDOW</th>
                <th className="py-2 px-2.5 font-semibold">VACCINE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6EC] text-[#101826]">
              {registry.map((d) => (
                <tr key={d.diseaseName} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-2 px-3 font-bold text-[#101826]">{d.diseaseName}</td>
                  <td className="py-2 px-2.5">
                    <Badge
                      variant={
                        d.severity === 'CRITICAL'
                          ? 'danger'
                          : d.severity === 'HIGH'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {d.severity}
                    </Badge>
                  </td>
                  <td className="py-2 px-2.5">
                    {d.zoonotic ? (
                      <span className="text-[#B7301F] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> YES
                      </span>
                    ) : (
                      <span className="text-[#526074]">NO</span>
                    )}
                  </td>
                  <td className="py-2 px-2.5">
                    {d.reportable ? (
                      <span className="text-[#101826] font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-[#1E5C97]" /> YES
                      </span>
                    ) : (
                      <span className="text-[#526074]">NO</span>
                    )}
                  </td>
                  <td className="py-2 px-2.5">{d.defaultRadiusKm != null ? `±${d.defaultRadiusKm.toFixed(0)} km` : 'N/A'}</td>
                  <td className="py-2 px-2.5">{d.minimumCases != null ? `${d.minimumCases} Cases` : 'N/A'}</td>
                  <td className="py-2 px-2.5">{d.evaluationWindowHours != null ? `${d.evaluationWindowHours}h` : 'N/A'}</td>
                  <td className="py-2 px-2.5">
                    {d.vaccineAvailable ? (
                      <span className="text-[#3E7C4A] font-bold">Available</span>
                    ) : (
                      <span className="text-[#526074]">Not Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 text-center text-[#526074] font-mono text-xs bg-[#F8FAFC] border border-[#E1E6EC] rounded">
          No disease registry records returned from backend service.
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] font-mono text-[#526074] pt-1">
        <span>Source: VETRA Disease Registry Service (`GET /api/v1/disease/registry`)</span>
        <span>Parameters maintained via Spring Boot `DiseaseRegistryService`</span>
      </div>
    </div>
  );
};
