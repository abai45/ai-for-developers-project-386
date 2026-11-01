import { Link } from 'react-router-dom'
import EventTypesSection from '@/components/EventTypesSection'
import { buttonVariants } from '@/components/ui/button'

export default function OwnerPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold">Владелец</h1>
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          На главную
        </Link>
      </div>
      <EventTypesSection />
    </section>
  )
}
