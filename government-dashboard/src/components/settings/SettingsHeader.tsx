import React from 'react';
import { Sliders, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface SettingsHeaderProps {
  selectedScope: string;
  formattedUpdatedAt: string;
  isRefetching: boolean;
  onRefresh: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  selectedScope,
  formattedUpdatedAt,
  isRefetching,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[6px] border border-[#E1E6EC] shadow-subtle select-none">
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#1E5C97]" />
          <h1 className="text-base font-bold text-[#101826] tracking-tight">
            System Configuration & Operational Telemetry
          </h1>
        </div>
        <p className="text-xs text-[#526074] mt-0.5 font-mono">
          Inspect real-time backend configuration properties, surveillance engine parameters, and service integrations.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#526074] bg-[#F8FAFC] px-2.5 py-1 rounded border border-[#E1E6EC]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C4A] animate-pulse" />
          <span>Scope: <strong className="text-[#101826]">{selectedScope}</strong></span>
          <span>·</span>
          <span>Synced: <strong className="text-[#101826]">{formattedUpdatedAt}</strong></span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isRefetching}
          className="font-mono text-xs text-[#526074]"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>{isRefetching ? 'Syncing...' : 'Refresh Configuration'}</span>
        </Button>
      </div>
    </div>
  );
};
