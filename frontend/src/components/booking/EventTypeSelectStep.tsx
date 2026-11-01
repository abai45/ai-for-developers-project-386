import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { listEventTypes, type EventTypeView } from '@/lib/api/client'

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ok'; items: EventTypeView[] }

export default function EventTypeSelectStep({
  onPick,
}: {
  onPick: (eventType: EventTypeView) => void
}) {
  const [state, setState] = useState<State>({ status: 'loading' })
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
  }, [reloadKey])

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col gap-3">
        <p className="sr-only" aria-live="polite">
          Загрузка…
        </p>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <p className="text-muted-foreground">Не удалось загрузить данные</p>
        <Button variant="outline" onClick={() => setReloadKey(key => key + 1)}>
          Повторить
        </Button>
      </div>
    )
  }

  if (state.items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-medium">Типов встреч пока нет</p>
          <p className="text-muted-foreground">
            Вернитесь позже: владелец ещё не добавил ни одного типа.
          </p>
        </div>
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          На главную
        </Link>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {state.items.map(eventType => (
        <li key={eventType.id}>
          <button
            type="button"
            className="w-full rounded-xl border p-4 text-left transition-colors hover:bg-muted"
            onClick={() => onPick(eventType)}
          >
            <p className="font-medium">{eventType.name}</p>
            {eventType.description && (
              <p className="text-muted-foreground text-sm">{eventType.description}</p>
            )}
            <p className="text-muted-foreground text-sm">
              Длительность {eventType.durationMinutes} мин · Шаг{' '}
              {eventType.slotStepMinutes} мин
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}
