/**
 * Geo-spatial utilities for Haversine distance calculations and containment zone checks.
 * Aligns 100% with the VETRA backend GeoUtils and PostGIS spatial clustering semantics.
 */

export const EARTH_RADIUS_KM = 6371.0088;

/**
 * Calculates the Haversine great-circle distance between two geographic coordinates in kilometers.
 *
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    Number.isNaN(lat1) ||
    Number.isNaN(lon1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lon2)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Determines whether a given report coordinate falls within an outbreak cluster's geographic containment radius.
 *
 * @param reportLat Report latitude
 * @param reportLng Report longitude
 * @param outbreakCenterLat Outbreak center latitude
 * @param outbreakCenterLng Outbreak center longitude
 * @param outbreakRadiusKm Outbreak containment radius in km
 * @returns true if distance <= radiusKm
 */
export function isReportInsideOutbreak(
  reportLat: number,
  reportLng: number,
  outbreakCenterLat: number,
  outbreakCenterLng: number,
  outbreakRadiusKm: number
): boolean {
  const distanceKm = calculateHaversineDistanceKm(
    reportLat,
    reportLng,
    outbreakCenterLat,
    outbreakCenterLng
  );
  return distanceKm <= outbreakRadiusKm;
}
