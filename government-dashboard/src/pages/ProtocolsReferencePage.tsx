import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { diseaseService } from '../core/api/diseaseService';
import { DiseaseProtocolRecord } from '../core/types/protocol.types';
import { mapDiseaseMetadataToProtocol } from '../core/utils/protocolMapper';
import { ProtocolsHeader } from '../components/protocols/ProtocolsHeader';
import { ProtocolQuickSummaryStrip } from '../components/protocols/ProtocolQuickSummaryStrip';
import { ProtocolFilterBar } from '../components/protocols/ProtocolFilterBar';
import { ProtocolCatalogCard } from '../components/protocols/ProtocolCatalogCard';
import { ProtocolDetailDrawer } from '../components/protocols/ProtocolDetailDrawer';
import { RefreshCw, BookOpen, AlertOctagon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface ProtocolsReferencePageProps {
  initialDiseaseName?: string | null;
  selectedScope?: string;
  onNavigateToOutbreak?: (outbreakId: string) => void;
}

export const ProtocolsReferencePage: React.FC<ProtocolsReferencePageProps> = ({
  initialDiseaseName,
  selectedScope = 'Maharashtra (Statewide)',
  onNavigateToOutbreak,
}) => {
  // State for search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedZoonotic, setSelectedZoonotic] = useState('ALL');
  const [selectedReportable, setSelectedReportable] = useState('ALL');
  const [selectedProtocol, setSelectedProtocol] = useState<DiseaseProtocolRecord | null>(null);

  // 1. Fetch disease registry directly from backend single source of truth
  const {
    data: registryData = null,
    isLoading: isRegistryLoading,
    isError: isRegistryError,
    error: registryError,
    isRefetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['diseaseRegistryProtocols'],
    queryFn: diseaseService.getDiseaseRegistry,
    staleTime: 60000,
  });

  // 2. Fetch active outbreaks for correlation
  const { data: outbreaks = [], isLoading: isOutbreaksLoading } = useQuery({
    queryKey: ['activeOutbreaksForProtocols'],
    queryFn: () => diseaseService.listOutbreaks('ACTIVE'),
    staleTime: 30000,
  });

  // Map backend metadata to DiseaseProtocolRecords (only if registryData is loaded from backend)
  const protocols: DiseaseProtocolRecord[] = useMemo(() => {
    if (!registryData || !Array.isArray(registryData)) {
      return [];
    }
    return registryData.map((meta) => mapDiseaseMetadataToProtocol(meta));
  }, [registryData]);

  // Handle initialDiseaseName prop from route navigation
  useEffect(() => {
    if (initialDiseaseName && protocols.length > 0) {
      const match = protocols.find(
        (p) => p.diseaseName.toLowerCase() === initialDiseaseName.toLowerCase()
      );
      if (match) {
        setSelectedProtocol(match);
      }
    }
  }, [initialDiseaseName, protocols]);

  // Filtered protocols based on user inputs
  const filteredProtocols = useMemo(() => {
    return protocols.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.diseaseName.toLowerCase().includes(q);
        const categoryMatch = (item.category || '').toLowerCase().includes(q);
        const speciesMatch = (item.susceptibleSpecies || '').toLowerCase().includes(q);
        if (!nameMatch && !categoryMatch && !speciesMatch) {
          return false;
        }
      }

      // Severity filter
      if (selectedSeverity !== 'ALL' && item.severity !== selectedSeverity) {
        return false;
      }

      // Zoonotic filter
      if (selectedZoonotic === 'ZOONOTIC' && item.isZoonotic !== true) {
        return false;
      }
      if (selectedZoonotic === 'NON_ZOONOTIC' && item.isZoonotic !== false) {
        return false;
      }

      // Reportable filter
      if (selectedReportable === 'REPORTABLE' && item.isReportable !== true) {
        return false;
      }
      if (selectedReportable === 'NON_REPORTABLE' && item.isReportable !== false) {
        return false;
      }

      return true;
    });
  }, [protocols, searchQuery, selectedSeverity, selectedZoonotic, selectedReportable]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSeverity('ALL');
    setSelectedZoonotic('ALL');
    setSelectedReportable('ALL');
  };

  const formattedUpdatedAt = useMemo(() => {
    if (!dataUpdatedAt) return 'Synced';
    return new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [dataUpdatedAt]);

  const isPageLoading = isRegistryLoading || isOutbreaksLoading;

  return (
    <div className="space-y-4 select-none pb-12">
      {/* 1. Header with Freshness & Scope */}
      <ProtocolsHeader
        selectedScope={selectedScope}
        formattedUpdatedAt={formattedUpdatedAt}
        isRefetching={isRefetching}
        onRefresh={() => refetch()}
      />

      {/* ERROR STATE: Backend Disease Registry Failed */}
      {isRegistryError ? (
        <div className="bg-white border border-[#F5C2C7] rounded-[6px] p-8 text-center shadow-subtle space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FBEBEB] text-[#B7301F] flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-block mb-2">
              <Badge variant="danger" size="sm" className="font-mono">
                CONFIGURATION / DATA UNAVAILABLE
              </Badge>
            </div>
            <h2 className="text-base font-bold font-mono text-[#101826]">
              Unable to load the PASHU SATHI Disease Registry.
            </h2>
            <p className="text-xs text-[#526074] mt-1 font-mono max-w-lg mx-auto leading-relaxed">
              The backend Disease Registry Service (/api/v1/disease/registry) is currently unreachable or returned an error ({String(registryError)}). To maintain strict epidemiological data integrity, fallback parameters are not rendered.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>{isRefetching ? 'Reconnecting to Registry...' : 'Retry Connection'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Quick Summary Strip */}
          <ProtocolQuickSummaryStrip
            protocols={protocols}
            outbreaks={outbreaks}
            isLoading={isPageLoading}
          />

          {/* 3. Filter Bar */}
          <ProtocolFilterBar
            searchQuery={searchQuery}
            selectedSeverity={selectedSeverity}
            selectedZoonotic={selectedZoonotic}
            selectedReportable={selectedReportable}
            onSearchChange={setSearchQuery}
            onSeverityChange={setSelectedSeverity}
            onZoonoticChange={setSelectedZoonotic}
            onReportableChange={setSelectedReportable}
            onResetFilters={handleResetFilters}
          />

          {/* 4. Protocols Catalog Grid */}
          {isPageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-white border border-[#E1E6EC] rounded-[6px] p-4 animate-pulse"
                />
              ))}
            </div>
          ) : filteredProtocols.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProtocols.map((protocol) => (
                <ProtocolCatalogCard
                  key={protocol.diseaseName}
                  protocol={protocol}
                  outbreaks={outbreaks}
                  onSelectProtocol={(p) => setSelectedProtocol(p)}
                  onNavigateToOutbreak={onNavigateToOutbreak}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-8 text-center shadow-subtle">
              <div className="w-10 h-10 rounded-full bg-[#F1F4F8] text-[#526074] flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-mono text-[#101826]">
                No Matching Protocols
              </h3>
              <p className="text-xs text-[#526074] mt-1 font-mono max-w-md mx-auto">
                No matching biosecurity protocols found for the selected filters.
              </p>
              <div className="mt-4">
                <Button variant="secondary" size="sm" onClick={handleResetFilters} className="font-mono text-xs">
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}

          {/* 5. Protocol Detail Drawer */}
          <ProtocolDetailDrawer
            protocol={selectedProtocol}
            outbreaks={outbreaks}
            onClose={() => setSelectedProtocol(null)}
            onNavigateToOutbreak={onNavigateToOutbreak}
          />
        </>
      )}
    </div>
  );
};
