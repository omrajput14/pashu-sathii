import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FourSignalRiskDecomposition } from '../components/intelligence/FourSignalRiskDecomposition';
import { OutbreakResponse } from '../core/types/outbreak.types';

const mockOutbreak: OutbreakResponse = {
  id: 'f8fb7f4a-6d4b-4df2-a5e2-6cf72c2195f1',
  diseaseName: 'Foot and Mouth Disease',
  centerLatitude: 18.5204,
  centerLongitude: 73.8567,
  radiusKm: 25.0,
  riskScore: 'HIGH',
  compositeRiskScore: 74,
  severity: 'HIGH',
  affectedReportsCount: 8,
  status: 'ACTIVE',
  evaluationWindowHours: 72,
  createdAt: '2026-08-25T10:00:00Z',
  lastCaseReportedAt: '2026-08-28T14:30:00Z',
  riskBreakdown: {
    compositeScore: 74,
    riskLevel: 'HIGH',
    clusterScore: 82,
    weatherScore: 65,
    historyScore: 70,
    vaccinationGapScore: 78,
    weatherTemperature: 29.4,
    weatherHumidity: 84.0,
    weatherPrecipitation: 14.2,
    vaccinationCoveragePct: 62.5,
    riskExplanation: 'Dense spatial cluster with elevated humidity amplifying transmission.',
    recommendedAction: 'Deploy emergency ring vaccination within 10km buffer.',
  },
};

describe('FourSignalRiskDecomposition Component', () => {
  it('renders all four risk signal scores and weather metrics', () => {
    render(<FourSignalRiskDecomposition outbreak={mockOutbreak} />);

    expect(screen.getByText('1. Cluster Velocity & Density')).toBeInTheDocument();
    expect(screen.getByText('82 / 100')).toBeInTheDocument();
    expect(screen.getByText('2. Vector & Climate Conditions')).toBeInTheDocument();
    expect(screen.getByText('65 / 100')).toBeInTheDocument();
    expect(screen.getByText('29.4°C')).toBeInTheDocument();
    expect(screen.getByText('84%')).toBeInTheDocument();
    expect(screen.getByText('14.2mm')).toBeInTheDocument();
    expect(screen.getByText('62.5%')).toBeInTheDocument();
  });

  it('renders explainable risk synthesis and recommended action', () => {
    render(<FourSignalRiskDecomposition outbreak={mockOutbreak} />);

    expect(screen.getByText(/Dense spatial cluster with elevated humidity/)).toBeInTheDocument();
    expect(screen.getByText(/Deploy emergency ring vaccination within 10km/)).toBeInTheDocument();
  });
});
