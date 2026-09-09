import type {
  Coordinate,
  FarmSurvey,
  MapLine,
  MapPolygon,
  Measurement,
  MetricKey,
  ScenarioKey,
  SceneGeometry,
} from './types';

export const WALK_SAMPLE_COUNT = 1_482;
export const WALK_ANOMALY_INDEX = 986;

export const brestRoute: Coordinate[] = [
  [-4.486842, 48.390056],
  [-4.48691, 48.39072],
  [-4.48758, 48.39106],
  [-4.48855, 48.39094],
  [-4.48938, 48.39051],
  [-4.49026, 48.39022],
  [-4.49127, 48.38982],
  [-4.49247, 48.38943],
  [-4.49352, 48.38939],
  [-4.49463, 48.38938],
  [-4.49552, 48.38939],
  [-4.49622, 48.38968],
  [-4.49696, 48.38942],
  [-4.49745, 48.38903],
  [-4.498334, 48.38932],
];

const brestLines: MapLine[] = [
  { kind: 'primary', name: 'Rue de Siam', coordinates: [[-4.4862, 48.3931], [-4.4872, 48.3911], [-4.4887, 48.3881]] },
  { kind: 'primary', name: 'Pont de Recouvrance', coordinates: [[-4.4917, 48.38947], [-4.4955, 48.3894], [-4.4986, 48.3887]] },
  { kind: 'secondary', name: 'Rue de Lyon', coordinates: [[-4.4848, 48.3918], [-4.4876, 48.3912], [-4.4895, 48.3904]] },
  { kind: 'secondary', name: 'Rue du Château', coordinates: [[-4.4848, 48.3887], [-4.487, 48.3896], [-4.4894, 48.3902]] },
  { kind: 'secondary', name: 'Rue de la Porte', coordinates: [[-4.4954, 48.38942], [-4.4975, 48.3901], [-4.5004, 48.39032]] },
  { kind: 'secondary', name: 'Rue de Pontaniou', coordinates: [[-4.49725, 48.3879], [-4.49715, 48.3891], [-4.4979, 48.3913], [-4.4988, 48.3927]] },
  { kind: 'secondary', name: 'Rue de Maissin', coordinates: [[-4.5005, 48.3908], [-4.4984, 48.3895], [-4.4968, 48.3884]] },
  { kind: 'minor', coordinates: [[-4.4852, 48.3908], [-4.4886, 48.3895]] },
  { kind: 'minor', coordinates: [[-4.4861, 48.3923], [-4.4899, 48.3913]] },
  { kind: 'minor', coordinates: [[-4.4882, 48.3926], [-4.4902, 48.3886]] },
  { kind: 'minor', coordinates: [[-4.4998, 48.3921], [-4.4964, 48.3909], [-4.4957, 48.3887]] },
  { kind: 'minor', coordinates: [[-4.5011, 48.3891], [-4.4987, 48.3901], [-4.4972, 48.3906]] },
  { kind: 'minor', coordinates: [[-4.5003, 48.3881], [-4.4971, 48.3888], [-4.4957, 48.3898]] },
  { kind: 'minor', coordinates: [[-4.5007, 48.3915], [-4.4978, 48.3910], [-4.4963, 48.3901]] },
  { kind: 'water-edge', coordinates: [[-4.4941, 48.395], [-4.4938, 48.3924], [-4.4935, 48.3900], [-4.4935, 48.3869]] },
  { kind: 'water-edge', coordinates: [[-4.4954, 48.395], [-4.4950, 48.3924], [-4.4947, 48.3900], [-4.4949, 48.3869]] },
];

const brestPolygons: MapPolygon[] = [
  {
    kind: 'water',
    coordinates: [
      [-4.4954, 48.395], [-4.4941, 48.395], [-4.4938, 48.3924], [-4.4935, 48.3900],
      [-4.4935, 48.3869], [-4.4949, 48.3869], [-4.4947, 48.3900], [-4.4950, 48.3924],
    ],
  },
  { kind: 'park', coordinates: [[-4.4898, 48.3918], [-4.4875, 48.3913], [-4.4884, 48.3896], [-4.4903, 48.3901]] },
  { kind: 'block', coordinates: [[-4.4987, 48.3902], [-4.4976, 48.3906], [-4.4971, 48.3899], [-4.4981, 48.3895]] },
  { kind: 'block', coordinates: [[-4.5001, 48.3912], [-4.4987, 48.3911], [-4.4983, 48.3904], [-4.4996, 48.3905]] },
  { kind: 'block', coordinates: [[-4.4881, 48.3923], [-4.4865, 48.3919], [-4.4870, 48.3912], [-4.4886, 48.3916]] },
  { kind: 'block', coordinates: [[-4.4871, 48.3904], [-4.4858, 48.3899], [-4.4864, 48.3892], [-4.4877, 48.3897]] },
];

