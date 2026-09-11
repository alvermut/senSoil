import { expect, test, type Page } from '@playwright/test';

async function connectAndStart(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Connect device' }).click();
  await expect(page.getByRole('heading', { name: 'Finding senStep' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start measuring' })).toBeVisible({ timeout: 3_000 });
  await page.getByRole('button', { name: 'Start measuring' }).click();
  await expect(page.locator('#device-gate')).toBeHidden();
}

test('connects the senStep sensor before measurement', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Connect device' })).toBeVisible();
  await page.getByRole('button', { name: 'Connect device' }).click();
  await expect(page.getByRole('heading', { name: 'Finding senStep' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start measuring' })).toBeVisible({ timeout: 3_000 });
  const connectedPanel = page.locator('#device-connected');
  await expect(connectedPanel.getByText('48.4023° N, 4.4455° W')).toBeVisible();
  await expect(connectedPanel.getByText('SSTEP-BR-0427')).toBeVisible();
  await expect(page.locator('#device-timestamp')).not.toHaveText('—');
  await page.getByRole('button', { name: 'Start measuring' }).click();
  await expect(page.locator('#device-live')).toContainText('SS-0427');
  await expect(page.getByRole('heading', { name: 'Take a field measurement' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Measure', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('takes measurements and accumulates the session log', async ({ page }) => {
  await page.goto('/');
  await connectAndStart(page);

  await page.getByRole('button', { name: 'Take measurement' }).click();
  await expect(page.getByRole('heading', { name: 'Stay still' })).toBeVisible();
  await expect(page.getByText('Taking measurement. Keep your foot steady for 4 seconds.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Taking measurement' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Datapoint taken' })).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('#measurement-count')).toHaveText('1 datapoint');
  await expect(page.locator('.measurement-log-item')).toHaveCount(1);

  await page.getByRole('button', { name: 'Take another measurement' }).click();
  await expect(page.getByRole('heading', { name: 'Datapoint taken' })).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('#measurement-count')).toHaveText('2 datapoints');
  await expect(page.locator('.measurement-log-item')).toHaveCount(2);
});

test('opens on the Brest conductivity walk', async ({ page }) => {
  await page.goto('/');
  await connectAndStart(page);
  await page.getByRole('button', { name: 'Walk' }).click();
  await expect(page).toHaveTitle(/senStep/);
  await expect(page.getByRole('heading', { name: 'Vallon du Stangalar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Conductivity', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('1,482')).toBeVisible();
  await expect(page.getByText('3 park paths')).toBeVisible();
  await expect(page.locator('#walk-date')).not.toBeEmpty();
  await expect(page.getByRole('button', { name: /Shared hotspot across three paths/ })).toBeVisible();
});

test('opens the anomalous step details', async ({ page }) => {
  await page.goto('/');
  await connectAndStart(page);
  await page.getByRole('button', { name: 'Walk' }).click();
  await page.getByRole('button', { name: /Shared hotspot across three paths/ }).click();
  await expect(page.getByRole('heading', { name: /Step/ })).toBeVisible();
  await expect(page.getByText('1.12 dS/m')).toBeVisible();
  await expect(page.locator('#sample-alert-text')).toHaveText('Repeated conductivity signal suggests compacted soil');
});

test('switches to the farm and advances the timeline', async ({ page }) => {
  await page.goto('/');
  await connectAndStart(page);
  await page.getByRole('button', { name: 'Farm' }).click();
  await expect(page.getByRole('heading', { name: 'Quarterly field survey' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Humidity' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('September 2024')).toBeVisible();

  await page.getByRole('button', { name: 'Play farm timeline' }).click();
  await expect(page.getByRole('button', { name: 'Pause farm timeline' })).toBeVisible();
  await expect(page.getByText('December 2024')).toBeVisible({ timeout: 2_500 });
});

test('updates farm trend units with the active layer', async ({ page }) => {
  await page.goto('/');
  await connectAndStart(page);
  await page.getByRole('button', { name: 'Farm' }).click();
  await page.getByRole('button', { name: 'Weather' }).click();
  await expect(page.getByText('Average temperature')).toBeVisible();
  await expect(page.locator('#farm-average')).toContainText('°C');
});


test('shows living-lab calibration conditions for the farm', async ({ page }) => {
  await page.goto('/');
  await connectAndStart(page);
  await page.getByRole('button', { name: 'Farm' }).click();
  await expect(page.getByRole('heading', { name: 'NEMESIS-calibrated parameters' })).toBeVisible();
  await expect(page.getByText('Within range')).toBeVisible();
  await expect(page.getByText('1.41 dS/m')).toBeVisible();
  await expect(page.getByText('Illustrative NEMESIS-calibrated parameters for this product demo.')).toBeVisible();
});


test('flags the out-of-range farm humidity zone', async ({ page }) => {
  await page.goto('/');
  await connectAndStart(page);
  await page.getByRole('button', { name: 'Farm' }).click();
  await page.locator('#timeline').fill('4');
  await expect(page.getByText('September 2025')).toBeVisible();
  await expect(page.getByText('Outside range')).toBeVisible();
  await expect(page.locator('#farm-anomaly-onset')).toBeVisible();
  await page.getByRole('button', { name: 'Inspect out-of-range anomaly' }).click();
  await expect(page.getByRole('heading', { name: /Survey sample/ })).toBeVisible();
  await expect(page.getByText('Soil humidity exceeds the NEMESIS-calibrated range')).toBeVisible();
});
