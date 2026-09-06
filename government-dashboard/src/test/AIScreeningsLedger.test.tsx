import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIScreeningsLedgerTable } from '../components/reports/AIScreeningsLedgerTable';
import { AIScreeningResponse, Page } from '../core/types/disease.types';

describe('AIScreeningsLedgerTable Component', () => {
  const mockScreenings: AIScreeningResponse[] = [
    {
      id: 'scan-1111-2222-3333-444455556666',
      animalId: 'animal-001',
      tagNumber: 'TAG-PUNE-001',
      animalName: 'Gauri',
      species: 'CATTLE',
      preliminaryDiagnosis: 'Lumpy Skin Disease',
      confidenceScore: 0.78,
      severity: 'HIGH',
      status: 'COMPLETED',
      veterinarianVerified: false,
      verifiedByUserId: null,
      verifiedByVetName: null,
      verifiedAt: null,
      source: 'AI_PRELIMINARY_SCREENING',
      latitude: 18.5204,
      longitude: 73.8567,
      district: 'Pune',
      taluka: 'Haveli',
      state: 'Maharashtra',
      imageUrl: 'https://api.vetra.co.in/media/vetra-scans/scan_01.jpg',
      createdAt: '2026-08-30T10:30:00Z',
      updatedAt: '2026-08-30T10:30:00Z',
    },
    {
      id: 'scan-7777-8888-9999-000011112222',
      animalId: 'animal-002',
      tagNumber: 'TAG-SATARA-002',
      animalName: 'Radha',
      species: 'BUFFALO',
      preliminaryDiagnosis: 'Foot and Mouth Disease',
      confidenceScore: 0.92,
      severity: 'CRITICAL',
      status: 'COMPLETED',
      veterinarianVerified: true,
      verifiedByUserId: 'vet-001',
      verifiedByVetName: 'dr.deshmukh@vetra.app',
      verifiedAt: '2026-08-30T11:00:00Z',
      source: 'AI_PRELIMINARY_SCREENING',
      latitude: 17.6805,
      longitude: 74.0183,
      district: 'Satara',
      taluka: 'Karad',
      state: 'Maharashtra',
      imageUrl: null,
      createdAt: '2026-08-30T09:00:00Z',
      updatedAt: '2026-08-30T11:00:00Z',
    },
  ];

  const mockPageData: Page<AIScreeningResponse> = {
    content: mockScreenings,
    totalElements: 2,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  it('renders table headers and preliminary screening badges correctly', () => {
    render(
      <AIScreeningsLedgerTable
        pageData={mockPageData}
        isLoading={false}
        currentPage={0}
        pageSize={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByText(/AI Preliminary Screening Signals Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Early-Warning Only · Non-Clinical/i)).toBeInTheDocument();
    expect(screen.getByText('Lumpy Skin Disease')).toBeInTheDocument();
    expect(screen.getAllByText('AI PRELIMINARY SCREENING')).toHaveLength(2);
  });

  it('displays correct verification status for unverified and verified scans', () => {
    render(
      <AIScreeningsLedgerTable
        pageData={mockPageData}
        isLoading={false}
        currentPage={0}
        pageSize={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByText('Awaiting Veterinary Verification')).toBeInTheDocument();
    expect(screen.getByText('Verified by Vet')).toBeInTheDocument();
  });

  it('displays confidence score percentage and location details', () => {
    render(
      <AIScreeningsLedgerTable
        pageData={mockPageData}
        isLoading={false}
        currentPage={0}
        pageSize={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    );

    expect(screen.getByText('78.0%')).toBeInTheDocument();
    expect(screen.getByText('92.0%')).toBeInTheDocument();
    expect(screen.getByText('Pune')).toBeInTheDocument();
    expect(screen.getByText('Satara')).toBeInTheDocument();
  });

  it('handles item selection when a row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <AIScreeningsLedgerTable
        pageData={mockPageData}
        isLoading={false}
        currentPage={0}
        pageSize={20}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onSelectScreening={onSelect}
      />
    );

    const row = screen.getByText('Lumpy Skin Disease').closest('tr');
    if (row) fireEvent.click(row);
    expect(onSelect).toHaveBeenCalledWith(mockScreenings[0]);
  });
});
