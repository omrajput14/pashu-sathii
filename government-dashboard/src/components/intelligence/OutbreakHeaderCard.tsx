import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Radio,
  Copy,
  Check,
  Map,
  ChevronLeft,
  Calendar,
  Layers,
} from 'lucide-react';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { RiskBadge } from '../ui/RiskBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface OutbreakHeaderCardProps {
  outbreak: OutbreakResponse;
  onBackToList?: () => void;
  onViewOnMap?: (outbreakId: string) => void;
}

export const OutbreakHeaderCard: React.FC<OutbreakHeaderCardProps> = ({
  outbreak,
  onBackToList,
  onViewOnMap,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(outbreak.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detectedDate = outbreak.createdAt
    ? new Date(outbreak.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const lastCaseDate = outbreak.lastCaseReportedAt
    ? new Date(outbreak.lastCaseReportedAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' ' + new Date(outbreak.lastCaseReportedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' IST'
    : '—';

  return (
    <div
      className="bg-white border border-[#E1E6EC] rounded-[6px] shadow-subtle overflow-hidden"
      data-testid="outbreak-header-card"
    >
      {/* Top Banner with Dark Cartographic Header */}
      <div className="bg-[#0E1A2B] text-white px-5 py-4 border-b border-[#1B2B40] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToList && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onBackToList}
              className="text-xs font-mono bg-[#142337] text-[#9FB1C4] border-[#1B2B40] hover:text-white hover:bg-[#1E5C97]"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              <span>All Outbreaks</span>
            </Button>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[2px] bg-[#1E5C97] text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                EPIDEMIOLOGICAL DOSSIER
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#9FB1C4]">
                <span>UUID:</span>
                <span className="text-[#F4F7FA] font-semibold">#{outbreak.id.substring(0, 8)}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:text-white transition-colors"
                  title="Copy full Outbreak UUID"
                  aria-label="Copy Outbreak ID"
                >
                  {copied ? <Check className="w-3 h-3 text-[#3E7C4A]" /> : <Copy className="w-3 h-3 text-[#9FB1C4]" />}
                </button>
              </div>
            </div>

            <h1 className="text-xl font-bold font-mono text-white tracking-tight">
              {outbreak.diseaseName}
            </h1>
          </div>
        </div>

        {/* Status and Map Actions */}
        <div className="flex items-center gap-2.5">
          <Badge variant={outbreak.status === 'ACTIVE' ? 'confirmed' : 'default'} className="text-xs px-2.5 py-1">
            {outbreak.status}
          </Badge>

          {onViewOnMap && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewOnMap(outbreak.id)}
              className="text-xs font-mono"
            >
              <Map className="w-3.5 h-3.5 mr-1.5" />
              <span>View in GIS Map</span>
            </Button>
          )}
        </div>
      </div>

      {/* Structured Surveillance Key Parameter Grid */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 bg-white text-xs">
        {/* Metric 1: Composite Risk Score */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold">
            Composite Risk Score
          </span>
          <div className="mt-1.5 flex items-center gap-1.5">
            <RiskBadge
              level={outbreak.riskScore}
              score={outbreak.compositeRiskScore}
              size="md"
            />
          </div>
          <span className="text-[10px] font-mono text-[#526074] mt-1">
            {outbreak.severity || 'HIGH'} Severity
          </span>
        </div>

        {/* Metric 2: Centroid GPS */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#1E5C97]" />
            <span>Centroid GPS</span>
          </span>
          <span className="text-xs font-mono font-bold text-[#101826] mt-1 truncate">
            {outbreak.centerLatitude.toFixed(4)}°N, {outbreak.centerLongitude.toFixed(4)}°E
          </span>
          <span className="text-[10px] font-mono text-[#526074] mt-0.5">
            Buffer: ±{outbreak.radiusKm} km
          </span>
        </div>

        {/* Metric 3: Total Affected Cases */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#1E5C97]" />
            <span>Affected Cases</span>
          </span>
          <span className="text-lg font-mono font-bold text-[#101826] tabular-nums mt-1">
            {outbreak.affectedReportsCount}
          </span>
          <span className="text-[10px] font-mono text-[#526074] mt-0.5">
            Evaluation: {outbreak.evaluationWindowHours ?? 72}h Window
          </span>
        </div>

        {/* Metric 4: Containment Perimeter */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#1E5C97]" />
            <span>Spatial Radius</span>
          </span>
          <span className="text-sm font-mono font-bold text-[#101826] mt-1">
            {outbreak.radiusKm} km
          </span>
          <span className="text-[10px] font-mono text-[#526074] mt-0.5">
            Geodesic Area: ~{(Math.PI * Math.pow(outbreak.radiusKm, 2)).toFixed(1)} km²
          </span>
        </div>

        {/* Metric 5: Detected At */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#1E5C97]" />
            <span>First Detected</span>
          </span>
          <span className="text-xs font-mono font-bold text-[#101826] mt-1">
            {detectedDate}
          </span>
          <span className="text-[10px] font-mono text-[#526074] mt-0.5">
            OutbreakDetectionEngine
          </span>
        </div>

        {/* Metric 6: Latest Case Telemetry */}
        <div className="p-3 bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-[#526074] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#1E5C97]" />
            <span>Latest Report</span>
          </span>
          <span className="text-xs font-mono font-bold text-[#101826] mt-1 truncate" title={lastCaseDate}>
            {lastCaseDate}
          </span>
          <span className="text-[10px] font-mono text-[#526074] mt-0.5">
            Live Field Sync
          </span>
        </div>
      </div>
    </div>
  );
};
