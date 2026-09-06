import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriorityAlertRail } from '../components/overview/PriorityAlertRail';
import { OutbreakResponse } from '../core/types/outbreak.types';

describe('PriorityAlertRail Component', () => {
  const mockOutbreaks: OutbreakResponse[] = [
    {
      id: 'ob-1',
      diseaseName: 'Foot-and-Mouth Disease',
      severity: 'HIGH',
      status: 'ACTIVE',
      riskScore: 'CRITICAL',
      centerLatitude: 18.151,
      centerLongitude: 74.578,
      radiusKm: 5.5,
      affectedReportsCount: 12,
      evaluationWindowHours: 24,
      lastCaseReportedAt: '2026-08-29T10:00:00Z',
      createdAt: '2026-08-29T08:00:00Z',
      updatedAt: '2026-08-29T10:00:00Z',
      compositeRiskScore: 88,
      riskBreakdown: {
        clusterScore: 38,
        weatherScore: 18,
        historyScore: 14,
        vaccinationGapScore: 18,
        weatherTemperature: 27.5,
        weatherHumidity: 84,
        weatherPrecipitation: 5.2,
        vaccinationCoveragePct: 42.1,
        riskExplanation: 'High aerosol cluster in Baramati dairy corridor',
        recommendedAction: 'Ring vaccination buffer 5.5 km',
      },
    },
  ];

  it('renders priority alert item with disease name and severity', () => {
    render(<PriorityAlertRail outbreaks={mockOutbreaks} isLoading={false} />);
    expect(screen.getByTestId('priority-alert-rail')).toBeInTheDocument();
    expect(screen.getByText('Foot-and-Mouth Disease')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('(88)')).toBeInTheDocument();
    expect(screen.getByText('High aerosol cluster in Baramati dairy corridor')).toBeInTheDocument();
  });

  it('triggers onSelectOutbreak callback when Inspect is clicked', () => {
    const handleSelect = vi.fn();
    render(<PriorityAlertRail outbreaks={mockOutbreaks} isLoading={false} onSelectOutbreak={handleSelect} />);
    const inspectBtn = screen.getByLabelText('Inspect Foot-and-Mouth Disease cluster');
    fireEvent.click(inspectBtn);
    expect(handleSelect).toHaveBeenCalledWith(mockOutbreaks[0]);
  });

  it('displays empty state when outbreaks list is empty', () => {
    render(<PriorityAlertRail outbreaks={[]} isLoading={false} />);
    expect(screen.getByText('No active high-risk alerts')).toBeInTheDocument();
  });
});
