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

const emptyForm: FormValues = {
  name: '',
  description: '',
  durationMinutes: '',
  slotStepMinutes: '',
}

export default function CreateEventTypeForm({ onCreated }: { onCreated: () => void }) {
  const [values, setValues] = useState<FormValues>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  const setField = (field: keyof FormValues) => (value: string) =>
    setValues(prev => ({ ...prev, [field]: value }))

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
              onChange={event => setField('durationMinutes')(event.target.value)}
              required
              min={1}
              max={510}
              aria-invalid={fieldErrors.durationMinutes ? true : undefined}
            />
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
            {fieldErrors.slotStepMinutes && (
              <p role="alert" className="text-destructive text-sm">
                {fieldErrors.slotStepMinutes}
              </p>
            )}
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? 'Создаю…' : 'Создать тип встречи'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
