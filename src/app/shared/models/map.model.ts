import { Coordinates } from './coordinates.model';

export interface MapMarkerData {
  coordinates: Coordinates;
  title: string;
  popupContent?: string;
}

export interface MapCircleData {
  coordinates: Coordinates;
  radiusMeters: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
}

export interface MapViewState {
  center: Coordinates;
  zoom: number;
}
