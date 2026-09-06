/**
 * MapTiler Cloud Configuration & URL Builder for VETRA Basemap Layers.
 *
 * Provides standard raster tile URLs, attribution strings, and style identifiers
 * while reading the API key strictly from environment configuration (VITE_MAPTILER_API_KEY).
 */

export interface MapTilerConfig {
  defaultStyle: string;
  tileSize: number;
  zoomOffset: number;
  minZoom: number;
  maxZoom: number;
}

export const MAPTILER_CONFIG: MapTilerConfig = {
  defaultStyle: 'dataviz',
  tileSize: 512,
  zoomOffset: -1,
  minZoom: 5,
  maxZoom: 19,
};

export const MAPTILER_ATTRIBUTION =
  '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">&copy; OpenStreetMap contributors</a>';

/**
 * Retrieves the configured MapTiler API Key from Vite environment variables.
 * Returns empty string if not configured.
 */
export const getMapTilerApiKey = (): string => {
  return (import.meta.env.VITE_MAPTILER_API_KEY || '').trim();
};

/**
 * Constructs the MapTiler raster tile endpoint for the specified style and API key.
 *
 * @param style MapTiler style identifier (defaults to 'dataviz')
 * @param apiKey Optional API key override (defaults to environment configuration)
 * @returns Fully qualified tile URL template for Leaflet L.tileLayer
 */
export const getMapTilerTileUrl = (
  style: string = MAPTILER_CONFIG.defaultStyle,
  apiKey: string = getMapTilerApiKey()
): string => {
  if (!apiKey) return '';
  return `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${apiKey}`;
};
