import type {
  Coordinate,
  FarmSurvey,
  Measurement,
  MetricKey,
  ScenarioKey,
  SceneGeometry,
} from './types';
import {
  stangalarMapLines,
  stangalarMapPolygons,
  stangalarRoute,
  valenciaMapLines,
  valenciaMapPolygons,
} from './osm-data';

export const WALK_SAMPLE_COUNT = 1_482;
export const WALK_ANOMALY_INDEX = 986;
export const brestRoute: Coordinate[] = stangalarRoute;

export const brestGeometry: SceneGeometry = {
  center: [-4.4458, 48.4026],
  zoom: 16,
  lines: stangalarMapLines,
  polygons: stangalarMapPolygons,
  labels: [
    { coordinate: [-4.4442, 48.40412], text: 'Vallon du Stangalar', emphasis: true },
    { coordinate: [-4.44395, 48.40125], text: 'Le Stang Alar' },
  ],
};

const farmCenter: Coordinate = [-0.34517, 39.50572];

export const farmGeometry: SceneGeometry = {
  center: farmCenter,
  zoom: 17.2,
  lines: valenciaMapLines,
  polygons: valenciaMapPolygons,
  labels: [
    { coordinate: [-0.34515, 39.50635], text: 'Horta d’Alboraia', emphasis: true },
    { coordinate: [-0.34472, 39.50627], text: 'Braç de Basses' },
  ],
};

const surveyDates = [
  ['2024-09-01', 'September 2024'],
  ['2024-12-01', 'December 2024'],
  ['2025-03-01', 'March 2025'],
  ['2025-06-01', 'June 2025'],
  ['2025-09-01', 'September 2025'],
  ['2025-12-01', 'December 2025'],
  ['2026-03-01', 'March 2026'],
  ['2026-06-01', 'June 2026'],
  ['2026-09-01', 'September 2026'],
] as const;

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function distanceWeight(a: Coordinate, b: Coordinate): number {
  const lat = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const x = (b[0] - a[0]) * Math.cos(lat);
  const y = b[1] - a[1];
  return Math.hypot(x, y);
}

function interpolateRoute(route: Coordinate[], count: number): Coordinate[] {
  const lengths = route.slice(1).map((point, index) => distanceWeight(route[index], point));
  const total = lengths.reduce((sum, value) => sum + value, 0);
  const result: Coordinate[] = [];

  for (let index = 0; index < count; index += 1) {
    const target = (index / (count - 1)) * total;
    let traversed = 0;
    let segment = 0;
    while (segment < lengths.length - 1 && traversed + lengths[segment] < target) {
      traversed += lengths[segment];
      segment += 1;
    }
    const local = lengths[segment] === 0 ? 0 : (target - traversed) / lengths[segment];
    const start = route[segment];
    const end = route[segment + 1];
    result.push([
      start[0] + (end[0] - start[0]) * local,
      start[1] + (end[1] - start[1]) * local,
    ]);
  }
  return result;
}

export function createWalkMeasurements(): Measurement[] {
  const random = mulberry32(20_260_909);
  return interpolateRoute(brestRoute, WALK_SAMPLE_COUNT).map((coordinate, index) => {
    const progress = index / (WALK_SAMPLE_COUNT - 1);
    const noise = random() - 0.5;
    const anomaly = index === WALK_ANOMALY_INDEX
      ? { metric: 'conductivity' as const, reason: 'above-route-baseline' as const }
      : undefined;

    return {
      id: `walk-${index + 1}`,
      index,
      coordinate,
      temperature: Number(clamp(15.2 + 1.35 * Math.sin(progress * 7.4) + noise * 0.55, 13.8, 17.5).toFixed(1)),
      moisture: Number(clamp(34 + 8.6 * Math.sin(progress * 9.2 + 0.8) + noise * 5.2, 22, 48).toFixed(1)),
      conductivity: anomaly
        ? 2.74
        : Number(clamp(0.52 + 0.28 * Math.sin(progress * 13.1 - 0.4) + noise * 0.1, 0.18, 0.92).toFixed(2)),
      anomaly,
    };
  });
}

