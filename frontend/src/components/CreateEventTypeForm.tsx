import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createEventType } from '@/lib/api/client'

interface FormValues {
  name: string
  description: string
  durationMinutes: string
  slotStepMinutes: string
}

// Дефолты: 80% типов создаются именно с этими значениями (issue #16).
const emptyForm: FormValues = {
  name: '',
  description: '',
  durationMinutes: '30',
  slotStepMinutes: '15',
}

const DURATION_CHIPS = [15, 30, 45, 60, 90] as const
const STEP_CHIPS = [5, 10, 15, 30] as const

// Рабочее время и формула слотов повторяют серверные правила (docs/decisions.md,
// «Параметры расписания») — только для превью; источник истины остаётся сервер.
const WORK_START_MIN = 9 * 60 + 30 // 09:30
const WORK_END_MIN = 18 * 60 // 18:00

function clock(totalMinutes: number): string {
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const mm = String(totalMinutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

/** Первые три слота дня и их всего; пусто, если ввод вне серверных правил. */
function previewSlots(duration: number, step: number) {
  if (
    !Number.isInteger(duration) ||
    !Number.isInteger(step) ||
    duration < 1 ||
    duration > 510 ||
    step < 1 ||
    step > duration
  ) {
    return null
  }
  const starts: number[] = []
  for (let m = WORK_START_MIN; m + duration <= WORK_END_MIN; m += step) {
    starts.push(m)
  }
  if (starts.length === 0) return null
  return {
    labels: starts
      .slice(0, 3)
      .map(m => `${clock(m)}–${clock(m + duration)}`),
    count: starts.length,
  }
}

export default function CreateEventTypeForm({ onCreated }: { onCreated: () => void }) {
  const [values, setValues] = useState<FormValues>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  const setField = (field: keyof FormValues) => (value: string) =>
    setValues(prev => ({ ...prev, [field]: value }))

  // Выбор/ввод длительности: шаг не может превышать новую длительность (issue #16).
  const setDuration = (value: string) =>
    setValues(prev => {
      const duration = Number(value)
      const step = Number(prev.slotStepMinutes)
      const nextStep =
        value !== '' && Number.isInteger(duration) && duration >= 1 && step > duration
          ? String(duration)
          : prev.slotStepMinutes
      return {
        ...prev,
        durationMinutes: value,
        slotStepMinutes: nextStep,
      }
    })

  const pickChip =
    (field: 'durationMinutes' | 'slotStepMinutes') => (value: number) =>
      field === 'durationMinutes' ? setDuration(String(value)) : setField(field)(String(value))

  function chipClass(isActive: boolean) {
    return `rounded-full border px-3 py-1 text-sm ${
      isActive ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
    }`
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setPending(true)
    setFieldErrors({})
    try {
      const result = await createEventType({
        name: values.name,
        description: values.description || undefined,
        durationMinutes: Number(values.durationMinutes),
        slotStepMinutes: Number(values.slotStepMinutes),
      })
      if (result.kind === 'validation') {
        const errors: Record<string, string> = {}
        for (const error of result.errors) {
          errors[error.field] ??= error.message
        }
        setFieldErrors(errors)
      } else {
        setValues(emptyForm)
        toast.success(`Тип встречи «${result.eventType.name}» создан`)
        onCreated()
      }
    } catch {
      toast.error('Не удалось создать тип встречи. Попробуйте ещё раз.')
    } finally {
      setPending(false)
    }
  }

  const durationNum = Number(values.durationMinutes)
  const stepNum = Number(values.slotStepMinutes)
  const preview = previewSlots(durationNum, stepNum)

  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading text-base leading-snug font-medium">
          Создать тип встречи
        </h2>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-type-name">Название</Label>
            <Input
              id="event-type-name"
              value={values.name}
              onChange={event => setField('name')(event.target.value)}
              required
              minLength={1}
              maxLength={100}
              aria-invalid={fieldErrors.name ? true : undefined}
            />
            {fieldErrors.name && (
              <p role="alert" className="text-destructive text-sm">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-type-description">Описание</Label>
            <Textarea
              id="event-type-description"
              value={values.description}
              onChange={event => setField('description')(event.target.value)}
              maxLength={500}
              aria-invalid={fieldErrors.description ? true : undefined}
            />
            {fieldErrors.description && (
              <p role="alert" className="text-destructive text-sm">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-type-duration">Длительность, мин</Label>
            <Input
              id="event-type-duration"
              type="number"
              value={values.durationMinutes}
              onChange={event => setDuration(event.target.value)}
              required
              min={1}
              max={510}
              aria-invalid={fieldErrors.durationMinutes ? true : undefined}
            />
            <div
              role="group"
              className="flex flex-wrap gap-1.5 pt-1"
              aria-label="Быстрый выбор длительности"
            >
              {DURATION_CHIPS.map(minutes => (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={durationNum === minutes}
                  className={chipClass(durationNum === minutes)}
                  onClick={() => pickChip('durationMinutes')(minutes)}
                >
                  {minutes} мин
                </button>
              ))}
            </div>
            {fieldErrors.durationMinutes && (
              <p role="alert" className="text-destructive text-sm">
                {fieldErrors.durationMinutes}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-type-step">Шаг слота, мин</Label>
            <Input
              id="event-type-step"
              type="number"
              value={values.slotStepMinutes}
              onChange={event => setField('slotStepMinutes')(event.target.value)}
              required
              min={1}
              max={values.durationMinutes ? Number(values.durationMinutes) : undefined}
              aria-invalid={fieldErrors.slotStepMinutes ? true : undefined}
            />
            <div
              role="group"
              className="flex flex-wrap gap-1.5 pt-1"
              aria-label="Быстрый выбор шага слота"
            >
              {STEP_CHIPS.map(minutes => {
                const tooBig = Number.isInteger(durationNum) && durationNum >= 1 && minutes > durationNum
                return (
                  <button
                    key={minutes}
                    type="button"
                    disabled={tooBig}
                    aria-pressed={stepNum === minutes}
                    className={`${chipClass(stepNum === minutes)}${tooBig ? ' opacity-40' : ''}`}
                    onClick={() => pickChip('slotStepMinutes')(minutes)}
                  >
                    {minutes} мин
                  </button>
                )
              })}
            </div>
            {fieldErrors.slotStepMinutes && (
              <p role="alert" className="text-destructive text-sm">
                {fieldErrors.slotStepMinutes}
              </p>
            )}
          </div>

          {preview && (
            <p className="text-muted-foreground text-sm" aria-live="polite">
              Первые слоты в рабочий день (09:30–18:00, время владельца):{' '}
              {preview.labels.join(' · ')}
              {preview.count > preview.labels.length ? ' …' : ''} — {preview.count} слот(ов) в
              дне.
            </p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? 'Создаю…' : 'Создать тип встречи'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
