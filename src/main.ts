import 'ol/ol.css';
import './styles.css';

import Feature from 'ol/Feature.js';
import OlMap from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import LineString from 'ol/geom/LineString.js';
import Point from 'ol/geom/Point.js';
import Polygon from 'ol/geom/Polygon.js';
import VectorLayer from 'ol/layer/Vector.js';
import { fromLonLat } from 'ol/proj.js';
import VectorSource from 'ol/source/Vector.js';
import CircleStyle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import Text from 'ol/style/Text.js';
import type { FeatureLike } from 'ol/Feature.js';
import type { Geometry } from 'ol/geom.js';

import {
  WALK_ANOMALY_INDEX,
  brestGeometry,
  brestRoute,
  createFarmSurveys,
  createWalkMeasurements,
  farmGeometry,
} from './data';
import type { FarmSurvey, Measurement, MetricKey, ScenarioKey, SceneGeometry } from './types';

const walkMeasurements = createWalkMeasurements();
const farmSurveys = createFarmSurveys();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const metricMeta: Record<MetricKey, { label: string; unit: string; decimals: number }> = {
  temperature: { label: 'Temperature', unit: '°C', decimals: 1 },
  moisture: { label: 'Soil humidity', unit: '%', decimals: 1 },
  conductivity: { label: 'Conductivity', unit: 'dS/m', decimals: 2 },
};

const ranges: Record<ScenarioKey, Record<MetricKey, [number, number]>> = {
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

const colorStops: Record<MetricKey, [string, string, string]> = {
  temperature: ['#2864a5', '#e7c85c', '#c94c3f'],
  moisture: ['#c9b36b', '#54a7a5', '#155e75'],
  conductivity: ['#b7d6af', '#3b9b75', '#6f3c88'],
};

const element = <T extends HTMLElement>(selector: string): T => {
  const match = document.querySelector<T>(selector);
  if (!match) throw new Error(`Missing interface element: ${selector}`);
  return match;
};

const svgElement = <T extends SVGElement>(selector: string): T => {
  const match = document.querySelector<T>(selector);
  if (!match) throw new Error(`Missing SVG element: ${selector}`);
  return match;
};

const baseSource = new VectorSource();
const routeSource = new VectorSource();
const sampleSource = new VectorSource();
const labelSource = new VectorSource();

let scenario: ScenarioKey = 'walk';
let activeMetric: MetricKey = 'conductivity';
let currentSurveyIndex = 0;
let selectedId: string | null = null;
let playbackTimer: number | undefined;
let transitionSequence = 0;

function closeRing(coordinates: [number, number][]): [number, number][] {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return coordinates;
  return [...coordinates, first];
}

function parseHex(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function mixColor(start: string, end: string, amount: number): string {
  const from = parseHex(start);
  const to = parseHex(end);
  const channels = from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount));
  return `rgb(${channels.join(',')})`;
}

function metricColor(measurement: Measurement): string {
  const [minimum, maximum] = ranges[scenario][activeMetric];
  const progress = Math.max(0, Math.min(1, (measurement[activeMetric] - minimum) / (maximum - minimum)));
  const [low, middle, high] = colorStops[activeMetric];
  return progress < 0.5
    ? mixColor(low, middle, progress * 2)
    : mixColor(middle, high, (progress - 0.5) * 2);
}

