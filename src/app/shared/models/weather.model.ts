export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface WeatherWind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface WeatherResponse {
  coord: { lon: number; lat: number };
  weather: WeatherCondition[];
  main: WeatherMain;
  wind: WeatherWind;
  name: string;
  dt: number;
  visibility: number;
  clouds: { all: number };
  sys: { country: string; sunrise: number; sunset: number };
}

// Open-Meteo specific interfaces
export interface OpenMeteoCurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  time: string;
}

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  relativehumidity_2m: number[];
  windspeed_10m: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather: OpenMeteoCurrentWeather;
  hourly?: OpenMeteoHourly;
}

// Weather code descriptions for Open-Meteo
export const WEATHER_CODE_MAP: Record<number, { description: string; icon: string; main: string }> = {
  0: { description: 'Cielo despejado', icon: '01d', main: 'Clear' },
  1: { description: 'Principalmente despejado', icon: '01d', main: 'Clear' },
  2: { description: 'Parcialmente nublado', icon: '02d', main: 'Clouds' },
  3: { description: 'Nublado', icon: '04d', main: 'Clouds' },
  45: { description: 'Niebla', icon: '50d', main: 'Fog' },
  48: { description: 'Niebla con escarcha', icon: '50d', main: 'Fog' },
  51: { description: 'Llovizna ligera', icon: '09d', main: 'Drizzle' },
  53: { description: 'Llovizna moderada', icon: '09d', main: 'Drizzle' },
  55: { description: 'Llovizna intensa', icon: '09d', main: 'Drizzle' },
  56: { description: 'Llovizna helada ligera', icon: '09d', main: 'Drizzle' },
  57: { description: 'Llovizna helada intensa', icon: '09d', main: 'Drizzle' },
  61: { description: 'Lluvia ligera', icon: '10d', main: 'Rain' },
  63: { description: 'Lluvia moderada', icon: '10d', main: 'Rain' },
  65: { description: 'Lluvia intensa', icon: '10d', main: 'Rain' },
  66: { description: 'Lluvia helada ligera', icon: '13d', main: 'Rain' },
  67: { description: 'Lluvia helada intensa', icon: '13d', main: 'Rain' },
  71: { description: 'Nevada ligera', icon: '13d', main: 'Snow' },
  73: { description: 'Nevada moderada', icon: '13d', main: 'Snow' },
  75: { description: 'Nevada intensa', icon: '13d', main: 'Snow' },
  77: { description: 'Granizo', icon: '13d', main: 'Snow' },
  80: { description: 'Chubascos ligeros', icon: '09d', main: 'Rain' },
  81: { description: 'Chubascos moderados', icon: '09d', main: 'Rain' },
  82: { description: 'Chubascos intensos', icon: '09d', main: 'Rain' },
  85: { description: 'Nevadas ligeras', icon: '13d', main: 'Snow' },
  86: { description: 'Nevadas intensas', icon: '13d', main: 'Snow' },
  95: { description: 'Tormenta', icon: '11d', main: 'Thunderstorm' },
  96: { description: 'Tormenta con granizo', icon: '11d', main: 'Thunderstorm' },
  99: { description: 'Tormenta con granizo intenso', icon: '11d', main: 'Thunderstorm' }
};
