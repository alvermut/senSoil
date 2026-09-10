import { describe, expect, it } from 'vitest';

import {
  FARM_ANOMALY_ONSET_INDEX,
  WALK_SAMPLE_COUNT,
  brestRoutes,
  createFarmSurveys,
  createWalkMeasurements,
  metricAverage,
} from '../src/data';

describe('Brest walk data', () => {
  it('creates one measurement for each of the 1,482 steps', () => {
    const points = createWalkMeasurements();
    expect(points).toHaveLength(WALK_SAMPLE_COUNT);
    expect(new Set(points.map((point) => point.trackId))).toEqual(new Set(['path-1', 'path-2', 'path-3']));
    expect(brestRoutes).toHaveLength(3);
  });

  it('marks the same compaction hotspot on all three paths', () => {
    const points = createWalkMeasurements();
    const anomalies = points.filter((point) => point.anomaly);
    expect(anomalies).toHaveLength(3);
    expect(new Set(anomalies.map((point) => point.trackId)).size).toBe(3);
    expect(new Set(anomalies.map((point) => point.coordinate.join(','))).size).toBe(1);
    expect(anomalies.every((point) => point.anomaly?.reason === 'possible-compaction')).toBe(true);
    expect(anomalies.every((point) => point.conductivity === 1.12)).toBe(true);
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
    expect(surveys.every((survey) => survey.calibration.referenceConductivity === 1.41)).toBe(true);
    expect(surveys.slice(0, FARM_ANOMALY_ONSET_INDEX).every((survey) => survey.calibration.status === 'Within range')).toBe(true);
    expect(surveys.slice(FARM_ANOMALY_ONSET_INDEX).every((survey) => survey.calibration.status === 'Outside range')).toBe(true);
  });

  it('marks one localized humidity zone outside the calibrated range', () => {
    const anomalies = surveys[FARM_ANOMALY_ONSET_INDEX].points.filter((point) => point.anomaly);
    expect(anomalies.length).toBeGreaterThan(3);
    expect(anomalies.every((point) => point.anomaly?.metric === 'moisture')).toBe(true);
    expect(anomalies.every((point) => point.moisture > 36)).toBe(true);
    expect(surveys.slice(0, FARM_ANOMALY_ONSET_INDEX).every((survey) => survey.points.every((point) => !point.anomaly))).toBe(true);
    expect(surveys.slice(FARM_ANOMALY_ONSET_INDEX).every((survey) => survey.points.some((point) => point.anomaly))).toBe(true);
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
