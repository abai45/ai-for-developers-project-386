import { expect, test } from '@playwright/test'

/**
 * Сценарий владельца: создал тип — увидел его в списке.
 */
test('владелец создаёт тип встречи и видит его в списке', async ({ page }) => {
  await page.goto('/owner')

  // Дефолты 30/15: чип длительности подсвечен, превью считает слоты серверной формулой.
  await expect(
    page.getByRole('group', { name: 'Быстрый выбор длительности' }).getByRole('button', { name: '30 мин' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText(/33 слот/)).toBeVisible()

  const typeName = `E2E владелец ${Date.now()}`
  await page.getByLabel('Название').fill(typeName)
  await page.getByLabel('Описание').fill('Проверочный тип из браузерного теста')
  // Длительность выбираем чипом (45 меняет дефолт → превью пересчитывается).
  await page.getByRole('group', { name: 'Быстрый выбор длительности' }).getByRole('button', { name: '45 мин' }).click()
  await expect(page.getByText(/32 слот/)).toBeVisible()
  await page.getByLabel('Шаг слота, мин').fill('15')
  await page.getByRole('button', { name: 'Создать тип встречи' }).click()

  await expect(
    page.getByText(`Тип встречи «${typeName}» создан`, { exact: false }),
  ).toBeVisible()

  const list = page.getByRole('heading', { level: 2, name: 'Типы встреч' })
  await expect(list).toBeVisible()
  // Фильтр по строке метаданных отличает карточку от тоста (тост — тоже listitem).
  const card = page
    .getByRole('listitem')
    .filter({ hasText: typeName })
    .filter({ hasText: 'Длительность 45 мин · Шаг 15 мин' })
  await expect(card).toBeVisible()
})
