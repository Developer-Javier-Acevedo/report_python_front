import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  readonly weatherApiUrl = environment.weatherApiUrl;
  readonly geocodingApiUrl = environment.geocodingApiUrl;
  readonly production = environment.production;

  getWeatherForecastUrl(lat: number, lon: number): string {
    return `${this.weatherApiUrl}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`;
  }

  getGeocodingUrl(lat: number, lon: number): string {
    return `${this.geocodingApiUrl}/reverse?lat=${lat}&lon=${lon}&format=json`;
  }
}
