import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { MapMarkerData, MapCircleData } from '../../../../shared/models/map.model';

@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="map-wrapper">
      <div class="map-overlay" *ngIf="!hasData">
        <div class="map-overlay__content">
          <div class="map-overlay__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.710.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="map-overlay__title">Mapa Interactivo</h3>
          <p class="map-overlay__text">Introduce las coordenadas en el formulario y haz clic en "Buscar Ubicación" para visualizar el área en el mapa.</p>
        </div>
      </div>
      <div class="map-container" #mapContainer></div>
      <div class="map-info-bar" *ngIf="hasData && markerData">
        <div class="map-info-bar__item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M8 1.5A6.5 6.5 0 1114.5 8 6.508 6.508 0 018 1.5zm3.25 5.25a.75.75 0 00-1.5 0v2.19l-1.72 1.72a.75.75 0 001.06 1.06l2-2A.75.75 0 0011.25 9V6.75z" clip-rule="evenodd" />
          </svg>
          <span>{{ markerData.coordinates.latitude | number:'1.4-6' }}°, {{ markerData.coordinates.longitude | number:'1.4-6' }}°</span>
        </div>
        <div class="map-info-bar__item" *ngIf="circleData">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 .5a7.5 7.5 0 100 15A7.5 7.5 0 008 .5zm0 13a5.5 5.5 0 110-11 5.5 5.5 0 010 11zm0-9a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
          </svg>
          <span>Radio: {{ circleData.radiusMeters | number:'1.0-0' }} m</span>
        </div>
        <button class="map-info-bar__zoom-btn" (click)="fitBounds()" title="Ajustar vista">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2.5A.5.5 0 012.5 2H6a.5.5 0 010 1H3v2.5a.5.5 0 01-1 0V2.5zm13 0V5a.5.5 0 01-1 0V3h-2.5a.5.5 0 010-1H14.5a.5.5 0 01.5.5zM2.5 11a.5.5 0 000 1H5v2.5a.5.5 0 001 0V11.5a.5.5 0 00-.5-.5H2.5zm12.5.5a.5.5 0 00-1 0V14h-2.5a.5.5 0 000 1H14.5a.5.5 0 00.5-.5V11.5z"/>
          </svg>
          Ajustar vista
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./map-viewer.component.scss']
})
export class MapViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() markerData: MapMarkerData | null = null;
  @Input() circleData: MapCircleData | null = null;

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLElement>;

  get hasData(): boolean {
    return this.markerData !== null;
  }

  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    this.mapService.initMap(this.mapContainer.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mapContainer) return;

    const markerChanged = changes['markerData'];
    const circleChanged = changes['circleData'];

    if (markerChanged?.currentValue || circleChanged?.currentValue) {
      this.updateMapLayers();
    }

    if (markerChanged && !markerChanged.currentValue) {
      this.mapService.clearLayers();
    }
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }

  fitBounds(): void {
    if (this.markerData && this.circleData) {
      this.mapService.fitCircleBounds(
        this.markerData.coordinates,
        this.circleData.radiusMeters
      );
    } else if (this.markerData) {
      this.mapService.flyTo(this.markerData.coordinates, 13);
    }
  }

  private updateMapLayers(): void {
    if (this.markerData) {
      this.mapService.setMarker(this.markerData);
    }

    if (this.circleData) {
      this.mapService.setCircle(this.circleData);
      // Fit bounds to show the circle
      setTimeout(() => {
        if (this.circleData) {
          this.mapService.fitCircleBounds(
            this.circleData.coordinates,
            this.circleData.radiusMeters
          );
        }
      }, 100);
    } else if (this.markerData) {
      this.mapService.flyTo(this.markerData.coordinates, 13);
    }
  }
}
