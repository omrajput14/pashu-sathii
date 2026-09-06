import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContributingReportsLedger } from '../components/intelligence/ContributingReportsLedger';
import { DiseaseReportResponse } from '../core/types/disease.types';

const mockReports: DiseaseReportResponse[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    diseaseName: 'Lumpy Skin Disease',
    diagnosisStatus: 'CONFIRMED',
    diagnosisConfidenceSource: 'VETERINARIAN',
    tagNumber: 'TAG-8821',
    animalName: 'Lakshmi',
    latitude: 18.5204,
    longitude: 73.8567,
    createdAt: '2026-08-28T09:30:00Z',
    notes: 'Nodular lesions on neck',
    severity: 'HIGH',
    reportedByName: 'Dr. Kulkarni',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    diseaseName: 'Lumpy Skin Disease',
    diagnosisStatus: 'SUSPECTED',
    diagnosisConfidenceSource: 'AI_VERIFIED',
    tagNumber: 'TAG-9932',
    animalName: 'Rani',
    latitude: 18.5210,
    longitude: 73.8570,
    createdAt: '2026-08-28T12:00:00Z',
    notes: 'Suspected lesions',
    severity: 'MEDIUM',
    reportedByName: 'Farmer Somnath',
  },
];

describe('ContributingReportsLedger Component', () => {
  it('renders report rows and handles search filtering', () => {
    const onInspect = vi.fn();
    render(
      <ContributingReportsLedger
        reports={mockReports}
        onInspectReport={onInspect}
      />
    );

    expect(screen.getByText('TAG-8821')).toBeInTheDocument();
    expect(screen.getByText('TAG-9932')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search tag or reporter...');
    fireEvent.change(searchInput, { target: { value: '8821' } });

    expect(screen.getByText('TAG-8821')).toBeInTheDocument();
    expect(screen.queryByText('TAG-9932')).not.toBeInTheDocument();
  });

  it('triggers onInspectReport when inspect button is clicked', () => {
    const onInspect = vi.fn();
    render(
      <ContributingReportsLedger
        reports={mockReports}
        onInspectReport={onInspect}
      />
    );

    const inspectButtons = screen.getAllByText('Inspect');
    fireEvent.click(inspectButtons[0]);
    expect(onInspect).toHaveBeenCalledWith(mockReports[0]);
  });
});
