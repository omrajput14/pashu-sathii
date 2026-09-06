import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SurveillanceMap } from '../components/gis/SurveillanceMap';
import { DEFAULT_GIS_FILTERS, GeoJsonFeatureCollection, AdministrativeFeatureProperties } from '../core/types/gis.types';
import { OutbreakResponse } from '../core/types/outbreak.types';
import { DiseaseReportResponse } from '../core/types/disease.types';

describe('SurveillanceMap Component & MapTiler Basemap Integration', () => {
  const originalEnv = import.meta.env.VITE_MAPTILER_API_KEY;

  beforeEach(() => {
    import.meta.env.VITE_MAPTILER_API_KEY = 'mock-maptiler-test-key';
  });

  afterEach(() => {
    import.meta.env.VITE_MAPTILER_API_KEY = originalEnv;
  });

  const mockOutbreaks: OutbreakResponse[] = [
    {
      id: 'f8fb7f4a-de19-4e3d-8300-9cf366ad90e8',
      diseaseName: 'Foot and Mouth Disease',
      severity: 'HIGH',
      status: 'ACTIVE',
      riskScore: 'CRITICAL',
      compositeRiskScore: 88,
      centerLatitude: 18.1512,
      centerLongitude: 74.5772,
      radiusKm: 5.5,
      affectedReportsCount: 14,
      evaluationWindowHours: 72,
      lastCaseReportedAt: '2026-08-29T10:15:00Z',
      createdAt: '2026-08-28T09:00:00Z',
      updatedAt: '2026-08-29T10:15:00Z',
      riskBreakdown: {
        clusterScore: 92.0,
        weatherScore: 78.5,
        historyScore: 65.0,
        vaccinationGapScore: 84.0,
        weatherTemperature: 28.5,
        weatherHumidity: 82.0,
        weatherPrecipitation: 12.4,
        vaccinationCoveragePct: 42.5,
        riskExplanation: 'Critical risk in Baramati block',
        recommendedAction: 'Quarantine area',
      },
    },
  ];

  const mockReports: DiseaseReportResponse[] = [
    {
      id: 'rep-001',
      reportNumber: 'REP-2026-001',
      diseaseId: 'dis-001',
      diseaseName: 'Foot and Mouth Disease',
      animalType: 'CATTLE',
      affectedAnimalsCount: 3,
      deadAnimalsCount: 0,
      symptoms: ['Fever', 'Blisters'],
      latitude: 18.16,
      longitude: 74.58,
      village: 'Malegaon',
      taluka: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      diagnosisStatus: 'CONFIRMED',
      diagnosisConfidenceSource: 'LAB_PCR',
      reportedAt: '2026-08-29T08:00:00Z',
      isVerified: true,
      tagNumber: 'MH-PUN-0192',
    },
    {
      id: 'rep-002',
      reportNumber: 'REP-2026-002',
      diseaseId: 'dis-001',
      diseaseName: 'Foot and Mouth Disease',
      animalType: 'BUFFALO',
      affectedAnimalsCount: 1,
      deadAnimalsCount: 0,
      symptoms: ['Salivation'],
      latitude: 18.18,
      longitude: 74.60,
      village: 'Supa',
      taluka: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      diagnosisStatus: 'SUSPECTED',
      diagnosisConfidenceSource: 'VET_FIELD',
      reportedAt: '2026-08-29T09:00:00Z',
      isVerified: false,
      tagNumber: 'MH-PUN-0193',
    },
  ];

  const mockBoundaries: GeoJsonFeatureCollection<AdministrativeFeatureProperties> = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'adm1-state',
        properties: {
          name: 'Maharashtra',
          administrativeLevel: 'STATE',
          state: 'Maharashtra',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[72.5, 15.5], [80.5, 15.5], [80.5, 22.0], [72.5, 22.0], [72.5, 15.5]]],
        },
      },
      {
        type: 'Feature',
        id: 'adm2-pune',
        properties: {
          name: 'Pune',
          administrativeLevel: 'DISTRICT',
          state: 'Maharashtra',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[73.5, 18.0], [75.0, 18.0], [75.0, 19.5], [73.5, 19.5], [73.5, 18.0]]],
        },
      },
      {
        type: 'Feature',
        id: 'adm3-baramati',
        properties: {
          name: 'Baramati',
          administrativeLevel: 'TALUKA',
          state: 'Maharashtra',
          district: 'Pune',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[74.4, 18.1], [74.7, 18.1], [74.7, 18.3], [74.4, 18.3], [74.4, 18.1]]],
        },
      },
    ],
  };

  it('initializes map DOM container with spatial coordinate reference', () => {
    render(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        filters={DEFAULT_GIS_FILTERS}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();
    expect(screen.getByText(/EPSG:4326/i)).toBeInTheDocument();
    expect(screen.getByText('Visible Clusters:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders without missing-key banner when MapTiler key is configured', () => {
    render(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        filters={DEFAULT_GIS_FILTERS}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(screen.queryByTestId('maptiler-missing-key-banner')).not.toBeInTheDocument();
    expect(screen.queryByText('MapTiler API key is not configured.')).not.toBeInTheDocument();
  });

  it('displays clean missing-key banner when MapTiler API key is absent without crashing', () => {
    import.meta.env.VITE_MAPTILER_API_KEY = '';

    render(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        filters={DEFAULT_GIS_FILTERS}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(screen.getByTestId('maptiler-missing-key-banner')).toBeInTheDocument();
    expect(screen.getByText('MapTiler API key is not configured.')).toBeInTheDocument();
    // Surveillance features remain initialized and active
    expect(screen.getByText('Visible Clusters:')).toBeInTheDocument();
  });

  it('renders map zoom and fit bounds control buttons with accessible labels', () => {
    render(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        filters={DEFAULT_GIS_FILTERS}
        onSelectOutbreak={vi.fn()}
      />
    );

    const zoomInBtn = screen.getByLabelText('Zoom In');
    const zoomOutBtn = screen.getByLabelText('Zoom Out');
    const fitBoundsBtn = screen.getByLabelText('Fit View to Active Outbreak Clusters');
    const recenterBtn = screen.getByLabelText('Recenter Maharashtra Statewide');

    expect(zoomInBtn).toBeInTheDocument();
    expect(zoomOutBtn).toBeInTheDocument();
    expect(fitBoundsBtn).toBeInTheDocument();
    expect(recenterBtn).toBeInTheDocument();

    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomOutBtn);
    fireEvent.click(fitBoundsBtn);
    fireEvent.click(recenterBtn);
  });

  it('renders administrative boundaries and toggles state/district/taluka layers', () => {
    const { rerender } = render(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        boundaries={mockBoundaries}
        filters={{
          ...DEFAULT_GIS_FILTERS,
          showStateBoundary: true,
          showDistrictBoundaries: true,
          showTalukaBoundaries: false,
        }}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();

    // Rerender with Taluka boundaries enabled manually
    rerender(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        boundaries={mockBoundaries}
        filters={{
          ...DEFAULT_GIS_FILTERS,
          showStateBoundary: true,
          showDistrictBoundaries: true,
          showTalukaBoundaries: true,
        }}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();
  });

  it('renders confirmed and suspected case point layers with toggles', () => {
    const { rerender } = render(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        filters={{
          ...DEFAULT_GIS_FILTERS,
          showConfirmedCases: true,
          showSuspectedCases: true,
        }}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();

    rerender(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        filters={{
          ...DEFAULT_GIS_FILTERS,
          showConfirmedCases: false,
          showSuspectedCases: false,
        }}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();
  });

  it('renders heatmap KDE points when showHeatmap filter is enabled', () => {
    const mockHeatmapPoints = [
      { latitude: 18.15, longitude: 74.57, intensityWeight: 0.85, caseCount: 12, diseaseName: 'Foot and Mouth Disease' },
      { latitude: 18.20, longitude: 74.62, intensityWeight: 0.40, caseCount: 3, diseaseName: 'Foot and Mouth Disease' },
    ];

    render(
      <SurveillanceMap
        outbreaks={mockOutbreaks}
        reports={mockReports}
        heatmapPoints={mockHeatmapPoints}
        filters={{
          ...DEFAULT_GIS_FILTERS,
          showHeatmap: true,
        }}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(screen.getByTestId('surveillance-map-component')).toBeInTheDocument();
  });

  it('renders empty state message when 0 outbreaks match filter', () => {
    render(
      <SurveillanceMap
        outbreaks={[]}
        reports={[]}
        filters={DEFAULT_GIS_FILTERS}
        onSelectOutbreak={vi.fn()}
      />
    );

    expect(
      screen.getByText('No outbreak clusters match the selected filter criteria.')
    ).toBeInTheDocument();
  });
});
