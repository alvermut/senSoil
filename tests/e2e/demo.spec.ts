import { expect, test } from '@playwright/test';

test('opens on the Brest conductivity walk', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Sensoil/);
  await expect(page.getByRole('heading', { name: 'Remparts to Capucins' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Conductivity', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('1,482')).toBeVisible();
  await expect(page.getByRole('button', { name: /One reading needs attention/ })).toBeVisible();
});

test('opens the anomalous step details', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /One reading needs attention/ }).click();
  await expect(page.getByRole('heading', { name: 'Step 987' })).toBeVisible();
  await expect(page.getByText('2.74 dS/m')).toBeVisible();
  await expect(page.getByText('Conductivity exceeds the route baseline', { exact: true })).toBeVisible();
});

test('switches to the farm and advances the timeline', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Farm' }).click();
  await expect(page.getByRole('heading', { name: 'Quarterly field survey' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Moisture' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('September 2024')).toBeVisible();

  await page.getByRole('button', { name: 'Play farm timeline' }).click();
  await expect(page.getByRole('button', { name: 'Pause farm timeline' })).toBeVisible();
  await expect(page.getByText('December 2024')).toBeVisible({ timeout: 2_500 });
});

test('updates farm trend units with the active layer', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Farm' }).click();
  await page.getByRole('button', { name: 'Temperature' }).click();
  await expect(page.getByText('Average temperature')).toBeVisible();
  await expect(page.locator('#farm-average')).toContainText('°C');
});
