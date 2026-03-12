import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationQuery } from '../../../../shared/models/coordinates.model';
import { GeospatialService } from '../../services/geospatial.service';

@Component({
  selector: 'app-location-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-card" *ngIf="query; else emptyState">
      <div class="summary-card__header">
        <div class="summary-card__icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="summary-card__title">Resumen de Búsqueda</h3>
      </div>

      <div class="summary-card__body">
        <div class="summary-item">
          <div class="summary-item__label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
              <path fill-rule="evenodd" d="M8 1.5A6.5 6.5 0 1114.5 8 6.508 6.508 0 018 1.5zm3.25 5.25a.75.75 0 00-1.5 0v2.19l-1.72 1.72a.75.75 0 001.06 1.06l2-2A.75.75 0 0011.25 9V6.75z" clip-rule="evenodd" />
            </svg>
            Coordenadas
          </div>
          <div class="summary-item__values">
            <div class="coord-value">
              <span class="coord-label">LAT</span>
              <span class="coord-number">{{ query.coordinates.latitude | number:'1.4-6' }}°</span>
              <span class="coord-dir">{{ query.coordinates.latitude >= 0 ? 'N' : 'S' }}</span>
            </div>
            <div class="coord-value">
              <span class="coord-label">LON</span>
              <span class="coord-number">{{ query.coordinates.longitude | number:'1.4-6' }}°</span>
              <span class="coord-dir">{{ query.coordinates.longitude >= 0 ? 'E' : 'O' }}</span>
            </div>
          </div>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-item">
          <div class="summary-item__label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .5a7.5 7.5 0 100 15A7.5 7.5 0 008 .5zm0 13a5.5 5.5 0 110-11 5.5 5.5 0 010 11zm0-9a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
            </svg>
            Radio de Búsqueda
          </div>
          <div class="radius-display">
            <div class="radius-bar-container">
              <div class="radius-bar" [style.width.%]="getRadiusPercent()"></div>
            </div>
            <div class="radius-values">
              <span class="radius-primary">{{ formatRadius() }}</span>
              <span class="radius-secondary" *ngIf="query.radius.unit === 'kilometers'">
                ({{ getRadiusInMeters() | number:'1.0-0' }} m)
              </span>
              <span class="radius-secondary" *ngIf="query.radius.unit === 'meters'">
                ({{ getRadiusInKm() | number:'1.2-3' }} km)
              </span>
            </div>
          </div>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-item">
          <div class="summary-item__label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
              <path fill-rule="evenodd" d="M8 1.5A6.5 6.5 0 1114.5 8 6.508 6.508 0 018 1.5zm.75 3a.75.75 0 00-1.5 0v3.25c0 .2.08.39.22.53l2 2a.75.75 0 001.06-1.06L8.75 7.69V4.5z" clip-rule="evenodd" />
            </svg>
            Timestamp
          </div>
          <div class="timestamp-display">
            <span class="timestamp-date">{{ formatDate(query.timestamp) }}</span>
            <span class="timestamp-time">{{ formatTime(query.timestamp) }}</span>
          </div>
        </div>

        <div class="summary-item" *ngIf="query.label">
          <div class="summary-item__label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
              <path fill-rule="evenodd" d="M4.5 2A2.5 2.5 0 002 4.5v2.879a2.5 2.5 0 00.732 1.767l4.5 4.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-4.5-4.5A2.5 2.5 0 007.38 2H4.5zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            Etiqueta
          </div>
          <span class="label-badge">{{ query.label }}</span>
        </div>

        <!-- Area Coverage Info -->
        <div class="area-info">
          <div class="area-info__item">
            <span class="area-info__label">Área aprox.</span>
            <span class="area-info__value">{{ getAreaKm2() | number:'1.0-2' }} km²</span>
          </div>
          <div class="area-info__item">
            <span class="area-info__label">Circunferencia</span>
            <span class="area-info__value">{{ getCircumferenceKm() | number:'1.0-2' }} km</span>
          </div>
        </div>
      </div>
    </div>

    <ng-template #emptyState>
      <div class="summary-card summary-card--empty">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clip-rule="evenodd" />
          </svg>
          <p>Los detalles de la búsqueda aparecerán aquí</p>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./location-summary.component.scss']
})
export class LocationSummaryComponent {
  @Input() query: LocationQuery | null = null;

  constructor(private geoService: GeospatialService) {}

  formatRadius(): string {
    if (!this.query) return '';
    return this.geoService.formatRadius(this.query.radius);
  }

  getRadiusInMeters(): number {
    if (!this.query) return 0;
    return this.geoService.convertRadiusConfig(this.query.radius);
  }

  getRadiusInKm(): number {
    return this.getRadiusInMeters() / 1000;
  }

  getRadiusPercent(): number {
    const meters = this.getRadiusInMeters();
    const maxMeters = 1000000;
    return Math.min((meters / maxMeters) * 100, 100);
  }

  getAreaKm2(): number {
    const radiusKm = this.getRadiusInMeters() / 1000;
    return Math.PI * radiusKm * radiusKm;
  }

  getCircumferenceKm(): number {
    const radiusKm = this.getRadiusInMeters() / 1000;
    return 2 * Math.PI * radiusKm;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