const baseStyles = {
  water: new Style({ fill: new Fill({ color: '#c9dddc' }), stroke: new Stroke({ color: '#9ebdbe', width: 1 }) }),
  field: new Style({ fill: new Fill({ color: 'rgba(201, 179, 107, 0.2)' }), stroke: new Stroke({ color: 'rgba(126, 118, 70, 0.3)', width: 0.8 }) }),
  'survey-field': new Style({ fill: new Fill({ color: 'rgba(201, 179, 107, 0.43)' }), stroke: new Stroke({ color: 'rgba(91, 91, 49, 0.68)', width: 1.5 }) }),
  block: new Style({ fill: new Fill({ color: 'rgba(202, 216, 212, 0.65)' }), stroke: new Stroke({ color: 'rgba(114, 137, 137, 0.24)', width: 0.8 }) }),
  park: new Style({ fill: new Fill({ color: 'rgba(177, 207, 186, 0.52)' }), stroke: new Stroke({ color: 'rgba(83, 130, 101, 0.2)', width: 0.8 }) }),
  primary: [
    new Style({ stroke: new Stroke({ color: 'rgba(255,255,255,.92)', width: 7 }) }),
    new Style({ stroke: new Stroke({ color: '#9aaead', width: 2.2 }) }),
  ],
  secondary: [
    new Style({ stroke: new Stroke({ color: 'rgba(255,255,255,.86)', width: 5 }) }),
    new Style({ stroke: new Stroke({ color: '#b0c0be', width: 1.25 }) }),
  ],
  minor: new Style({ stroke: new Stroke({ color: 'rgba(126, 151, 150, .56)', width: 0.8 }) }),
  'water-edge': new Style({ stroke: new Stroke({ color: '#8fb4b7', width: 1.2, lineDash: [5, 4] }) }),
  'field-row': new Style({ stroke: new Stroke({ color: 'rgba(137, 126, 73, .29)', width: 0.75 }) }),
};

function baseStyle(feature: FeatureLike): Style | Style[] {
  const kind = feature.get('kind') as keyof typeof baseStyles;
  return baseStyles[kind] ?? baseStyles.minor;
}

function labelStyle(feature: FeatureLike): Style {
  const emphasis = Boolean(feature.get('emphasis'));
  const endpoint = feature.get('endpoint') as 'start' | 'finish' | undefined;

  if (endpoint) {
    return new Style({
      image: new CircleStyle({
        radius: endpoint === 'finish' ? 5 : 4.5,
        fill: new Fill({ color: endpoint === 'finish' ? '#155e75' : '#f3f8f7' }),
        stroke: new Stroke({ color: '#155e75', width: 2 }),
      }),
    });
  }

  return new Style({
    text: new Text({
      text: feature.get('label') as string,
      font: `${emphasis ? 600 : 450} ${emphasis ? 12 : 10}px Geologica, sans-serif`,
      fill: new Fill({ color: emphasis ? '#20343b' : '#657c80' }),
      stroke: new Stroke({ color: 'rgba(243,248,247,.95)', width: emphasis ? 4 : 3 }),
      offsetY: emphasis ? -11 : 0,
    }),
  });
}

const sampleStyleCache = new globalThis.Map<string, Style>();

function sampleStyle(feature: FeatureLike): Style {
  const measurement = feature.get('measurement') as Measurement;
  const selected = measurement.id === selectedId;
  const color = metricColor(measurement);
  const key = `${scenario}-${color}-${selected ? 'selected' : 'normal'}`;
  const existing = sampleStyleCache.get(key);
  if (existing) return existing;

  const style = new Style({
    image: new CircleStyle({
      radius: selected ? 7 : scenario === 'walk' ? 2.55 : 4.1,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: selected ? '#20343b' : 'rgba(243,248,247,.74)', width: selected ? 2.2 : 0.65 }),
    }),
    zIndex: selected ? 50 : 10,
  });
  sampleStyleCache.set(key, style);
  return style;
}

const routeStyleCache = new globalThis.Map<string, Style[]>();

function routeStyle(feature: FeatureLike): Style[] {
  const measurement = feature.get('measurement') as Measurement;
  const color = metricColor(measurement);
  const key = `${scenario}-${color}`;
  const existing = routeStyleCache.get(key);
  if (existing) return existing;

  const styles = [
    new Style({
      stroke: new Stroke({
        color: 'rgba(243,248,247,.94)',
        width: scenario === 'walk' ? 9 : 6.5,
        lineCap: 'round',
        lineJoin: 'round',
      }),
      zIndex: 4,
    }),
    new Style({
      stroke: new Stroke({
        color,
        width: scenario === 'walk' ? 5.4 : 3.8,
        lineCap: 'round',
        lineJoin: 'round',
      }),
      zIndex: 5,
    }),
  ];
  routeStyleCache.set(key, styles);
  return styles;
}

