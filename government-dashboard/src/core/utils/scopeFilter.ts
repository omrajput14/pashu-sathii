import { OutbreakResponse } from '../types/outbreak.types';
import { DiseaseReportResponse } from '../types/disease.types';
import { OperationalAlertResponse } from '../types/alerts.types';
import { calculateHaversineDistanceKm } from './geoUtils';

export interface ScopeConfig {
  name: string;
  shortName: string;
  center: [number, number];
  zoom: number;
  district: string;
  taluka?: string;
  radiusKm: number;
  keywords: string[];
}

export const SCOPE_CONFIGS: Record<string, ScopeConfig> = {
  'Maharashtra (Statewide)': {
    name: 'Maharashtra (Statewide)',
    shortName: 'Statewide',
    center: [19.7515, 75.7139],
    zoom: 7,
    district: 'ALL',
    radiusKm: 1000,
    keywords: [],
  },
  'Pune District': {
    name: 'Pune District',
    shortName: 'Pune',
    center: [18.5204, 73.8567],
    zoom: 9,
    district: 'Pune',
    radiusKm: 85,
    keywords: ['pune', 'baramati', 'haveli', 'shirur', 'daund', 'khed', 'indapur', 'ambegaon', 'junnar', 'purandar', 'bhor', 'velhe', 'mulshi', 'maval'],
  },
  'Baramati Block / Taluka': {
    name: 'Baramati Block / Taluka',
    shortName: 'Baramati',
    center: [18.1517, 74.5772],
    zoom: 11,
    district: 'Pune',
    taluka: 'Baramati',
    radiusKm: 35,
    keywords: ['baramati'],
  },
  'Ahmednagar District': {
    name: 'Ahmednagar District',
    shortName: 'Ahmednagar',
    center: [19.0948, 74.7480],
    zoom: 9,
    district: 'Ahmednagar',
    radiusKm: 85,
    keywords: ['ahmednagar', 'nagar', 'rahuri', 'shirdi', 'sangamner', 'kopargaon', 'newasa', 'shevgaon', 'parner', 'shrigonda', 'karjat', 'jamkhed'],
  },
  'Nashik District': {
    name: 'Nashik District',
    shortName: 'Nashik',
    center: [19.9975, 73.7898],
    zoom: 9,
    district: 'Nashik',
    radiusKm: 85,
    keywords: ['nashik', 'malegaon', 'sinnar', 'niphad', 'yeola', 'satana', 'dindori', 'kalwan', 'deola', 'chandwad', 'trimbak', 'igatpuri', 'peint', 'surgana'],
  },
};

export function getScopeConfig(scope: string): ScopeConfig {
  return SCOPE_CONFIGS[scope] || SCOPE_CONFIGS['Maharashtra (Statewide)'];
}

export function isStatewide(scope: string): boolean {
  return !scope || scope === 'Maharashtra (Statewide)';
}

export function isOutbreakInScope(outbreak: OutbreakResponse, scope: string): boolean {
  if (isStatewide(scope)) return true;
  const config = getScopeConfig(scope);

  // 1. Check ID and text keywords
  const idLower = (outbreak.id || '').toLowerCase();
  const notesLower = (outbreak.riskBreakdown?.riskExplanation || '').toLowerCase();
  for (const kw of config.keywords) {
    if (idLower.includes(kw) || notesLower.includes(kw)) {
      return true;
    }
  }

  // 2. Spatial distance check to scope centroid
  if (outbreak.centerLatitude && outbreak.centerLongitude) {
    const dist = calculateHaversineDistanceKm(
      config.center[0],
      config.center[1],
      outbreak.centerLatitude,
      outbreak.centerLongitude
    );
    if (dist <= config.radiusKm) {
      return true;
    }
  }

  return false;
}

export function isReportInScope(report: DiseaseReportResponse, scope: string): boolean {
  if (isStatewide(scope)) return true;
  const config = getScopeConfig(scope);

  const reporterLower = (report.reportedByName || '').toLowerCase();
  const notesLower = (report.notes || '').toLowerCase();

  for (const kw of config.keywords) {
    if (reporterLower.includes(kw) || notesLower.includes(kw)) {
      return true;
    }
  }

  if (report.latitude && report.longitude) {
    const dist = calculateHaversineDistanceKm(
      config.center[0],
      config.center[1],
      report.latitude,
      report.longitude
    );
    if (dist <= config.radiusKm) {
      return true;
    }
  }

  return false;
}

export function isAlertInScope(alert: OperationalAlertResponse, scope: string): boolean {
  if (isStatewide(scope)) return true;
  const config = getScopeConfig(scope);

  const locLower = (alert.locationName || '').toLowerCase();
  const titleLower = (alert.title || '').toLowerCase();
  const whyLower = (alert.whyItMatters || '').toLowerCase();

  for (const kw of config.keywords) {
    if (locLower.includes(kw) || titleLower.includes(kw) || whyLower.includes(kw)) {
      return true;
    }
  }

  if (alert.relatedOutbreakId) {
    for (const kw of config.keywords) {
      if (alert.relatedOutbreakId.toLowerCase().includes(kw)) {
        return true;
      }
    }
  }

  return false;
}

export function isZoneInScope(zoneName: string, scope: string): boolean {
  if (isStatewide(scope)) return true;
  const config = getScopeConfig(scope);
  const zLower = (zoneName || '').toLowerCase();
  for (const kw of config.keywords) {
    if (zLower.includes(kw)) return true;
  }
  return false;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): void {
  const sanitize = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return '"' + str + '"';
  };

  const csvLines = [
    headers.map(sanitize).join(','),
    ...rows.map(row => row.map(sanitize).join(',')),
  ];

  const blob = new Blob([csvLines.join(String.fromCharCode(10))], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : filename + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
