import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { OutbreakResponse } from '../../core/types/outbreak.types';
import { DiseaseReportResponse, AIScreeningResponse } from '../../core/types/disease.types';
import {
  HeatmapPoint,
  GisFilterState,
  GeoJsonFeatureCollection,
  AdministrativeFeatureProperties,
} from '../../core/types/gis.types';
import { getRiskToken } from '../../core/theme/tokens';
import {
  getMapTilerApiKey,
  getMapTilerTileUrl,
  MAPTILER_CONFIG,
  MAPTILER_ATTRIBUTION,
} from '../../core/config/maptiler';
import { Locate, Maximize2, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { getScopeConfig, isStatewide } from '../../core/utils/scopeFilter';

interface SurveillanceMapProps {
  outbreaks: OutbreakResponse[];
  reports?: DiseaseReportResponse[];
  aiScreenings?: AIScreeningResponse[];
  onSelectAiScreening?: (screening: AIScreeningResponse) => void;
  heatmapPoints?: HeatmapPoint[];
  boundaries?: GeoJsonFeatureCollection<AdministrativeFeatureProperties> | null;
  filters: GisFilterState;
  selectedOutbreakId?: string | null;
  onSelectOutbreak: (outbreak: OutbreakResponse) => void;
  onSelectReport?: (report: DiseaseReportResponse) => void;
  height?: string;
  isCompact?: boolean;
  scope?: string;
}

// Maharashtra State Reference Center & Bounding Box
const MAHARASHTRA_CENTER: [number, number] = [19.0760, 74.8777];
const DEFAULT_ZOOM = 7;
const TALUKA_AUTO_ZOOM_THRESHOLD = 9;

export const SurveillanceMap: React.FC<SurveillanceMapProps> = ({
  outbreaks,
  reports = [],
  aiScreenings = [],
  onSelectAiScreening,
  heatmapPoints = [],
  boundaries = null,
  filters,
  selectedOutbreakId,
  onSelectOutbreak,
  onSelectReport,
  height = '100%',
  isCompact = false,
  scope,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const adminLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const surveillanceLayersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(isCompact ? 6 : DEFAULT_ZOOM);
  const [isKeyConfigured, setIsKeyConfigured] = useState<boolean>(true);
  const [basemapUnavailable, setBasemapUnavailable] = useState<boolean>(false);

  // Auto-pan / fly map viewport when administrative scope changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (scope && !isStatewide(scope)) {
      const config = getScopeConfig(scope);
      if (typeof map.flyTo === 'function') {
        map.flyTo(config.center, config.zoom, { duration: 1.2 });
      } else if (typeof map.setView === 'function') {
        map.setView(config.center, config.zoom);
      }
    } else if (scope && isStatewide(scope)) {
      const initialZoom = isCompact ? 6 : DEFAULT_ZOOM;
      if (typeof map.flyTo === 'function') {
        map.flyTo(MAHARASHTRA_CENTER, initialZoom, { duration: 1.0 });
      } else if (typeof map.setView === 'function') {
        map.setView(MAHARASHTRA_CENTER, initialZoom);
      }
    }
  }, [scope, isCompact]);

  // 1. Initialize Leaflet Map Instance with MapTiler Basemap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialZoom = isCompact ? 6 : DEFAULT_ZOOM;
    const map = L.map(mapContainerRef.current, {
      center: MAHARASHTRA_CENTER,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      minZoom: 5,
      maxZoom: 18,
    });

    // Dedicated pane for administrative boundaries so they stay strictly underneath surveillance layers
    if (!map.getPane('adminBoundariesPane')) {
      const pane = map.createPane('adminBoundariesPane');
      pane.style.zIndex = '250';
    }

    // Retrieve MapTiler API Key from environment configuration
    const maptilerApiKey = getMapTilerApiKey();

    if (!maptilerApiKey) {
      setIsKeyConfigured(false);
      // Fallback to high-performance CARTO Voyager basemap if MapTiler API key is absent
      const fallbackLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      );
      fallbackLayer.addTo(map);
      tileLayerRef.current = fallbackLayer;
    } else {
      setIsKeyConfigured(true);
      let tileUrl = getMapTilerTileUrl(MAPTILER_CONFIG.defaultStyle, maptilerApiKey);

      // In local dev with non-3000 port, proxy through Vite to preserve Referer
      if (
        typeof window !== 'undefined' &&
        window.location &&
        window.location.port &&
        window.location.port !== '3000' &&
        ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ) {
        tileUrl = `/maptiler-tiles/maps/${MAPTILER_CONFIG.defaultStyle}/{z}/{x}/{y}.png?key=${maptilerApiKey}`;
      }

      const tileLayer = L.tileLayer(tileUrl, {
        tileSize: MAPTILER_CONFIG.tileSize,
        zoomOffset: MAPTILER_CONFIG.zoomOffset,
        minZoom: 1,
        maxZoom: MAPTILER_CONFIG.maxZoom,
        crossOrigin: true,
        attribution: MAPTILER_ATTRIBUTION,
      });

      let hasFallenBack = false;
      tileLayer.on('tileerror', () => {
        setBasemapUnavailable(true);
        // Seamless fallback to OpenStreetMap if MapTiler tiles are restricted or error
        if (!hasFallenBack && mapInstanceRef.current) {
          hasFallenBack = true;
          try {
            mapInstanceRef.current.removeLayer(tileLayer);
            const fallbackLayer = L.tileLayer(
              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              {
                maxZoom: 19,
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }
            );
            fallbackLayer.addTo(mapInstanceRef.current);
            tileLayerRef.current = fallbackLayer;
          } catch {
            // Silently retain vector overlay
          }
        }
      });

      tileLayer.on('load', () => {
        setBasemapUnavailable(false);
      });

      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;
    }

    // Attribution control bottom-right with MapTiler and data provenance credits
    L.control
      .attribution({
        position: 'bottomright',
        prefix: 'PASHU SATHI GIS · DataMeet · geoBoundaries',
      })
      .addTo(map);

    // Dedicated layer groups for admin polygons and operational surveillance features
    const adminGroup = L.layerGroup().addTo(map);
    const surveillanceGroup = L.layerGroup().addTo(map);

    adminLayersGroupRef.current = adminGroup;
    surveillanceLayersGroupRef.current = surveillanceGroup;
    mapInstanceRef.current = map;

    // Track map zoom events for zoom-responsive taluka rendering
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
    };
  }, [isCompact]);

  // 2. Render and Sync Administrative Boundary Polygons (State, Districts, Talukas)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const adminGroup = adminLayersGroupRef.current;
    if (!map || !adminGroup) return;

    adminGroup.clearLayers();

    if (!boundaries || !boundaries.features || boundaries.features.length === 0) {
      return;
    }

    // Taluka resolution rule:
    // User manual toggle (filters.showTalukaBoundaries) OR auto-enabled on district zoom / district selection
    const isTalukaActive =
      filters.showTalukaBoundaries ||
      currentZoom >= TALUKA_AUTO_ZOOM_THRESHOLD ||
      (filters.district !== 'ALL' && filters.district !== undefined);

    // Filter features based on toggle state and zoom threshold
    const visibleFeatures = boundaries.features.filter((f) => {
      const level = f.properties?.administrativeLevel;
      if (level === 'STATE' && !filters.showStateBoundary) return false;
      if (level === 'DISTRICT' && !filters.showDistrictBoundaries) return false;
      if (level === 'TALUKA' && !isTalukaActive) return false;
      return true;
    });

    if (visibleFeatures.length === 0) return;

    const adminGeoJsonLayer = L.geoJSON(
      { type: 'FeatureCollection', features: visibleFeatures } as any,
      {
        pane: 'adminBoundariesPane',
        style: (feature) => {
          const level = feature?.properties?.administrativeLevel;
          if (level === 'STATE') {
            return {
              color: '#1E5C97',
              weight: 2.2,
              opacity: 0.85,
              fillColor: '#1E5C97',
              fillOpacity: 0.015,
            };
          }
          if (level === 'DISTRICT') {
            return {
              color: '#475569',
              weight: 1.2,
              opacity: 0.7,
              dashArray: '4, 4',
              fillColor: '#64748B',
              fillOpacity: 0.03,
            };
          }
          // Taluka
          return {
            color: '#94A3B8',
            weight: 0.8,
            opacity: 0.5,
            dashArray: '2, 2',
            fillColor: '#CBD5E1',
            fillOpacity: 0.02,
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties as AdministrativeFeatureProperties;
          if (!props) return;

          const levelLabel =
            props.administrativeLevel === 'STATE'
              ? 'State'
              : props.administrativeLevel === 'DISTRICT'
              ? 'District'
              : 'Taluka';

          const subtitle =
            props.administrativeLevel === 'TALUKA' && props.district
              ? `<div class="text-[10px] text-[#526074]">District: ${props.district}</div>`
              : '';

          layer.bindTooltip(
            `<div class="font-mono text-xs p-1">
              <strong class="text-[#101826]">${props.name}</strong>
              <div class="text-[10px] text-[#1E5C97] font-semibold">${levelLabel} Boundary</div>
              ${subtitle}
            </div>`,
            { sticky: true, className: 'vetra-admin-tooltip' }
          );

          layer.on({
            mouseover: (e) => {
              const target = e.target;
              if (props.administrativeLevel !== 'STATE') {
                target.setStyle({
                  weight: 2.0,
                  color: '#1E5C97',
                  fillOpacity: 0.08,
                });
              }
            },
            mouseout: (e) => {
              adminGeoJsonLayer.resetStyle(e.target);
            },
          });
        },
      }
    );

    adminGroup.addLayer(adminGeoJsonLayer);
  }, [
    boundaries,
    filters.showStateBoundary,
    filters.showDistrictBoundaries,
    filters.showTalukaBoundaries,
    filters.district,
    currentZoom,
  ]);

  // 3. Render and Sync Spatial Surveillance Features (Outbreaks, Cases, Heatmap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = surveillanceLayersGroupRef.current;
    if (!map || !group) return;

    // Clear previous operational vector layers
    group.clearLayers();

    // A. Render Outbreak Clusters & Risk Buffer Perimeters
    outbreaks.forEach((outbreak) => {
      const isSelected = outbreak.id === selectedOutbreakId;
      const riskTokens = getRiskToken(outbreak.riskScore);
      const hasNumericScore = outbreak.compositeRiskScore !== null && outbreak.compositeRiskScore !== undefined;
      const scoreBadgeText = hasNumericScore
        ? `${outbreak.compositeRiskScore}`
        : (outbreak.riskScore ? outbreak.riskScore.substring(0, 4) : '—');

      // Draw radius buffer circle if enabled
      if (filters.showOutbreakBuffers && outbreak.radiusKm && outbreak.radiusKm > 0) {
        const radiusMeters = outbreak.radiusKm * 1000;
        const circle = L.circle([outbreak.centerLatitude, outbreak.centerLongitude], {
          radius: radiusMeters,
          color: riskTokens.color,
          fillColor: riskTokens.color,
          fillOpacity: isSelected ? 0.28 : 0.14,
          weight: isSelected ? 2.5 : 1.2,
          dashArray: outbreak.riskScore === 'CRITICAL' ? undefined : '4, 4',
        });

        circle.bindTooltip(
          `<strong>${outbreak.diseaseName}</strong><br/>Risk Level: ${outbreak.riskScore}${hasNumericScore ? ` (${outbreak.compositeRiskScore}/100)` : ''}<br/>Radius: ±${outbreak.radiusKm} km<br/>Cases: ${outbreak.affectedReportsCount}`,
          { className: 'font-mono text-xs' }
        );

        circle.on('click', () => {
          onSelectOutbreak(outbreak);
        });

        group.addLayer(circle);
      }

      // Draw Centroid Marker with Risk Badge
      const markerHtml = `
        <div class="vetra-outbreak-marker ${isSelected ? 'ring-2 ring-[#0E1A2B] ring-offset-2 scale-110' : ''}" style="
          background-color: ${riskTokens.color};
          color: #FFFFFF;
          width: ${isSelected ? '32px' : '26px'};
          height: ${isSelected ? '32px' : '26px'};
          border: 2px solid #FFFFFF;
        ">
          ${scoreBadgeText}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
      });

      const marker = L.marker([outbreak.centerLatitude, outbreak.centerLongitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 500,
      });

      marker.bindPopup(`
        <div class="p-3 font-mono text-xs select-none">
          <div class="flex items-center justify-between gap-2 mb-1 border-b border-[#E1E6EC] pb-1">
            <span class="font-bold text-[#101826]">${outbreak.diseaseName}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" style="background-color: ${riskTokens.bg}; color: ${riskTokens.color}">
              ${outbreak.riskScore}${hasNumericScore ? ` (${outbreak.compositeRiskScore})` : ''}
            </span>
          </div>
          <p class="text-[11px] text-[#526074]">Affected Cases: <strong class="text-[#101826]">${outbreak.affectedReportsCount}</strong></p>
          <p class="text-[11px] text-[#526074]">Status: <strong class="text-[#101826]">${outbreak.status}</strong></p>
          <p class="text-[10px] text-[#93A1B0] mt-1">Centroid: ${outbreak.centerLatitude.toFixed(3)}°, ${outbreak.centerLongitude.toFixed(3)}°</p>
        </div>
      `);

      marker.on('click', () => {
        onSelectOutbreak(outbreak);
      });

      group.addLayer(marker);
    });

    // B. Render Individual Confirmed & Suspected Field Cases
    reports.forEach((report) => {
      if (!report.latitude || !report.longitude) return;

      const isConfirmed = report.diagnosisStatus === 'CONFIRMED';
      if (isConfirmed && !filters.showConfirmedCases) return;
      if (!isConfirmed && !filters.showSuspectedCases) return;

      const caseHtml = isConfirmed
        ? `<div class="vetra-case-confirmed-marker" title="Confirmed Case: ${report.diseaseName}"></div>`
        : `<div class="vetra-case-suspected-marker" title="Suspected Case: ${report.diseaseName}"></div>`;

      const caseIcon = L.divIcon({
        html: caseHtml,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const caseMarker = L.marker([report.latitude, report.longitude], {
        icon: caseIcon,
        zIndexOffset: isConfirmed ? 200 : 100,
      });

      caseMarker.bindTooltip(
        `<strong>${isConfirmed ? '■ Confirmed' : '◇ Suspected'}</strong>: ${report.diseaseName}<br/>Tag: ${report.tagNumber || 'N/A'}<br/>Source: ${report.diagnosisConfidenceSource || 'FIELD'}`,
        { className: 'font-mono text-xs' }
      );

      caseMarker.on('click', () => {
        onSelectReport?.(report);
      });

      group.addLayer(caseMarker);
    });

    // B2. Render AI Preliminary Screening Signals (if enabled)
    if (filters.showAiScreenings && aiScreenings.length > 0) {
      aiScreenings.forEach((screening) => {
        if (!screening.latitude || !screening.longitude) return;

        const isVerified = screening.veterinarianVerified;
        const confidencePct =
          screening.confidenceScore !== null && screening.confidenceScore !== undefined
            ? `${(screening.confidenceScore * 100).toFixed(0)}%`
            : '—';

        const aiMarkerHtml = `
          <div class="vetra-case-ai-screening-marker" title="AI Preliminary: ${screening.preliminaryDiagnosis}">
            <div class="vetra-ai-pulse"></div>
          </div>
        `;

        const aiIcon = L.divIcon({
          html: aiMarkerHtml,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const aiMarker = L.marker([screening.latitude, screening.longitude], {
          icon: aiIcon,
          zIndexOffset: 150,
        });

        aiMarker.bindTooltip(
          `<strong>AI PRELIMINARY SCREENING</strong><br/>` +
            `Disease: ${screening.preliminaryDiagnosis}<br/>` +
            `Confidence: ${confidencePct}<br/>` +
            `Status: ${isVerified ? 'Verified by Vet' : 'Awaiting Veterinary Verification'}<br/>` +
            `Location: ${screening.district || 'N/A'}${screening.taluka ? ', ' + screening.taluka : ''}`,
          { className: 'font-mono text-xs' }
        );

        aiMarker.bindPopup(`
          <div class="p-3 font-mono text-xs select-none">
            <div class="flex items-center justify-between gap-2 mb-1.5 border-b border-[#E1E6EC] pb-1">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EDE9FE] text-[#6366F1]">
                AI PRELIMINARY SCREENING
              </span>
              <span class="text-[10px] font-semibold text-[#526074]">
                ${confidencePct} Confidence
              </span>
            </div>
            <div class="font-bold text-[#101826] text-sm mb-1">${screening.preliminaryDiagnosis}</div>
            <p class="text-[11px] text-[#526074] mb-0.5">Tag: <strong class="text-[#101826]">${screening.tagNumber || 'Unregistered'}</strong> (${screening.species || 'Livestock'})</p>
            <p class="text-[11px] text-[#526074] mb-0.5">Status: <strong class="text-[#D97B1F]">${isVerified ? 'Verified by Veterinarian' : 'Awaiting Veterinary Verification'}</strong></p>
            <p class="text-[11px] text-[#526074] mb-0.5">Location: <strong class="text-[#101826]">${screening.district || 'Maharashtra'}${screening.taluka ? ' · ' + screening.taluka : ''}</strong></p>
            <p class="text-[10px] text-[#93A1B0] mt-1">Screened: ${new Date(screening.createdAt).toLocaleString('en-IN')}</p>
          </div>
        `);

        aiMarker.on('click', () => {
          onSelectAiScreening?.(screening);
        });

        group.addLayer(aiMarker);
      });
    }

    // C. Render Spatial Heatmap KDE Points (if toggled)
    if (filters.showHeatmap && heatmapPoints.length > 0) {
      heatmapPoints.forEach((point) => {
        if (!point.latitude || !point.longitude) return;
        const heatCircle = L.circleMarker([point.latitude, point.longitude], {
          radius: Math.max(8, point.intensityWeight * 28),
          fillColor: '#B7301F',
          fillOpacity: Math.max(0.15, point.intensityWeight * 0.55),
          stroke: false,
        });
        heatCircle.bindTooltip(
          `Intensity: ${(point.intensityWeight * 100).toFixed(0)}% · Cases: ${point.caseCount} · ${point.diseaseName}`,
          { className: 'font-mono text-xs' }
        );
        group.addLayer(heatCircle);
      });
    }
  }, [outbreaks, reports, aiScreenings, heatmapPoints, filters, selectedOutbreakId, onSelectOutbreak, onSelectReport, onSelectAiScreening]);

  // Fit map viewport to active outbreaks
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || outbreaks.length === 0) return;

    const bounds = L.latLngBounds(
      outbreaks.map((o) => [o.centerLatitude, o.centerLongitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  };

  // Reset to Maharashtra statewide center
  const handleResetCenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView(MAHARASHTRA_CENTER, isCompact ? 6 : DEFAULT_ZOOM, { animate: true });
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div
      className="relative w-full overflow-hidden bg-[#F6F8FA] border border-[#E1E6EC] rounded-[6px]"
      style={{ height }}
      data-testid="surveillance-map-component"
    >
      {/* Missing MapTiler API Key Banner */}
      {!isKeyConfigured && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] px-4 py-2 rounded-[4px] shadow-md text-xs font-mono flex items-center gap-2"
          role="status"
          data-testid="maptiler-missing-key-banner"
        >
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>MapTiler API key is not configured.</span>
        </div>
      )}

      {/* Basemap Tiles Unavailable Notification (clean non-crashing fallback) */}
      {basemapUnavailable && isKeyConfigured && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] px-3.5 py-1.5 rounded-[4px] shadow-sm text-xs font-mono flex items-center gap-2"
          role="status"
          data-testid="maptiler-unavailable-banner"
        >
          <Info className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <span>Basemap tiles temporarily unavailable. Epidemiological vector layers active.</span>
        </div>
      )}

      {/* Map Target DOM */}
      <div ref={mapContainerRef} className="w-full h-full" tabIndex={0} aria-label="Interactive Disease Surveillance Map" />

      {/* Map Overlay Action Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 bg-white border border-[#C7D0DB] rounded-[4px] shadow-subtle p-1">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 flex items-center justify-center font-mono font-bold text-xs text-[#101826] hover:bg-[#F1F4F8] rounded transition-colors focus:outline-none"
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>
        <div className="h-[1px] bg-[#E1E6EC] mx-1" />
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 flex items-center justify-center font-mono font-bold text-xs text-[#101826] hover:bg-[#F1F4F8] rounded transition-colors focus:outline-none"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          -
        </button>
        <div className="h-[1px] bg-[#E1E6EC] mx-1" />
        <button
          onClick={handleFitBounds}
          disabled={outbreaks.length === 0}
          className="w-7 h-7 flex items-center justify-center text-[#526074] hover:text-[#1E5C97] hover:bg-[#F1F4F8] rounded transition-colors disabled:opacity-30 focus:outline-none"
          title="Fit View to Active Outbreak Clusters"
          aria-label="Fit View to Active Outbreak Clusters"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetCenter}
          className="w-7 h-7 flex items-center justify-center text-[#526074] hover:text-[#1E5C97] hover:bg-[#F1F4F8] rounded transition-colors focus:outline-none"
          title="Recenter Maharashtra Statewide"
          aria-label="Recenter Maharashtra Statewide"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Status Badge (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-[2px] border border-[#E1E6EC] px-2.5 py-1.5 rounded-[4px] shadow-subtle text-[11px] font-mono text-[#526074] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Locate className="w-3.5 h-3.5 text-[#1E5C97]" />
          <span>CRS: <strong className="text-[#101826]">EPSG:4326 (WGS84)</strong></span>
        </div>
        <div className="w-[1px] h-3 bg-[#E1E6EC]" />
        <div>
          Zoom: <strong className="text-[#101826] font-bold">{currentZoom}</strong>
        </div>
        <div className="w-[1px] h-3 bg-[#E1E6EC]" />
        <div>
          Visible Clusters: <strong className="text-[#101826] tabular-nums font-bold">{outbreaks.length}</strong>
        </div>
      </div>

      {/* Empty State Banner when no outbreaks match current filters */}
      {outbreaks.length === 0 && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[400] bg-white border border-[#E1E6EC] px-4 py-2 rounded-[4px] shadow-md text-xs font-mono text-[#526074] flex items-center gap-2">
          <span>No outbreak clusters match the selected filter criteria.</span>
          <button
            onClick={handleResetCenter}
            className="text-[#1E5C97] font-semibold underline hover:text-[#164A7C]"
          >
            Reset View
          </button>
        </div>
      )}
    </div>
  );
};
