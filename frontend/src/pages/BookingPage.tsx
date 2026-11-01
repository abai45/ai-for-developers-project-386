import { useState } from 'react'
import { Link } from 'react-router-dom'
import BookingStepper from '@/components/booking/BookingStepper'
import CalendarStep from '@/components/booking/CalendarStep'
import EventTypeSelectStep from '@/components/booking/EventTypeSelectStep'
import { buttonVariants } from '@/components/ui/button'
import type { EventTypeView, Slot } from '@/lib/api/client'

// Шаг 3 «Имя» и шаг 4 «Подтверждение» — тикет #11.
const STEP_NAMES = ['Тип', 'Календарь', 'Имя', 'Подтверждение'] as const

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [eventType, setEventType] = useState<EventTypeView | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  function pickType(next: EventTypeView) {
    // Смена типа сбрасывает выбранный слот и день.
    setEventType(next)
    setSelectedDay(null)
    setSelectedSlot(null)
    setStep(2)
  }

  function goToStep(target: number) {
    // Возврат возможен только на пройденные шаги.
    if (target < step && target >= 1) setStep(target)
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold">Присоединиться ко встрече</h1>
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          На главную
        </Link>
      </div>

      <BookingStepper current={step} onStepClick={goToStep} />

      {step === 1 && <EventTypeSelectStep onPick={pickType} />}

      {step === 2 && eventType && (
        <CalendarStep
          eventType={eventType}
          selectedDay={selectedDay}
          selectedSlot={selectedSlot}
          onPickDay={day => {
            setSelectedDay(day)
            setSelectedSlot(null)
          }}
          onPickSlot={setSelectedSlot}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step >= 3 && (
        <div className="flex flex-col items-start gap-3">
          <p className="font-medium">Шаг «{STEP_NAMES[step - 1]}»</p>
          <p className="text-muted-foreground">Раздел появится с тикетом #11.</p>
          <button
            type="button"
            className={buttonVariants({ variant: 'outline' })}
            onClick={() => setStep(step - 1)}
          >
            Назад
          </button>
        </div>
      )}
    </section>
  )
}
