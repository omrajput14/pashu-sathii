import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getMapTilerApiKey,
  getMapTilerTileUrl,
  MAPTILER_CONFIG,
  MAPTILER_ATTRIBUTION,
} from '../core/config/maptiler';

describe('MapTiler Configuration & URL Builder', () => {
  const originalEnv = import.meta.env.VITE_MAPTILER_API_KEY;

  afterEach(() => {
    import.meta.env.VITE_MAPTILER_API_KEY = originalEnv;
  });

  it('retrieves configured API key from import.meta.env', () => {
    import.meta.env.VITE_MAPTILER_API_KEY = 'test-maptiler-key-123';
    expect(getMapTilerApiKey()).toBe('test-maptiler-key-123');
  });

  it('returns empty string when API key is missing or blank', () => {
    import.meta.env.VITE_MAPTILER_API_KEY = '';
    expect(getMapTilerApiKey()).toBe('');

    delete (import.meta.env as any).VITE_MAPTILER_API_KEY;
    expect(getMapTilerApiKey()).toBe('');
  });

  it('constructs correct MapTiler tile URL with given style and key', () => {
    const url = getMapTilerTileUrl('dataviz', 'custom-key-xyz');
    expect(url).toBe('https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=custom-key-xyz');
  });

  it('defaults to dataviz style and environment key when none passed', () => {
    import.meta.env.VITE_MAPTILER_API_KEY = 'env-key-999';
    const url = getMapTilerTileUrl();
    expect(url).toBe('https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=env-key-999');
  });

  it('returns empty string if constructed without any key', () => {
    import.meta.env.VITE_MAPTILER_API_KEY = '';
    const url = getMapTilerTileUrl('dataviz', '');
    expect(url).toBe('');
  });

  it('includes required MapTiler and OpenStreetMap attribution strings', () => {
    expect(MAPTILER_ATTRIBUTION).toContain('https://www.maptiler.com/copyright/');
    expect(MAPTILER_ATTRIBUTION).toContain('MapTiler');
    expect(MAPTILER_ATTRIBUTION).toContain('https://www.openstreetmap.org/copyright');
    expect(MAPTILER_ATTRIBUTION).toContain('OpenStreetMap contributors');
  });

  it('specifies standard high-resolution tile size and zoom settings', () => {
    expect(MAPTILER_CONFIG.tileSize).toBe(512);
    expect(MAPTILER_CONFIG.zoomOffset).toBe(-1);
    expect(MAPTILER_CONFIG.minZoom).toBe(5);
    expect(MAPTILER_CONFIG.maxZoom).toBe(19);
  });
});