function farmCoordinate(u: number, v: number, surveyIndex: number, random: () => number): Coordinate {
  const shiftedU = clamp(u + Math.sin(surveyIndex * 1.7) * 0.008 + (random() - 0.5) * 0.012, 0.05, 0.95);
  const shiftedV = clamp(v + Math.cos(surveyIndex * 1.35) * 0.008 + (random() - 0.5) * 0.012, 0.05, 0.95);
  const northWest: Coordinate = [-0.3458588, 39.5060244];
  const northEast: Coordinate = [-0.3443153, 39.5056989];
  const southEast: Coordinate = [-0.3445097, 39.5053958];
  const southWest: Coordinate = [-0.3460241, 39.5057172];
  const interpolate = (start: Coordinate, end: Coordinate, amount: number): Coordinate => [
    start[0] + (end[0] - start[0]) * amount,
    start[1] + (end[1] - start[1]) * amount,
  ];
  const west = interpolate(southWest, northWest, shiftedV);
  const east = interpolate(southEast, northEast, shiftedV);
  return interpolate(west, east, shiftedU);
}

export function createFarmSurveys(): FarmSurvey[] {
  const seasonalTemperature = [24.6, 14.2, 17.1, 27.3, 25.1, 14.7, 17.8, 28.0, 24.4];
  const generalMoisture = [18.5, 20.7, 24.1, 18.2, 20.4, 22.6, 25.0, 21.3, 24.2];
  const recoveringZone = [11.2, 13.0, 15.4, 18.0, 20.8, 23.1, 25.9, 28.7, 31.0];

  return surveyDates.map(([date, label], surveyIndex) => {
    const random = mulberry32(8_400 + surveyIndex * 137);
    const points: Measurement[] = [];

    for (let row = 0; row < 10; row += 1) {
      for (let column = 0; column < 12; column += 1) {
        const traversalColumn = row % 2 === 0 ? column : 11 - column;
        const u = (traversalColumn + 0.5) / 12;
        const v = (row + 0.5) / 10;
        const coordinate = farmCoordinate(u, v, surveyIndex, random);
        const isRecoveryZone = u > 0.61 && v > 0.51;
        const spatialWave = Math.sin(u * 8.2 + v * 3.1) * 1.4;
        const moistureBase = isRecoveryZone ? recoveringZone[surveyIndex] : generalMoisture[surveyIndex];

        points.push({
          id: `farm-${surveyIndex}-${points.length + 1}`,
          index: points.length,
          coordinate,
          temperature: Number(clamp(seasonalTemperature[surveyIndex] + (v - 0.5) * 2.2 + (random() - 0.5) * 1.2, 11, 31).toFixed(1)),
          moisture: Number(clamp(moistureBase + spatialWave + (random() - 0.5) * 2.4, 9, 34).toFixed(1)),
          conductivity: Number(clamp(0.54 + u * 0.17 + Math.sin(v * 5 + surveyIndex * 0.2) * 0.06 + (random() - 0.5) * 0.05, 0.33, 0.94).toFixed(2)),
        });
      }
    }

    return { date, label, points };
  });
}

export const metricRanges: Record<ScenarioKey, Record<MetricKey, [number, number]>> = {
  walk: {
    temperature: [13, 18],
    moisture: [18, 50],
    conductivity: [0.18, 0.92],
  },
  farm: {
    temperature: [10, 32],
    moisture: [8, 36],
    conductivity: [0.25, 1.1],
  },
};

export const metricLabels: Record<MetricKey, { unit: string; decimals: number }> = {
  temperature: { unit: '°C', decimals: 1 },
  moisture: { unit: '%', decimals: 1 },
  conductivity: { unit: 'dS/m', decimals: 2 },
};

export function metricAverage(points: Measurement[], metric: MetricKey): number {
  return points.reduce((sum, point) => sum + point[metric], 0) / points.length;
}
