import { describe, it, expect } from 'vitest';
import { calculateHaversineDistanceKm, isReportInsideOutbreak, EARTH_RADIUS_KM } from '../core/utils/geoUtils';

describe('geoUtils', () => {
  it('calculates 0 km distance for identical coordinates', () => {
    const d = calculateHaversineDistanceKm(18.5204, 73.8567, 18.5204, 73.8567);
    expect(d).toBeCloseTo(0, 4);
  });

  it('calculates accurate Haversine distance between Pune and Mumbai (~118-120 km)', () => {
    // Pune: (18.5204, 73.8567), Mumbai: (19.0760, 72.8777)
    const d = calculateHaversineDistanceKm(18.5204, 73.8567, 19.0760, 72.8777);
    expect(d).toBeGreaterThan(115);
    expect(d).toBeLessThan(125);
  });

  it('handles invalid NaN coordinates by returning POSITIVE_INFINITY', () => {
    const d = calculateHaversineDistanceKm(NaN, 73.8567, 18.5204, 73.8567);
    expect(d).toBe(Number.POSITIVE_INFINITY);
  });

  it('correctly determines if a point is inside or outside an outbreak radius', () => {
    const centerLat = 18.5204;
    const centerLng = 73.8567;
    const radiusKm = 15.0;

    // Point ~1 km away (inside)
    const insideLat = 18.5250;
    const insideLng = 73.8600;
    expect(isReportInsideOutbreak(insideLat, insideLng, centerLat, centerLng, radiusKm)).toBe(true);

    // Point ~120 km away (Mumbai - outside)
    const outsideLat = 19.0760;
    const outsideLng = 72.8777;
    expect(isReportInsideOutbreak(outsideLat, outsideLng, centerLat, centerLng, radiusKm)).toBe(false);
  });
});
