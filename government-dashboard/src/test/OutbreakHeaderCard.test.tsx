import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OutbreakHeaderCard } from '../components/intelligence/OutbreakHeaderCard';
import { OutbreakResponse } from '../core/types/outbreak.types';

const mockOutbreak: OutbreakResponse = {
  id: 'f8fb7f4a-6d4b-4df2-a5e2-6cf72c2195f1',
  diseaseName: 'Lumpy Skin Disease',
  centerLatitude: 18.5204,
  centerLongitude: 73.8567,
  radiusKm: 25.0,
  riskScore: 'CRITICAL',
  compositeRiskScore: 88,
  severity: 'CRITICAL',
  affectedReportsCount: 14,
  status: 'ACTIVE',
  evaluationWindowHours: 72,
  createdAt: '2026-08-25T10:00:00Z',
  lastCaseReportedAt: '2026-08-28T14:30:00Z',
  riskBreakdown: null,
};

describe('OutbreakHeaderCard Component', () => {
  it('renders disease title, composite score and GPS coordinates', () => {
    render(<OutbreakHeaderCard outbreak={mockOutbreak} />);

    expect(screen.getByText('Lumpy Skin Disease')).toBeInTheDocument();
    expect(screen.getByText('#f8fb7f4a')).toBeInTheDocument();
    expect(screen.getByText('18.5204°N, 73.8567°E')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('25 km')).toBeInTheDocument();
  });

  it('triggers view on map and back callbacks when provided', () => {
    const onBack = vi.fn();
    const onMap = vi.fn();

    render(
      <OutbreakHeaderCard
        outbreak={mockOutbreak}
        onBackToList={onBack}
        onViewOnMap={onMap}
      />
    );

    const backBtn = screen.getByText('All Outbreaks');
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalled();

    const mapBtn = screen.getByText('View in GIS Map');
    fireEvent.click(mapBtn);
    expect(onMap).toHaveBeenCalledWith('f8fb7f4a-6d4b-4df2-a5e2-6cf72c2195f1');
  });
});
