import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function waitForStableReport(page: import('@playwright/test').Page) {
  await expect(page.getByText(/channel pulse/i).first()).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(800);
}

test.describe('report workflow', () => {
  test('navigates through the report tabs and preserves the selected tab in the URL', async ({ page }) => {
    await page.goto('/analyze/mkbhd?demo=true');
    await expect(page.getByText(/channel pulse/i).first()).toBeVisible({ timeout: 30_000 });

    await page.getByRole('tab', { name: /Patterns/i }).click();
    await expect(page).toHaveURL(/tab=patterns/);
    await expect(page.getByRole('heading', { name: /what repeats across the videos/i })).toBeVisible();

    await page.getByRole('tab', { name: /Hook & Script/i }).click();
    await expect(page).toHaveURL(/tab=transcripts/);
    await expect(page.getByRole('heading', { name: /how do the best videos begin/i })).toBeVisible();
    await expect(page.getByText(/what to borrow/i)).toBeVisible({ timeout: 15_000 });

    await page.getByRole('tab', { name: /Videos/i }).click();
    await expect(page).toHaveURL(/tab=uploads/);
    await expect(page.getByRole('heading', { name: /every video, side by side/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /above typical/i })).toBeVisible();
  });

  test('supports the comparison workflow and its visual signals', async ({ page }) => {
    await page.goto('/compare');
    await page.getByRole('button', { name: /MKBHD vs Veritasium/i }).click();
    await expect(page.getByRole('heading', { name: /quick comparison/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/head-to-head signals/i)).toBeVisible();
    await expect(page.getByText('Content focus', { exact: true })).toBeVisible();
    await expect(page.getByText(/opening style/i)).toBeVisible();

    await page.getByRole('button', { name: /analyze openings/i }).click();
    await expect(page.getByRole('button', { name: /retry opening analysis/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/illustrative sample/i).first()).toBeVisible();
  });
});

test('report and compare entry points have no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/analyze/mkbhd?demo=true');
  await waitForStableReport(page);
  const reportResults = await new AxeBuilder({ page }).analyze();
  expect(reportResults.violations).toEqual([]);

  await page.goto('/compare');
  await page.waitForTimeout(300);
  const compareResults = await new AxeBuilder({ page }).analyze();
  expect(compareResults.violations).toEqual([]);
});
