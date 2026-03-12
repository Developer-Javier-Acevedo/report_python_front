import { Injectable, NgZone } from '@angular/core';
import * as L from 'leaflet';
import { MapMarkerData, MapCircleData } from '../../../shared/models/map.model';
import { Coordinates } from '../../../shared/models/coordinates.model';

// Fix Leaflet default icon paths for Webpack
const iconDefault = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = iconDefault;

@Injectable({ providedIn: 'root' })
export class MapService {
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private circle: L.Circle | null = null;
  private tileLayer: L.TileLayer | null = null;

  constructor(private ngZone: NgZone) {}

  /**
   * Initializes the Leaflet map inside the given HTML element.
   */
  initMap(container: HTMLElement, initialCenter: Coordinates = { latitude: 40.4168, longitude: -3.7038 }, zoom = 5): L.Map {
    if (this.map) {
      this.destroyMap();
    }

    this.ngZone.runOutsideAngular(() => {
      this.map = L.map(container, {
        center: [initialCenter.latitude, initialCenter.longitude],
        zoom: zoom,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true
      });

      this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      });

      this.tileLayer.addTo(this.map);
    });

    return this.map!;
  }

  /**
   * Places or updates a marker at the given coordinates.
   */
  setMarker(data: MapMarkerData): void {
    if (!this.map) {
      console.warn('[MapService] Map not initialized');
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if (this.marker) {
        this.marker.remove();
        this.marker = null;
      }

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin">
            <div class="marker-pulse"></div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.328a8 8 0 10-16 0c0 3.631 1.557 6.326 3.5 8.328a19.579 19.579 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42]
      });

      this.marker = L.marker(
        [data.coordinates.latitude, data.coordinates.longitude],
        { icon: customIcon, title: data.title }
      );

      if (data.popupContent) {
        this.marker.bindPopup(
          `<div class="map-popup"><strong>${data.title}</strong>${data.popupContent ? '<br>' + data.popupContent : ''}</div>`,
          { maxWidth: 250 }
        );
      }

      this.marker.addTo(this.map!);
    });
  }

  /**
   * Draws or updates a circle at the given coordinates.
   */
  setCircle(data: MapCircleData): void {
    if (!this.map) {
      console.warn('[MapService] Map not initialized');
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if (this.circle) {
        this.circle.remove();
        this.circle = null;
      }

      this.circle = L.circle(
        [data.coordinates.latitude, data.coordinates.longitude],
        {
          radius: data.radiusMeters,
          color: data.color ?? '#2563eb',
          fillColor: data.fillColor ?? '#2563eb',
          fillOpacity: data.fillOpacity ?? 0.15,
          weight: 2,
          dashArray: '8, 4'
        }
      );

      this.circle.addTo(this.map!);
    });
  }

  /**
   * Smoothly animates the map view to the given coordinates.
   */
  flyTo(coordinates: Coordinates, zoom: number): void {
    if (!this.map) return;

    this.ngZone.runOutsideAngular(() => {
      this.map!.flyTo(
        [coordinates.latitude, coordinates.longitude],
        zoom,
        { animate: true, duration: 1.2 }
      );
    });
  }

  /**
   * Fits the map view to show the circle bounds with padding.
   */
  fitCircleBounds(coordinates: Coordinates, radiusMeters: number): void {
    if (!this.map || !this.circle) return;

    this.ngZone.runOutsideAngular(() => {
      const bounds = this.circle!.getBounds();
      this.map!.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1.2 });
    });
  }

  /**
   * Removes all markers and circles from the map.
   */
  clearLayers(): void {
    if (!this.map) return;

    this.ngZone.runOutsideAngular(() => {
      if (this.marker) {
        this.marker.remove();
        this.marker = null;
      }
      if (this.circle) {
        this.circle.remove();
        this.circle = null;
      }
    });
  }

  /**
   * Destroys the map instance and frees resources.
   */
  destroyMap(): void {
    if (this.map) {
      this.clearLayers();
      if (this.tileLayer) {
        this.tileLayer.remove();
        this.tileLayer = null;
      }
      this.map.remove();
      this.map = null;
    }
  }

  /**
   * Returns the current map instance.
   */
  getMap(): L.Map | null {
    return this.map;
  }

  /**
   * Invalidates the map size (useful after container resize).
   */
  invalidateSize(): void {
    if (this.map) {
      this.ngZone.runOutsideAngular(() => {
        this.map!.invalidateSize();
      });
    }
  }
}
