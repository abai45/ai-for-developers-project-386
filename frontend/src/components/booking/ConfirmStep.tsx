import BookingInfoCard from '@/components/booking/BookingInfoCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import type { EventTypeView, Slot } from '@/lib/api/client'

export default function ConfirmStep({
  eventType,
  selectedDay,
  selectedSlot,
  guestName,
  pending,
  onBack,
  onConfirm,
}: {
  eventType: EventTypeView
  selectedDay: string
  selectedSlot: Slot
  guestName: string
  pending: boolean
  onBack: () => void
  onConfirm: () => void
}) {
  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start">
      <BookingInfoCard eventType={eventType} day={selectedDay} slot={selectedSlot} />
      <Card>
        <CardHeader>
          <h2 className="font-heading text-base leading-snug font-medium">
            Подтверждение записи
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="flex flex-col gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground inline">Тип встречи: </dt>
              <dd className="inline font-medium">
                {eventType.name} · {eventType.durationMinutes} мин
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground inline">Имя: </dt>
              <dd className="inline font-medium">{guestName}</dd>
            </div>
          </dl>
          <div className="flex justify-between">
            <Button variant="outline" disabled={pending} onClick={onBack}>
              Назад
            </Button>
            <Button disabled={pending} onClick={onConfirm}>
              {pending ? 'Записываю…' : 'Подтвердить запись'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
