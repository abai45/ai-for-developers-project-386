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
