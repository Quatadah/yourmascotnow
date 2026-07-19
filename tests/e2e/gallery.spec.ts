import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
})

test('browses, searches, and filters the 80-illustration catalog', async ({
  page,
}) => {
  await expect(
    page.getByRole('heading', { name: /Pick a scene/i }),
  ).toBeVisible()
  await expect(page.locator('.illustration-card')).toHaveCount(80)
  await expect(page.locator('.availability-dot')).toHaveCount(0)
  await expect(page.locator('.header-nav')).toHaveCount(0)
  await expect(page.locator('.header-index')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: /Choose mascot color/i }),
  ).toContainText('Color')
  await expect(page.locator('.site-header')).toHaveCSS(
    'background-image',
    'none',
  )
  await expect(page.locator('.hero')).toHaveCSS('background-image', 'none')
  await expect(page.locator('.catalog-controls')).toHaveCSS(
    'background-image',
    'none',
  )
  await expect(page.locator('.catalog-grid')).toHaveCSS(
    'background-image',
    'none',
  )
  await expect(page.locator('.illustration-card').first()).not.toContainText(
    'YM/',
  )

  await page.getByRole('searchbox', { name: /search all 80/i }).fill('logo')
  await expect(page).toHaveURL(/q=logo/)
  await expect(page.locator('.illustration-card')).toHaveCount(3)

  await page.getByRole('searchbox', { name: /search all 80/i }).fill('')
  await page
    .locator('.category-rail a')
    .filter({ hasText: 'Portfolio' })
    .click()
  await expect(page).toHaveURL(/category=portfolio/)
  await expect(page.getByText('18 scenes in Portfolio')).toBeVisible()
  await expect(
    page.locator('.illustration-card > .card-caption > .copy-prompt'),
  ).toHaveCount(18)
})

test('adapts the illustration grid to the viewport', async ({ page }) => {
  const columnCount = async () => {
    const template = await page
      .locator('.catalog-grid')
      .evaluate((element) =>
        window.getComputedStyle(element).gridTemplateColumns.split(' '),
      )
    return template.length
  }

  await page.setViewportSize({ width: 1100, height: 900 })
  expect(await columnCount()).toBe(3)

  await page.setViewportSize({ width: 760, height: 900 })
  expect(await columnCount()).toBe(2)

  await page.setViewportSize({ width: 440, height: 900 })
  expect(await columnCount()).toBe(1)
})

test('opens a dedicated illustration and traverses to the next item', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'View Mascot waving hello' }).click()
  await expect(page).toHaveURL(/mascot-waving-hello/)
  await expect(
    page.getByRole('heading', { name: 'Mascot waving hello' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: /Recreate this scene with your own photo/i,
    }),
  ).toBeVisible()
  await expect(page.locator('.prompt-copy')).toContainText('SCENE REFERENCE')
  await expect(
    page.getByRole('link', { name: 'Download SVG' }),
  ).toHaveAttribute('href', /\.svg$/)
  await expect(
    page.getByRole('button', { name: 'Current color SVG' }),
  ).toBeVisible()
  await page.getByRole('link', { name: /Next illustration/i }).click()
  await expect(page).toHaveURL(/mascot-introducing-himself-with-an-open-hand/)
})

test('persists the selected color theme', async ({ page }) => {
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.artwork-color-layer').first()).toHaveCSS(
    'background-color',
    'rgb(245, 245, 245)',
  )
  await expect(page.locator('.card-artwork').first()).toHaveCSS(
    'background-color',
    'rgb(17, 17, 17)',
  )

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(
    page.getByRole('button', { name: 'Switch to light mode' }),
  ).toBeVisible()
})

test('applies custom color to artwork and copied prompts', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const colorTrigger = page.getByRole('button', {
    name: /Choose mascot color/i,
  })
  await colorTrigger.click()
  await expect(
    page.getByRole('dialog', { name: 'Mascot color mixer' }),
  ).toBeVisible()
  const colorPicker = page.getByLabel('Custom hex color')
  await colorPicker.fill('#e6492d')
  await colorPicker.press('Enter')

  await expect(page.locator('html')).toHaveAttribute(
    'data-mascot-color',
    'custom',
  )
  await expect(page.locator('.artwork-color-layer').first()).toHaveCSS(
    'background-color',
    'rgb(230, 73, 45)',
  )

  await page
    .locator('.illustration-card > .card-caption > .copy-prompt')
    .first()
    .click()
  const copiedPrompt = await page.evaluate(() => navigator.clipboard.readText())
  expect(copiedPrompt).toContain('#e6492d')

  await page.reload()
  await colorTrigger.click()
  await expect(colorPicker).toHaveValue('#e6492d')
  await expect(
    page.getByRole('button', { name: 'Use theme color' }),
  ).toBeVisible()
})

test('copies the photo-to-mascot recipe from a gallery card', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const copyButton = page
    .locator('.illustration-card > .card-caption > .copy-prompt')
    .first()
  await copyButton.click()
  await expect(copyButton).toContainText('Prompt copied')

  const copiedPrompt = await page.evaluate(() => navigator.clipboard.readText())
  expect(copiedPrompt).toContain('SCENE REFERENCE')
  expect(copiedPrompt).toContain('IDENTITY REFERENCE')
  expect(copiedPrompt).toContain('Do not invent facial hair')
  expect(copiedPrompt).toContain('Mascot waving hello')
})

test('shares an available-only view of the complete collection', async ({
  page,
}) => {
  await page.locator('.availability-toggle').click()
  await expect(page).toHaveURL(/available=true/)
  await expect(page.locator('.illustration-card')).toHaveCount(80)
  await expect(page.getByLabel('Originals available')).toBeChecked()
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
