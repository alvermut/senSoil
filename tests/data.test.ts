import { describe, expect, it } from 'vitest';

import {
  WALK_ANOMALY_INDEX,
  WALK_SAMPLE_COUNT,
  brestRoute,
  createFarmSurveys,
  createWalkMeasurements,
  metricAverage,
} from '../src/data';

describe('Brest walk data', () => {
  it('creates one measurement for each of the 1,482 steps', () => {
    const points = createWalkMeasurements();
    expect(points).toHaveLength(WALK_SAMPLE_COUNT);
    expect(points[0].coordinate).toEqual(brestRoute[0]);
    expect(points.at(-1)?.coordinate).toEqual(brestRoute.at(-1));
  });

  it('contains exactly one conductivity anomaly', () => {
    const points = createWalkMeasurements();
    const anomalies = points.filter((point) => point.anomaly);
    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].index).toBe(WALK_ANOMALY_INDEX);
    expect(anomalies[0].conductivity).toBe(2.74);
  });

  it('keeps ordinary readings inside the intended demo ranges', () => {
    const points = createWalkMeasurements().filter((point) => !point.anomaly);
    expect(points.every((point) => point.temperature >= 13.8 && point.temperature <= 17.5)).toBe(true);
    expect(points.every((point) => point.moisture >= 22 && point.moisture <= 48)).toBe(true);
    expect(points.every((point) => point.conductivity >= 0.18 && point.conductivity <= 0.92)).toBe(true);
  });
});

describe('Valencia farm data', () => {
  const surveys = createFarmSurveys();

  it('creates nine quarterly surveys over two years', () => {
    expect(surveys).toHaveLength(9);
    expect(surveys[0].date).toBe('2024-09-01');
    expect(surveys.at(-1)?.date).toBe('2026-09-01');
    expect(surveys.every((survey) => survey.points.length === 120)).toBe(true);
  });

  it('uses different sampling positions for each visit', () => {
    const firstPositions = surveys[0].points.map((point) => point.coordinate.join(',')).join('|');
    const secondPositions = surveys[1].points.map((point) => point.coordinate.join(',')).join('|');
    expect(firstPositions).not.toBe(secondPositions);
  });

  it('shows moisture recovery across the full timeline', () => {
    const firstAverage = metricAverage(surveys[0].points, 'moisture');
    const lastAverage = metricAverage(surveys.at(-1)!.points, 'moisture');
    expect(lastAverage).toBeGreaterThan(firstAverage + 5);
  });
});
