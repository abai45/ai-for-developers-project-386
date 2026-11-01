import { expect, test } from '@playwright/test'

async function createTypeViaOwnerUi(page: import('@playwright/test').Page, name: string) {
  await page.goto('/owner')
  await page.getByLabel('Название').fill(name)
  await page.getByLabel('Длительность, мин').fill('30')
  await page.getByLabel('Шаг слота, мин').fill('15')
  await page.getByRole('button', { name: 'Создать тип встречи' }).click()
  await expect(
    page
      .getByRole('listitem')
      .filter({ hasText: name })
      .filter({ hasText: 'Длительность' })
      .first(),
  ).toBeVisible()
}

/** Первый клик-день окна; день помечен data-day (yyyy-mm-dd по времени владельца). */
async function pickFirstDay(page: import('@playwright/test').Page): Promise<string> {
  const day = page.locator('button[data-day]:not([disabled])').first()
  const dayKey = (await day.getAttribute('data-day'))!
  await day.click()
  return dayKey
}

/** Первый свободный слот выбранного дня; возвращает локальное время старта HH:MM. */
async function pickFirstFreeSlot(page: import('@playwright/test').Page): Promise<string> {
  const slot = page.getByRole('button').filter({ hasText: 'Свободно' }).first()
  const label = (await slot.textContent())!
  const start = label.trim().slice(0, 5) // «09:30–10:00 Свободно» → «09:30»
  await slot.click()
  return start
}

test('гость проходит мастер целиком: тип → календарь → имя → подтверждение → «Вы записаны», и встреча видна владельцу', async ({
  page,
}) => {
  const typeName = `E2E марафон ${Date.now()}`
  const guest = `Гость ${Date.now()}`
  await createTypeViaOwnerUi(page, typeName)

  await page.goto('/book')
  await page
    .getByRole('button')
    .filter({ hasText: typeName })
    .click()

  await pickFirstDay(page)
  const start = await pickFirstFreeSlot(page)

  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeEnabled()
  await page.getByRole('button', { name: 'Продолжить' }).click()

  await page.getByLabel('Ваше имя').fill(guest)
  await page.getByRole('button', { name: 'Продолжить' }).click()

  // Сводка перед подтверждением.
  await expect(page.getByText(typeName).first()).toBeVisible()
  await expect(page.getByText(`Имя: ${guest}`)).toBeVisible()

  await page.getByRole('button', { name: 'Подтвердить запись' }).click()

  await expect(
    page.getByRole('heading', { level: 1, name: 'Вы записаны' }),
  ).toBeVisible()
  await expect(page.getByText(`Гость: ${guest}`)).toBeVisible()
  // Время показывается в поясе владельца диапазоном по выбранному слоту.
  await expect(page.getByText(`${start}–`).first()).toBeVisible()

  // Владелец видит эту встречу в списке предстоящих.
  await page.goto('/owner')
  const meetings = page.getByRole('heading', { level: 2, name: 'Предстоящие встречи' })
  await expect(meetings).toBeVisible()
  await expect(page.getByText(`Гость: ${guest}`)).toBeVisible()
})

test('конфликт 409: занятый соперником слот возвращает на календарь с сообщением и обновлёнными слотами', async ({
  page,
  request,
}) => {
  const typeName = `E2E конфликт ${Date.now()}`
  await createTypeViaOwnerUi(page, typeName)

  await page.goto('/book')
  await page.getByRole('button').filter({ hasText: typeName }).click()

  const dayKey = await pickFirstDay(page)
  const start = await pickFirstFreeSlot(page)

  await page.getByRole('button', { name: 'Продолжить' }).click()
  await page.getByLabel('Ваше имя').fill('Запоздалый гость')
  await page.getByRole('button', { name: 'Продолжить' }).click()

  // Соперник занимает тот же слот реальным запросом к настоящему серверу.
  const types = await (await request.get('/api/event-types')).json()
  const eventTypeId = types.find((t: { name: string }) => t.name === typeName).id
  const rival = await request.post('/api/meetings', {
    data: { eventTypeId, guestName: 'Соперник', start: `${dayKey}T${start}+05:00` },
  })
  expect(rival.status()).toBe(201)

  // Подтверждение упирается в 409 → автовозврат на календарь.
  await page.getByRole('button', { name: 'Подтвердить запись' }).click()

  await expect(
    page.getByRole('alert').filter({ hasText: 'Слот только что заняли, выберите другой' }),
  ).toBeVisible()
  // Перезапрошенные слоты: выбранный слот теперь «Занято» и некликабелен.
  const busy = page.getByRole('button').filter({ hasText: `${start}–` }).first()
  await expect(busy).toContainText('Занято')
  await expect(busy).toBeDisabled()
  // «Продолжить» не активна без нового выбора.
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeDisabled()
})
