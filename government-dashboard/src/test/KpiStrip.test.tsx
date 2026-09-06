import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiStrip } from '../components/overview/KpiStrip';

describe('KpiStrip Component (No Fabricated Metrics)', () => {
  it('renders skeleton loading state when isLoading is true', () => {
    render(<KpiStrip isLoading={true} />);
    expect(screen.getByTestId('kpi-strip-loading')).toBeInTheDocument();
  });

  it('renders actual backend statistics without arbitrary multiplier fallbacks', () => {
    const mockStats = {
      totalOutbreaks: 15,
      activeOutbreaks: 8,
      resolvedOutbreaks: 7,
      highRiskOutbreaks: 3,
    };

    const mockAnalytics = {
      totalOutbreaks: 15,
      activeOutbreaks: 8,
      resolvedOutbreaks: 7,
      highRiskOutbreaks: 3,
      averageResolutionTimeHours: 48.5,
      diseaseDistribution: { 'Foot-and-Mouth Disease': 5 },
      mostCommonDiseases: ['Foot-and-Mouth Disease'],
      reportsByConfidenceSource: {
        VETERINARIAN: 24,
        LAB_CONFIRMED: 6,
        AI_VERIFIED: 12,
        GOVERNMENT: 4,
      },
    };

    render(<KpiStrip stats={mockStats} analytics={mockAnalytics} isLoading={false} />);
    expect(screen.getByTestId('kpi-strip')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE OUTBREAK CLUSTERS')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument(); // exactly 24 + 6 from API
    expect(screen.getByText('16')).toBeInTheDocument(); // exactly 12 + 4 from API
    expect(screen.getByText('3')).toBeInTheDocument(); // high risk
  });

  it('displays "—" and "Data unavailable" when analytics data is missing or unpopulated', () => {
    const mockStats = {
      totalOutbreaks: 4,
      activeOutbreaks: 2,
      resolvedOutbreaks: 2,
      highRiskOutbreaks: 1,
    };

    render(<KpiStrip stats={mockStats} analytics={undefined} isLoading={false} />);
    expect(screen.getByTestId('kpi-strip')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // from stats
    // Confirmed and Suspected must display '—' rather than multiplying activeOutbreaks * 3 or 5!
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBe(2);
    const unavailables = screen.getAllByText('Data unavailable');
    expect(unavailables.length).toBe(2);
  });
});
