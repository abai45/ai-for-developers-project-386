const STEP_LABELS = ['Тип', 'Календарь', 'Имя', 'Подтверждение'] as const

export default function BookingStepper({
  current,
  onStepClick,
}: {
  current: number
  onStepClick: (step: number) => void
}) {
  return (
    <ol aria-label="Шаги записи" className="flex flex-wrap items-center gap-2">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1
        const isCurrent = step === current
        const isDone = step < current
        return (
          <li key={label} className="flex items-center gap-2">
            {isDone ? (
              <button
                type="button"
                onClick={() => onStepClick(step)}
                className="text-muted-foreground underline-offset-4 hover:underline"
              >
                {step}. {label}
              </button>
            ) : (
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={isCurrent ? 'font-medium' : 'text-muted-foreground'}
              >
                {step}. {label}
              </span>
            )}
            {step < STEP_LABELS.length && <span aria-hidden>·</span>}
          </li>
        )
      })}
    </ol>
  )
}
