import { useEffect, useState } from 'react';

/**
 * The subset of a TanStack Query result this hook needs. Pass the whole
 * `useQuery(...)` result object — it structurally satisfies this.
 */
export interface TrackedQuery {
  isError: boolean;
  /** Timestamp of the last SUCCESSFUL fetch. 0 when the query has never resolved. */
  dataUpdatedAt: number;
  isFetching: boolean;
  refetch: () => unknown;
}

export interface DataFreshness {
  /** The page is rendering values that are no longer known to be current. */
  isStale: boolean;
  /** At least one tracked query is currently in an error state. */
  hasError: boolean;
  /** Everything failed and nothing was ever loaded — there is no data to show. */
  hasNoData: boolean;
  isFetching: boolean;
  /** Oldest successful fetch across tracked queries; null if none have succeeded. */
  lastUpdatedAt: number | null;
  ageSeconds: number | null;
  retry: () => void;
}

const DEFAULT_STALE_AFTER_MS = 90_000;
const TICK_MS = 5_000;

/**
 * Reports whether the values a page is rendering are still live.
 *
 * React Query keeps the last successful `data` when a background refetch fails,
 * and leaves `isLoading` false, so a page silently keeps showing old numbers
 * indefinitely. This hook exists so that state is visible.
 *
 * Pass only queries that poll. A query configured with `staleTime: Infinity`
 * (e.g. static administrative boundaries) is never expected to refresh, so
 * age-based staleness does not apply to it and it would false-positive here.
 */
export function useDataFreshness(
  queries: TrackedQuery[],
  staleAfterMs: number = DEFAULT_STALE_AFTER_MS
): DataFreshness {
  // Staleness is a function of elapsed time, so re-evaluate on a timer rather
  // than waiting for an unrelated render.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const loaded = queries.filter((q) => q.dataUpdatedAt > 0);
  const hasError = queries.some((q) => q.isError);
  const isFetching = queries.some((q) => q.isFetching);

  // Oldest success across the page: if any one panel is stale, the page is stale.
  const lastUpdatedAt = loaded.length
    ? Math.min(...loaded.map((q) => q.dataUpdatedAt))
    : null;
  const ageMs = lastUpdatedAt === null ? null : Math.max(0, now - lastUpdatedAt);

  return {
    isStale: lastUpdatedAt !== null && (hasError || (ageMs as number) > staleAfterMs),
    hasError,
    // Only claim "no data" once something has actually failed, otherwise the
    // first render of a healthy page would trip this.
    hasNoData: loaded.length === 0 && hasError,
    isFetching,
    lastUpdatedAt,
    ageSeconds: ageMs === null ? null : Math.round(ageMs / 1000),
    retry: () => queries.forEach((q) => q.refetch()),
  };
}
