import React, { useState } from 'react';
import { OperationalAlertResponse } from '../../core/types/alerts.types';
import { Badge } from '../ui/Badge';
import { AlertTriangle, Siren, ShieldAlert, MapPin, ArrowRight, Copy, Check, Clock, ShieldCheck, Activity } from 'lucide-react';
import { Button } from '../ui/Button';

interface OperationalAlertCardProps {
  alert: OperationalAlertResponse;
  onNavigateToOutbreak?: (outbreakId: string) => void;
  onNavigateToMap?: () => void;
}

export const OperationalAlertCard: React.FC<OperationalAlertCardProps> = ({
  alert,
  onNavigateToOutbreak,
  onNavigateToMap,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(alert.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="danger" size="sm">CRITICAL THREAT</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">HIGH PRIORITY</Badge>;
      case 'MEDIUM':
        return <Badge variant="info" size="sm">MONITORED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">ROUTINE</Badge>;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CRITICAL_OUTBREAK_DETECTED':
        return <Siren className="w-4 h-4 text-[#B7301F]" />;
      case 'IMMUNITY_GAP_OVERLAP':
        return <ShieldAlert className="w-4 h-4 text-[#D97B1F]" />;
      case 'RAPID_VELOCITY_ESCALATION':
        return <Activity className="w-4 h-4 text-[#1E5C97]" />;
      case 'CONFIRMED_CASE_CLUSTER':
        return <ShieldCheck className="w-4 h-4 text-[#2E6930]" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-[#526074]" />;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      className={`bg-white border rounded-[6px] p-4 shadow-subtle text-xs select-none transition-all ${
        alert.severity === 'CRITICAL'
          ? 'border-[#F5C2C7] bg-[#FFFDFC]'
          : alert.severity === 'HIGH'
          ? 'border-[#F8D7DA]'
          : 'border-[#E1E6EC]'
      }`}
    >
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E1E6EC]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[4px] bg-[#F1F4F8] flex items-center justify-center shrink-0">
            {getEventIcon(alert.eventType)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#101826] text-xs">
                {alert.title}
              </h3>
              {getSeverityBadge(alert.severity)}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#526074] mt-0.5">
              <span>Source: <strong className="text-[#101826]">{alert.source}</strong></span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#526074]" />
                <span>{formatDate(alert.detectedAt)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* UUID Copy */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Alert UUID"
            className="flex items-center gap-1 px-2 py-1 bg-[#F8FAFC] border border-[#C7D0DB] hover:border-[#1E5C97] rounded text-[10px] font-mono text-[#526074] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#2E6930]" />
                <span className="text-[#2E6930] font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>ID: {alert.id.substring(0, 8)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 bg-[#F8FAFC] p-2.5 rounded-[4px] border border-[#E1E6EC] text-[11px] font-mono">
        <div>
          <span className="text-[10px] text-[#526074] uppercase block">Pathogen</span>
          <strong className="text-[#101826]">{alert.diseaseName}</strong>
        </div>
        <div>
          <span className="text-[10px] text-[#526074] uppercase block">Sector Location</span>
          <span className="text-[#526074] truncate block" title={alert.locationName}>
            {alert.locationName}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#526074] uppercase block">Composite Risk</span>
          <strong className="text-[#101826]">
            {alert.compositeRiskScore != null ? `${alert.compositeRiskScore.toFixed(1)}/100` : '—'}
          </strong>
        </div>
        <div>
          <span className="text-[10px] text-[#526074] uppercase block">Immunity Gap</span>
          <strong className="text-[#B7301F]">
            {alert.vaccinationGapScore != null ? `${alert.vaccinationGapScore.toFixed(1)}%` : '—'}
          </strong>
        </div>
      </div>

      {/* Contextual Rationales */}
      <div className="space-y-2 mb-3">
        <div className="p-2.5 bg-[#FFFFFF] border border-[#E1E6EC] rounded text-[11px] font-mono leading-relaxed">
          <strong className="text-[#101826] uppercase text-[10px] block mb-0.5">Surveillance Rationale:</strong>
          <span className="text-[#526074]">{alert.whyItMatters}</span>
        </div>

        <div className="p-2.5 bg-[#FFFDFC] border border-[#BED2E8] rounded text-[11px] font-mono leading-relaxed">
          <strong className="text-[#1E5C97] uppercase text-[10px] block mb-0.5">Recommended Bio-Containment Guidance:</strong>
          <span className="text-[#101826]">{alert.recommendedNextStep}</span>
        </div>
      </div>

      {/* Action Deep-Links */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E1E6EC]">
        <span className="text-[10px] font-mono text-[#526074]">
          Status: <strong className="text-[#101826]">{isAcknowledged ? 'ACKNOWLEDGED' : alert.status}</strong>
          {isEscalated ? ' · Directive Issued to District Collector' : isAcknowledged ? ' · Officer Reviewed' : ' · Requires Officer Review'}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {!isAcknowledged ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAcknowledged(true)}
              className="font-mono text-[11px] text-[#2E6930] hover:bg-[#EDF7F0] border-[#BFE4C9]"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>Acknowledge</span>
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#2E6930] font-bold bg-[#EDF7F0] px-2 py-1 rounded border border-[#BFE4C9]">
              <Check className="w-3 h-3" />
              ACKNOWLEDGED
            </span>
          )}

          {!isEscalated ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEscalated(true)}
              className="font-mono text-[11px] text-[#B7301F] hover:bg-[#FBEBEB] border-[#F5C2C7]"
            >
              <Siren className="w-3.5 h-3.5 mr-1" />
              <span>Escalate</span>
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#B7301F] font-bold bg-[#FBEBEB] px-2 py-1 rounded border border-[#F5C2C7]">
              <Siren className="w-3 h-3" />
              ESCALATED TO COLLECTOR
            </span>
          )}

          {alert.relatedOutbreakId && onNavigateToOutbreak && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateToOutbreak(alert.relatedOutbreakId!)}
              className="font-mono text-[11px]"
            >
              <span>Outbreak Dossier</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#1E5C97]" />
            </Button>
          )}

          {onNavigateToMap && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onNavigateToMap}
              className="font-mono text-[11px]"
            >
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#1E5C97]" />
              <span>GIS View</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
