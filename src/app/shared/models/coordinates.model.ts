export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RadiusConfig {
  value: number;
  unit: 'meters' | 'kilometers';
}

export interface LocationQuery {
  coordinates: Coordinates;
  radius: RadiusConfig;
  timestamp: Date;
  label?: string;
}

export interface RadiusRequest {
  coordinates: Coordinates;
  radius: RadiusConfig;
}
