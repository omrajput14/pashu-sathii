import React from 'react';
import { AlertOctagon, AlertTriangle, RefreshCw } from 'lucide-react';
import { DataFreshness } from '../../core/hooks/useDataFreshness';

interface DataFreshnessBannerProps {
  freshness: DataFreshness;
  /** Optional page-specific noun, e.g. "vaccination telemetry". */
  subject?: string;
  className?: string;
}

const formatAge = (seconds: number): string => {
  if (seconds < 120) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 120) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} h ago`;
};

/**
 * Surfaces the fact that a page is rendering data that is no longer live.
 *
 * Deliberately NOT dismissible: on a surveillance console, silently confident
 * stale numbers are the dangerous failure mode, so this stays until the data
 * is actually refreshed.
 */
export const DataFreshnessBanner: React.FC<DataFreshnessBannerProps> = ({
  freshness,
  subject = 'surveillance data',
  className = '',
}) => {
  const { isStale, hasNoData, isFetching, lastUpdatedAt, ageSeconds, retry } = freshness;

  if (!isStale && !hasNoData) return null;

  const timestamp =
    lastUpdatedAt !== null ? new Date(lastUpdatedAt).toLocaleTimeString() : null;

  const Icon = hasNoData ? AlertOctagon : AlertTriangle;
  const tone = hasNoData
    ? 'bg-[#FBEBEB] border-[#F5C2C7] text-[#6E1423]'
    : 'bg-[#FDF8E7] border-[#F4E5A8] text-[#8A6D1F]';

  return (
    <div
      className={`p-3.5 border rounded-[4px] text-xs flex items-start justify-between gap-2 ${tone} ${className}`}
      role="alert"
      aria-live="polite"
      data-testid="data-freshness-banner"
    >
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold font-mono uppercase">
            {hasNoData ? 'Live Data Unavailable' : 'Showing Stale Data'}
          </p>
          <p className="mt-0.5 text-[#526074]">
            {hasNoData ? (
              <>
                The {subject} endpoints could not be reached, so no current values are
                available. Figures below are not being displayed.
              </>
            ) : (
              <>
                The values below are <strong>not live</strong>. Last successful update{' '}
                <strong data-testid="freshness-timestamp">{timestamp}</strong>
                {ageSeconds !== null && <> ({formatAge(ageSeconds)})</>}. Automatic refresh
                is failing; treat these figures as historical until they update.
              </>
            )}
          </p>
        </div>
      </div>
      <button
        onClick={retry}
        disabled={isFetching}
        className="inline-flex items-center gap-1.5 shrink-0 text-xs font-semibold underline hover:opacity-80 disabled:opacity-50 disabled:no-underline focus:outline-none"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        {isFetching ? 'Retrying…' : 'Retry now'}
      </button>
    </div>
  );
};
