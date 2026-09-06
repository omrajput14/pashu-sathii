import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GisFilterBar } from '../components/gis/GisFilterBar';
import { DEFAULT_GIS_FILTERS } from '../core/types/gis.types';

describe('GisFilterBar Component', () => {
  const mockDiseases = ['Foot-and-Mouth Disease', 'Lumpy Skin Disease', 'Anthrax'];

  it('renders all filter controls, dropdowns, and layer checkboxes', () => {
    const handleFilterChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <GisFilterBar
        filters={DEFAULT_GIS_FILTERS}
        onFilterChange={handleFilterChange}
        onResetFilters={handleReset}
        availableDiseases={mockDiseases}
        totalVisibleCount={5}
      />
    );

    expect(screen.getByText('GIS Filters')).toBeInTheDocument();
    expect(screen.getByLabelText(/Disease:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Risk:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/District:/i)).toBeInTheDocument();
    expect(screen.getByText('5 Visible')).toBeInTheDocument();
    expect(screen.getByText('Cluster Risk Buffers')).toBeInTheDocument();
    expect(screen.getByText(/Confirmed Cases/i)).toBeInTheDocument();
    expect(screen.getByText(/Suspected Cases/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when disease filter is modified', () => {
    const handleFilterChange = vi.fn();

    render(
      <GisFilterBar
        filters={DEFAULT_GIS_FILTERS}
        onFilterChange={handleFilterChange}
        onResetFilters={vi.fn()}
        availableDiseases={mockDiseases}
        totalVisibleCount={3}
      />
    );

    fireEvent.change(screen.getByLabelText(/Disease:/i), {
      target: { value: 'Foot-and-Mouth Disease' },
    });

    expect(handleFilterChange).toHaveBeenCalledWith({
      disease: 'Foot-and-Mouth Disease',
    });
  });

  it('calls onFilterChange when risk level or layer checkboxes are toggled', () => {
    const handleFilterChange = vi.fn();

    render(
      <GisFilterBar
        filters={DEFAULT_GIS_FILTERS}
        onFilterChange={handleFilterChange}
        onResetFilters={vi.fn()}
        availableDiseases={mockDiseases}
        totalVisibleCount={3}
      />
    );

    fireEvent.change(screen.getByLabelText(/Risk:/i), {
      target: { value: 'CRITICAL' },
    });
    expect(handleFilterChange).toHaveBeenCalledWith({ riskLevel: 'CRITICAL' });

    // Toggle heatmap checkbox
    fireEvent.click(screen.getByText(/Spatial Intensity/i));
    expect(handleFilterChange).toHaveBeenCalledWith({ showHeatmap: true });
  });

  it('calls onResetFilters when the reset button is clicked', () => {
    const handleReset = vi.fn();

    render(
      <GisFilterBar
        filters={{ ...DEFAULT_GIS_FILTERS, disease: 'Anthrax' }}
        onFilterChange={vi.fn()}
        onResetFilters={handleReset}
        availableDiseases={mockDiseases}
        totalVisibleCount={1}
      />
    );

    fireEvent.click(screen.getByTitle('Reset Filters to Default'));
    expect(handleReset).toHaveBeenCalled();
  });
});
