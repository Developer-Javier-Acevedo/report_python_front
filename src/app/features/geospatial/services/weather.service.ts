import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Coordinates } from '../../../shared/models/coordinates.model';
import {
  WeatherResponse,
  OpenMeteoResponse,
  WEATHER_CODE_MAP
} from '../../../shared/models/weather.model';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { ApiErrorResponse } from '../../../shared/models/api.model';

@Injectable({ providedIn: 'root' })
export class WeatherService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  /**
   * Fetches current weather data for the given coordinates using Open-Meteo API.
   * Maps the response to our internal WeatherResponse interface.
   */
  getWeather(coordinates: Coordinates): Observable<WeatherResponse> {
    const url = this.apiConfig.getWeatherForecastUrl(
      coordinates.latitude,
      coordinates.longitude
    );

    return this.http.get<OpenMeteoResponse>(url).pipe(
      map((response) => this.mapToWeatherResponse(response, coordinates)),
      catchError((error: ApiErrorResponse) => {
        const message = error?.message || 'Error al obtener datos meteorológicos';
        return throwError(() => ({ ...error, message }));
      })
    );
  }

  /**
   * Maps an Open-Meteo API response to our internal WeatherResponse format.
   */
  private mapToWeatherResponse(
    response: OpenMeteoResponse,
    coordinates: Coordinates
  ): WeatherResponse {
    const current = response.current_weather;
    const weatherCode = current.weathercode;
    const weatherInfo = WEATHER_CODE_MAP[weatherCode] ?? {
      description: 'Condición desconocida',
      icon: '01d',
      main: 'Unknown'
    };

    // Get humidity from hourly data (first available value)
    let humidity = 0;
    if (response.hourly?.relativehumidity_2m?.length) {
      humidity = response.hourly.relativehumidity_2m[0] ?? 0;
    }

    // Convert wind direction to degrees (already in degrees from Open-Meteo)
    const windDeg = current.winddirection ?? 0;

    // Open-Meteo provides temperature in Celsius by default
    const temp = current.temperature;

    return {
      coord: {
        lon: coordinates.longitude,
        lat: coordinates.latitude
      },
      weather: [
        {
          id: weatherCode,
          main: weatherInfo.main,
          description: weatherInfo.description,
          icon: weatherInfo.icon
        }
      ],
      main: {
        temp: temp,
        feels_like: this.calculateFeelsLike(temp, current.windspeed, humidity),
        temp_min: temp - 2, // Approximation since Open-Meteo doesn't provide this in current_weather
        temp_max: temp + 2, // Approximation
        pressure: 1013, // Not available in free tier current_weather
        humidity: humidity
      },
      wind: {
        speed: current.windspeed,
        deg: windDeg,
        gust: undefined
      },
      name: `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`,
      dt: new Date(current.time).getTime() / 1000,
      visibility: 10000, // Default - not in free tier
      clouds: { all: 0 },
      sys: {
        country: '',
        sunrise: 0,
        sunset: 0
      }
    };
  }

  /**
   * Calculates apparent temperature (feels like) using a simplified formula.
   * Based on the Australian Bureau of Meteorology formula.
   */
  private calculateFeelsLike(tempC: number, windSpeedKmh: number, humidity: number): number {
    // Simplified wind chill / heat index approximation
    if (tempC <= 10 && windSpeedKmh > 4.8) {
      // Wind chill
      const wc =
        13.12 +
        0.6215 * tempC -
        11.37 * Math.pow(windSpeedKmh, 0.16) +
        0.3965 * tempC * Math.pow(windSpeedKmh, 0.16);
      return Math.round(wc * 10) / 10;
    } else if (tempC >= 27 && humidity > 40) {
      // Heat index (simplified Rothfusz)
      const hi =
        -8.78469475556 +
        1.61139411 * tempC +
        2.33854883889 * humidity -
        0.14611605 * tempC * humidity -
        0.012308094 * tempC * tempC -
        0.0164248277778 * humidity * humidity +
        0.002211732 * tempC * tempC * humidity +
        0.00072546 * tempC * humidity * humidity -
        0.000003582 * tempC * tempC * humidity * humidity;
      return Math.round(hi * 10) / 10;
    }
    return tempC;
  }

  /**
   * Gets the wind direction as a compass label in Spanish.
   */
  getWindDirectionLabel(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}
