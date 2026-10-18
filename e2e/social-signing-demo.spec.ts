// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
/**
 * Journey 1: open the synthetic social portal.
 * Journey 2: review one immutable publication-signature request.
 * Journey 3: authorize it through the explicit demo ceremony.
 * Journey 4: reload and observe the authoritative in-memory adapter receipt.
 * Authorization invariant: browser state never grants signing authority.
 * Persistence invariant: the result is read from the BFF adapter after reload.
 * Evidence invariant: the UI labels the receipt as simulation, never Fabric or cryptographic proof.
 */
import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'

test('records and reloads a simulated social publication authorization', async ({ page }, testInfo) => {
  mkdirSync('screenshots', { recursive: true })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Share something worth verifying' })).toBeVisible()
  await expect(page.getByText('Local test adapter · No network publication')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Review & sign' })).toBeEnabled()
  await page.screenshot({ path: `screenshots/antifraud-social-demo-20261018-065800-create-en-${testInfo.project.name}.png`, fullPage: false })

  await page.getByRole('button', { name: 'Review & sign' }).click()
  await expect(page.getByRole('dialog', { name: 'Review signing request' })).toBeVisible()
  await page.screenshot({ path: `screenshots/antifraud-social-demo-20261018-065850-review-en-${testInfo.project.name}.png`, fullPage: false })
  await page.getByLabel('Demo PIN').fill('0426')
  await page.getByRole('button', { name: 'Authorize demo' }).click()

  const dialog = page.getByRole('dialog', { name: 'Review signing request' })
  await expect(dialog.getByRole('heading', { name: 'Simulation recorded' })).toBeVisible()
  await expect(dialog.getByText('Not a cryptographic signature or Fabric transaction.')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Signing request status').getByText('Simulation recorded')).toBeVisible()
  await page.screenshot({ path: `screenshots/antifraud-social-demo-20261018-065900-recorded-en-${testInfo.project.name}.png`, fullPage: false })
})