const baseLayer = new VectorLayer({ source: baseSource, style: baseStyle, updateWhileInteracting: false });
const routeLayer = new VectorLayer({ source: routeSource, style: routeStyle, updateWhileAnimating: true });
const sampleLayer = new VectorLayer({ source: sampleSource, style: sampleStyle, updateWhileAnimating: true });
const labelLayer = new VectorLayer({ source: labelSource, style: labelStyle, declutter: true });

const view = new View({ center: fromLonLat(brestGeometry.center), zoom: brestGeometry.zoom, minZoom: 13, maxZoom: 20 });
const map = new OlMap({
  target: 'map',
  layers: [baseLayer, routeLayer, sampleLayer, labelLayer],
  view,
  controls: defaultControls({ attribution: false, rotate: false, zoom: false }),
});

const anomalyElement = element<HTMLDivElement>('#anomaly-marker');
const anomalyOverlay = new Overlay({ element: anomalyElement, positioning: 'bottom-center', offset: [0, -5], stopEvent: true });
map.addOverlay(anomalyOverlay);

function featureFromMeasurement(measurement: Measurement): Feature<Point> {
  const feature = new Feature(new Point(fromLonLat(measurement.coordinate)));
  feature.set('measurement', measurement);
  feature.set('interactive', true);
  return feature;
}

function populateGeometry(geometry: SceneGeometry): void {
  baseSource.clear();
  labelSource.clear();

  for (const polygon of geometry.polygons) {
    const feature = new Feature(new Polygon([closeRing(polygon.coordinates).map((coordinate) => fromLonLat(coordinate))]));
    feature.set('kind', polygon.kind);
    baseSource.addFeature(feature);
  }

  for (const line of geometry.lines) {
    const feature = new Feature(new LineString(line.coordinates.map((coordinate) => fromLonLat(coordinate))));
    feature.set('kind', line.kind);
    feature.set('name', line.name);
    baseSource.addFeature(feature);
  }

  for (const label of geometry.labels) {
    const feature = new Feature(new Point(fromLonLat(label.coordinate)));
    feature.set('label', label.text);
    feature.set('emphasis', label.emphasis);
    labelSource.addFeature(feature);
  }
}

function setMeasurements(points: Measurement[]): void {
  sampleSource.clear();
  sampleSource.addFeatures(points.map(featureFromMeasurement));
}

function setRoute(points: Measurement[]): void {
  routeSource.clear();
  routeStyleCache.clear();
  const segments = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const feature = new Feature(new LineString([
      fromLonLat(point.coordinate),
      fromLonLat(next.coordinate),
    ]));
    feature.set('measurement', {
      ...point,
      temperature: (point.temperature + next.temperature) / 2,
      moisture: (point.moisture + next.moisture) / 2,
      conductivity: (point.conductivity + next.conductivity) / 2,
    } satisfies Measurement);
    return feature;
  });
  routeSource.addFeatures(segments);
}

function fitScene(duration = 0): void {
  if (routeSource.getFeatures().length === 0) return;
  map.updateSize();
  const extent = routeSource.getExtent();
  if (!extent) return;
  const desktop = window.matchMedia('(min-width: 900px)').matches;
  const padding = desktop ? [150, 150, 150, 150] : [96, 22, 118, 22];
  view.cancelAnimations();
  view.fit(extent, {
    padding,
    duration: reducedMotion.matches ? 0 : duration,
    maxZoom: scenario === 'walk' ? 17 : 17.2,
  });
}

function resetMapView(): void {
  fitScene(360);
}

