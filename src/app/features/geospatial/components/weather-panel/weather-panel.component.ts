import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherResponse } from '../../../../shared/models/weather.model';
import { LoadingState } from '../../../../shared/models/api.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-weather-panel',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="weather-card">
      <div class="weather-card__header">
        <div class="weather-card__title-group">
          <div class="weather-card__icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.592-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          </div>
          <h3 class="weather-card__title">Condiciones Meteorológicas</h3>
        </div>
      </div>

      <!-- Loading State -->
      <div class="weather-card__body" *ngIf="loading === 'loading'">
        <app-loading-spinner message="Obteniendo datos del tiempo..."></app-loading-spinner>
      </div>

      <!-- Error State -->
      <div class="weather-card__body" *ngIf="loading === 'error' && error">
        <app-error-message [message]="error" type="error"></app-error-message>
      </div>

      <!-- Idle State -->
      <div class="weather-card__body weather-card__body--idle" *ngIf="loading === 'idle'">
        <div class="idle-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
          </svg>
          <p>Busca una ubicación para ver las condiciones meteorológicas</p>
        </div>
      </div>

      <!-- Success State -->
      <div class="weather-card__body weather-card__body--success" *ngIf="loading === 'success' && weather">
        <!-- Location -->
        <div class="weather-location" *ngIf="weather.name">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M8 1.5A6.5 6.5 0 1114.5 8 6.508 6.508 0 018 1.5zm3.25 5.25a.75.75 0 00-1.5 0v2.19l-1.72 1.72a.75.75 0 001.06 1.06l2-2A.75.75 0 0011.25 9V6.75z" clip-rule="evenodd" />
          </svg>
          <span>{{ weather.name }}</span>
        </div>

        <!-- Main temperature display -->
        <div class="weather-main">
          <div class="weather-temp-display">
            <div class="weather-icon-large">{{ getWeatherEmoji(weather.weather[0]?.id ?? 0) }}</div>
            <div class="weather-temp">
              <span class="weather-temp__value">{{ weather.main.temp | number:'1.0-1' }}°</span>
              <span class="weather-temp__unit">C</span>
            </div>
          </div>
          <div class="weather-description">
            <p class="weather-description__main">{{ weather.weather[0]?.main }}</p>
            <p class="weather-description__detail">{{ weather.weather[0]?.description }}</p>
          </div>
          <div class="weather-feels-like">
            Sensación térmica: <strong>{{ weather.main.feels_like | number:'1.0-1' }}°C</strong>
          </div>
        </div>

        <!-- Weather Stats Grid -->
        <div class="weather-stats">
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="stat-card__content">
              <span class="stat-card__label">Humedad</span>
              <span class="stat-card__value">{{ weather.main.humidity }}%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--cyan">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.818a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.845-.143z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="stat-card__content">
              <span class="stat-card__label">Viento</span>
              <span class="stat-card__value">{{ weather.wind.speed | number:'1.0-1' }} km/h</span>
              <span class="stat-card__sub">{{ getWindDirection(weather.wind.deg) }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--green">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.452 6.712 6.712 0 01-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
              </svg>
            </div>
            <div class="stat-card__content">
              <span class="stat-card__label">Temp. Mín/Máx</span>
              <span class="stat-card__value">{{ weather.main.temp_min | number:'1.0-1' }}° / {{ weather.main.temp_max | number:'1.0-1' }}°C</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--purple">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315c.502-.806 1.365-1.34 2.332-1.39zm.607 6.179a1.5 1.5 0 10-2.14 2.101 5.232 5.232 0 01-1.542.52.75.75 0 00.26 1.477 6.73 6.73 0 003.763-1.974 6.73 6.73 0 003.763 1.974.75.75 0 10.26-1.477 5.232 5.232 0 01-1.542-.52 1.5 1.5 0 10-2.14-2.101 1.5 1.5 0 10-.44 1.14z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="stat-card__content">
              <span class="stat-card__label">Presión</span>
              <span class="stat-card__value">{{ weather.main.pressure }} hPa</span>
            </div>
          </div>
        </div>

        <!-- Last updated -->
        <div class="weather-updated">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-10.25a.75.75 0 00-1.5 0v2.69L5.03 9.22a.75.75 0 001.06 1.06l1.92-1.92V4.75z" clip-rule="evenodd" />
          </svg>
          Actualizado: {{ getFormattedDate(weather.dt) }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./weather-panel.component.scss']
})
export class WeatherPanelComponent {
  @Input() weather: WeatherResponse | null = null;
  @Input() loading: LoadingState = 'idle';
  @Input() error: string | null = null;

  constructor(private weatherService: WeatherService) {}

  getWeatherEmoji(weatherCode: number): string {
    const emojiMap: Record<number, string> = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌦️', 53: '🌦️', 55: '🌧️',
      56: '🌨️', 57: '🌨️',
      61: '🌧️', 63: '🌧️', 65: '⛈️',
      66: '🌨️', 67: '🌨️',
      71: '🌨️', 73: '❄️', 75: '❄️', 77: '🌨️',
      80: '🌦️', 81: '🌧️', 82: '⛈️',
      85: '❄️', 86: '❄️',
      95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return emojiMap[weatherCode] ?? '🌡️';
  }

  getWindDirection(degrees: number): string {
    return this.weatherService.getWindDirectionLabel(degrees);
  }

  getFormattedDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
