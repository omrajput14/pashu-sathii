import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentSurveillanceTable } from '../components/overview/RecentSurveillanceTable';
import { Page, DiseaseReportResponse } from '../core/types/disease.types';

describe('RecentSurveillanceTable Component', () => {
  const mockPage: Page<DiseaseReportResponse> = {
    content: [
      {
        id: 'rep-uuid-12345678',
        animalId: 'anim-1',
        tagNumber: 'TAG-MH-9812',
        animalName: 'Gauri',
        medicalRecordId: null,
        aiScanId: null,
        reportedById: 'user-1',
        reportedByName: 'Dr. S. Kulkarni',
        reportSource: 'VET_CONSULTATION',
        diagnosisConfidenceSource: 'VETERINARIAN',
        diseaseName: 'Foot-and-Mouth Disease',
        diagnosisStatus: 'CONFIRMED',
        latitude: 18.151,
        longitude: 74.578,
        notes: 'Vesicular lesions on tongue',
        createdAt: '2026-08-29T10:15:00Z',
        updatedAt: '2026-08-29T10:15:00Z',
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  it('renders report rows with correct data', () => {
    render(<RecentSurveillanceTable reportsPage={mockPage} isLoading={false} />);
    expect(screen.getByTestId('recent-surveillance-table')).toBeInTheDocument();
    expect(screen.getByText('#rep-uuid')).toBeInTheDocument();
    expect(screen.getByText('TAG-MH-9812')).toBeInTheDocument();
    expect(screen.getByText('Foot-and-Mouth Disease')).toBeInTheDocument();
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText('VETERINARIAN')).toBeInTheDocument();
  });

  it('triggers onInspectReport when action button is clicked', () => {
    const handleInspect = vi.fn();
    render(<RecentSurveillanceTable reportsPage={mockPage} isLoading={false} onInspectReport={handleInspect} />);
    const inspectBtn = screen.getByLabelText('Inspect report rep-uuid-12345678');
    fireEvent.click(inspectBtn);
    expect(handleInspect).toHaveBeenCalledWith(mockPage.content[0]);
  });

  it('renders empty table message when content is empty', () => {
    render(<RecentSurveillanceTable reportsPage={{ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true, empty: true }} isLoading={false} />);
    expect(screen.getByText('No recent field reports ingested')).toBeInTheDocument();
  });
});
