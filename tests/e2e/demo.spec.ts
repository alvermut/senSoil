import { expect, test } from '@playwright/test';

test('opens on the Brest conductivity walk', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/senStep/);
  await expect(page.getByRole('heading', { name: 'Stangalar soil loop' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Conductivity', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('1,482')).toBeVisible();
  await expect(page.getByRole('button', { name: /One reading needs attention/ })).toBeVisible();
});

test('opens the anomalous step details', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /One reading needs attention/ }).click();
  await expect(page.getByRole('heading', { name: 'Step 987' })).toBeVisible();
  await expect(page.getByText('2.74 dS/m')).toBeVisible();
  await expect(page.locator('#sample-alert-text')).toBeVisible();
});

test('switches to the farm and advances the timeline', async ({ page }) => {
  await page.goto('/');
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
  await page.getByRole('button', { name: 'Farm' }).click();
  await page.getByRole('button', { name: 'Weather' }).click();
  await expect(page.getByText('Average temperature')).toBeVisible();
  await expect(page.locator('#farm-average')).toContainText('°C');
});


test('shows living-lab calibration conditions for the farm', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Farm' }).click();
  await expect(page.getByRole('heading', { name: 'NEMESIS-calibrated parameters' })).toBeVisible();
  await expect(page.getByText('Outside range')).toBeVisible();
  await expect(page.getByText('1.41 dS/m')).toBeVisible();
  await expect(page.getByText('Illustrative NEMESIS-calibrated parameters for this product demo.')).toBeVisible();
});


test('flags the out-of-range farm humidity zone', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Farm' }).click();
  await page.getByRole('button', { name: 'Inspect out-of-range anomaly' }).click();
  await expect(page.getByRole('heading', { name: /Survey sample/ })).toBeVisible();
  await expect(page.getByText('Soil humidity exceeds the NEMESIS-calibrated range')).toBeVisible();
});