export const brestGeometry: SceneGeometry = {
  center: [-4.493, 48.3901],
  zoom: 15.4,
  lines: brestLines,
  polygons: brestPolygons,
  labels: [
    { coordinate: [-4.48775, 48.38978], text: 'Remparts de Brest', emphasis: true },
    { coordinate: [-4.49445, 48.38911], text: 'Pont de Recouvrance' },
    { coordinate: [-4.4963, 48.38955], text: 'Ateliers des Capucins', emphasis: true },
    { coordinate: [-4.49462, 48.3921], text: 'Penfeld' },
  ],
};

const farmCenter: Coordinate = [-0.3444, 39.5058];
const farmField: Coordinate[] = [
  [-0.3460, 39.5049], [-0.3434, 39.5047], [-0.3428, 39.5063],
  [-0.3441, 39.5070], [-0.3463, 39.5065],
];

const farmLines: MapLine[] = [
  { kind: 'primary', name: 'Camí del Mar', coordinates: [[-0.3487, 39.5036], [-0.3467, 39.5047], [-0.3439, 39.5071], [-0.3413, 39.5085]] },
  { kind: 'secondary', coordinates: [[-0.3488, 39.5078], [-0.3465, 39.5070], [-0.3440, 39.5066], [-0.3413, 39.5068]] },
  { kind: 'secondary', coordinates: [[-0.3468, 39.5034], [-0.3462, 39.5049], [-0.3464, 39.5066], [-0.3472, 39.5082]] },
  { kind: 'minor', coordinates: [[-0.3453, 39.5036], [-0.3449, 39.5049], [-0.3448, 39.5077]] },
  { kind: 'minor', coordinates: [[-0.3428, 39.5035], [-0.3433, 39.5048], [-0.3430, 39.5064], [-0.3423, 39.5081]] },
  { kind: 'water-edge', name: 'Séquia', coordinates: [[-0.3485, 39.5050], [-0.3464, 39.5055], [-0.3440, 39.5059], [-0.3415, 39.5061]] },
  ...Array.from({ length: 11 }, (_, index): MapLine => {
    const y = 39.50493 + index * 0.00015;
    return {
      kind: 'field-row',
      coordinates: [[-0.34592 + index * 0.00004, y], [-0.34316 + index * 0.00002, y - 0.00008]],
    };
  }),
];

const farmPolygons: MapPolygon[] = [
  { kind: 'field', coordinates: farmField },
  { kind: 'field', coordinates: [[-0.3485, 39.5052], [-0.3467, 39.5051], [-0.3466, 39.5067], [-0.3481, 39.5072]] },
  { kind: 'field', coordinates: [[-0.3431, 39.5038], [-0.3415, 39.5039], [-0.3414, 39.5057], [-0.3428, 39.5056]] },
  { kind: 'field', coordinates: [[-0.3458, 39.5070], [-0.3439, 39.5073], [-0.3436, 39.5082], [-0.3461, 39.5080]] },
  { kind: 'park', coordinates: [[-0.3485, 39.5037], [-0.3468, 39.5036], [-0.3465, 39.5045], [-0.3480, 39.5048]] },
];

export const farmGeometry: SceneGeometry = {
  center: farmCenter,
  zoom: 16.2,
  lines: farmLines,
  polygons: farmPolygons,
  labels: [
    { coordinate: [-0.3445, 39.5075], text: 'L’Horta Nord', emphasis: true },
    { coordinate: [-0.3419, 39.5044], text: 'Alboraia' },
    { coordinate: [-0.3474, 39.50525], text: 'Séquia' },
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
        : Number(clamp(0.49 + 0.17 * Math.sin(progress * 13.1 - 0.4) + noise * 0.11, 0.18, 0.92).toFixed(2)),
      anomaly,
    };
  });
}

function farmCoordinate(u: number, v: number, surveyIndex: number, random: () => number): Coordinate {
  const rotation = -0.09;
  const shiftedU = u + Math.sin(surveyIndex * 1.7) * 0.012 + (random() - 0.5) * 0.018;
  const shiftedV = v + Math.cos(surveyIndex * 1.35) * 0.012 + (random() - 0.5) * 0.018;
  const x = (shiftedU - 0.5) * 0.00265;
  const y = (shiftedV - 0.5) * 0.00155;
  return [
    farmCenter[0] + x * Math.cos(rotation) - y * Math.sin(rotation),
    farmCenter[1] + x * Math.sin(rotation) + y * Math.cos(rotation),
  ];
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
    conductivity: [0.1, 3],
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
