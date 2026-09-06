import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiStrip } from '../components/overview/KpiStrip';
import { EconomicImpactResponse } from '../core/types/analytics.types';

describe('Phase 4B Statewide Income Protected KPI', () => {
  it('renders authoritative formatted rupee value and modeled estimate badge when sufficient data exists', () => {
    const mockEconomic: EconomicImpactResponse = {
      modeledSavings: 180000.0,
      formattedValue: '₹1,80,000', unit: 'INR', label: 'Modeled estimate', isModeled: true, statusMessage: 'Modeled from registered livestock data', methodologyVersion: 'v1.0', scope: 'STATEWIDE',
      eligibleAnimalsCount: 10,
      
      methodology: 'Modeled estimate based on registered livestock',
      
      
      hasSufficientData: true,
    };

    render(<KpiStrip economicImpact={mockEconomic} isLoading={false} />);
    expect(screen.getByText('STATEWIDE INCOME PROTECTED')).toBeInTheDocument();
    expect(screen.getByText('₹1,80,000')).toBeInTheDocument();
    expect(screen.getByText('MODELED ESTIMATE')).toBeInTheDocument();
    expect(screen.getByText(/10 Susceptible Animals Protected/i)).toBeInTheDocument();
  });

  it('renders "Insufficient data" without fabricating ₹0 or fallback amounts when 0 eligible animals or insufficientData', () => {
    const mockEmptyEconomic: EconomicImpactResponse = {
      modeledSavings: null,
      formattedValue: null, unit: 'INR', label: 'Modeled estimate', isModeled: true, statusMessage: 'Insufficient data', methodologyVersion: 'v1.0', scope: 'STATEWIDE',
      eligibleAnimalsCount: 0,
      
      methodology: 'Modeled estimate based on registered livestock',
      
      
      hasSufficientData: false,
    };

    render(<KpiStrip economicImpact={mockEmptyEconomic} isLoading={false} />);
    expect(screen.getByText('STATEWIDE INCOME PROTECTED')).toBeInTheDocument();
    expect(screen.getByText('Insufficient data')).toBeInTheDocument();
    expect(screen.getByText('Zero eligible animals')).toBeInTheDocument();
    // Verify no fabricated example numbers appear
    expect(screen.queryByText('₹18,000')).not.toBeInTheDocument();
    expect(screen.queryByText('₹0')).not.toBeInTheDocument();
  });

  it('renders "Insufficient data" when economicImpact prop is missing or undefined', () => {
    render(<KpiStrip isLoading={false} />);
    expect(screen.getByText('STATEWIDE INCOME PROTECTED')).toBeInTheDocument();
    expect(screen.getByText('Insufficient data')).toBeInTheDocument();
    expect(screen.getByText('Zero eligible animals')).toBeInTheDocument();
  });
});
