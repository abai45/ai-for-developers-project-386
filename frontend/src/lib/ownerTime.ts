const OWNER_TIME_ZONE = 'Asia/Almaty'

/** Ключ дня (yyyy-mm-dd) в поясе владельца — для группировки слотов по дням. */
export function ownerDayKey(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: OWNER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** «вторник, 31 марта» — день окна в поясе владельца. */
export function formatOwnerDay(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: OWNER_TIME_ZONE,
  }).format(date)
}

function formatOwnerTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: OWNER_TIME_ZONE,
  }).format(new Date(iso))
}

/** «10:00–11:00» — интервал слота в поясе владельца. */
export function formatOwnerTimeRange(startIso: string, endIso: string): string {
  return `${formatOwnerTime(startIso)}–${formatOwnerTime(endIso)}`
}

/** «27 октября, 10:00–11:00» — день и интервал слота в поясе владельца. */
export function formatOwnerDateTimeRange(startIso: string, endIso: string): string {
  const date = new Date(startIso)
  const day = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: OWNER_TIME_ZONE,
  }).format(date)
  return `${day}, ${formatOwnerTimeRange(startIso, endIso)}`
}

/** Сегодняшний день в поясе владельца (yyyy-mm-dd). */
export function ownerTodayKey(): string {
  return ownerDayKey(new Date().toISOString())
}
