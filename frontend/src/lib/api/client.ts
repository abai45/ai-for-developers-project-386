import createClient from 'openapi-fetch'
import type { components, paths } from './schema'

export type EventType = components['schemas']['EventType']
export type EventTypeView = components['schemas']['EventTypeView']

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
