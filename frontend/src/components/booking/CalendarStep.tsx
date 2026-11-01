import { useEffect, useMemo, useState } from 'react'
import BookingInfoCard from '@/components/booking/BookingInfoCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { listSlots, type EventTypeView, type Slot } from '@/lib/api/client'
import {
  formatOwnerDay,
  formatOwnerTimeRange,
  ownerDayKey,
} from '@/lib/ownerTime'

type SlotsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ok'; slots: Slot[] }

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

export default function CalendarStep({
  eventType,
  selectedDay,
  selectedSlot,
  conflictMessage,
  onPickDay,
  onPickSlot,
  onBack,
  onNext,
}: {
  eventType: EventTypeView
  selectedDay: string | null
  selectedSlot: Slot | null
  conflictMessage?: string | null
  onPickDay: (day: string) => void
  onPickSlot: (slot: Slot) => void
  onBack: () => void
  onNext: () => void
}) {
  const [state, setState] = useState<SlotsState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [monthIndex, setMonthIndex] = useState(0)

  // Каждый вход на шаг перезапрашивает слоты (канон свежести слотов).
  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    listSlots(eventType.id)
      .then(slots => {
        if (!cancelled) setState({ status: 'ok', slots })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [eventType.id, reloadKey])

  // Окно записи берём из ответа сервера (сервер — источник истины расписания):
  // уникальные дни слотов = дни окна, уникальные месяцы = границы листания.
  const windowMonths = useMemo(() => {
    if (state.status !== 'ok') return []
    const months = new Set(state.slots.map(slot => ownerDayKey(slot.start).slice(0, 7)))
    return Array.from(months).sort()
  }, [state])

  const freeByDay = useMemo(() => {
    const counts = new Map<string, number>()
    if (state.status === 'ok') {
      for (const slot of state.slots) {
        if (slot.status === 'free') {
          const key = ownerDayKey(slot.start)
          counts.set(key, (counts.get(key) ?? 0) + 1)
        }
      }
    }
    return counts
  }, [state])

  const slotsOfSelectedDay = useMemo(
    () =>
      state.status === 'ok' && selectedDay
        ? state.slots.filter(slot => ownerDayKey(slot.start) === selectedDay)
        : [],
    [state, selectedDay],
  )

  if (state.status === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <Card role="alert">
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <p className="text-muted-foreground">Не удалось загрузить данные</p>
            <Button variant="outline" onClick={() => setReloadKey(key => key + 1)}>
              Повторить
            </Button>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Назад
          </Button>
          <Button disabled onClick={() => undefined}>
            Продолжить
          </Button>
        </div>
      </div>
    )
  }

  const loading = state.status === 'loading'
  if (!loading && windowMonths.length === 0) {
    // Сервер всегда отдаёт слоты для дней окна; пустой ответ — аномалия.
    return (
      <Card role="alert">
        <CardContent className="flex flex-col items-start gap-3 py-6">
          <p className="text-muted-foreground">Не удалось загрузить данные</p>
          <Button variant="outline" onClick={() => setReloadKey(key => key + 1)}>
            Повторить
          </Button>
        </CardContent>
      </Card>
    )
  }
  if (loading) {
    // Скелетон всего шага: окно и месяцы известны только из ответа сервера.
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-start">
          <BookingInfoCard
            eventType={eventType}
            day={selectedDay ?? undefined}
            slot={selectedSlot}
          />
          <Card>
            <CardHeader>
              <h2 className="font-heading text-base leading-snug font-medium">Календарь</h2>
            </CardHeader>
            <CardContent>
              <p className="sr-only" aria-live="polite">
                Загрузка…
              </p>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 21 }, (_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card aria-label="Слоты выбранного дня">
            <CardHeader>
              <h3 className="font-heading text-base leading-snug font-medium">Слоты</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Назад
          </Button>
          <Button disabled>Продолжить</Button>
        </div>
      </div>
    )
  }
  // state.status === 'ok' и окно непусто: months посчитаны из слотов сервера.
  const currentMonth = windowMonths[Math.min(monthIndex, windowMonths.length - 1)]
  const [year, month] = currentMonth.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  // Понедельник — первый столбец: сдвиг первого дня месяца (0..6).
  const firstWeekday = (new Date(`${currentMonth}-01T12:00:00Z`).getUTCDay() + 6) % 7

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-start">
        <BookingInfoCard eventType={eventType} day={selectedDay ?? undefined} slot={selectedSlot} />

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <h2 className="font-heading text-base leading-snug font-medium">Календарь</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                aria-label="Предыдущий месяц"
                disabled={monthIndex === 0}
                onClick={() => setMonthIndex(index => index - 1)}
              >
                ←
              </Button>
              <span className="min-w-28 text-center text-sm">
                {new Intl.DateTimeFormat('ru-RU', {
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(`${currentMonth}-15T12:00:00Z`))}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Следующий месяц"
                disabled={monthIndex >= windowMonths.length - 1}
                onClick={() => setMonthIndex(index => index + 1)}
              >
                →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
              <>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                  {WEEKDAYS.map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {Array.from({ length: firstWeekday }, (_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const dayKey = `${currentMonth}-${String(i + 1).padStart(2, '0')}`
                    // Кликабелен только день окна со свободными слотами;
                    // дни вне окна отсутствуют в ответе сервера → free = 0.
                    const free = freeByDay.get(dayKey) ?? 0
                    const clickable = free > 0
                    const isSelected = selectedDay === dayKey
                    return (
                      <button
                        key={dayKey}
                        data-day={dayKey}
                        type="button"
                        disabled={!clickable}
                        onClick={() => onPickDay(dayKey)}
                        className={
                          `flex flex-col items-center gap-0.5 rounded-lg border p-1.5 text-sm ${
                            isSelected ? 'bg-primary text-primary-foreground' : ''
                          } ${
                            clickable
                              ? 'hover:bg-muted'
                              : 'pointer-events-none opacity-40'
                          }`
                        }
                      >
                        <span>{i + 1}</span>
                        {clickable && (
                          <span className="text-xs">{free} св.</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
          </CardContent>
        </Card>

        <Card aria-label="Слоты выбранного дня">
          {conflictMessage && (
            <p
              role="alert"
              className="text-destructive rounded-t-xl border-b bg-destructive/5 px-4 py-2 text-sm"
            >
              {conflictMessage}
            </p>
          )}
          <CardHeader>
            <h3 className="font-heading text-base leading-snug font-medium">
              {selectedDay
                ? formatOwnerDay(selectedDay)
                : 'Слоты'}
            </h3>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <p className="text-muted-foreground">Выберите день в календаре.</p>
            ) : slotsOfSelectedDay.length === 0 ? (
              <p className="text-muted-foreground">Свободных слотов на этот день нет</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {slotsOfSelectedDay.map(slot => {
                  const isFree = slot.status === 'free'
                  const isSelected =
                    selectedSlot !== null &&
                    selectedSlot.start === slot.start &&
                    selectedSlot.end === slot.end
                  return (
                    <li key={slot.start}>
                      <button
                        type="button"
                        disabled={!isFree}
                        onClick={() => onPickSlot(slot)}
                        className={
                          `w-full rounded-lg border px-3 py-2 text-left text-sm ${
                            isSelected ? 'border-primary bg-primary/10 font-medium' : ''
                          } ${isFree ? 'hover:bg-muted' : 'pointer-events-none opacity-40'}`
                        }
                      >
                        {formatOwnerTimeRange(slot.start, slot.end)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {isFree ? 'Свободно' : 'Занято'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Назад
        </Button>
        <Button disabled={selectedSlot === null} onClick={onNext}>
          Продолжить
        </Button>
      </div>
    </div>
  )
}
