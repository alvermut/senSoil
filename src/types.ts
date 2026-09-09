export type ScenarioKey = 'walk' | 'farm';
export type MetricKey = 'temperature' | 'moisture' | 'conductivity';
export type Coordinate = [number, number];

export interface Anomaly {
  metric: 'conductivity';
  reason: 'above-route-baseline';
}

export interface Measurement {
  id: string;
  index: number;
  coordinate: Coordinate;
  temperature: number;
  moisture: number;
  conductivity: number;
  anomaly?: Anomaly;
}

export interface FarmSurvey {
  date: string;
  label: string;
  points: Measurement[];
}

export interface MapLine {
  coordinates: Coordinate[];
  kind: 'primary' | 'secondary' | 'minor' | 'water-edge' | 'field-row';
  name?: string;
}

export interface MapPolygon {
  coordinates: Coordinate[];
  kind: 'water' | 'field' | 'survey-field' | 'block' | 'park';
}

export interface SceneGeometry {
  center: Coordinate;
  zoom: number;
  lines: MapLine[];
  polygons: MapPolygon[];
  labels: Array<{ coordinate: Coordinate; text: string; emphasis?: boolean }>;
}
