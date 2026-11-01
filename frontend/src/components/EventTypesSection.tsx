import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { listEventTypes, type EventTypeView } from '@/lib/api/client'

type SectionState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ok'; items: EventTypeView[] }

export default function EventTypesSection({ refreshToken = 0 }: { refreshToken?: number }) {
  const [state, setState] = useState<SectionState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    listEventTypes()
      .then(items => {
        if (!cancelled) setState({ status: 'ok', items })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey, refreshToken])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setReloadKey(key => key + 1)
  }, [])

  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading text-base leading-snug font-medium">Типы встреч</h2>
      </CardHeader>
      <CardContent>
        {state.status === 'loading' && (
          <div className="flex flex-col gap-3">
            <p className="sr-only" aria-live="polite">
              Загрузка…
            </p>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        )}
        {state.status === 'error' && (
          <div className="flex flex-col items-start gap-3" role="alert">
            <p className="text-muted-foreground">Не удалось загрузить данные</p>
            <Button variant="outline" onClick={reload}>
              Повторить
            </Button>
          </div>
        )}
        {state.status === 'ok' && state.items.length === 0 && (
          <div className="flex flex-col gap-1">
            <p className="font-medium">Типов встреч пока нет</p>
            <p className="text-muted-foreground">
              Создайте первый тип — гость сможет записаться на него.
            </p>
          </div>
        )}
        {state.status === 'ok' && state.items.length > 0 && (
          <ul className="flex flex-col gap-3">
            {state.items.map(eventType => (
              <li key={eventType.id}>
                <EventTypeCard eventType={eventType} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function EventTypeCard({ eventType }: { eventType: EventTypeView }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border p-4">
      <p className="font-medium">{eventType.name}</p>
      {eventType.description && (
        <p className="text-muted-foreground text-sm">{eventType.description}</p>
      )}
      <p className="text-muted-foreground text-sm">
        Длительность {eventType.durationMinutes} мин · Шаг {eventType.slotStepMinutes} мин
      </p>
    </div>
  )
}
