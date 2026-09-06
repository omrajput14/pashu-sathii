import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FieldSurveillanceReportsPage } from '../pages/FieldSurveillanceReportsPage';
import { diseaseService } from '../core/api/diseaseService';

vi.mock('../core/api/diseaseService', () => ({
  diseaseService: {
    listReports: vi.fn(),
    getDiseaseRegistry: vi.fn(),
  },
}));

const mockPageData = {
  content: [
    {
      id: 'rep-uuid-1111-2222',
      animalId: 'anim-1',
      tagNumber: 'MH-12-TAG-99',
      animalName: 'Nandi Bull',
      medicalRecordId: 'med-1',
      aiScanId: null,
      reportedById: 'vet-1',
      reportedByName: 'Dr. Deshmukh',
      reportSource: 'VET_CONSULTATION',
      diagnosisConfidenceSource: 'VETERINARIAN',
      diseaseName: 'Foot and Mouth Disease',
      diagnosisStatus: 'CONFIRMED',
      latitude: 18.5204,
      longitude: 73.8567,
      notes: 'Vesicular lesions on oral mucosa and interdigital space.',
      createdAt: '2026-08-28T10:00:00Z',
      updatedAt: '2026-08-28T10:00:00Z',
    },
    {
      id: 'rep-uuid-3333-4444',
      animalId: 'anim-2',
      tagNumber: 'MH-14-TAG-01',
      animalName: 'Gauri Cow',
      medicalRecordId: null,
      aiScanId: 'scan-2',
      reportedById: 'farmer-1',
      reportedByName: 'Ramesh Patil',
      reportSource: 'FARMER_REPORT',
      diagnosisConfidenceSource: 'AI_VERIFIED',
      diseaseName: 'Lumpy Skin Disease',
      diagnosisStatus: 'SUSPECTED',
      latitude: 19.0760,
      longitude: 72.8777,
      notes: 'Multiple nodular eruptions across neck.',
      createdAt: '2026-08-29T08:30:00Z',
      updatedAt: '2026-08-29T08:30:00Z',
    },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

describe('FieldSurveillanceReportsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('renders field surveillance reports page with table and dual-coded statuses', async () => {
    vi.mocked(diseaseService.listReports).mockResolvedValue(mockPageData as any);
    vi.mocked(diseaseService.getDiseaseRegistry).mockResolvedValue([
      { diseaseName: 'Foot and Mouth Disease', speciesAffected: 'Cattle' },
      { diseaseName: 'Lumpy Skin Disease', speciesAffected: 'Bovine' },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <FieldSurveillanceReportsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Field Surveillance Operations & Clinical Reports')
      ).toBeInTheDocument();
      expect(screen.getAllByText('Foot and Mouth Disease').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Lumpy Skin Disease').length).toBeGreaterThan(0);
      expect(screen.getAllByText('CONFIRMED').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SUSPECTED').length).toBeGreaterThan(0);
      expect(screen.getByText('MH-12-TAG-99')).toBeInTheDocument();
    });
  });
});