function formatMeasurement(value: number, metric: MetricKey): string {
  const meta = metricMeta[metric];
  return `${value.toFixed(meta.decimals)} ${meta.unit}`;
}

function average(survey: FarmSurvey, metric: MetricKey): number {
  return survey.points.reduce((sum, point) => sum + point[metric], 0) / survey.points.length;
}

function updateModeCaption(): void {
  const context = element('#mode-context');
  const detail = element('#mode-detail');

  if (activeMetric === 'temperature') {
    if (scenario === 'walk') {
      context.textContent = 'Overcast, 14.8 °C air';
      detail.textContent = 'Mapped by surface temperature';
    } else {
      const calibration = farmSurveys[currentSurveyIndex].calibration;
      context.textContent = `${calibration.weather}, ${calibration.ambientTemperature.toFixed(1)} °C air`;
      detail.textContent = 'Mapped by surface temperature';
    }
  } else if (activeMetric === 'moisture') {
    context.textContent = 'Soil humidity';
    detail.textContent = 'Volumetric estimate at each sample';
  } else {
    context.textContent = 'Electrical conductivity';
    detail.textContent = 'Salinity response at each sample';
  }
}

function updateLegend(): void {
  const [minimum, maximum] = ranges[scenario][activeMetric];
  const meta = metricMeta[activeMetric];
  element('#legend-low').textContent = minimum.toFixed(meta.decimals);
  element('#legend-high').textContent = `${maximum.toFixed(meta.decimals)} ${meta.unit}`;
  const ramp = element('#legend-ramp');
  ramp.className = `legend-ramp ${activeMetric}`;

  document.querySelectorAll<HTMLButtonElement>('[data-metric]').forEach((button) => {
    const isActive = button.dataset.metric === activeMetric;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  updateModeCaption();
}

function updateTrend(): void {
  const values = farmSurveys.map((survey) => average(survey, activeMetric));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = Math.max(maximum - minimum, 0.1);
  const points = values.map((value, index) => {
    const x = 6 + (index / (values.length - 1)) * 308;
    const y = 48 - ((value - minimum) / span) * 36;
    return { x, y };
  });

  svgElement<SVGPolylineElement>('#trend-line').setAttribute('points', points.map(({ x, y }) => `${x},${y}`).join(' '));
  const pointsGroup = svgElement<SVGGElement>('#trend-points');
  pointsGroup.replaceChildren();
  points.forEach(({ x, y }, index) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', index === currentSurveyIndex ? '4' : '2.8');
    circle.classList.toggle('is-current', index === currentSurveyIndex);
    pointsGroup.append(circle);
  });

  const survey = farmSurveys[currentSurveyIndex];
  element('#survey-date').textContent = survey.label;
  element('#farm-average').textContent = formatMeasurement(average(survey, activeMetric), activeMetric);
  element('#farm-average-label').textContent = `Average ${metricMeta[activeMetric].label.toLowerCase()}`;
  svgElement('#trend-chart').setAttribute('aria-label', `${metricMeta[activeMetric].label} average across nine surveys`);

  const calibration = survey.calibration;
  element('#calibration-ambient').textContent = `${calibration.weather}, ${calibration.ambientTemperature.toFixed(1)} °C`;
  element('#calibration-humidity').textContent = `${calibration.relativeHumidity}% RH`;
  element('#calibration-conductivity').textContent = `${calibration.referenceConductivity.toFixed(2)} dS/m`;
  element('#calibration-soil').textContent = calibration.soilState;
  element('#calibration-status').lastChild!.textContent = calibration.status;
  updateModeCaption();
}

function openMeasurement(measurement: Measurement): void {
  selectedId = measurement.id;
  sampleStyleCache.clear();
  sampleLayer.changed();

  element('#sample-context').textContent = scenario === 'walk' ? 'Walk sample' : farmSurveys[currentSurveyIndex].label;
  element('#sample-title').textContent = scenario === 'walk' ? `Step ${measurement.index + 1}` : `Survey sample ${measurement.index + 1}`;
  element('#sample-temperature').textContent = formatMeasurement(measurement.temperature, 'temperature');
  element('#sample-moisture').textContent = formatMeasurement(measurement.moisture, 'moisture');
  element('#sample-conductivity').textContent = formatMeasurement(measurement.conductivity, 'conductivity');
  element('#sample-alert').hidden = !measurement.anomaly;
  element('#sample-sheet').hidden = false;
}

function closeMeasurement(): void {
  selectedId = null;
  sampleStyleCache.clear();
  sampleLayer.changed();
  element('#sample-sheet').hidden = true;
}

function fadeLayerTo(layer: VectorLayer<VectorSource<Feature<Geometry>>>, target: number, duration: number): Promise<void> {
  if (reducedMotion.matches || duration === 0) {
    layer.setOpacity(target);
    return Promise.resolve();
  }

  const start = performance.now();
  const initial = layer.getOpacity();
  return new Promise((resolve) => {
    const frame = (now: number): void => {
      const progress = Math.min(1, (now - start) / duration);
      layer.setOpacity(initial + (target - initial) * progress);
      if (progress < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

async function setFarmSurvey(index: number, crossfade = false): Promise<void> {
  const sequence = ++transitionSequence;
  const safeIndex = Math.max(0, Math.min(farmSurveys.length - 1, index));
  closeMeasurement();

  if (crossfade) {
    await Promise.all([fadeLayerTo(sampleLayer, 0, 135), fadeLayerTo(routeLayer, 0, 135)]);
    if (sequence !== transitionSequence) return;
  }

  currentSurveyIndex = safeIndex;
  const survey = farmSurveys[currentSurveyIndex];
  setMeasurements(survey.points);
  setRoute(survey.points);
  element<HTMLInputElement>('#timeline').value = String(currentSurveyIndex);
  element<HTMLInputElement>('#timeline').setAttribute('aria-valuetext', survey.label);
  updateTrend();

  if (crossfade) {
    sampleLayer.setOpacity(0);
    routeLayer.setOpacity(0);
    await Promise.all([fadeLayerTo(sampleLayer, 1, 190), fadeLayerTo(routeLayer, 1, 190)]);
  } else {
    sampleLayer.setOpacity(1);
    routeLayer.setOpacity(1);
  }
}

function stopPlayback(): void {
  if (playbackTimer !== undefined) window.clearInterval(playbackTimer);
  playbackTimer = undefined;
  const button = element<HTMLButtonElement>('#play-timeline');
  button.classList.remove('is-playing');
  button.setAttribute('aria-label', 'Play farm timeline');
}

async function startPlayback(): Promise<void> {
  if (currentSurveyIndex === farmSurveys.length - 1) await setFarmSurvey(0, true);
  const button = element<HTMLButtonElement>('#play-timeline');
  button.classList.add('is-playing');
  button.setAttribute('aria-label', 'Pause farm timeline');

  playbackTimer = window.setInterval(() => {
    const next = currentSurveyIndex + 1;
    if (next >= farmSurveys.length) {
      stopPlayback();
      return;
    }
    void setFarmSurvey(next, true);
    if (next === farmSurveys.length - 1) stopPlayback();
  }, reducedMotion.matches ? 650 : 1_000);
}

function setMetric(metric: MetricKey): void {
  activeMetric = metric;
  sampleStyleCache.clear();
  routeStyleCache.clear();
  sampleLayer.changed();
  routeLayer.changed();
  updateLegend();
  if (scenario === 'farm') updateTrend();
}

function renderScene(nextScenario: ScenarioKey): void {
  stopPlayback();
  closeMeasurement();
  scenario = nextScenario;
  element('#app').dataset.activeScenario = scenario;
  activeMetric = scenario === 'walk' ? 'conductivity' : 'moisture';
  currentSurveyIndex = 0;
  transitionSequence += 1;
  const geometry = scenario === 'walk' ? brestGeometry : farmGeometry;
  populateGeometry(geometry);

  if (scenario === 'walk') {
    setMeasurements(walkMeasurements);
    setRoute(walkMeasurements);
    const start = new Feature(new Point(fromLonLat(brestRoute[0])));
    start.set('endpoint', 'start');
    const finish = new Feature(new Point(fromLonLat(brestRoute[brestRoute.length - 1])));
    finish.set('endpoint', 'finish');
    labelSource.addFeatures([start, finish]);
    anomalyOverlay.setPosition(fromLonLat(walkMeasurements[WALK_ANOMALY_INDEX].coordinate));
    anomalyElement.hidden = false;
    element('#scene-place').textContent = 'Brest, France';
    element('#scene-title').textContent = 'Stangalar soil loop';
    element('#walk-panel').hidden = false;
    element('#farm-panel').hidden = true;
  } else {
    void setFarmSurvey(0);
    anomalyOverlay.setPosition(undefined);
    anomalyElement.hidden = true;
    element('#scene-place').textContent = 'L’Horta Nord, Valencia';
    element('#scene-title').textContent = 'Quarterly field survey';
    element('#walk-panel').hidden = true;
    element('#farm-panel').hidden = false;
  }

  document.querySelectorAll<HTMLButtonElement>('[data-scenario]').forEach((button) => {
    const isActive = button.dataset.scenario === scenario;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  updateLegend();
  window.setTimeout(() => fitScene(0), 0);
}

map.on('singleclick', (event) => {
  const feature = map.forEachFeatureAtPixel(event.pixel, (candidate) => (
    candidate.get('interactive') ? candidate : undefined
  ), { hitTolerance: 8 });
  const measurement = feature?.get('measurement') as Measurement | undefined;
  if (measurement) openMeasurement(measurement);
});

map.on('pointermove', (event) => {
  if (event.dragging) return;
  const hit = map.hasFeatureAtPixel(event.pixel, {
    hitTolerance: 6,
    layerFilter: (layer) => layer === sampleLayer,
  });
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});

document.querySelectorAll<HTMLButtonElement>('[data-scenario]').forEach((button) => {
  button.addEventListener('click', () => renderScene(button.dataset.scenario as ScenarioKey));
});

document.querySelectorAll<HTMLButtonElement>('[data-metric]').forEach((button) => {
  button.addEventListener('click', () => setMetric(button.dataset.metric as MetricKey));
});

element<HTMLButtonElement>('#zoom-in').addEventListener('click', () => view.animate({ zoom: (view.getZoom() ?? 15) + 1, duration: reducedMotion.matches ? 0 : 180 }));
element<HTMLButtonElement>('#zoom-out').addEventListener('click', () => view.animate({ zoom: (view.getZoom() ?? 15) - 1, duration: reducedMotion.matches ? 0 : 180 }));
element<HTMLButtonElement>('#reset-map').addEventListener('click', resetMapView);
element<HTMLButtonElement>('#close-sheet').addEventListener('click', closeMeasurement);
element<HTMLButtonElement>('#anomaly-summary').addEventListener('click', () => openMeasurement(walkMeasurements[WALK_ANOMALY_INDEX]));
anomalyElement.querySelector('button')?.addEventListener('click', () => openMeasurement(walkMeasurements[WALK_ANOMALY_INDEX]));

element<HTMLButtonElement>('#play-timeline').addEventListener('click', () => {
  if (playbackTimer === undefined) void startPlayback();
  else stopPlayback();
});

element<HTMLInputElement>('#timeline').addEventListener('input', (event) => {
  stopPlayback();
  void setFarmSurvey(Number((event.target as HTMLInputElement).value), true);
});

const ticks = element('#timeline-ticks');
for (let index = 0; index < farmSurveys.length; index += 1) ticks.append(document.createElement('i'));

let resizeTimer: number | undefined;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => fitScene(0), 100);
});
renderScene('walk');
