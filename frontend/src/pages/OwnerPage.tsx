import { useState } from 'react'
import { Link } from 'react-router-dom'
import CreateEventTypeForm from '@/components/CreateEventTypeForm'
import EventTypesSection from '@/components/EventTypesSection'
import UpcomingMeetingsSection from '@/components/UpcomingMeetingsSection'
import { buttonVariants } from '@/components/ui/button'

export default function OwnerPage() {
  const [typesRefresh, setTypesRefresh] = useState(0)

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold">Владелец</h1>
        <Link to="/" className={buttonVariants({ variant: 'outline' })}>
          На главную
        </Link>
      </div>
      <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start">
        <CreateEventTypeForm onCreated={() => setTypesRefresh(key => key + 1)} />
        <div className="flex flex-col gap-6">
          <EventTypesSection refreshToken={typesRefresh} />
          <UpcomingMeetingsSection />
        </div>
      </div>
    </section>
  )
}
