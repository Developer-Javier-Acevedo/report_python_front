import { Injectable } from '@angular/core';
import { Coordinates, RadiusConfig } from '../../../shared/models/coordinates.model';

export interface BoundsResult {
  north: number;
  south: number;
  east: number;
  west: number;
}

@Injectable({ providedIn: 'root' })
export class GeospatialService {

  /**
   * Validates that the latitude and longitude are within valid ranges.
   */
  validateCoordinates(lat: number, lon: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (isNaN(lat) || lat === null || lat === undefined) {
      errors.push('La latitud es requerida y debe ser un número');
    } else if (lat < -90 || lat > 90) {
      errors.push('La latitud debe estar entre -90 y 90 grados');
    }

    if (isNaN(lon) || lon === null || lon === undefined) {
      errors.push('La longitud es requerida y debe ser un número');
    } else if (lon < -180 || lon > 180) {
      errors.push('La longitud debe estar entre -180 y 180 grados');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Converts a radius value to meters.
   */
  convertRadius(value: number, unit: 'meters' | 'kilometers'): number {
    if (unit === 'kilometers') {
      return value * 1000;
    }
    return value;
  }

  /**
   * Converts a radius config to meters.
   */
  convertRadiusConfig(config: RadiusConfig): number {
    return this.convertRadius(config.value, config.unit);
  }

  /**
   * Formats coordinates as a human-readable string.
   */
  formatCoordinates(coords: Coordinates): string {
    const lat = Math.abs(coords.latitude).toFixed(6);
    const lon = Math.abs(coords.longitude).toFixed(6);
    const latDir = coords.latitude >= 0 ? 'N' : 'S';
    const lonDir = coords.longitude >= 0 ? 'E' : 'O';
    return `${lat}° ${latDir}, ${lon}° ${lonDir}`;
  }

  /**
   * Formats a radius config as a human-readable string.
   */
  formatRadius(config: RadiusConfig): string {
    if (config.unit === 'kilometers') {
      return `${config.value.toLocaleString('es-ES')} km`;
    }
    return `${config.value.toLocaleString('es-ES')} m`;
  }

  /**
   * Calculates the bounding box for a circle defined by center coordinates and radius in meters.
   * Uses the Haversine formula approximation.
   */
  calculateBounds(coords: Coordinates, radiusMeters: number): BoundsResult {
    // Earth's radius in meters
    const earthRadius = 6371000;

    // Angular distance in radians
    const angular = radiusMeters / earthRadius;

    const latRad = (coords.latitude * Math.PI) / 180;
    const lonRad = (coords.longitude * Math.PI) / 180;

    const deltaLat = angular * (180 / Math.PI);
    const deltaLon = (angular / Math.cos(latRad)) * (180 / Math.PI);

    return {
      north: coords.latitude + deltaLat,
      south: coords.latitude - deltaLat,
      east: coords.longitude + deltaLon,
      west: coords.longitude - deltaLon
    };
  }

  /**
   * Calculates the distance between two coordinates in meters using the Haversine formula.
   */
  calculateDistance(from: Coordinates, to: Coordinates): number {
    const earthRadius = 6371000;
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const deltaLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const deltaLon = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  /**
   * Determines the appropriate zoom level based on radius in meters.
   */
  getZoomForRadius(radiusMeters: number): number {
    if (radiusMeters <= 100) return 17;
    if (radiusMeters <= 500) return 15;
    if (radiusMeters <= 1000) return 14;
    if (radiusMeters <= 5000) return 12;
    if (radiusMeters <= 10000) return 11;
    if (radiusMeters <= 50000) return 9;
    if (radiusMeters <= 100000) return 8;
    if (radiusMeters <= 500000) return 6;
    return 4;
  }
}
