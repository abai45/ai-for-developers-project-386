import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { formatOwnerDay, formatOwnerTimeRange, ownerDayKey } from '@/lib/ownerTime'
import type { EventTypeView, Slot } from '@/lib/api/client'

export default function BookingInfoCard({
  eventType,
  day,
  slot,
}: {
  eventType: EventTypeView
  day?: string
  slot?: Slot | null
}) {
  const dayKey = day ?? (slot ? ownerDayKey(slot.start) : undefined)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base leading-snug font-medium">
            {eventType.name}
          </h2>
          <Badge variant="secondary">{eventType.durationMinutes} мин</Badge>
        </div>
        {eventType.description && (
          <p className="text-muted-foreground text-sm">{eventType.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="text-muted-foreground text-xs">Выбранная дата</p>
          <p className="text-sm">{dayKey ? formatOwnerDay(dayKey) : 'День не выбран'}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Выбранное время</p>
          <p className="text-sm">
            {slot ? formatOwnerTimeRange(slot.start, slot.end) : 'Время не выбрано'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
