import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
})

test('browses, searches, and filters the 80-proof catalog', async ({
  page,
}) => {
  await expect(
    page.getByRole('heading', { name: /80 ways to say it/i }),
  ).toBeVisible()
  await expect(page.locator('.illustration-card')).toHaveCount(80)

  await page.getByRole('searchbox', { name: /search all 80/i }).fill('logo')
  await expect(page).toHaveURL(/q=logo/)
  await expect(page.locator('.illustration-card')).toHaveCount(3)

  await page.getByRole('searchbox', { name: /search all 80/i }).fill('')
  await page
    .locator('.category-rail a')
    .filter({ hasText: 'Portfolio' })
    .click()
  await expect(page).toHaveURL(/category=portfolio/)
  await expect(page.getByText('18 proofs in Portfolio')).toBeVisible()
})

test('opens a dedicated proof and traverses to the next item', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'View Mascot waving hello' }).click()
  await expect(page).toHaveURL(/mascot-waving-hello/)
  await expect(
    page.getByRole('heading', { name: 'Mascot waving hello' }),
  ).toBeVisible()
  await expect(page.getByText('YM/01/001').first()).toBeVisible()
  await page.getByRole('link', { name: /Next proof/i }).click()
  await expect(page).toHaveURL(/mascot-introducing-himself-with-an-open-hand/)
})

test('teaches the empty available-only state', async ({ page }) => {
  await page.locator('.availability-toggle').click()
  await expect(
    page.getByRole('heading', { name: /No proof carries/i }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Show all 80' }).click()
  await expect(page.locator('.illustration-card')).toHaveCount(80)
})

test('supports the search keyboard shortcut', async ({ page }) => {
  await page.keyboard.press('/')
  await expect(
    page.getByRole('searchbox', { name: /search all 80/i }),
  ).toBeFocused()
})

test('has no serious automated accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze()
  expect(
    results.violations.filter((violation) => violation.impact === 'serious'),
  ).toEqual([])
})
