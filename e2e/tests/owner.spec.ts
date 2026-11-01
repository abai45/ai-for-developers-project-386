import { expect, test } from '@playwright/test'

/**
 * Сценарий владельца: создал тип — увидел его в списке.
 */
test('владелец создаёт тип встречи и видит его в списке', async ({ page }) => {
  await page.goto('/owner')

  const typeName = `E2E владелец ${Date.now()}`
  await page.getByLabel('Название').fill(typeName)
  await page.getByLabel('Описание').fill('Проверочный тип из браузерного теста')
  await page.getByLabel('Длительность, мин').fill('30')
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
    .filter({ hasText: 'Длительность 30 мин · Шаг 15 мин' })
  await expect(card).toBeVisible()
})
