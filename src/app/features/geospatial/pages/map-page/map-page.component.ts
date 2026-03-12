import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeospatialService } from '../../services/geospatial.service';
import { WeatherService } from '../../services/weather.service';
import { CoordinateFormComponent } from '../../components/coordinate-form/coordinate-form.component';
import { MapViewerComponent } from '../../components/map-viewer/map-viewer.component';
import { WeatherPanelComponent } from '../../components/weather-panel/weather-panel.component';
import { LocationSummaryComponent } from '../../components/location-summary/location-summary.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { RadiusRequest, LocationQuery } from '../../../../shared/models/coordinates.model';
import { WeatherResponse } from '../../../../shared/models/weather.model';
import { MapMarkerData, MapCircleData } from '../../../../shared/models/map.model';
import { LoadingState, ApiErrorResponse } from '../../../../shared/models/api.model';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [
    CommonModule,
    CoordinateFormComponent,
    MapViewerComponent,
    WeatherPanelComponent,
    LocationSummaryComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="map-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header__content">
          <h1 class="page-header__title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.710.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clip-rule="evenodd" />
            </svg>
            Explorador Geoespacial
          </h1>
          <p class="page-header__subtitle">
            Analiza coordenadas, visualiza áreas de radio y consulta condiciones meteorológicas en tiempo real
          </p>
        </div>
        <div class="page-header__stats" *ngIf="currentQuery">
          <div class="stat-pill stat-pill--success">
            <span class="stat-pill__dot"></span>
            Búsqueda activa
          </div>
          <div class="stat-pill stat-pill--info">
            {{ currentQuery.coordinates.latitude | number:'1.4-4' }}°,
            {{ currentQuery.coordinates.longitude | number:'1.4-4' }}°
          </div>
        </div>
      </div>

      <!-- Global Error Banner -->
      <div class="global-error" *ngIf="globalError">
        <app-error-message [message]="globalError" type="error"></app-error-message>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Left Panel: Coordinate Form -->
        <aside class="panel panel--left">
          <app-coordinate-form
            #coordForm
            (formSubmit)="onFormSubmit($event)"
          ></app-coordinate-form>
        </aside>

        <!-- Center: Map Viewer -->
        <main class="panel panel--center">
          <app-map-viewer
            [markerData]="markerData"
            [circleData]="circleData"
          ></app-map-viewer>
        </main>

        <!-- Right Panel: Weather + Summary -->
        <aside class="panel panel--right">
          <app-weather-panel
            [weather]="weatherData"
            [loading]="loadingState"
            [error]="errorMessage"
          ></app-weather-panel>

          <app-location-summary
            [query]="currentQuery"
          ></app-location-summary>
        </aside>
      </div>
    </div>
  `,
  styleUrls: ['./map-page.component.scss']
})
export class MapPageComponent {
  @ViewChild('coordForm') coordFormRef!: CoordinateFormComponent;

  currentQuery: LocationQuery | null = null;
  weatherData: WeatherResponse | null = null;
  loadingState: LoadingState = 'idle';
  errorMessage: string | null = null;
  globalError: string | null = null;

  markerData: MapMarkerData | null = null;
  circleData: MapCircleData | null = null;

  constructor(
    private geoService: GeospatialService,
    private weatherService: WeatherService
  ) {}

  onFormSubmit(request: RadiusRequest): void {
    // 1. Validate coordinates
    const validation = this.geoService.validateCoordinates(
      request.coordinates.latitude,
      request.coordinates.longitude
    );

    if (!validation.valid) {
      this.globalError = validation.errors.join('. ');
      return;
    }

    this.globalError = null;
    this.errorMessage = null;
    this.loadingState = 'loading';

    // 2. Create LocationQuery
    this.currentQuery = {
      coordinates: request.coordinates,
      radius: request.radius,
      timestamp: new Date(),
      label: this.geoService.formatCoordinates(request.coordinates)
    };

    // 3. Convert radius to meters
    const radiusMeters = this.geoService.convertRadiusConfig(request.radius);

    // 4. Update marker and circle data for the map
    this.markerData = {
      coordinates: request.coordinates,
      title: this.geoService.formatCoordinates(request.coordinates),
      popupContent: `Radio: ${this.geoService.formatRadius(request.radius)}`
    };

    this.circleData = {
      coordinates: request.coordinates,
      radiusMeters: radiusMeters,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.12
    };

    // 5. Set form loading state
    if (this.coordFormRef) {
      this.coordFormRef.setLoading(true);
    }

    // 6. Fetch weather data
    this.weatherService.getWeather(request.coordinates).subscribe({
      next: (weatherResponse) => {
        this.weatherData = weatherResponse;
        this.loadingState = 'success';
        this.errorMessage = null;
        if (this.coordFormRef) {
          this.coordFormRef.setLoading(false);
        }
      },
      error: (err: ApiErrorResponse) => {
        console.error('[MapPage] Weather fetch error:', err);
        this.loadingState = 'error';
        this.errorMessage = err?.message || 'No se pudieron obtener los datos meteorológicos. Verifica tu conexión.';
        this.weatherData = null;
        if (this.coordFormRef) {
          this.coordFormRef.setLoading(false);
        }
      }
    });
  }
}
