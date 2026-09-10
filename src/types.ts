export type ScenarioKey = 'walk' | 'farm';
export type MetricKey = 'temperature' | 'moisture' | 'conductivity';
export type Coordinate = [number, number];

export interface Anomaly {
  metric: 'moisture' | 'conductivity';
  reason: 'above-route-baseline' | 'above-calibrated-range' | 'possible-compaction';
}

export interface Measurement {
  id: string;
  index: number;
  trackId?: string;
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
  calibration: {
    weather: string;
    ambientTemperature: number;
    relativeHumidity: number;
    referenceConductivity: number;
    soilState: string;
    status: 'Within range' | 'Outside range';
  };
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
