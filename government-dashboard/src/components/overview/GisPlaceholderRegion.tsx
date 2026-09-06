import React from 'react';
import { Map, MapPin, Maximize2, ShieldCheck, Clock } from 'lucide-react';
import { OutbreakResponse } from '../../core/types/outbreak.types';

interface GisPlaceholderRegionProps {
  outbreaks?: OutbreakResponse[];
  onOpenFullMap?: () => void;
}

export const GisPlaceholderRegion: React.FC<GisPlaceholderRegionProps> = ({
  outbreaks = [],
  onOpenFullMap,
}) => {
  return (
    <div
      className="bg-[#FFFFFF] border border-[#E1E6EC] rounded-[6px] flex flex-col h-full shadow-subtle overflow-hidden"
      data-testid="gis-placeholder-region"
    >
      {/* Map Control Header */}
      <div className="px-4 py-3 border-b border-[#E1E6EC] bg-[#FAFBFC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-[#1E5C97]" />
          <h2 className="text-xs font-mono font-semibold uppercase text-[#101826] tracking-wider">
            GIS SURVEILLANCE & SPATIAL RISK CONTOURS
          </h2>
          <span className="text-[10px] font-mono bg-[#E4EDF6] text-[#1E5C97] px-1.5 py-0.5 rounded-[2px] font-bold">
            PHASE 2 INTEGRATION AREA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#526074]">
            <span className="w-2 h-2 rounded-[1px] bg-[#B7301F]" /> Confirmed
            <span className="w-2 h-2 rounded-[1px] border border-[#D97B1F] ml-2" /> Suspected
          </span>
          <button
            onClick={onOpenFullMap}
            className="p-1 text-[#526074] hover:text-[#1E5C97] hover:bg-[#E4EDF6] rounded-[4px] transition-colors"
            title="Inspect GIS Architecture"
            aria-label="Inspect GIS Architecture"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explicit Phase 2 Integration Canvas Placeholder */}
      <div className="relative flex-1 min-h-[340px] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 border-b border-[#E1E6EC]">
        <div className="relative z-10 flex flex-col items-center text-center max-w-md p-6 bg-white border border-[#C7D0DB] rounded-[6px] shadow-sm">
          <div className="w-10 h-10 rounded-[4px] bg-[#E4EDF6] text-[#1E5C97] flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5" />
          </div>

          <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-[#F6F8FA] border border-[#E1E6EC] text-[#526074] px-2 py-0.5 rounded-[2px] mb-2 font-semibold">
            <Clock className="w-3 h-3 text-[#1E5C97]" />
            <span>Interactive Map Mounting in Phase 2</span>
          </div>

          <h3 className="text-sm font-semibold text-[#101826] font-mono uppercase tracking-wide">
            Spatial Outbreak Vector Engine
          </h3>
          <p className="text-xs text-[#526074] mt-1.5 leading-relaxed">
            Full-screen MapLibre / Leaflet vector map with PostGIS RFC 7946 GeoJSON layers (<code className="font-mono text-[#1E5C97]">/api/v1/disease/outbreaks/geojson</code>) and normalized KDE heatmap surfaces will be mounted here in Phase 2.
          </p>

          <div className="mt-4 pt-3 border-t border-[#E1E6EC] w-full flex items-center justify-between text-[11px] font-mono text-[#526074]">
            <span>Active Clusters in Backend:</span>
            <strong className="text-[#101826] tabular-nums font-bold">{outbreaks.length} Clusters</strong>
          </div>
        </div>

        {/* Technical CRS & Backend Integration Indicator */}
        <div className="absolute bottom-2 left-2 z-10 bg-white border border-[#E1E6EC] px-2 py-1 rounded-[2px] text-[10px] font-mono text-[#526074]">
          ENGINE: PostgreSQL 16 + PostGIS 3.4 (EPSG:4326)
        </div>

        <div className="absolute top-2 right-2 z-10 bg-white border border-[#E1E6EC] px-2 py-1 rounded-[2px] text-[10px] font-mono text-[#101826] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#3E7C4A]" />
          <span>GeoJSON RFC 7946 Endpoint Verified</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-[#FAFBFC] flex items-center justify-between text-xs font-mono text-[#526074]">
        <span>Target Capabilities: Isopleth Risk Contours · Ring Vaccination Buffers · Movement Restriction Zones</span>
        <span className="text-[#93A1B0]">Phase 1 Compliant</span>
      </div>
    </div>
  );
};
