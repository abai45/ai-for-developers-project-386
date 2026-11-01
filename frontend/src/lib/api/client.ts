import createClient from 'openapi-fetch'
import type { components, paths } from './schema'

export type EventType = components['schemas']['EventType']
export type EventTypeView = components['schemas']['EventTypeView']
export type FieldError = components['schemas']['FieldError']

const api = createClient<paths>()

/**
 * Список типов встреч владельца в порядке ответа сервера.
 * Бросает ошибку при сетевом сбое или не-2xx ответе — секция показывает «Повторить».
 */
export async function listEventTypes(): Promise<EventTypeView[]> {
  const { data, error, response } = await api.GET('/api/event-types')
  if (!response.ok || error || !data) {
    throw new Error('Не удалось загрузить типы встреч')
  }
  return data
}

/** Слот записи из контракта. */
export type Slot = components['schemas']['Slot']

/**
 * Слоты типа встречи в окне записи (голый массив, по возрастанию времени).
 * Бросает ошибку при сетевом сбое или не-2xx — шаг показывает «Повторить».
 */
export async function listSlots(eventTypeId: string): Promise<Slot[]> {
  const { data, error, response } = await api.GET(
    '/api/event-types/{eventTypeId}/slots',
    { params: { path: { eventTypeId } } },
  )
  if (!response.ok || error || !data) {
    throw new Error('Не удалось загрузить слоты')
  }
  return data
}

/**
 * Запись встречи гостем. Разбор исходов: 201 — создано; 409 — слот занят;
 * 400 — problem+json с detail (тост); остальное (сеть/5xx) бросает ошибку.
 */
export async function createMeeting(
  input: components['schemas']['Meeting'],
): Promise<CreateMeetingResult> {
  const { data, error, response } = await api.POST('/api/meetings', {
    body: input,
  })
  if (response.status === 409) {
    return { kind: 'conflict' }
  }
  if (response.status === 400 && error) {
    return { kind: 'problem', detail: error.detail }
  }
  if (!response.ok || !data) {
    throw new Error('Не удалось записаться')
  }
  return { kind: 'created', meeting: data }
}

/** Встреча в ответе сервера (end вычислен сервером). */
export type MeetingView = components['schemas']['MeetingView']

/** Исход записи: успех, конфликт 409 или 400 с русским detail. */
export type CreateMeetingResult =
  | { kind: 'created'; meeting: MeetingView }
  | { kind: 'conflict' }
  | { kind: 'problem'; detail: string }

/** Исход создания типа: создан (тело ответа) или отбит по полям (400 errors[]). */
export type CreateEventTypeResult =
  | { kind: 'created'; eventType: EventTypeView }
  | { kind: 'validation'; errors: FieldError[] }

/**
 * Создание типа встречи. 400 с ошибками по полям возвращается как данные
 * (форма подсвечивает поля); сетевой сбой и 5xx бросают ошибку (форма тостит).
 */
export async function createEventType(
  eventType: EventType,
): Promise<CreateEventTypeResult> {
  const { data, error, response } = await api.POST(
    '/api/event-types',
    { body: eventType },
  )
  if (response.status === 400 && error) {
    return { kind: 'validation', errors: error.errors ?? [] }
  }
  if (!response.ok || !data) {
    throw new Error('Не удалось создать тип встречи')
  }
  return { kind: 'created', eventType: data }
}
