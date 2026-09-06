import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfirmedVsSuspectedAnalysis } from '../components/intelligence/ConfirmedVsSuspectedAnalysis';
import { DiseaseReportResponse } from '../core/types/disease.types';

const mockReports: DiseaseReportResponse[] = [
  {
    id: 'r-1',
    diseaseName: 'Anthrax',
    diagnosisStatus: 'CONFIRMED',
    diagnosisConfidenceSource: 'LAB_CONFIRMED',
    tagNumber: 'MH-PUN-001',
    animalName: 'Gauri',
    latitude: 18.52,
    longitude: 73.85,
    createdAt: '2026-08-27T10:00:00Z',
    notes: 'PCR positive',
    severity: 'HIGH',
    reportedByName: 'Dr. Patil',
  },
  {
    id: 'r-2',
    diseaseName: 'Anthrax',
    diagnosisStatus: 'CONFIRMED',
    diagnosisConfidenceSource: 'VETERINARIAN',
    tagNumber: 'MH-PUN-002',
    animalName: 'Kalu',
    latitude: 18.53,
    longitude: 73.86,
    createdAt: '2026-08-28T11:00:00Z',
    notes: 'Clinical signs verified',
    severity: 'HIGH',
    reportedByName: 'Dr. Patil',
  },
  {
    id: 'r-3',
    diseaseName: 'Anthrax',
    diagnosisStatus: 'SUSPECTED',
    diagnosisConfidenceSource: 'AI_VERIFIED',
    tagNumber: 'MH-PUN-003',
    animalName: 'Shyam',
    latitude: 18.54,
    longitude: 73.87,
    createdAt: '2026-08-28T14:00:00Z',
    notes: 'Farmer scan',
    severity: 'MEDIUM',
    reportedByName: 'Farmer Ramesh',
  },
];

describe('ConfirmedVsSuspectedAnalysis Component', () => {
  it('computes and displays verified confirmed vs suspected counts', () => {
    render(<ConfirmedVsSuspectedAnalysis reports={mockReports} />);

    expect(screen.getByText('CONFIRMED DIAGNOSES')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('(66.7% of total cluster)')).toBeInTheDocument();

    expect(screen.getByText('SUSPECTED / PRELIMINARY')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('(33.3% triage queue)')).toBeInTheDocument();
  });
});
